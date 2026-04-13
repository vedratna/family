import { describe, it, expect, vi, beforeEach } from "vitest";

describe("auth-mode", () => {
  const envKeys = [
    "VITE_AUTH_MODE",
    "VITE_COGNITO_USER_POOL_ID",
    "VITE_COGNITO_CLIENT_ID",
  ] as const;

  beforeEach(() => {
    vi.resetModules();
    // Reset env vars used by the module under test
    for (const key of envKeys) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (import.meta.env as Record<string, string | undefined>)[key];
    }
  });

  function setEnv(vars: Record<string, string>) {
    Object.assign(import.meta.env, vars);
  }

  describe("getAuthMode", () => {
    it("defaults to local when VITE_AUTH_MODE is not set", async () => {
      const { getAuthMode } = await import("../lib/auth/auth-mode");
      expect(getAuthMode()).toBe("local");
    });

    it('returns "cognito" when VITE_AUTH_MODE is "cognito"', async () => {
      setEnv({ VITE_AUTH_MODE: "cognito" });
      const { getAuthMode } = await import("../lib/auth/auth-mode");
      expect(getAuthMode()).toBe("cognito");
    });

    it('returns "local" for unrecognized auth mode values', async () => {
      setEnv({ VITE_AUTH_MODE: "something-else" });
      const { getAuthMode } = await import("../lib/auth/auth-mode");
      expect(getAuthMode()).toBe("local");
    });
  });

  describe("getCognitoConfig", () => {
    it("returns null when env vars are not set", async () => {
      const { getCognitoConfig } = await import("../lib/auth/auth-mode");
      expect(getCognitoConfig()).toBeNull();
    });

    it("returns null when only user pool ID is set", async () => {
      setEnv({ VITE_COGNITO_USER_POOL_ID: "us-east-1_abc123" });
      const { getCognitoConfig } = await import("../lib/auth/auth-mode");
      expect(getCognitoConfig()).toBeNull();
    });

    it("returns null when only client ID is set", async () => {
      setEnv({ VITE_COGNITO_CLIENT_ID: "abc123clientid" });
      const { getCognitoConfig } = await import("../lib/auth/auth-mode");
      expect(getCognitoConfig()).toBeNull();
    });

    it("returns config when both env vars are set", async () => {
      setEnv({
        VITE_COGNITO_USER_POOL_ID: "us-east-1_abc123",
        VITE_COGNITO_CLIENT_ID: "abc123clientid",
      });
      const { getCognitoConfig } = await import("../lib/auth/auth-mode");
      expect(getCognitoConfig()).toEqual({
        userPoolId: "us-east-1_abc123",
        clientId: "abc123clientid",
      });
    });

    it("returns null when env vars are empty strings", async () => {
      setEnv({
        VITE_COGNITO_USER_POOL_ID: "",
        VITE_COGNITO_CLIENT_ID: "",
      });
      const { getCognitoConfig } = await import("../lib/auth/auth-mode");
      expect(getCognitoConfig()).toBeNull();
    });
  });

  describe("isCognitoMode", () => {
    it("returns false by default (local mode, no config)", async () => {
      const { isCognitoMode } = await import("../lib/auth/auth-mode");
      expect(isCognitoMode()).toBe(false);
    });

    it("returns false when auth mode is cognito but config is missing", async () => {
      setEnv({ VITE_AUTH_MODE: "cognito" });
      const { isCognitoMode } = await import("../lib/auth/auth-mode");
      expect(isCognitoMode()).toBe(false);
    });

    it("returns false when config is present but auth mode is local", async () => {
      setEnv({
        VITE_AUTH_MODE: "local",
        VITE_COGNITO_USER_POOL_ID: "us-east-1_abc123",
        VITE_COGNITO_CLIENT_ID: "abc123clientid",
      });
      const { isCognitoMode } = await import("../lib/auth/auth-mode");
      expect(isCognitoMode()).toBe(false);
    });

    it("returns true when auth mode is cognito and both env vars are present", async () => {
      setEnv({
        VITE_AUTH_MODE: "cognito",
        VITE_COGNITO_USER_POOL_ID: "us-east-1_abc123",
        VITE_COGNITO_CLIENT_ID: "abc123clientid",
      });
      const { isCognitoMode } = await import("../lib/auth/auth-mode");
      expect(isCognitoMode()).toBe(true);
    });
  });
});
