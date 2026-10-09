#!/usr/bin/env bash
# Idempotent Cloud Agent setup for neat-os.
#
# neat-os has no third-party npm or Composer dependencies (there are no
# lockfiles to restore), so the only toolchain this repo needs beyond the
# base image is PHP, which backs packages/composer. Node.js 22, git and bash
# are already provided by the base image.
set -euo pipefail

if ! command -v php >/dev/null 2>&1 || ! command -v composer >/dev/null 2>&1; then
  echo "Installing PHP CLI and Composer..."
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends \
    php-cli composer
else
  echo "PHP and Composer already installed; skipping apt install."
fi

echo "Toolchain versions:"
node --version
php --version | head -1
composer --version
