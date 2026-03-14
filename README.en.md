# pplog MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[日本語](https://github.com/esaio/pplog-mcp-server#readme) | **English**

Official Model Context Protocol (MCP) server for pplog - STDIO transport version.

## Overview

This MCP server provides seamless integration between AI assistants and [pplog](https://pplog.net), a poem sharing service. It enables AI assistants to read, search, and create poems through the Model Context Protocol.

## Available Tools

- `get-poem` - Retrieve a poem by ID
- `search-poems` - Search poems with advanced query syntax (date filtering, AND/OR operators, exclusion, etc.)
- `create-poem` - Create a new poem with optional image attachment

## MCP Client Configuration

Add to your MCP client configuration file:

### Required Environment Variables

- PPLOG_ACCESS_TOKEN: Access Token

### Claude Desktop Example

Add to `claude_desktop_config.json`:

#### Option 1: Docker (Recommended)

```json
{
  "mcpServers": {
    "pplog": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "PPLOG_ACCESS_TOKEN",
        "ghcr.io/esaio/pplog-mcp-server"
      ],
      "env": {
        "PPLOG_ACCESS_TOKEN": "your_access_token"
      }
    }
  }
}
```

#### Option 2: npx

```json
{
  "mcpServers": {
    "pplog": {
      "command": "/Users/your-username/.nodenv/shims/npx",
      "args": ["@esaio/pplog-mcp-server"],
      "env": {
        "PPLOG_ACCESS_TOKEN": "your_access_token"
      }
    }
  }
}
```

> **Note**: Replace `/path/to/your/node` with the output of `which node` command.

## Links

- [pplog](https://pplog.net) - Poem sharing service
- [Model Context Protocol](https://modelcontextprotocol.io) - Learn more about MCP
- [Claude Desktop](https://claude.ai/download) - AI assistant with MCP support

## Support

- 🐛 Issues: [GitHub Issues](https://github.com/esaio/pplog-mcp-server/issues)

---

Made with ❤️ by the esa team
