#!/usr/bin/env python3
"""
sweet-vpn-spot health endpoint checker.

Checks the application's HTTP health endpoints and verifies they return
HTTP 200 OK and a responsive body. Supports published production endpoints and,
optionally, a local dev/preview server, with optional JSON status verification.

Environment:
  LOCAL_URL   Base URL of a local server to probe as well, e.g. http://localhost:8080.
              Unset by default: a dev server that simply is not running must not make
              the whole report (and the monitor built on it) look unhealthy.
"""

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path

# Project root (this file lives in monitoring/)
PROJECT_ROOT = Path(__file__).parent.parent.resolve()

PRODUCTION_URL = "https://sweet-vpn-spot.lovable.app"

# Monitored endpoints: (label, url, expect_json_ok)
HEALTH_ENDPOINTS = [
    ("Published production app", f"{PRODUCTION_URL}/health", True),
    ("Published production app (healthz)", f"{PRODUCTION_URL}/healthz", True),
    ("Root page", f"{PRODUCTION_URL}/", False),
]

DEFAULT_TIMEOUT = 10  # seconds


def default_endpoints() -> list[tuple[str, str, bool]]:
    """Production endpoints, plus the local server when LOCAL_URL is set."""
    endpoints = list(HEALTH_ENDPOINTS)
    local = os.environ.get("LOCAL_URL", "").strip().rstrip("/")
    if local:
        endpoints.insert(0, ("Local server", f"{local}/health", True))
    return endpoints


@dataclass
class HealthCheckResult:
    label: str
    url: str
    ok: bool
    status_code: int | None
    response_time_ms: float
    error: str = ""
    body_preview: str = ""


def check_endpoint(label: str, url: str, expect_json_ok: bool) -> HealthCheckResult:
    """Perform a single HTTP health check against a target URL."""
    start = time.monotonic()
    result = HealthCheckResult(label=label, url=url, ok=False, status_code=None, response_time_ms=0.0)

    try:
        req = urllib.request.Request(url, method="GET", headers={"User-Agent": "sweet-vpn-spot-SRE/1.0"})
        with urllib.request.urlopen(req, timeout=DEFAULT_TIMEOUT) as resp:
            elapsed_ms = (time.monotonic() - start) * 1000.0
            result.status_code = resp.status
            result.response_time_ms = round(elapsed_ms, 2)

            body = resp.read(4096).decode("utf-8", errors="replace")
            result.body_preview = body[:200]

            if resp.status != 200:
                result.error = f"HTTP {resp.status} (expected 200)"
                return result

            if expect_json_ok:
                # An empty body is not a healthy JSON response.
                try:
                    payload = json.loads(body)
                except json.JSONDecodeError:
                    result.error = "Response is not valid JSON"
                    return result
                if not isinstance(payload, dict) or not payload.get("ok"):
                    result.error = f"Expected 'ok: true' in response, got {payload}"
                    return result

            result.ok = True
            return result

    except urllib.error.HTTPError as e:
        elapsed_ms = (time.monotonic() - start) * 1000.0
        result.status_code = e.code
        result.response_time_ms = round(elapsed_ms, 2)
        result.error = f"HTTP error: {e.code} {e.reason}"
        return result
    except urllib.error.URLError as e:
        elapsed_ms = (time.monotonic() - start) * 1000.0
        result.response_time_ms = round(elapsed_ms, 2)
        result.error = f"Connection failed: {e.reason}"
        return result
    except Exception as e:  # noqa: BLE001
        elapsed_ms = (time.monotonic() - start) * 1000.0
        result.response_time_ms = round(elapsed_ms, 2)
        result.error = f"Unexpected error: {type(e).__name__}: {e}"
        return result


def run_health_checks(endpoint_urls: list[tuple[str, str, bool]] | None = None) -> list[HealthCheckResult]:
    """Run all configured health checks and return results."""
    targets = endpoint_urls or default_endpoints()
    return [check_endpoint(label, url, expect_json_ok) for label, url, expect_json_ok in targets]


def parse_endpoint_overrides(specs: list[str]) -> list[tuple[str, str, bool]]:
    """Parse `label|url|expect_json_ok` specs from --endpoints (expect_json_ok defaults to false)."""
    targets: list[tuple[str, str, bool]] = []
    for spec in specs:
        parts = [part.strip() for part in spec.split("|")]
        if len(parts) < 2 or not parts[0] or not parts[1]:
            raise ValueError(f"Invalid endpoint {spec!r}; expected label|url[|true|false]")
        expect_json = len(parts) > 2 and parts[2].lower() in ("1", "true", "yes")
        targets.append((parts[0], parts[1], expect_json))
    return targets


def print_results(results: list[HealthCheckResult], verbose: bool = False) -> bool:
    """Print a human-readable summary of health check results. Returns True if all healthy."""
    print("=" * 64)
    print(" SWEET VPN SPOT — Health Check Results")
    print("=" * 64)
    all_ok = True
    for r in results:
        status = "PASS" if r.ok else "FAIL"
        if not r.ok:
            all_ok = False
        print(f"[{status}] {r.label}")
        print(f"       URL: {r.url}")
        if r.status_code is not None:
            print(f"       HTTP: {r.status_code}  ({r.response_time_ms:.1f} ms)")
        if r.error:
            print(f"       ERROR: {r.error}")
        if r.body_preview:
            print(f"       BODY: {r.body_preview}")
        print()

    print("=" * 64)
    print(f" Overall: {'ALL HEALTHY' if all_ok else 'DEGRADED / SEVERE'}")
    print("=" * 64)

    if verbose:
        failed = [r for r in results if not r.ok]
        print(f"\nDetailed report: {len(results) - len(failed)}/{len(results)} healthy")
        for r in failed:
            print(f"  FAILED: {r.label} — {r.error}")
        print()

    return all_ok


def main() -> int:
    parser = argparse.ArgumentParser(description="Health check for sweet-vpn-spot")
    parser.add_argument(
        "--endpoints",
        nargs="+",
        help="Override health endpoints (label|url|expect_json_ok)",
    )
    parser.add_argument("--verbose", action="store_true", help="Show full report")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    try:
        overrides = parse_endpoint_overrides(args.endpoints) if args.endpoints else None
    except ValueError as e:
        parser.error(str(e))

    results = run_health_checks(overrides)

    if args.json:
        output = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "overall": "healthy" if all(r.ok for r in results) else "degraded",
            "checks": [
                {
                    "label": r.label,
                    "url": r.url,
                    "ok": r.ok,
                    "http_status": r.status_code,
                    "response_time_ms": r.response_time_ms,
                    "error": r.error,
                }
                for r in results
            ],
        }
        print(json.dumps(output, indent=2))
    else:
        print_results(results, verbose=args.verbose)

    return 0 if all(r.ok for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())
