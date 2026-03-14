import { createPplogClient } from "../api_client/index.js";
import type { MCPContext } from "../context/mcp-context.js";

export async function withContext<T extends unknown[], R>(
  context: MCPContext,
  handler: (
    client: ReturnType<typeof createPplogClient>,
    ...args: T
  ) => Promise<R>,
  ...args: T
): Promise<R> {
  let client: ReturnType<typeof createPplogClient>;

  if ("apiAccessToken" in context && "apiBaseUrl" in context) {
    client = createPplogClient(
      context.apiAccessToken as string,
      context.apiBaseUrl as string,
    );
  } else {
    throw new Error(
      "Unsupported context type. Only StdioContext is currently supported.",
    );
  }

  return handler(client, ...args);
}
