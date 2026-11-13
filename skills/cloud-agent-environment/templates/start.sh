#!/usr/bin/env bash
# Start step. Fast. Runs on every agent boot. Does not install toolchains.
# Docker, databases, and tunnels belong here. Daemonise, wait until healthy, then exit.
# A long-running app or dev server belongs in terminals, not here.
# Dependency installs stay in setup.sh. This script reinstalls only when a
# lockfile hash differs from the stamp written outside the worktree.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: start.sh

Boot step for a Cloud Agent. Fill refresh_dependencies and start_services
before relying on it. The unfilled template exits 1.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi
if [[ $# -gt 0 ]]; then
  echo "error: unexpected argument: $1" >&2
  exit 2
fi

cd "$(dirname "$0")/../.."

H="$(bash "$(dirname "$0")/resolve-helper-dir.sh")"

refresh_dependencies() {
  # The feature branch is checked out on top of a Build and may change the lockfiles.
  # Same lockfiles and the same install command as setup.sh.
  # install-if-lockfile-changed.sh skips the command when the hash matches.
  echo "error: refresh_dependencies is still the template. Call install-if-lockfile-changed.sh with this repo's lockfiles." >&2
  return 1
}

start_services() {
  # Docker, databases, and tunnels. Daemonise, wait until healthy, then exit.
  # A long-running app or dev server belongs in terminals, not here.
  #   bash "$H/wait-healthy.sh" --timeout 60 --tcp 127.0.0.1:5432
  #   bash "$H/wait-healthy.sh" --timeout 60 \
  #     --url http://127.0.0.1:8080/health \
  #     --expect-body '"status":"ok"'
  echo "error: start_services is still the template. Fill it from the services this repo needs, or make it return 0 and say in AGENTS.md that there are none." >&2
  return 1
}

refresh_dependencies
start_services
