# sweet-vpn-spot SRE — Health Monitoring & Auto-Fix

Self-contained monitoring for the sweet-vpn-spot project. Checks the health
endpoints, runs the code-quality gates and, when those fail, applies a safe
auto-fix.

## Files

- `health_check.py`  — HTTP health endpoint checker
- `quality_check.sh` — quality gate runner (lint / test / types / build)
- `monitor.py`       — monitoring loop (health + quality + auto-fix)
- `repair.py`        — auto-fix: normalises CRLF line endings (nothing else)

## Quick start

    # One pass; fixes stay in the working tree (nothing committed or pushed)
    python3 monitor.py --once

    # One pass; fixes are committed and pushed
    python3 monitor.py --cycle

    # Diagnostics only
    python3 monitor.py --once --no-fix

    # Continuous (commits and pushes fixes)
    nohup python3 monitor.py --daemon > /var/log/sweet-vpn-spot-monitor.log 2>&1 &

    # Also probe a local server
    LOCAL_URL=http://localhost:8080 python3 health_check.py

## Monitored targets

| Target                     | URL                                        | Notes                          |
|----------------------------|--------------------------------------------|--------------------------------|
| Published production app   | https://sweet-vpn-spot.lovable.app/health  | JSON `{"ok": true}`            |
| Published production (z)   | https://sweet-vpn-spot.lovable.app/healthz | JSON `{"ok": true}`            |
| Root page                  | https://sweet-vpn-spot.lovable.app/        | HTTP 200                       |
| Local server (optional)    | `$LOCAL_URL/health`                        | only when `LOCAL_URL` is set   |

## What the auto-fix does (and does not do)

`repair.py` runs only when the quality gates fail. It converts CRLF to LF in tracked
text files. With `--commit` / `--push` it stages **only the files it changed**
(never `git add -A`), refuses to commit while merge conflicts are unresolved, and
pushes the *current* branch. It never rewrites translations or other source text.

The monitor exits `0` only if health checks and quality gates pass (re-checked
after a repair), otherwise `1`.
