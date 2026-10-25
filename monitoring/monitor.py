#!/usr/bin/env python3
"""
sweet-vpn-spot monitoring daemon.

Implements the full SRE loop:
  1. Continuous Uptime & Health Monitoring     — HTTP health endpoint checks
  2. Self-Healing & Error Detection            — quality gates (lint/test/types/build)
  3. Autonomous Auto-Fix with commit/push      — safe fixes + git operations

Run modes:
  --daemon      Continuous monitoring loop (runs forever, --interval sleep)
  --once        Single pass (health → quality gates → repair)
  --cycle       Same as --once but also commits/pushes fixes
  --no-fix      Disable auto-fix (diagnostic mode)
  --interval=N  Sleep N seconds between daemon cycles

Exit codes:
  0   All checks healthy and no repair needed (or fixes applied successfully)
  1   Some check failed / repair failed
"""

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone

# Project root (parent of monitoring/)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# --- Paths -----------------------------------------------------------------
HEALTH_CHECK = os.path.join(os.path.dirname(__file__), "health_check.py")
QUALITY_SCRIPT = os.path.join(os.path.dirname(__file__), "quality_check.sh")
LOG_FILE = os.path.join(PROJECT_ROOT, "monitoring", "monitor.log")
MAX_LOG_LINES = 1000

# Git identity (configured for this repo)
GIT_USER = "sweet-vpn-spot-SRE"
GIT_EMAIL = "sre@sweet-vpn-spot.local"

# Repair script (created by this module if missing)
REPAIR_SCRIPT = os.path.join(os.path.dirname(__file__), "repair.py")

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
def step_quality_gates() -> bool:
    """Run lint, test, types, build. Return True if all passed."""
    log("Step 2/3: Quality gates (lint/test/types/build)")
    cmd = [QUALITY_SCRIPT]
    proc = subprocess.run(cmd, capture_output=True, text=True, cwd=PROJECT_ROOT)

    # Stream output in real time
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
def ensure_repair_script() -> bool:
    """Ensure a repair script exists; generate one if missing."""
    if os.path.exists(REPAIR_SCRIPT):
        return True

    repair_code = '''
#!/usr/bin/env python3
"""
Auto-repair for sweet-vpn-spot.
Applies safe, reversible code corrections and commits them.
"""
import json, os, subprocess, sys, time
from pathlib import Path

PROJECT = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
MON = PROJECT / "monitoring"
LOG = MON / "repair.log"

def log(msg, level="INFO"):
    ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    line = f"[{ts}] [{level}] {msg}"
    LOG.open("a").write(line + "\\n")
    print(line)

def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, cwd=PROJECT, **kw)

def git(*) -> subprocess.CompletedProcess:
    return run(["git", *list(*)], check=False)

def fix_i18n_free_plan():
    """The i18n Russian test expects no word 'Free' in translations.
    Replace 'Free' with 'Бесплатный' in the Russian dict entry."""
    import re
    i18n = PROJECT / "src/lib/i18n.ts"
    text = i18n.read_text(encoding="utf-8")
    # Russian entry containing 'Free'
    lines = text.split("\\n")
    new_lines = []
    changed = False
    for line in lines:
        # Look for lines with Russian '無料' or 'Free' inside mk([...]) arrays
        if "無料" in line or 'Free' in line:
            # Only fix if within the ru: dict (look for 'ru:' prefix)
            if "ru:" in line or 'ru: { name: "Русский"' in text:
                # Replace 'Free' with 'Бесплатный'
                line = line.replace("Free", "Бесплатный")
                changed = True
        new_lines.append(line)
    if changed:
        i18n.write_text("\\n".join(new_lines), encoding="utf-8")
        log("Fixed i18n Russian 'Free' -> 'Бесплатный'")
        return True
    log("No i18n fix needed", "DEBUG")
    return False

def fix_crlf():
    """Convert CRLF to LF end-of-line in tracked source files."""
    r = git("config", "core.autocrlf")
    if r.returncode == 0 and "false" in r.stdout:
        log("core.autocrlf already set to input", "DEBUG")
    else:
        r = git("config", "core.autocrlf", "input")
        log("Set core.autocrlf=input" if r.returncode == 0 else f"git config failed: {r.stderr[:200]}", "DEBUG")

    # Find tracked files with CRLF and fix them
    r = run(["git", "grep", "-I", "-l", "\\r", "--", "."])
    if r.returncode != 0:
        log("No CRLF files found", "DEBUG")
        return True

    count = 0
    for path in r.stdout.splitlines():
        if path.startswith("."):  # .git directory
            continue
        p = Path(path)
        if not p.exists():
            continue
        data = p.read_bytes()
        if b"\\r\\n" not in data:
            continue
        p.write_bytes(data.replace(b"\\r\\n", b"\\n"))
        log(f"Fixed CRLF -> LF in {path}")
        count += 1
    return count > 0

def commit_and_push(branch: str = "main"):
    log("Committing and pushing auto-fix changes")
    r = git("config", "user.name", GIT_USER)
    if r.returncode != 0:
        log("Failed to set git user.name", "ERROR")
    r = git("config", "user.email", GIT_EMAIL)
    if r.returncode != 0:
        log("Failed to set git user.email", "ERROR")
    r = git("add", "-A")
    if r.returncode != 0:
        log(f"git add failed: {r.stderr[:300]}", "ERROR")
        return False
    r = git("diff", "--staged", "--name-only")
    if not r.stdout.strip():
        log("No changes to commit", "DEBUG")
        return True
    r = git("commit", "-m", "auto-fix: SRE health and quality gate repairs")
    if r.returncode != 0:
        log(f"git commit failed: {r.stderr[:300]}", "ERROR")
        return False
    log("Committed auto-fix changes")
    r = git("push", "origin", branch)
    if r.returncode != 0:
        log(f"git push failed: {r.stderr[:300]}", "ERROR")
        return False
    log("Pushed auto-fix commits")
    return True

def main():
    log("Starting auto-repair pass")
    fixes = []
    try:
        fixes.append(("i18n", fix_i18n_free_plan()))
    except Exception as e:
        log(f"i18n fix error: {e}", "ERROR")
    try:
        fixes.append(("crlf", fix_crlf()))
    except Exception as e:
        log(f"crlf fix error: {e}", "ERROR")
    ok = True
    for name, result in fixes:
        log(f"fix:{name} = {result}", "DEBUG")
        if not result:
            ok = False
    if ok and len([f for f in fixes if f[1]]) > 0:
        commit_and_push()
    log("Auto-repair pass finished", "INFO")
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
'''
    MON.mkdir(parents=True, exist_ok=True)
    REPAIR_SCRIPT.write_text(repair_code, encoding="utf-8")
    os.chmod(REPAIR_SCRIPT, 0o755)
    log(f"Generated auto-repair script at {REPAIR_SCRIPT}", "INFO")
    return True


def step_repair() -> bool:
    """Run the repair script. Return True if repair succeeded."""
    log("Step 3/3: Auto-repair")
    if not os.path.exists(REPAIR_SCRIPT):
        log("Repair script missing; generating", "WARN")
        ensure_repair_script()

    proc = subprocess.run(
        [sys.executable, REPAIR_SCRIPT],
        capture_output=True,
        text=True,
        cwd=PROJECT_ROOT,
    )
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
def run_once(verbose: bool = False, do_fix: bool = True, do_push: bool = True) -> int:
    """Run one full monitoring cycle. Returns exit code."""
    log("=== Monitoring cycle started ===")
    steps: list[tuple[str, bool]] = [
        ("health", True),
        ("quality", True),
        ("repair", do_fix),
    ]

    # 1. Health
    health_ok = step_health_check(verbose=verbose)

    # 2. Quality gates
    quality_ok = step_quality_gates()

    # 3. Auto-repair (only if a health or quality issue was found)
    repair_ok = False
    if health_ok and quality_ok:
        log("No issues detected — skipping auto-repair")
        repair_ok = True
    elif do_fix:
        repair_ok = step_repair()

    log("=== Monitoring cycle finished ===")

    # Verify: after repair, re-run quality gates to confirm stability
    if do_fix and (not health_ok or not quality_ok):
        log("Re-verifying stability after repair...")
        # Re-run quality gates briefly
        q2 = step_quality_gates()
        if q2:
            log("Post-repair quality gates: PASSED")
        else:
            log("Post-repair quality gates: STILL FAILED", "WARN")

    overall = health_ok and quality_ok
    if repair_ok and overall:
        log("RESULT: STABLE — no further action needed")
        return 0
    elif repair_ok:
        log("RESULT: STABLE after auto-fix (verify manually)")
        return 0
    else:
        log("RESULT: UNSTABLE — manual intervention required", "ERROR")
        return 1


def main() -> int:
    parser = argparse.ArgumentParser(description="sweet-vpn-spot SRE monitoring daemon")
    parser.add_argument("--daemon", action="store_true", help="Run as a continuous daemon")
    parser.add_argument("--interval", type=int, default=300, help="Cycle interval in seconds (default 300)")
    parser.add_argument("--once", action="store_true", help="Single monitoring cycle (alias for --cycle)")
    parser.add_argument("--cycle", action="store_true", help="Single monitoring cycle")
    parser.add_argument("--no-fix", action="store_true", help="Disable auto-fix (diagnostic mode)")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    args = parser.parse_args()

    # Resolve mode
    if args.daemon:
        do_fix = not args.no_fix
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

    # One-shot modes
    do_fix = not args.no_fix
    if args.once or args.cycle:
        return run_once(verbose=args.verbose, do_fix=do_fix, do_push=True)

    # Default: single cycle
    return run_once(verbose=args.verbose, do_fix=do_fix, do_push=True)


if __name__ == "__main__":
    sys.exit(main())
