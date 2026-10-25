import { describe, expect, it } from "vitest";

import { healthResponse, isHealthRequest } from "@/lib/health";
import { faviconResponse, isFaviconRequest } from "@/lib/favicon";
import { publishedAssetUrl } from "@/lib/media";

describe("Liveness and static fallbacks", () => {
  it("recognizes GET /health and /healthz", () => {
    expect(isHealthRequest(new Request("https://cfg.local/health"))).toBe(true);
    expect(isHealthRequest(new Request("https://cfg.local/healthz", { method: "HEAD" }))).toBe(
      true,
    );
    expect(isHealthRequest(new Request("https://cfg.local/", { method: "GET" }))).toBe(false);
    expect(isHealthRequest(new Request("https://cfg.local/health", { method: "POST" }))).toBe(
      false,
    );
  });

  it("returns a JSON 200 for health checks", async () => {
    const response = healthResponse("GET");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, service: "sweet-vpn-spot" });
  });

  it("serves an SVG favicon instead of falling through to SSR", async () => {
    expect(isFaviconRequest(new Request("https://cfg.local/favicon.ico"))).toBe(true);
    const response = faviconResponse();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(await response.text()).toContain("<svg");
  });

  it("rewrites Lovable editor asset paths to the published origin", () => {
    expect(publishedAssetUrl("/__l5e/assets-v1/demo/clip.mp4")).toBe(
      "https://sweet-vpn-spot.lovable.app/__l5e/assets-v1/demo/clip.mp4",
    );
    expect(publishedAssetUrl("/hero.jpg")).toBe("/hero.jpg");
  });
});
