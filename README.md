# ZEVO Host MCP Server

Give your AI agent direct, read-only access to your ZEVO financial data.

This is a small [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server. An MCP
server advertises a set of **tools** to an AI agent; the agent reads their descriptions, decides
which to call, and this server executes the matching request against the [ZEVO Client
API](https://api.zevo.io/client-api/v1) using your API key. Drop in your key, register it with your
agent, and ask questions like *"which of my vehicles are out on a trip right now?"* or *"show my
wallet transactions for this month."*

It runs **locally over stdio** and is **read-only** — no payouts, no writes.

## Tools

| Tool | What it returns |
|---|---|
| `get_me` | The authenticated account and its wallet |
| `list_vehicles` | Vehicles on your account (VIN, listing details, charge %, ...) |
| `list_bookings` | Bookings (trip records): status, VIN, pricing, timing |
| `list_active_bookings` | Only bookings where a renter currently has the vehicle |
| `list_inspections` | Pre/post-trip inspection records with photos and damage tags |
| `list_receipts` | Itemized charges billed to renters (amounts in cents) |
| `get_receipts_by_vehicle` | Receipts for one vehicle (`vehicleId`) |
| `get_receipts_by_booking` | Receipts for one booking (`bookingId`) |
| `list_transactions` | Wallet ledger — best for statements & payout reconciliation |
| `get_transactions_by_vin` | Wallet transactions for one Tesla by VIN |

List tools return up to 10 records at a time; the agent pages with `skip`.

## Getting an API key

You need a ZEVO Client API key. It is sent as the `x-api-key` header and is scoped to your account,
so tools only ever return your own data. Contact ZEVO (or use the host dashboard, if available) to
issue a key for your account.

## Quickstart

Requires Node.js 18+.

```bash
npm install
npm run build
```

Verify it locally with the MCP Inspector:

```bash
ZEVO_API_KEY=your_key npm run inspect
```

## Configure your agent

### Claude Desktop / Claude Code

Add to your `claude_desktop_config.json` (Claude Desktop) or MCP config:

```json
{
  "mcpServers": {
    "zevo-host": {
      "command": "npx",
      "args": ["-y", "zevo-host-mcp"],
      "env": { "ZEVO_API_KEY": "YOUR_KEY" }
    }
  }
}
```

Or, if running from a local checkout:

```json
{
  "mcpServers": {
    "zevo-host": {
      "command": "node",
      "args": ["/absolute/path/to/zevo-host-mcp/dist/index.js"],
      "env": { "ZEVO_API_KEY": "YOUR_KEY" }
    }
  }
}
```

### Cursor

Add the same block to `~/.cursor/mcp.json` (or the project's `.cursor/mcp.json`).

## Configuration

| Env var | Required | Default | Description |
|---|---|---|---|
| `ZEVO_API_KEY` | yes | — | Your Client API key (sent as `x-api-key`) |
| `ZEVO_API_BASE_URL` | no | `https://api.zevo.io/client-api/v1` | Override for staging/local |

## Adding an endpoint

Append one entry to the `TOOLS` array in [`src/tools.ts`](src/tools.ts) — name, description, path,
and a small zod schema for its params. Nothing else needs to change.

## License

MIT
