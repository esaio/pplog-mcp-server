# pplog MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**日本語** | [English](https://github.com/esaio/pplog-mcp-server/blob/main/README.en.md)

pplog の公式 MCP(Model Context Protocol)サーバー(STDIO Transport 版)

## 概要

AI アシスタントとポエム共有サービス [pplog](https://pplog.net) をつなぐ MCP サーバーです。Model Context Protocol 経由で、AI アシスタントから pplog のポエムを読んだり、検索・投稿ができます。

## 使えるツール

- `get-poem` - ポエムを ID で取得
- `search-poems` - ポエムを検索（日付絞り込み、AND/OR 検索、除外検索などに対応）
- `create-poem` - 新しいポエムを投稿（画像添付も可能）

## MCP クライアントの設定

MCP クライアントの設定ファイルに以下を追加します：

### 用意する環境変数

- PPLOG_ACCESS_TOKEN: アクセストークン

### Claude Desktop の例

`claude_desktop_config.json` への追加方法：

#### オプション 1: docker(推奨)

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

#### オプション 2: npx

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

> **注意**: `/path/to/your/node` は `which node` で調べたパスに置き換えてください。

## リンク

- [pplog](https://pplog.net) - ポエム共有サービス pplog
- [Model Context Protocol](https://modelcontextprotocol.io) - MCP の詳細
- [Claude Desktop](https://claude.ai/download) - MCP 対応の AI アシスタント

## サポート

- 🐛 Issues: [GitHub Issues](https://github.com/esaio/pplog-mcp-server/issues)

---

Made with ❤️ by the esa team
