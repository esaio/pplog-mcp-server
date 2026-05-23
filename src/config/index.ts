import packageJson from "../../package.json" with { type: "json" };

export const config = {
  pplog: {
    apiAccessToken: process.env.PPLOG_ACCESS_TOKEN || "",
    apiBaseUrl: process.env.PPLOG_API_BASE_URL || "https://api.pplog.net",
  },
  server: {
    name: "pplog-mcp-server",
    version: packageJson.version,
    description: "Official MCP server for pplog",
  },
} as const;

export function validateConfig(): void {
  if (!config.pplog.apiAccessToken) {
    throw new Error("PPLOG_ACCESS_TOKEN environment variable is required");
  }
}
