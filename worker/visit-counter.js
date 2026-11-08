/**
 * Visit counter for lairdscabar.com
 *
 * Cloudflare Worker + KV. Returns the total visit count as JSON, and
 * increments it when called with ?hit=1.
 *
 *   GET /            -> {"count": 1234}            (read only)
 *   GET /?hit=1      -> {"count": 1235}            (count this visit)
 *
 * Setup (Cloudflare dashboard, ~3 minutes):
 *   1. Storage & databases > KV > Create namespace, name it VISITS.
 *   2. Compute > Workers > Create > start from "Hello World", name it
 *      visit-counter, then paste this file in as the code and deploy.
 *   3. Worker > Settings > Bindings > Add > KV namespace:
 *        Variable name: VISITS      Namespace: the one from step 1.
 *   4. Deploy again, then copy the worker URL (…​.workers.dev).
 *   5. Put that URL in data-endpoint on the footer counter in every page.
 *
 * The free plan covers 100k requests/day, far more than a portfolio needs.
 */

const ALLOWED_ORIGINS = [
  "https://lairdscabar.com",
  "https://www.lairdscabar.com",
  "https://lairdo7.github.io",
];

const KEY = "total";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers });
    if (request.method !== "GET") return new Response("Method not allowed", { status: 405, headers });

    if (!env.VISITS) {
      return new Response(JSON.stringify({ error: "KV binding VISITS is missing" }), { status: 500, headers });
    }

    const url = new URL(request.url);
    let count = parseInt((await env.VISITS.get(KEY)) || "0", 10);
    if (!Number.isFinite(count)) count = 0;

    if (url.searchParams.get("hit") === "1") {
      count += 1;
      await env.VISITS.put(KEY, String(count));
    }

    return new Response(JSON.stringify({ count }), { headers });
  },
};
