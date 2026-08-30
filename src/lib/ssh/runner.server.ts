/**
 * SSH runner (server-only)
 *
 * Thin wrapper around the system `ssh` binary used by container-log tools.
 * It never derives credentials from the Coolify API: connection details come
 * from validated config, and every value interpolated into the remote shell
 * script is single-quoted via {@link shQuote}.
 *
 * Design notes:
 * - Uses `execFile` (no shell on the local side) so local arg injection is
 *   impossible; the remote side runs a fixed `/bin/sh` script whose only
 *   variable parts are a Coolify id, an integer, a bounded `--since` token and
 *   an optional container name that already passed a strict allow-list regex.
 * - Read-only by nature: the remote script only runs `docker ps`,
 *   `docker inspect` and `docker logs`.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const MAX_OUTPUT_BYTES = 20 * 1024 * 1024;

export interface SshConnection {
  host: string;
  port: number;
  user: string;
  privateKeyPath: string;
  strictHostKeyChecking: "yes" | "accept-new" | "no";
  knownHostsPath?: string;
  commandTimeoutMs: number;
}

export interface SshResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Single-quote a value for safe embedding in a POSIX `/bin/sh` script.
 * `abc'def` becomes `'abc'\''def'`.
 */
export function shQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

/**
 * Build the argv passed to the local `ssh` binary. Pure, so tests can assert
 * that no option is missing and the remote command is passed as a single arg.
 */
export function buildSshArgs(conn: SshConnection, remoteCommand: string): string[] {
  const connectTimeoutSec = Math.max(1, Math.ceil(conn.commandTimeoutMs / 1000));
  const args = [
    "-i",
    conn.privateKeyPath,
    "-o",
    "BatchMode=yes",
    "-o",
    `StrictHostKeyChecking=${conn.strictHostKeyChecking}`,
    "-o",
    `ConnectTimeout=${connectTimeoutSec}`,
    "-o",
    "LogLevel=ERROR",
  ];
  if (conn.knownHostsPath) {
    args.push("-o", `UserKnownHostsFile=${conn.knownHostsPath}`);
  }
  args.push("-p", String(conn.port), `${conn.user}@${conn.host}`, "--", remoteCommand);
  return args;
}

interface ExecError extends Error {
  code?: number | string;
  killed?: boolean;
  signal?: NodeJS.Signals | null;
  stdout?: string;
  stderr?: string;
}

/**
 * Run a remote command over SSH. Resolves with stdout/stderr/exitCode even when
 * the remote command exits non-zero; rejects only when `ssh` itself could not
 * run or the timeout fired.
 */
export async function runSsh(
  conn: SshConnection,
  remoteCommand: string
): Promise<SshResult> {
  const args = buildSshArgs(conn, remoteCommand);
  try {
    const { stdout, stderr } = await execFileAsync("ssh", args, {
      timeout: conn.commandTimeoutMs,
      maxBuffer: MAX_OUTPUT_BYTES,
      windowsHide: true,
    });
    return { stdout, stderr, exitCode: 0 };
  } catch (err) {
    const e = err as ExecError;
    if (e.killed && e.signal === "SIGTERM") {
      throw new Error(
        `SSH command timed out after ${conn.commandTimeoutMs}ms (host ${conn.host})`
      );
    }
    // A numeric `code` means ssh ran and the remote command exited non-zero.
    if (typeof e.code === "number") {
      return {
        stdout: e.stdout ?? "",
        stderr: e.stderr ?? e.message,
        exitCode: e.code,
      };
    }
    // Non-numeric code (e.g. "ENOENT") => the local ssh binary is unavailable.
    throw new Error(
      `Could not execute 'ssh' (${String(e.code ?? e.message)}). Is the OpenSSH client installed and on PATH?`
    );
  }
}

/** Coolify container-name label markers emitted by the remote script. */
export const CONTAINER_MARKER = "@@@CONTAINER@@@";
export const META_MARKER = "@@@META@@@";
export const END_MARKER = "@@@END@@@";

export interface ContainerLogsScriptParams {
  /** Coolify resource UUID (already validated by the caller). */
  uuid: string;
  /** Number of trailing log lines. */
  tail: number;
  /** Optional `docker logs --since` token (already validated). */
  since?: string;
  /** Prefix every log line with an RFC3339 timestamp. */
  timestamps: boolean;
  /** Restrict to this exact container name (already validated). */
  container?: string;
}

/**
 * Build the POSIX `/bin/sh` script executed on the Docker host. It resolves the
 * container set for a Coolify resource by two independent anchors — the compose
 * project label (equals the Coolify UUID) and the container name (embeds it) —
 * then streams `docker logs` for each, wrapped in parseable markers.
 */
export function buildContainerLogsScript(p: ContainerLogsScriptParams): string {
  const uuidQ = shQuote(p.uuid);
  const logArgs = [`--tail ${p.tail}`];
  if (p.since) logArgs.push(`--since ${shQuote(p.since)}`);
  if (p.timestamps) logArgs.push("--timestamps");
  const logArgsStr = logArgs.join(" ");
  const containerFilter = p.container
    ? `printf '%s\\n' ${shQuote(p.container)}`
    : `{ docker ps -a --no-trunc --filter label=com.docker.compose.project=${uuidQ} --format '{{.Names}}'; ` +
      `docker ps -a --no-trunc --filter name=${uuidQ} --format '{{.Names}}'; } ` +
      `| grep -v '^$' | grep -v -- '-volume-backup$' | sort -u`;

  return [
    "set -u",
    "command -v docker >/dev/null 2>&1 || { echo 'docker not found on PATH' >&2; exit 127; }",
    `names=$(${containerFilter})`,
    'if [ -z "$names" ]; then echo "NO_CONTAINERS" >&2; exit 3; fi',
    'for n in $names; do',
    `  echo "${CONTAINER_MARKER} $n"`,
    `  docker inspect "$n" --format '${META_MARKER} {{.State.Status}} {{index .Config.Labels "com.docker.compose.service"}}' 2>/dev/null || echo "${META_MARKER} unknown"`,
    `  docker logs ${logArgsStr} "$n" 2>&1 || true`,
    `  echo "${END_MARKER}"`,
    "done",
  ].join("\n");
}

export interface ParsedContainerLog {
  name: string;
  state?: string;
  service?: string;
  logs: string;
  lines: number;
}

/**
 * Parse the marker-wrapped stdout produced by {@link buildContainerLogsScript}.
 */
export function parseContainerLogsOutput(stdout: string): ParsedContainerLog[] {
  const out: ParsedContainerLog[] = [];
  let current: ParsedContainerLog | null = null;
  let buffer: string[] = [];

  const flush = (): void => {
    if (current) {
      const logs = buffer.join("\n").replace(/\n+$/, "");
      current.logs = logs;
      current.lines = logs === "" ? 0 : logs.split("\n").length;
      out.push(current);
    }
    current = null;
    buffer = [];
  };

  for (const line of stdout.split("\n")) {
    if (line.startsWith(CONTAINER_MARKER)) {
      flush();
      current = {
        name: line.slice(CONTAINER_MARKER.length).trim(),
        logs: "",
        lines: 0,
      };
      continue;
    }
    if (line.startsWith(META_MARKER)) {
      const rest = line.slice(META_MARKER.length).trim().split(/\s+/);
      if (current) {
        current.state = rest[0] && rest[0] !== "unknown" ? rest[0] : undefined;
        current.service = rest[1] || undefined;
      }
      continue;
    }
    if (line.startsWith(END_MARKER)) {
      flush();
      continue;
    }
    if (current) buffer.push(line);
  }
  flush();
  return out;
}
