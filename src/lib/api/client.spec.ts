import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import { isTransportFailure } from "./client";

/** Builds the shape axios rejects with, with or without a response. */
function failure(status?: number, code?: string) {
  const error = new AxiosError("failed", code);
  if (status !== undefined) {
    error.response = { status, data: {}, statusText: "", headers: {}, config: {} as any };
  }
  return error;
}

describe("isTransportFailure", () => {
  it("treats a request that never got an answer as transport", () => {
    // Offline, DNS, CORS, aborted: axios rejects with no response at all.
    expect(isTransportFailure(failure(undefined, "ERR_NETWORK"))).toBe(true);
    expect(isTransportFailure(failure(undefined, "ECONNABORTED"))).toBe(true);
  });

  it("treats a server that is down or waking as transport", () => {
    // Render spins the free tier down; a cold start answers 502/503 first.
    for (const status of [500, 502, 503, 504, 408, 429]) {
      expect(isTransportFailure(failure(status))).toBe(true);
    }
  });

  it("treats an answered refusal as an authentication verdict", () => {
    for (const status of [400, 401, 403, 404]) {
      expect(isTransportFailure(failure(status))).toBe(false);
    }
  });
});
