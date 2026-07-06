#!/usr/bin/env node
/**
 * ZEVO Host MCP server.
 *
 * Exposes the read-only ZEVO Client API as MCP tools over stdio, so an AI agent
 * (Claude Desktop/Code, Cursor, etc.) can query a host's financial data using
 * the host's `x-api-key`.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { ZevoClient, type QueryParams } from "./client.js";
import { TOOLS } from "./tools.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const client = new ZevoClient(config);

  const server = new McpServer({
    name: "zevo-host-mcp",
    version: "0.1.0"
  });

  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.params
      },
      async (args: Record<string, unknown>) => {
        try {
          const data = await client.get(tool.path, args as QueryParams);
          return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
          };
        } catch (err) {
          return {
            isError: true,
            content: [{ type: "text", text: (err as Error).message }]
          };
        }
      }
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr is safe to log to; stdout is reserved for the MCP protocol.
  console.error(`zevo-host-mcp ready — ${TOOLS.length} tools, API ${config.baseUrl}`);
}

main().catch((err) => {
  console.error(`Failed to start zevo-host-mcp: ${(err as Error).message}`);
  process.exit(1);
});
