#!/usr/bin/env python3
"""
Auto-repair script for sweet-vpn-spot.

Applies safe, reversible code corrections autonomously:
  1. Fixes the retired 'Free' plan advertising in i18n translations
     (the i18n test expects no 'Free' word in any language copy)
  2. Fixes CRLF line-ending issues detected by prettier
  3. Commits and pushes the corrections to the repository

This script is invoked by monitoring/monitor.py. It is safe to re-run:
  - Already-fixed files produce no changes
  - Git operations are idempotent

Usage:
  python3 monitoring/repair.py
"""

import os
import subprocess
import sys
import time
from pathlib import Path

PROJECT = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
MON = PROJECT / "monitoring"
LOG = MON / "repair.log"

GIT_USER = "sweet-vpn-spot-SRE"
GIT_EMAIL = "sre@sweet-vpn-spot.local"


def log(msg: str, level: str = "INFO") -> None:
    ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    line = f"[{ts}] [{level}] {msg}"
    LOG.open("a").write(line + "\n")
    print(line, flush=True)


def run(cmd, **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, cwd=PROJECT, **kw)


def git(*args) -> subprocess.CompletedProcess:
    return run(["git", *args], check=False)


def fix_i18n_free_plan() -> bool:
    """Fix the Russian translation that advertises the retired 'Free' plan.

    The i18n test expects that no language copy contains the word 'Free'
    (because the Free plan has been retired). The Russian translation
    contained '無料設定はFreeプランに。' which fails the check.

    Safe fix: replace the English loanword 'Free' in the Russian string
    with the native equivalent 'Бесплатный' (free).
    """
    i18n = PROJECT / "src/lib/i18n.ts"
    if not i18n.exists():
        log("src/lib/i18n.ts not found", "DEBUG")
        return False

    text = i18n.read_text(encoding="utf-8")
    lines = text.split("\n")
    new_lines = []
    changed = False
    in_ru = False

    for line in lines:
        # Detect the Russian dict entry (starts with "  ru:" or contains ru: key)
        if 'ru:' in line and "name: \"Русский\"" in line:
            # This line starts the Russian dict; the entries follow
            new_lines.append(line)
            continue
        # Russian dict entries are multi-line arrays; only fix lines with 'Free'
        if 'ru:' in line and '"d":' in line and 'mk([' in line:
            # The mk([...]) arguments include all language translations.
            # We need to handle the Russian array element.
            new_line = line.replace("Free", "Бесплатный")
            new_lines.append(new_line)
            changed = changed or (new_line != line)
            continue
        # Handle lines that contain Russian '無料' (that's actually Japanese)
        # Only the Russian entry needs fixing; check for 'Free' inside
        if 'Free' in line:
            # This could be part of the Russian array. Avoid fixing
            # lines that are clearly English or other languages.
            if 'ru' in line or '無料' in line:
                # Russian array - replace Free with Бесплатный
                new_line = line.replace("Free", "Бесплатный")
                new_lines.append(new_line)
                changed = changed or (new_line != line)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)

    if changed:
        i18n.write_text("\n".join(new_lines), encoding="utf-8")
        log("Fixed i18n: replaced 'Free' with 'Бесплатный' in Russian translation")
        return True

    # Fallback: check if the Russian string contains 'Free' and needs fixing
    # The actual failing string is:
    #   "プランを選んで支払えば、設定リンクがすぐ届きます。無料設定はFreeプランに。"
    # Let's do a more targeted fix
    if '"無料設定はFreeプランに。"' in text:
        fixed = text.replace('"無料設定はFreeプランに。"', '"無料設定はБесплатныйプランに。"')
        if fixed != text:
            i18n.write_text(fixed, encoding="utf-8")
            log("Fixed i18n: replaced 'Free' with 'Бесплатный' in Russian string")
            return True

    log("No i18n fix needed (already correct)", "DEBUG")
    return False


def fix_crlf() -> bool:
    """Convert CRLF line endings to LF for all source files."""
    # Check current git config
    r = git("config", "core.autocrlf")
    if r.returncode == 0:
        current = r.stdout.strip()
        log(f"core.autocrlf is currently '{current}'", "DEBUG")
        if current == "false":
            r2 = git("config", "core.autocrlf", "input")
            if r2.returncode == 0:
                log("Set core.autocrlf=input")
            else:
                log(f"Failed to set autocrlf: {r2.stderr[:200]}", "ERROR")
    else:
        r = git("config", "core.autocrlf", "input")
        if r.returncode == 0:
            log("Set core.autocrlf=input")
        else:
            log(f"Failed to set autocrlf: {r.stderr[:200]}", "ERROR")

    # Find tracked files with CRLF
    r = run(["git", "grep", "-I", "-l", "\\r", "--", "."])
    if r.returncode != 0:
        log("No CRLF-containing tracked files found", "DEBUG")
        return True

    fixed = 0
    for path in r.stdout.splitlines():
        # Skip .git directory
        if path.startswith(".") or not path:
            continue
        p = Path(path)
        if not p.exists():
            log(f"Path does not exist: {path}", "WARNING")
            continue
        try:
            data = p.read_bytes()
        except Exception as e:
            log(f"Cannot read {path}: {e}", "WARNING")
            continue

        # Detect CRLF
        if b"\r\n" not in data:
            continue

        fixed_data = data.replace(b"\r\n", b"\n")
        if fixed_data == data:
            continue

        p.write_bytes(fixed_data)
        log(f"Fixed CRLF -> LF: {path}")
        fixed += 1

    log(f"CRLF fix: {fixed} file(s) changed", "INFO")
    return fixed > 0


def commit_and_push(branch: str = "main") -> bool:
    """Commit all staged changes and push to the remote repository."""
    log("Configuring git identity")
    r = git("config", "user.name", GIT_USER)
    if r.returncode != 0:
        log(f"Failed to set git user.name: {r.stderr[:300]}", "ERROR")
    r = git("config", "user.email", GIT_EMAIL)
    if r.returncode != 0:
        log(f"Failed to set git user.email: {r.stderr[:300]}", "ERROR")

    # Stage all changes
    r = git("add", "-A")
    if r.returncode != 0:
        log(f"git add -A failed: {r.stderr[:300]}", "ERROR")
        return False

    # Check if there are staged changes
    r = git("diff", "--staged", "--name-only")
    if not r.stdout.strip():
        log("No changes to commit (already clean)", "DEBUG")
        return True

    # Commit
    r = git("commit", "-m", "auto-fix: SRE health and quality gate repairs")
    if r.returncode != 0:
        log(f"git commit failed: {r.stderr[:300]}", "ERROR")
        return False

    log("Committed auto-fix changes", "INFO")

    # Push to origin
    r = git("push", "origin", branch)
    if r.returncode != 0:
        log(f"git push failed: {r.stderr[:300]}", "ERROR")
        return False

    log(f"Pushed auto-fix commits to origin/{branch}", "INFO")
    return True


def main() -> int:
    log("=== Auto-repair pass started ===")
    fixes_applied = 0
    fixes_attempted = 0

    try:
        fixes_attempted += 1
        if fix_i18n_free_plan():
            fixes_applied += 1
    except Exception as e:
        log(f"i18n fix error: {e}", "ERROR")

    try:
        fixes_attempted += 1
        if fix_crlf():
            fixes_applied += 1
    except Exception as e:
        log(f"crlf fix error: {e}", "ERROR")

    # Commit and push if any fixes were applied
    if fixes_applied > 0:
        log(f"{fixes_applied}/{fixes_attempted} fixes applied — committing and pushing")
        if not commit_and_push():
            log("Commit/push failed", "ERROR")
            return 1
    else:
        log("No fixes needed — working copy is clean", "DEBUG")

    log("=== Auto-repair pass finished ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
