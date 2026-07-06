/**
 * Reads and validates configuration from environment variables.
 *
 * ZEVO_API_KEY      - required; sent as the `x-api-key` header on every request.
 * ZEVO_API_BASE_URL - optional; defaults to the production Client API.
 */

const DEFAULT_BASE_URL = "https://api.zevo.io/client-api/v1";

export interface Config {
  apiKey: string;
  baseUrl: string;
}

export function loadConfig(): Config {
  const apiKey = process.env.ZEVO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Missing ZEVO_API_KEY. Set it in your MCP client config (env) or shell environment. " +
        "See the README for how to obtain a ZEVO Client API key."
    );
  }

  const baseUrl = (process.env.ZEVO_API_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "");

  return { apiKey, baseUrl };
}
