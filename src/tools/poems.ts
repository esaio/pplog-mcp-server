import { z } from "zod";
import type { createPplogClient } from "../api_client/index.js";
import {
  formatToolError,
  formatToolResponse,
} from "../formatters/mcp-response.js";
import type { paths } from "../generated/api-types.js";

type PoemsResponse =
  paths["/v1/poems"]["get"]["responses"]["200"]["content"]["application/json"];
type PoemListItem = PoemsResponse["poems"][number];

export const getPoemSchema = z.object({
  id: z.string().describe("Poem ID"),
});

export const searchPoemsSchema = z.object({
  keyword: z
    .string()
    .optional()
    .describe(
      `Search query for poems. Supports advanced search patterns:

## Important Note for Relative Date Queries:
**CRITICAL: Always get today's actual date from the system before processing
relative date queries (e.g., "today", "yesterday", "last week", "recent").

Convert relative terms to absolute dates for accurate searching.**

## Query Syntax:
- Basic search: "keyword" for partial match, "exact phrase" for exact match
- Negative search: "-keyword" to exclude
- Date search:
  - date:2023 (year), date:2023-10 (month), date:2023-10-11 (day)
  - date>2023-10-01, date>=2023-10-01, date<2023-10-01, date<=2023-10-01
  - before:2023-10-01, after:2023-10-01
- Logical operators:
  - AND (case-insensitive) or just space
  - OR (case-insensitive)
- Grouping: (keyword1 OR keyword2) AND keyword3

Empty string returns all your poems.`,
    ),
  page: z
    .number()
    .optional()
    .describe(
      "Page number (starting from 1). If omitted, retrieves the first page.",
    ),
});

export const createPoemSchema = z.object({
  content: z
    .string()
    .describe("Poem content (first line is title, rest is body)"),
});

export async function getPoem(
  client: ReturnType<typeof createPplogClient>,
  args: z.infer<typeof getPoemSchema>,
) {
  try {
    const { data, error, response } = await client.GET("/v1/poems/{id}", {
      params: {
        path: { id: args.id },
      },
    });

    if (error || !response.ok || !data) {
      return formatToolError(error || response.status);
    }

    return formatToolResponse(data);
  } catch (error) {
    return formatToolError(error);
  }
}

export async function searchPoems(
  client: ReturnType<typeof createPplogClient>,
  args: z.infer<typeof searchPoemsSchema>,
) {
  try {
    const { data, error, response } = await client.GET("/v1/poems", {
      params: {
        query: {
          ...(args.keyword ? { keyword: args.keyword } : {}),
          ...(args.page ? { page: args.page } : {}),
        },
      },
    });

    if (error || !response.ok || !data) {
      return formatToolError(error || response.status);
    }

    return formatToolResponse({
      poems: data.poems.map((poem: PoemListItem) => ({
        id: poem.id,
        title: poem.title,
        content:
          poem.content && poem.content.length > 200
            ? `${poem.content.substring(0, 200)}...`
            : poem.content,
        created_at: poem.created_at,
      })),
      pagination: data.pagination,
    });
  } catch (error) {
    return formatToolError(error);
  }
}

export async function createPoem(
  client: ReturnType<typeof createPplogClient>,
  args: z.infer<typeof createPoemSchema>,
) {
  try {
    const { data, error, response } = await client.POST("/v1/poems", {
      body: {
        content: args.content,
      },
    });

    if (error || !response.ok || !data) {
      return formatToolError(error || response.status);
    }

    return formatToolResponse(data);
  } catch (error) {
    return formatToolError(error);
  }
}
