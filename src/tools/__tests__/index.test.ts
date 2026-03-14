import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MCPContext } from "../../context/mcp-context.js";
import { setupTools } from "../index.js";

describe("setupTools", () => {
  let server: McpServer;
  let context: MCPContext;
  let consoleErrorSpy: MockInstance<typeof console.error>;

  beforeEach(() => {
    server = new McpServer({
      name: "test-server",
      version: "1.0.0",
    });
    context = {} as unknown as MCPContext;

    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should register all 3 tools with correct handlers", () => {
    const registerToolSpy = vi.spyOn(server, "registerTool");

    setupTools(server, context);

    expect(registerToolSpy).toHaveBeenCalledTimes(3);

    const expectedToolNames = ["get-poem", "search-poems", "create-poem"];

    for (let i = 0; i < 3; i++) {
      const call = registerToolSpy.mock.calls[i] as unknown as [
        string,
        object,
        // biome-ignore lint/complexity/noBannedTypes: Function type needed for mock verification
        Function,
      ];
      const [toolName, schema, handler] = call;
      expect(toolName).toBe(expectedToolNames[i]);
      expect(schema).toBeTypeOf("object");
      expect(handler).toBeTypeOf("function");
    }
  });

  it("should log setup completion message", () => {
    setupTools(server, context);

    expect(consoleErrorSpy).toHaveBeenCalledWith("Setting up MCP tools...");
  });
});
