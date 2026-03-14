import createClient from "openapi-fetch";
import packageJson from "../../package.json" with { type: "json" };
import type { paths } from "../generated/api-types.js";
import { createAuthMiddleware } from "./middleware.js";

const packageVersion = packageJson.version;

function createUserAgentMiddleware(version: string) {
  return {
    async onRequest({ request }: { request: Request }) {
      request.headers.set(
        "User-Agent",
        `pplog-mcp-server/${version} (official)`,
      );
      return request;
    },
  };
}

export function createPplogClient(
  apiAccessToken: string,
  apiBaseUrl: string = "https://api.pplog.net",
) {
  const client = createClient<paths>({
    baseUrl: apiBaseUrl,
  });

  client.use(createUserAgentMiddleware(packageVersion));
  client.use(createAuthMiddleware(apiAccessToken));

  return client;
}
