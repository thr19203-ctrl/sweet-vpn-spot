export const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="#f5f5f5" stroke-width="2.6" stroke-linecap="round"><path d="M6 22 L14 8"/><path d="M11 25 L21 7"/><path d="M17 26 L26 10"/></svg>`;

export const FAVICON_DATA_URI = `data:image/svg+xml,${encodeURIComponent(FAVICON_SVG)}`;

export function isFaviconRequest(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  try {
    const path = new URL(request.url).pathname;
    return path === "/favicon.ico" || path === "/favicon.svg";
  } catch {
    return false;
  }
}

export function faviconResponse(): Response {
  return new Response(FAVICON_SVG, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=86400",
    },
  });
}
