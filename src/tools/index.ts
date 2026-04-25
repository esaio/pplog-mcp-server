import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { withContext } from "../api_client/with-context.js";
import type { MCPContext } from "../context/mcp-context.js";
import {
  createPoem,
  createPoemSchema,
  getPoem,
  getPoemSchema,
  searchPoems,
  searchPoemsSchema,
} from "./poems.js";

export function setupTools(server: McpServer, context: MCPContext): void {
  console.error("Setting up MCP tools...");

  server.registerTool(
    "get-poem",
    {
      title: "Get Poem",
      description: "Retrieves a poem from pplog by ID.",
      inputSchema: getPoemSchema.shape,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (params: z.infer<typeof getPoemSchema>) =>
      withContext(context, getPoem, params),
  );

  server.registerTool(
    "search-poems",
    {
      title: "Search Poems",
      description:
        "Searches for poems in pplog with advanced query syntax support.",
      inputSchema: searchPoemsSchema.shape,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (params: z.infer<typeof searchPoemsSchema>) =>
      withContext(context, searchPoems, params),
  );

  server.registerTool(
    "create-poem",
    {
      title: "Create Poem",
      description:
        "Creates a pplog poem: a casual short note (not literary verse). Posting hides your previous poem from other readers.",
      inputSchema: createPoemSchema.shape,
      annotations: {
        destructiveHint: true,
      },
    },
    async (params: z.infer<typeof createPoemSchema>) =>
      withContext(context, createPoem, params),
  );
}
