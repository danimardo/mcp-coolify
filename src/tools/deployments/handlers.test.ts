/**
 * Tests para los handlers de Deployments
 */

import { describe, it, expect } from "vitest";
import type { ExtendedToolContext } from "$lib/tools/types";
import { triggerDeploymentHandler, cancelDeploymentHandler } from "./handlers";

interface RecordedCall {
  method: string;
  url: string;
  data?: unknown;
  options?: unknown;
}

function makeContext(): { context: ExtendedToolContext; calls: RecordedCall[] } {
  const calls: RecordedCall[] = [];
  const httpClient = {
    get: (url: string, options?: unknown) => {
      calls.push({ method: "GET", url, options });
      return Promise.resolve({ ok: true });
    },
    post: (url: string, data: unknown, options?: unknown) => {
      calls.push({ method: "POST", url, data, options });
      return Promise.resolve({ ok: true });
    },
  };

  const context = {
    httpClient,
    requestId: "req-test-123",
  } as unknown as ExtendedToolContext;

  return { context, calls };
}

describe("triggerDeploymentHandler", () => {
  it("usa GET /deploy con el uuid como query param (endpoint real de Coolify v4)", async () => {
    const { context, calls } = makeContext();

    await triggerDeploymentHandler(
      { application_uuid: "aks4wsg8gswc0c4wck84w4sc" },
      context
    );

    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe("GET");
    expect(calls[0].url).toBe("/deploy");
    expect(calls[0].options).toMatchObject({
      params: { uuid: "aks4wsg8gswc0c4wck84w4sc" },
    });
  });

  it("incluye force=true en los params cuando se solicita", async () => {
    const { context, calls } = makeContext();

    await triggerDeploymentHandler(
      { application_uuid: "aks4wsg8gswc0c4wck84w4sc", force: true },
      context
    );

    expect(calls[0].options).toMatchObject({
      params: { uuid: "aks4wsg8gswc0c4wck84w4sc", force: true },
    });
  });
});

describe("cancelDeploymentHandler", () => {
  it("usa POST /deployments/{uuid}/cancel", async () => {
    const { context, calls } = makeContext();

    await cancelDeploymentHandler({ uuid: "dw8ccwkso888ggwgwgww0wc4" }, context);

    expect(calls[0].method).toBe("POST");
    expect(calls[0].url).toBe("/deployments/dw8ccwkso888ggwgwgww0wc4/cancel");
  });
});
