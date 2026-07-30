/**
 * Cloudflare Worker entry point for the static Vyrelix application.
 * The Sites runtime provides the ASSETS binding during deployment.
 */
const SECURITY_HEADERS = Object.freeze({
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const assetResponse = await env.ASSETS.fetch(request);
    const response = assetResponse.status === 404 && !url.pathname.includes(".")
      ? await env.ASSETS.fetch(new Request(new URL("/index.html", url), request))
      : assetResponse;
    const headers = new Headers(response.headers);
    Object.entries(SECURITY_HEADERS).forEach(([name, value]) => headers.set(name, value));
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
};
