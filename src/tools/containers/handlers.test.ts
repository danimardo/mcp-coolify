/**
 * Tests del handler get_container_logs (runner SSH mockeado).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ExtendedToolContext } from "$lib/tools/types";
import {
  SshDisabledError,
  SshCommandError,
} from "$lib/errors/error-types";
import {
  CONTAINER_MARKER,
  META_MARKER,
  END_MARKER,
} from "$lib/ssh/runner.server";
import { getContainerLogsHandler } from "./handlers";

const runSshMock = vi.fn();

vi.mock("$lib/ssh/runner.server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("$lib/ssh/runner.server")>();
  return {
    ...actual,
    runSsh: (...args: unknown[]): Promise<unknown> =>
      runSshMock(...args) as Promise<unknown>,
  };
});

interface CtxOpts {
  sshEnabled?: boolean;
  host?: string;
  user?: string;
  privateKeyPath?: string;
}

function makeContext(opts: CtxOpts = {}): ExtendedToolContext {
  const noop = (): void => undefined;
  const logger = {
    info: noop,
    warn: noop,
    error: noop,
    debug: noop,
    trace: noop,
    fatal: noop,
    child: (): unknown => undefined,
  };
  return {
    requestId: "req-test",
    logger,
    config: {
      coolifyBaseUrl: "http://x/api/v1",
      readOnly: false,
      requestTimeout: 30000,
      ssh: {
        enabled: opts.sshEnabled ?? true,
        host: opts.host ?? "coolify.example.com",
        port: 22,
        user: opts.user ?? "deploy",
        privateKeyPath: opts.privateKeyPath ?? "C:\\keys\\id",
        strictHostKeyChecking: "accept-new",
        commandTimeoutMs: 20000,
      },
    },
  } as unknown as ExtendedToolContext;
}

beforeEach(() => {
  runSshMock.mockReset();
});

describe("getContainerLogsHandler", () => {
  it("lanza SshDisabledError si SSH_ENABLED no está activo", async () => {
    await expect(
      getContainerLogsHandler(
        { resource_type: "service", resource_uuid: "f8s0c0k4wgok8sccg0w4k8sg", tail: 200, timestamps: false },
        makeContext({ sshEnabled: false })
      )
    ).rejects.toBeInstanceOf(SshDisabledError);
    expect(runSshMock).not.toHaveBeenCalled();
  });

  it("lanza SshDisabledError si falta host/user/clave", async () => {
    await expect(
      getContainerLogsHandler(
        { resource_type: "service", resource_uuid: "f8s0c0k4wgok8sccg0w4k8sg", tail: 200, timestamps: false },
        makeContext({ host: "" })
      )
    ).rejects.toBeInstanceOf(SshDisabledError);
  });

  it("parsea la salida remota en contenedores estructurados", async () => {
    runSshMock.mockResolvedValue({
      exitCode: 0,
      stderr: "",
      stdout: [
        `${CONTAINER_MARKER} web-f8s0c0k4wgok8sccg0w4k8sg`,
        `${META_MARKER} running n8n`,
        "listo",
        END_MARKER,
      ].join("\n"),
    });

    const res = await getContainerLogsHandler(
      { resource_type: "service", resource_uuid: "f8s0c0k4wgok8sccg0w4k8sg", tail: 100, timestamps: false },
      makeContext()
    );

    expect(res.server).toEqual({ host: "coolify.example.com", user: "deploy", port: 22 });
    expect(res.matched_containers).toEqual(["web-f8s0c0k4wgok8sccg0w4k8sg"]);
    expect(res.containers[0]).toMatchObject({
      name: "web-f8s0c0k4wgok8sccg0w4k8sg",
      state: "running",
      service: "n8n",
      lines: 1,
      logs: "listo",
    });
  });

  it("propaga el uuid y el tail al script remoto", async () => {
    runSshMock.mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });
    await getContainerLogsHandler(
      { resource_type: "application", resource_uuid: "a4kw8sgc0co8gk00ggkcg84w", tail: 42, since: "15m", timestamps: true },
      makeContext()
    );
    const script = (runSshMock.mock.calls[0] as unknown[])[1] as string;
    expect(script).toContain("a4kw8sgc0co8gk00ggkcg84w");
    expect(script).toContain("--tail 42");
    expect(script).toContain("--since '15m'");
    expect(script).toContain("--timestamps");
  });

  it("exit 3 => SshCommandError (sin contenedores)", async () => {
    runSshMock.mockResolvedValue({ exitCode: 3, stderr: "NO_CONTAINERS", stdout: "" });
    await expect(
      getContainerLogsHandler(
        { resource_type: "database", resource_uuid: "d8c8sk0cskswcg44k4w444wz", tail: 200, timestamps: false },
        makeContext()
      )
    ).rejects.toBeInstanceOf(SshCommandError);
  });

  it("exit distinto de 0/3 => SshCommandError", async () => {
    runSshMock.mockResolvedValue({ exitCode: 127, stderr: "docker not found on PATH", stdout: "" });
    await expect(
      getContainerLogsHandler(
        { resource_type: "service", resource_uuid: "f8s0c0k4wgok8sccg0w4k8sg", tail: 200, timestamps: false },
        makeContext()
      )
    ).rejects.toBeInstanceOf(SshCommandError);
  });
});
