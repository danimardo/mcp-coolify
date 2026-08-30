/**
 * Tests de las funciones puras del runner SSH.
 * Se centran en seguridad (no inyección) y en el parseo de la salida remota.
 */

import { describe, it, expect } from "vitest";
import {
  shQuote,
  buildSshArgs,
  buildContainerLogsScript,
  parseContainerLogsOutput,
  CONTAINER_MARKER,
  META_MARKER,
  END_MARKER,
  type SshConnection,
} from "./runner.server";

const conn: SshConnection = {
  host: "coolify.example.com",
  port: 22,
  user: "deploy",
  privateKeyPath: "/home/deploy/.ssh/id_ed25519",
  strictHostKeyChecking: "accept-new",
  commandTimeoutMs: 20000,
};

describe("shQuote", () => {
  it("envuelve en comillas simples", () => {
    expect(shQuote("abc")).toBe("'abc'");
  });

  it("neutraliza comillas simples embebidas", () => {
    expect(shQuote("a'b")).toBe(`'a'\\''b'`);
  });

  it("neutraliza intentos de inyección de comando", () => {
    const evil = "x'; rm -rf / #";
    const quoted = shQuote(evil);
    expect(quoted.startsWith("'")).toBe(true);
    expect(quoted.endsWith("'")).toBe(true);
    // El punto y coma queda dentro de comillas, nunca como separador de shell.
    expect(quoted).toBe(`'x'\\''; rm -rf / #'`);
  });
});

describe("buildSshArgs", () => {
  it("incluye BatchMode, StrictHostKeyChecking y ConnectTimeout", () => {
    const args = buildSshArgs(conn, "echo hi");
    expect(args).toContain("-o");
    expect(args).toContain("BatchMode=yes");
    expect(args).toContain("StrictHostKeyChecking=accept-new");
    expect(args).toContain("ConnectTimeout=20");
  });

  it("pasa el comando remoto como único argumento tras '--'", () => {
    const args = buildSshArgs(conn, "docker logs x");
    const sep = args.indexOf("--");
    expect(sep).toBeGreaterThan(-1);
    expect(args[sep + 1]).toBe("docker logs x");
    expect(args).toHaveLength(sep + 2);
  });

  it("incluye UserKnownHostsFile solo si se especifica", () => {
    expect(buildSshArgs(conn, "x")).not.toContain("UserKnownHostsFile=/tmp/kh");
    const withKh = buildSshArgs(
      { ...conn, knownHostsPath: "/tmp/kh" },
      "x"
    );
    expect(withKh).toContain("UserKnownHostsFile=/tmp/kh");
  });

  it("usa el destino user@host y el puerto configurado", () => {
    const args = buildSshArgs({ ...conn, port: 2222 }, "x");
    expect(args).toContain("deploy@coolify.example.com");
    expect(args[args.indexOf("-p") + 1]).toBe("2222");
  });
});

describe("buildContainerLogsScript", () => {
  it("filtra por label compose-project y por nombre, excluyendo volume-backup", () => {
    const s = buildContainerLogsScript({
      uuid: "f8s0c0k4wgok8sccg0w4k8sg",
      tail: 200,
      timestamps: false,
    });
    expect(s).toContain(
      "label=com.docker.compose.project='f8s0c0k4wgok8sccg0w4k8sg'"
    );
    expect(s).toContain("--filter name='f8s0c0k4wgok8sccg0w4k8sg'");
    expect(s).toContain("-volume-backup$");
    expect(s).toContain("--tail 200");
  });

  it("cita el uuid: un uuid malicioso no rompe el script", () => {
    const s = buildContainerLogsScript({
      uuid: "x'; reboot; '",
      tail: 10,
      timestamps: false,
    });
    expect(s).toContain(`name='x'\\''; reboot; '\\'''`);
    expect(s).not.toMatch(/name=x; reboot/);
  });

  it("añade --since y --timestamps cuando se piden", () => {
    const s = buildContainerLogsScript({
      uuid: "abc12345",
      tail: 50,
      since: "15m",
      timestamps: true,
    });
    expect(s).toContain("--since '15m'");
    expect(s).toContain("--timestamps");
  });

  it("con container fijo no ejecuta docker ps de resolución", () => {
    const s = buildContainerLogsScript({
      uuid: "abc12345",
      tail: 50,
      timestamps: false,
      container: "n8n-abc12345",
    });
    expect(s).toContain("printf '%s\\n' 'n8n-abc12345'");
    expect(s).not.toContain("docker ps -a --no-trunc --filter label=com.docker.compose.project");
  });
});

describe("parseContainerLogsOutput", () => {
  it("parsea varios contenedores con metadatos y cuenta de líneas", () => {
    const stdout = [
      `${CONTAINER_MARKER} n8n-abc`,
      `${META_MARKER} running n8n`,
      "linea 1",
      "linea 2",
      END_MARKER,
      `${CONTAINER_MARKER} redis-abc`,
      `${META_MARKER} exited redis`,
      "boom",
      END_MARKER,
    ].join("\n");

    const parsed = parseContainerLogsOutput(stdout);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toMatchObject({
      name: "n8n-abc",
      state: "running",
      service: "n8n",
      lines: 2,
    });
    expect(parsed[0].logs).toBe("linea 1\nlinea 2");
    expect(parsed[1]).toMatchObject({ name: "redis-abc", state: "exited", lines: 1 });
  });

  it("maneja metadatos 'unknown' y logs vacíos", () => {
    const stdout = [
      `${CONTAINER_MARKER} solo`,
      `${META_MARKER} unknown`,
      END_MARKER,
    ].join("\n");
    const parsed = parseContainerLogsOutput(stdout);
    expect(parsed[0].state).toBeUndefined();
    expect(parsed[0].lines).toBe(0);
    expect(parsed[0].logs).toBe("");
  });

  it("devuelve vacío si no hay marcadores", () => {
    expect(parseContainerLogsOutput("ruido sin formato")).toEqual([]);
  });
});
