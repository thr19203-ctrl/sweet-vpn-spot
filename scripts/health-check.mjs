#!/usr/bin/env node
/**
 * Uptime probe for the deployed site.
 *
 * A 200 is not enough: a broken deploy, a parked domain or a half-finished
 * release can all answer 200. The probe therefore checks that
 *   1. every public page answers 2xx,
 *   2. the expected markup is still there (prices, sections, terms copy),
 *   3. no page fell back to the error screen,
 *   4. every same-origin stylesheet/script/image referenced by the home page
 *      actually loads.
 *
 * Usage:
 *   node scripts/health-check.mjs                       # probe production
 *   SITE_URL=http://localhost:8080 node scripts/health-check.mjs
 *
 * Env:
 *   SITE_URL               base URL to probe (default: https://sweet-vpn-spot.lovable.app)
 *   HEALTH_ATTEMPTS        attempts per page before failing (default: 3)
 *   HEALTH_TIMEOUT_MS      per-request timeout (default: 15000)
 *   HEALTH_RETRY_DELAY_MS  delay between attempts (default: 5000)
 *   HEALTH_ASSET_LIMIT     max assets to verify per run (default: 10)
 *
 * Exit codes: 0 healthy, 1 outage (a page is unreachable), 2 degraded
 * (pages work, but an asset they reference is broken).
 */
import { appendFile, writeFile } from "node:fs/promises";

const SITE_URL = (process.env.SITE_URL ?? "https://sweet-vpn-spot.lovable.app").replace(/\/+$/, "");
const ATTEMPTS = Number(process.env.HEALTH_ATTEMPTS ?? 3);
const TIMEOUT_MS = Number(process.env.HEALTH_TIMEOUT_MS ?? 15_000);
const RETRY_DELAY_MS = Number(process.env.HEALTH_RETRY_DELAY_MS ?? 5_000);
const ASSET_LIMIT = Number(process.env.HEALTH_ASSET_LIMIT ?? 10);
const SLOW_RESPONSE_MS = Number(process.env.HEALTH_SLOW_MS ?? 4_000);

const PAGES = [
  {
    path: "/",
    label: "home",
    // Rendered by the pricing section — the first thing to vanish when a
    // release ships a broken route.
    markers: ['data-plan="Plus"', 'data-plan="Pro"', "og:title"],
  },
  { path: "/terms", label: "terms", markers: ["Terms of Use"] },
];

const ERROR_SCREEN = "This page didn't load";
const ASSET_RE =
  /(?:src|href)="([^"]+\.(?:css|js|mjs|jpe?g|png|webp|svg|ico|woff2?)(?:\?[^"]*)?)"/g;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(url) {
  const startedAt = Date.now();
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": "sweet-vpn-spot-healthcheck/2.0" },
  });
  const body = await response.text();
  return { response, body, elapsedMs: Date.now() - startedAt };
}

async function probePage(page) {
  const url = `${SITE_URL}${page.path}`;
  const { response, body, elapsedMs } = await request(url);

  // Only a failed request counts as an outage. A 2xx with unexpected content
  // is reported as "degraded" so a content change never looks like downtime.
  if (!response.ok) throw new Error(`HTTP ${response.status} (${elapsedMs}ms)`);

  const problems = [];
  if (body.includes(ERROR_SCREEN)) problems.push("error screen rendered");
  const missing = page.markers.filter((marker) => !body.includes(marker));
  if (missing.length > 0) problems.push(`missing content: ${missing.join(", ")}`);

  return { label: page.label, path: page.path, status: response.status, elapsedMs, body, problems };
}

async function checkPage(page) {
  let lastError;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      return await probePage(page);
    } catch (error) {
      lastError = error;
      if (attempt < ATTEMPTS) {
        console.warn(`  ↻ ${page.label}: attempt ${attempt}/${ATTEMPTS} failed (${error.message})`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }
  throw lastError;
}

function collectAssets(html) {
  const seen = new Set();
  const assets = [];
  for (const match of html.matchAll(ASSET_RE)) {
    const raw = match[1];
    if (!raw) continue;
    let url;
    try {
      url = new URL(raw, SITE_URL);
    } catch {
      continue;
    }
    // Third-party hosts (e.g. Google Fonts) are not ours to page for.
    if (url.origin !== new URL(SITE_URL).origin) continue;
    if (seen.has(url.pathname)) continue;
    seen.add(url.pathname);
    assets.push(url.toString());
    if (assets.length >= ASSET_LIMIT) break;
  }
  return assets;
}

async function checkAsset(url) {
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "sweet-vpn-spot-healthcheck/2.0" },
    });
    const elapsedMs = Date.now() - startedAt;
    if (response.status >= 400) return { url, ok: false, status: response.status, elapsedMs };
    return { url, ok: true, status: response.status, elapsedMs };
  } catch (error) {
    return { url, ok: false, error: error.message, elapsedMs: Date.now() - startedAt };
  }
}

const pages = [];
for (const page of PAGES) {
  try {
    const result = await checkPage(page);
    const icon = result.problems.length > 0 ? "⚠️" : "✅";
    console.log(
      `${icon} ${page.label} (${result.path}) → ${result.status} in ${result.elapsedMs}ms`,
    );
    for (const problem of result.problems) console.warn(`  ⚠ ${problem}`);
    if (result.elapsedMs > SLOW_RESPONSE_MS) {
      console.warn(`  ⚠ slow response (${result.elapsedMs}ms > ${SLOW_RESPONSE_MS}ms)`);
    }
    pages.push({ ...result, ok: true });
  } catch (error) {
    console.error(`❌ ${page.label} (${page.path}) is DOWN: ${error.message}`);
    pages.push({ label: page.label, path: page.path, ok: false, error: error.message });
  }
}

const home = pages.find((page) => page.label === "home" && page.ok);
const assets = [];
if (home?.body) {
  const urls = collectAssets(home.body);
  const results = await Promise.all(urls.map((url) => checkAsset(url)));
  for (const result of results) {
    const name = new URL(result.url).pathname;
    if (result.ok) console.log(`✅ asset ${name} → ${result.status}`);
    else console.error(`❌ asset ${name} → ${result.error ?? `HTTP ${result.status}`}`);
  }
  assets.push(...results);
  if (results.length === 0) console.warn("⚠ no same-origin assets found on the home page");
}

const pageFailures = pages.filter((page) => !page.ok);
const degradedPages = pages.filter((page) => page.ok && (page.problems?.length ?? 0) > 0);
const assetFailures = assets.filter((asset) => !asset.ok);
const checked = pages.length + assets.length;
// "down" — users cannot load a page at all.
// "degraded" — pages load, but their content or a referenced asset is broken.
const status =
  pageFailures.length > 0
    ? "down"
    : degradedPages.length > 0 || assetFailures.length > 0
      ? "degraded"
      : "ok";

const reasons = [
  ...degradedPages.map((page) => `${page.path}: ${page.problems.join("; ")}`),
  ...assetFailures.map(
    (asset) => `${new URL(asset.url).pathname}: ${asset.error ?? `HTTP ${asset.status}`}`,
  ),
];

console.log(
  status === "ok"
    ? `\nAll ${checked} checks passed for ${SITE_URL}`
    : status === "down"
      ? `\nOUTAGE: ${pageFailures.length}/${pages.length} pages unreachable for ${SITE_URL}`
      : `\nDEGRADED: ${reasons.length} problem(s) on ${SITE_URL}\n${reasons.map((reason) => `  - ${reason}`).join("\n")}`,
);

const reportPath = process.env.HEALTH_REPORT ?? "health-report.json";
await writeFile(
  reportPath,
  `${JSON.stringify(
    {
      status,
      site: SITE_URL,
      checkedAt: new Date().toISOString(),
      pages: pages.map(({ body: _body, ...page }) => page),
      assets,
    },
    null,
    2,
  )}\n`,
);

if (process.env.GITHUB_STEP_SUMMARY) {
  const pageRows = pages
    .map((page) => {
      if (!page.ok) return `| ${page.path} | ❌ down | — | ${page.error} |`;
      const note = page.problems?.length ? page.problems.join("; ") : "—";
      return `| ${page.path} | ${page.problems?.length ? "⚠️ degraded" : "✅ up"} | ${page.status} | ${note} |`;
    })
    .join("\n");
  const assetRows = assets
    .map((asset) => {
      const name = new URL(asset.url).pathname;
      return asset.ok
        ? `| ${name} | ✅ | ${asset.status} | ${asset.elapsedMs} ms |`
        : `| ${name} | ❌ | ${asset.status ?? "—"} | ${asset.error ?? "failed"} |`;
    })
    .join("\n");

  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    [
      `## Live site health — ${SITE_URL}`,
      "",
      "### Pages",
      "| Path | Status | Code | Note |",
      "| --- | --- | --- | --- |",
      pageRows,
      "",
      "### Assets referenced by the home page",
      "| Asset | Status | Code | Time |",
      "| --- | --- | --- | --- |",
      assetRows || "| — | — | — | — |",
      "",
    ].join("\n"),
  );
}

process.exit(status === "ok" ? 0 : status === "degraded" ? 2 : 1);
