const PUBLISHED_ORIGIN = "https://sweet-vpn-spot.lovable.app";

/** Lovable editor paths 404 outside the hosted app; pin them to the published origin. */
export function publishedAssetUrl(url: string): string {
  if (url.startsWith("/__l5e/")) return `${PUBLISHED_ORIGIN}${url}`;
  return url;
}
