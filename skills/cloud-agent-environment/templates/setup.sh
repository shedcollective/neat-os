#!/usr/bin/env bash
# Install step for .cursor/environment.json. Idempotent. Must exit.
# Toolchains and lockfile installs belong here. Long-running processes belong in start.sh.
# A snapshot keeps files and drops processes. Do not delete package-manager caches.
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

# Least trust: probe only the hosts this install contacts. Add a host when a
# lockfile dist URL or a toolchain download uses it. Leave a metadata registry
# off this list when every dist URL is already on a host here.
# GitHub baseline for lockfiles whose archives come from GitHub:
bash "$H/probe-hosts.sh" \
  github.com \
  api.github.com \
  codeload.github.com \
  objects.githubusercontent.com \
  raw.githubusercontent.com

install_dependencies() {
  # Replace this body from the lockfiles in this repo.
  # The installer is the one named in conventions/lockfile.md.
  # Do not bake a lockfile hash into this file. The stamp lives outside the worktree.
  #
  # Composer, when composer.lock dist URLs are on GitHub:
  #   bash "$H/install-if-lockfile-changed.sh" \
  #     --lockfile composer.lock -- \
  #     bash "$H/guard-no-source-fallback.sh" --composer -- \
  #     composer install --prefer-dist --no-interaction --no-progress
  #
  # npm, when package-lock.json is the lockfile (allow registry.npmjs.org only if the lockfile uses it):
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
