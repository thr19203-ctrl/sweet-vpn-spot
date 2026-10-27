#!/usr/bin/env python3
"""
Auto-repair script for sweet-vpn-spot.

Applies one narrowly-scoped, reversible correction:
  - normalises CRLF line endings to LF in tracked text files (prettier/eslint
    fail on CRLF checkouts made on Windows).

It deliberately does NOT rewrite translations or any other source text: an earlier
version tried to "fix" the retired Free plan by regex-replacing words in i18n files,
which targeted the wrong file and could corrupt other languages. Content problems are
fixed in the source and guarded by tests (src/test/i18n.test.ts), not by a script.

Nothing is committed unless asked, and only the files this script changed are staged
(never `git add -A`), so unrelated or half-resolved work is not swept into a commit.

Usage:
  python3 monitoring/repair.py            # fix files in the working tree only
  python3 monitoring/repair.py --commit   # ...and commit just those files
  python3 monitoring/repair.py --push     # ...commit, then push the current branch
"""

import argparse
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
COMMIT_MESSAGE = "auto-fix: normalise CRLF line endings"


def log(msg: str, level: str = "INFO") -> None:
    ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    line = f"[{ts}] [{level}] {msg}"
    try:
        with LOG.open("a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError:
        pass  # logging must never break the repair itself
    print(line, flush=True)


def run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, cwd=PROJECT, **kw)


def git(*args: str) -> subprocess.CompletedProcess:
    return run(["git", *args], check=False)


def ensure_autocrlf() -> None:
    """Make future checkouts stop reintroducing CRLF (leave an explicit 'true' alone)."""
    r = git("config", "core.autocrlf")
    current = r.stdout.strip() if r.returncode == 0 else ""
    if current in ("", "false"):
        r2 = git("config", "core.autocrlf", "input")
        if r2.returncode == 0:
            log("Set core.autocrlf=input")
        else:
            log(f"Failed to set autocrlf: {r2.stderr[:200]}", "ERROR")


def fix_crlf() -> list[str]:
    """Convert CRLF to LF in tracked text files. Returns the paths that were changed."""
    r = git("ls-files", "-z")
    if r.returncode != 0:
        log(f"Not a git work tree, skipping CRLF fix: {r.stderr.strip()[:200]}", "WARNING")
        return []

    ensure_autocrlf()

    changed: list[str] = []
    for rel in filter(None, r.stdout.split("\0")):
        p = PROJECT / rel
        if not p.is_file():
            continue
        try:
            data = p.read_bytes()
        except OSError as e:
            log(f"Cannot read {rel}: {e}", "WARNING")
            continue
        if b"\0" in data or b"\r\n" not in data:  # binary, or already LF
            continue
        p.write_bytes(data.replace(b"\r\n", b"\n"))
        log(f"Fixed CRLF -> LF: {rel}")
        changed.append(rel)

    log(f"CRLF fix: {len(changed)} file(s) changed")
    return changed


def commit_changed(paths: list[str], push: bool) -> bool:
    """Commit exactly `paths`; optionally push the current branch."""
    unmerged = git("diff", "--name-only", "--diff-filter=U")
    if unmerged.stdout.strip():
        log("Refusing to commit: unresolved merge conflicts in the work tree:\n" + unmerged.stdout, "ERROR")
        return False

    r = git("add", "--", *paths)
    if r.returncode != 0:
        log(f"git add failed: {r.stderr[:300]}", "ERROR")
        return False

    # Pathspec-limited commit: anything else already staged is left out of it.
    r = git("-c", f"user.name={GIT_USER}", "-c", f"user.email={GIT_EMAIL}", "commit", "-m", COMMIT_MESSAGE, "--", *paths)
    if r.returncode != 0:
        log(f"git commit failed: {(r.stderr or r.stdout)[:300]}", "ERROR")
        return False
    log("Committed auto-fix changes")

    if not push:
        return True

    branch = git("rev-parse", "--abbrev-ref", "HEAD").stdout.strip()
    if not branch or branch == "HEAD":
        log("Detached HEAD: not pushing", "ERROR")
        return False
    r = git("push", "origin", branch)
    if r.returncode != 0:
        log(f"git push failed: {r.stderr[:300]}", "ERROR")
        return False
    log(f"Pushed auto-fix commit to origin/{branch}")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="sweet-vpn-spot auto-repair")
    parser.add_argument("--commit", action="store_true", help="commit the files that were changed")
    parser.add_argument("--push", action="store_true", help="commit and push the current branch")
    args = parser.parse_args()

    log("=== Auto-repair pass started ===")
    try:
        changed = fix_crlf()
    except Exception as e:  # noqa: BLE001
        log(f"CRLF fix error: {e}", "ERROR")
        return 1

    if changed and (args.commit or args.push):
        if not commit_changed(changed, push=args.push):
            log("Commit/push failed", "ERROR")
            return 1
    elif not changed:
        log("No fixes needed — nothing to commit")

    log("=== Auto-repair pass finished ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
