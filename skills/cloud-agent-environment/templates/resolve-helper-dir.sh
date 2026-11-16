#!/usr/bin/env bash
# Print the cloud-agent-environment scripts directory for this product repo.
# Locked resolve order, then stop: NEAT_OS_ROOT, node_modules, vendor, sibling, checkout.
# Vendor metadata has no skills. A missing tree is an error, not a web search.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: resolve-helper-dir.sh [REPO]

Print the absolute path of skills/cloud-agent-environment/scripts from the
neat-os tree this repo consumes. REPO defaults to the git root of the
current directory.

Exit 1 when neat-os is missing or that hit has no skills (a Composer
vendor install is metadata only). Exit 2 on a usage error.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi
if [[ $# -gt 1 ]]; then
  echo "error: unexpected argument: $2" >&2
  exit 2
fi

REPO="${1:-}"
if [[ -z "$REPO" ]]; then
  REPO="$(git rev-parse --show-toplevel 2>/dev/null || true)"
fi
if [[ -z "$REPO" || ! -d "$REPO" ]]; then
  echo "error: not a git repository. Pass the product repo path." >&2
  exit 2
fi
REPO="$(cd "$REPO" && pwd)"

collapse_root() {
  local p="$1"
  while [[ "$p" == //* ]]; do
    p="/${p#//}"
  done
  printf '%s\n' "$p"
}

walk_up() {
  local rel="$1"
  local dir hops=0 parent
  dir="$(collapse_root "$REPO")"
  while [[ "$hops" -lt 64 ]]; do
    hops=$((hops + 1))
    if [[ -f "${dir}/${rel}" ]]; then
      printf '%s\n' "${dir}/${rel}"
      return 0
    fi
    parent="$(collapse_root "$(cd "${dir}/.." && pwd)")"
    if [[ "$parent" == "$dir" ]]; then
      return 1
    fi
    dir="$parent"
  done
  echo "error: walked off the top of the filesystem looking for ${rel}" >&2
  return 1
}

candidates=()
if [[ -n "${NEAT_OS_ROOT:-}" && -f "${NEAT_OS_ROOT}/skills/init/scripts/resolve-consume.sh" ]]; then
  candidates+=("${NEAT_OS_ROOT}/skills/init/scripts/resolve-consume.sh")
fi
node_hit="$(walk_up "node_modules/@shedcollective/neat-os/skills/init/scripts/resolve-consume.sh" || true)"
vendor_hit="$(walk_up "vendor/shedcollective/neat-os/skills/init/scripts/resolve-consume.sh" || true)"
[[ -n "$node_hit" ]] && candidates+=("$node_hit")
[[ -n "$vendor_hit" ]] && candidates+=("$vendor_hit")
if [[ -f "${REPO}/../neat-os/skills/init/scripts/resolve-consume.sh" ]]; then
  candidates+=("${REPO}/../neat-os/skills/init/scripts/resolve-consume.sh")
fi
if [[ -f "${REPO}/skills/init/scripts/resolve-consume.sh" ]]; then
  candidates+=("${REPO}/skills/init/scripts/resolve-consume.sh")
fi

if [[ ${#candidates[@]} -eq 0 ]]; then
  echo "error: neat-os was not found. Read docs/cursor-environments.md. Do not search the public web for neat-os." >&2
  exit 1
fi

for candidate in "${candidates[@]}"; do
  if [[ ! -f "$candidate" ]]; then
    continue
  fi
  out="$(bash "$candidate" "$REPO")" || {
    echo "error: neat-os resolve failed. Read docs/cursor-environments.md. Do not search the public web for neat-os." >&2
    exit 1
  }
  skills="$(printf '%s\n' "$out" | awk '/^skills_dir:/ { print $2 }')"
  if [[ -n "$skills" && -d "${skills}/cloud-agent-environment/scripts" ]]; then
    printf '%s\n' "${skills}/cloud-agent-environment/scripts"
    exit 0
  fi
  echo "error: neat-os resolved but cloud-agent-environment scripts are not on that path." >&2
  echo "error: a Composer vendor install is metadata only. Use node_modules or the sibling checkout." >&2
  exit 1
done

echo "error: neat-os was not found. Read docs/cursor-environments.md. Do not search the public web for neat-os." >&2
exit 1
