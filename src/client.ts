/**
 * Thin HTTP client for the ZEVO Client API.
 *
 * Every request is a GET that carries the host's API key in the `x-api-key`
 * header. Query parameters with `undefined`/`null` values are dropped so tools
 * can pass optional args through directly.
 */

import type { Config } from "./config.js";

export type QueryParams = Record<string, string | number | undefined | null>;

export class ZevoClient {
  constructor(private readonly config: Config) {}

  async get(path: string, params: QueryParams = {}): Promise<unknown> {
    const url = new URL(this.config.baseUrl + path);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }

    let res: Response;
    try {
      res = await fetch(url, {
        method: "GET",
        headers: {
          "x-api-key": this.config.apiKey,
          accept: "application/json"
        }
      });
    } catch (err) {
      throw new Error(
        `Network error calling ZEVO API (${url.pathname}): ${(err as Error).message}`
      );
    }

    const body = await res.text();

    if (res.status === 401) {
      throw new Error(
        "401 Unauthorized from ZEVO API. Your API key is invalid, expired, or the " +
          "account does not have API access enabled."
      );
    }

    if (!res.ok) {
      throw new Error(`ZEVO API error ${res.status} on ${url.pathname}: ${body || res.statusText}`);
    }

    if (!body) return null;
    try {
      return JSON.parse(body);
    } catch {
      // Non-JSON success payload (rare) — return the raw text.
      return body;
    }
  }
}
