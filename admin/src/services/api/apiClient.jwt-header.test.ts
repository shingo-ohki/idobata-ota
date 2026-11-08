import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "./apiClient";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function requestWithToken(header?: string) {
  vi.stubEnv("VITE_API_BASE_URL", "https://admin.idobata.example.test");
  // Explicitly unset the setting to verify compatibility with older builds.
  vi.stubEnv("VITE_JWT_AUTH_HEADER", header);
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => (key === "auth_token" ? "test-jwt-secret" : null),
  });

  const fetchMock = vi.fn(
    async (_input: string | URL | Request, _init?: RequestInit) => {
      return new Response(JSON.stringify({ user: { id: "1" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  );
  vi.stubGlobal("fetch", fetchMock);
  const log = vi.spyOn(console, "log").mockImplementation(() => {});

  // login() always emits request debug logs; no JWT value may leak into them.
  const result = await new ApiClient().login("person@example.test", "password");
  expect(result.isOk()).toBe(true);
  expect(fetchMock).toHaveBeenCalledTimes(1);

  const init = fetchMock.mock.calls[0][1] as RequestInit;
  expect(JSON.stringify(log.mock.calls)).not.toContain("test-jwt-secret");
  return init.headers as Record<string, string>;
}

describe("admin API JWT header", () => {
  it("uses Authorization when VITE_JWT_AUTH_HEADER is unset", async () => {
    const headers = await requestWithToken();
    expect(headers.Authorization).toBe("Bearer test-jwt-secret");
    expect(headers["X-Idobata-JWT"]).toBeUndefined();
  });

  it("uses Authorization when the setting is empty", async () => {
    const headers = await requestWithToken("");
    expect(headers.Authorization).toBe("Bearer test-jwt-secret");
    expect(headers["X-Idobata-JWT"]).toBeUndefined();
  });

  it("can use X-Idobata-JWT behind an HTTP Basic proxy", async () => {
    const headers = await requestWithToken("X-Idobata-JWT");
    expect(headers["X-Idobata-JWT"]).toBe("Bearer test-jwt-secret");
    expect(headers.Authorization).toBeUndefined();
  });

  it("does not accept arbitrary JWT header names", async () => {
    const headers = await requestWithToken("X-Unexpected-Header");
    expect(headers.Authorization).toBe("Bearer test-jwt-secret");
    expect(headers["X-Unexpected-Header"]).toBeUndefined();
  });
});
