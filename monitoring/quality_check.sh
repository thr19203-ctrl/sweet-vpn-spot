#!/usr/bin/env bash
# sweet-vpn-spot quality gate runner.
#
# Runs the code quality checks (lint, test, build) and returns:
#   0  — all quality gates passed
#   1  — at least one quality gate failed
#
# Usage:
#   quality_check.sh            # run all gates
#   quality_check.sh --fast     # lint + test only (skip build)
#   quality_check.sh --jobs 4   # run with custom npm jobs

set -o pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT" || { echo "FATAL: cannot cd to $PROJECT_ROOT"; exit 1; }

FAST=false
JOBS=""
for arg in "$@"; do
  case "$arg" in
    --fast) FAST=true ;;
    --jobs=*) JOBS="${arg#*=}";;
    --jobs) JOBS="$2"; shift ;;
  esac
done

echo "============================================================"
echo " SWEET VPN SPOT — Quality Gate Check"
echo " Project: $PROJECT_ROOT"
echo " Time:    $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "============================================================"

ALL_PASS=true

run_gate() {
  local name="$1"
  local cmd="$2"
  echo ""
  echo ">>> GATE: $name"
  echo "    Command: $cmd"
  local start=$(date +%s%N)
  eval "$cmd" 2>&1 | tee /tmp/sweet-vpn-spot-quality-gate-$name.log
  local rc=${PIPESTATUS[0]}
  local end=$(date +%s%N)
  local dur=$(( (end - start) / 1000000 ))
  echo "    Exit code: $rc  ($dur ms)"
  if [ "$rc" -ne 0 ]; then
    ALL_PASS=false
    echo "    >>> GATE FAILED: $name"
  else
    echo "    >>> GATE PASSED: $name"
  fi
}

# Gate 1: Lint (eslint)
run_gate "lint" "npx eslint ."

# Gate 2: Test (vitest)
run_gate "test" "npx vitest run"

# Gate 3: Type check (tsc --noEmit)
run_gate "types" "npx tsc --noEmit"

# Gate 4: Build (vite build)
if [ "$FAST" = false ]; then
  run_gate "build" "npx vite build 2>&1 | tail -40"
else
  echo ""
  echo ">>> SKIP GATE: build (--fast given)"
fi

echo ""
echo "============================================================"
if [ "$ALL_PASS" = true ]; then
  echo " QUALITY GATES: ALL PASSED"
  echo "============================================================"
  exit 0
else
  echo " QUALITY GATES: SOME GATES FAILED"
  echo " Failed gates logged to /tmp/sweet-vpn-spot-quality-gate-*.log"
  echo "============================================================"
  exit 1
fi
