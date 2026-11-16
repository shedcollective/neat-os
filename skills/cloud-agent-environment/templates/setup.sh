#!/usr/bin/env bash
# Install step for .cursor/environment.json. Idempotent. Must exit.
# Dependencies, toolchains, and cache warming belong here.
# System packages and compilers belong in the base image, not in start.sh.
# Do not delete package-manager caches.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: setup.sh

Idempotent install for a Cloud Agent build. Fill install_dependencies before
relying on it. The unfilled template exits 1.
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

# Probe only the hosts this install contacts. Add a host when a lockfile
# dist URL or a toolchain download uses it. Leave a metadata registry off
# this list when every dist URL is already on a host here. The unfilled
# template has no hosts, so it does not probe.

install_dependencies() {
  # Replace this body from the lockfiles in this repo.
  # The installer is the one named in conventions/lockfile.md.
  # Do not bake a lockfile hash into this file. The stamp lives outside the worktree.
  # If this repo uses Composer, follow neat-os skills/cloud-agent-environment/stacks/composer.md.
  #
  # npm, when package-lock.json is the lockfile (allow registry.npmjs.org only if the lockfile uses it):
  #   bash "$H/probe-hosts.sh" registry.npmjs.org
  #   bash "$H/install-if-lockfile-changed.sh" \
  #     --lockfile package-lock.json -- \
  #     bash "$H/guard-no-source-fallback.sh" -- \
  #     npm ci
  #
  # Install the dependencies the tests import. Do not pass --no-dev unless the
  # test command does not need require-dev. Do not compile a toolchain in start.sh.
  echo "error: install_dependencies is still the template. Fill it from the lockfiles in this repo." >&2
  return 1
}

install_dependencies
