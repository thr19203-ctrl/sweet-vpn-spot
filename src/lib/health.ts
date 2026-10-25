const HEALTH_PATHS = new Set(["/health", "/healthz"]);

export function isHealthRequest(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  try {
    return HEALTH_PATHS.has(new URL(request.url).pathname);
  } catch {
    return false;
  }
}

export function healthResponse(method: string = "GET"): Response {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  };
  if (method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }
  return new Response(JSON.stringify({ ok: true, service: "sweet-vpn-spot" }), {
    status: 200,
    headers,
  });
}
