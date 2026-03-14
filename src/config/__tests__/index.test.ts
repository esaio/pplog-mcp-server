import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import packageJson from "../../../package.json" with { type: "json" };

describe("config", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("PPLOG_ACCESS_TOKEN", undefined);
    vi.stubEnv("PPLOG_API_BASE_URL", undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("config object", () => {
    it("should have correct default values", async () => {
      const { config } = await import("../index.js");

      expect(config.pplog.apiBaseUrl).toBe("https://api.pplog.net");
      expect(config.server.name).toBe("pplog-mcp-server");
      expect(config.server.version).toBe(packageJson.version);
      expect(config.server.description).toBe("Official MCP server for pplog");
    });

    it("should use environment variables when set", async () => {
      vi.stubEnv("PPLOG_ACCESS_TOKEN", "test-token");
      vi.stubEnv("PPLOG_API_BASE_URL", "https://api.pplog.localhost");

      const { config } = await import("../index.js");

      expect(config.pplog.apiAccessToken).toBe("test-token");
      expect(config.pplog.apiBaseUrl).toBe("https://api.pplog.localhost");
    });
  });

  describe("validateConfig", () => {
    it("should throw error when PPLOG_ACCESS_TOKEN is not set", async () => {
      vi.stubEnv("PPLOG_ACCESS_TOKEN", undefined);

      const { validateConfig } = await import("../index.js");

      expect(() => validateConfig()).toThrow(
        "PPLOG_ACCESS_TOKEN environment variable is required",
      );
    });

    it("should not throw error when PPLOG_ACCESS_TOKEN is set", async () => {
      vi.stubEnv("PPLOG_ACCESS_TOKEN", "valid-token");

      const { validateConfig } = await import("../index.js");

      expect(() => validateConfig()).not.toThrow();
    });

    it("should throw error when PPLOG_ACCESS_TOKEN is empty string", async () => {
      vi.stubEnv("PPLOG_ACCESS_TOKEN", "");

      const { validateConfig } = await import("../index.js");

      expect(() => validateConfig()).toThrow(
        "PPLOG_ACCESS_TOKEN environment variable is required",
      );
    });
  });
});
