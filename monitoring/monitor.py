#!/usr/bin/env python3
"""
sweet-vpn-spot monitoring daemon.

Implements the SRE loop:
  1. Continuous Uptime & Health Monitoring     — HTTP health endpoint checks
  2. Self-Healing & Error Detection            — quality gates (lint/test/types/build)
  3. Auto-fix                                  — line-ending normalisation (repair.py),
                                                 only when the quality gates fail

Run modes:
  --daemon      Continuous monitoring loop (runs forever, --interval sleep); commits + pushes fixes
  --cycle       Single pass (health → quality gates → repair); commits + pushes fixes
  --once        Single pass, but fixes stay in the working tree (nothing is committed or pushed)
  (no mode)     Same as --once
  --no-fix      Disable auto-fix (diagnostic mode)
  --interval=N  Sleep N seconds between daemon cycles

Exit codes:
  0   Health checks and quality gates all pass (after any auto-fix)
  1   Something is still failing, or the repair step itself failed
"""

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))

# Project root (parent of monitoring/)
PROJECT_ROOT = os.path.abspath(os.path.join(HERE, ".."))

# --- Paths -----------------------------------------------------------------
HEALTH_CHECK = os.path.join(HERE, "health_check.py")
QUALITY_SCRIPT = os.path.join(HERE, "quality_check.sh")
REPAIR_SCRIPT = os.path.join(HERE, "repair.py")
LOG_FILE = os.path.join(HERE, "monitor.log")
MAX_LOG_LINES = 1000


# --- Logging ---------------------------------------------------------------
def log(message: str, level: str = "INFO") -> None:
    """Append a timestamped entry to the monitor log."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    line = f"[{ts}] [{level}] {message}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line)
    # Also echo to stdout (so `nohup ... &` captures it)
    print(line, end="")


def trim_log() -> None:
    """Keep the log file bounded."""
    if not os.path.exists(LOG_FILE):
        return
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()
    if len(lines) > MAX_LOG_LINES:
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            f.writelines(lines[-MAX_LOG_LINES:])


# --- Step 1: Health checks -------------------------------------------------
def step_health_check(verbose: bool = True) -> bool:
    """Run health endpoint checks. Return True if all healthy."""
    log("Step 1/3: Health checks")
    cmd = [sys.executable, HEALTH_CHECK, "--json"]
    proc = subprocess.run(cmd, capture_output=True, text=True, cwd=PROJECT_ROOT)
    if proc.returncode not in (0, 1):
        log(f"health_check.py crashed: {proc.stderr[:500]}", "ERROR")
        return False

    try:
        report = json.loads(proc.stdout)
    except json.JSONDecodeError as e:
        log(f"Could not parse health JSON: {e} | stderr={proc.stderr[:500]}", "ERROR")
        return False

    checks = report.get("checks", [])
    healthy = report.get("overall") == "healthy"
    if healthy:
        log(f"Health checks: all {len(checks)} endpoints healthy")
    else:
        failed = [c for c in checks if not c.get("ok")]
        log(f"Health checks: {len(checks) - len(failed)}/{len(checks)} healthy", "WARN")
        for f in failed:
            log(f"  FAIL: {f.get('label')} — {f.get('error')}", "WARN")

    if verbose:
        print(json.dumps(report, indent=2))

    return healthy


# --- Step 2: Quality gates -------------------------------------------------
def step_quality_gates(label: str = "Step 2/3") -> bool:
    """Run lint, test, types, build. Return True if all passed."""
    log(f"{label}: Quality gates (lint/test/types/build)")
    # Run through bash so a missing executable bit (zip downloads, Windows checkouts) cannot break it.
    proc = subprocess.run(["bash", QUALITY_SCRIPT], capture_output=True, text=True, cwd=PROJECT_ROOT)

    if proc.stdout:
        sys.stdout.write(proc.stdout)
        sys.stdout.flush()
    if proc.stderr:
        sys.stderr.write(proc.stderr)
        sys.stderr.flush()

    if proc.returncode == 0:
        log("Quality gates: ALL PASSED")
        return True

    log(f"Quality gates: FAILED (exit code {proc.returncode})", "ERROR")
    return False


# --- Step 3: Auto-repair ----------------------------------------------------
def step_repair(push: bool) -> bool:
    """Run repair.py. Return True if the repair step itself succeeded."""
    log("Step 3/3: Auto-repair")
    if not os.path.exists(REPAIR_SCRIPT):
        log(f"Repair script missing: {REPAIR_SCRIPT}", "ERROR")
        return False

    cmd = [sys.executable, REPAIR_SCRIPT]
    if push:
        cmd.append("--push")
    proc = subprocess.run(cmd, capture_output=True, text=True, cwd=PROJECT_ROOT)
    if proc.stdout:
        sys.stdout.write(proc.stdout)
        sys.stdout.flush()
    if proc.stderr:
        sys.stderr.write(proc.stderr)
        sys.stderr.flush()

    success = proc.returncode == 0
    if success:
        log("Auto-repair: SUCCESS")
    else:
        log(f"Auto-repair: FAILED (exit {proc.returncode})", "ERROR")
    return success


# --- Main loop --------------------------------------------------------------
def run_once(verbose: bool = False, do_fix: bool = True, do_push: bool = False) -> int:
    """Run one full monitoring cycle. Returns exit code."""
    log("=== Monitoring cycle started ===")

    health_ok = step_health_check(verbose=verbose)
    quality_ok = step_quality_gates()

    # Repair only touches local source files, so it can only help when the quality gates
    # fail. A down production site is not something a line-ending fix can cure.
    repair_ok = True
    if not quality_ok and do_fix:
        repair_ok = step_repair(push=do_push)
        if repair_ok:
            log("Re-verifying stability after repair...")
            quality_ok = step_quality_gates(label="Re-check")
            log(
                "Post-repair quality gates: PASSED" if quality_ok else "Post-repair quality gates: STILL FAILED",
                "INFO" if quality_ok else "WARN",
            )
    elif health_ok and quality_ok:
        log("No issues detected — skipping auto-repair")

    log("=== Monitoring cycle finished ===")
    trim_log()

    if health_ok and quality_ok and repair_ok:
        log("RESULT: STABLE — no further action needed")
        return 0
    log("RESULT: UNSTABLE — manual intervention required", "ERROR")
    return 1


def main() -> int:
    parser = argparse.ArgumentParser(description="sweet-vpn-spot SRE monitoring daemon")
    parser.add_argument("--daemon", action="store_true", help="Run as a continuous daemon")
    parser.add_argument("--interval", type=int, default=300, help="Cycle interval in seconds (default 300)")
    parser.add_argument("--once", action="store_true", help="Single cycle; fixes are NOT committed or pushed")
    parser.add_argument("--cycle", action="store_true", help="Single cycle; fixes ARE committed and pushed")
    parser.add_argument("--no-fix", action="store_true", help="Disable auto-fix (diagnostic mode)")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    args = parser.parse_args()

    do_fix = not args.no_fix

    if args.daemon:
        log(f"Daemon mode: interval={args.interval}s, auto-fix={do_fix}")
        while True:
            try:
                rc = run_once(verbose=args.verbose, do_fix=do_fix, do_push=True)
                if rc != 0:
                    log(f"Cycle exit code: {rc}", "ERROR")
            except KeyboardInterrupt:
                log("Daemon interrupted by user", "INFO")
                break
            except Exception as e:  # noqa: BLE001
                log(f"Unexpected daemon error: {e}", "ERROR")
            time.sleep(args.interval)
        return 0

    # --cycle publishes fixes; --once and the default leave them in the working tree.
    return run_once(verbose=args.verbose, do_fix=do_fix, do_push=args.cycle)


if __name__ == "__main__":
    sys.exit(main())
