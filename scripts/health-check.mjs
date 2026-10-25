#!/usr/bin/env node
/**
 * Uptime probe for the deployed site.
 *
 * Checks that the pages users actually land on answer with 200 *and* still
 * contain the markup we expect — a 200 from a broken deploy or a parked domain
 * should count as downtime, not as "up".
 *
 * Usage:
 *   node scripts/health-check.mjs                       # probe the production site
 *   SITE_URL=http://localhost:8080 node scripts/health-check.mjs
 *
 * Env:
 *   SITE_URL              base URL to probe (default: https://sweet-vpn-spot.lovable.app)
 *   HEALTH_ATTEMPTS       attempts per page before failing (default: 3)
 *   HEALTH_TIMEOUT_MS     per-request timeout (default: 15000)
 *   HEALTH_RETRY_DELAY_MS delay between attempts (default: 5000)
 *
 * Exit code 0 when every page is healthy, 1 otherwise.
 */
import { appendFile } from "node:fs/promises";

const SITE_URL = (process.env.SITE_URL ?? "https://sweet-vpn-spot.lovable.app").replace(/\/+$/, "");
const ATTEMPTS = Number(process.env.HEALTH_ATTEMPTS ?? 3);
const TIMEOUT_MS = Number(process.env.HEALTH_TIMEOUT_MS ?? 15_000);
const RETRY_DELAY_MS = Number(process.env.HEALTH_RETRY_DELAY_MS ?? 5_000);

const TARGETS = [
  {
    path: "/",
    markers: ['data-plan="Plus"', 'data-plan="Pro"', "og:title"],
    description: "home page",
  },
  {
    path: "/terms",
    markers: ["Terms of Use"],
    description: "terms page",
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function probe(target) {
  const url = `${SITE_URL}${target.path}`;
  const startedAt = Date.now();
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": "sweet-vpn-spot-healthcheck/1.0" },
  });
  const body = await response.text();
  const elapsedMs = Date.now() - startedAt;

  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url} (${elapsedMs}ms)`);

  const missing = target.markers.filter((marker) => !body.includes(marker));
  if (missing.length > 0) {
    throw new Error(
      `${url} returned ${response.status} but is missing expected content: ${missing.join(", ")}`,
    );
  }

  return {
    url,
    description: target.description,
    status: response.status,
    elapsedMs,
    bytes: body.length,
  };
}

async function check(target) {
  let lastError;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      return await probe(target);
    } catch (error) {
      lastError = error;
      if (attempt < ATTEMPTS) {
        console.warn(`attempt ${attempt}/${ATTEMPTS} failed: ${error.message} — retrying`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }
  throw lastError;
}

const results = [];
for (const target of TARGETS) {
  try {
    const result = await check(target);
    console.log(
      `✅ ${result.url} → ${result.status} in ${result.elapsedMs}ms (${result.bytes} bytes)`,
    );
    results.push({ ...result, ok: true });
  } catch (error) {
    console.error(`❌ ${target.description} is DOWN: ${error.message}`);
    results.push({ url: `${SITE_URL}${target.path}`, ok: false, error: error.message });
  }
}

const down = results.filter((result) => !result.ok);
console.log(
  down.length === 0
    ? `\nAll ${results.length} checks passed for ${SITE_URL}`
    : `\n${down.length}/${results.length} checks failed for ${SITE_URL}`,
);

if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = results
    .map((result) =>
      result.ok
        ? `| ${result.description} | ✅ up | ${result.status} | ${result.elapsedMs} ms |`
        : `| ${(result.url ?? "").replace(SITE_URL, "") || "/"} | ❌ down | — | ${result.error} |`,
    )
    .join("\n");
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    `## Live site health — ${SITE_URL}\n\n| Page | Status | Code | Detail |\n| --- | --- | --- | --- |\n${rows}\n`,
  );
}

process.exit(down.length === 0 ? 0 : 1);
