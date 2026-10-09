#!/usr/bin/env bash
# Detect how a target repo consumes neat-os. Does not install packages.
# Exit 0 when a usable knowledge path exists; 1 when missing; 2 on usage error.
#
# Locked order — stop at the first hit (shared with packages/npm/resolve-consume.js):
#   1. NEAT_OS_ROOT (absolute, valid os tree). SHED_OS_ROOT is a deprecated fallback.
#   2. node_modules/@shedcollective/neat-os (walk up, or require.resolve)
#   3. vendor/shedcollective/neat-os (walk up; PHP metadata only)
#   4. sibling ../neat-os. ../shed-os is a deprecated fallback.
#   5. TARGET itself is a neat-os checkout
# Do not search the public web for “neat-os init”.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
HELPER=""
for cand in \
  "$PKG_ROOT/packages/npm/resolve-consume.js" \
  "$PKG_ROOT/resolve-consume.js"
do
  if [[ -f "$cand" ]]; then
    HELPER="$cand"
    break
  fi
done

if [[ -n "$HELPER" ]] && command -v node >/dev/null 2>&1; then
  exec node "$HELPER" "$@"
fi

TARGET=""

usage() {
  cat <<'EOF'
Usage: resolve-consume.sh [TARGET_DIR]

Report the neat-os consume mode for TARGET_DIR (default: current git root).

Locked order (stop at the first hit):
  1. NEAT_OS_ROOT     absolute env path to a valid neat-os tree
  2. node_modules     @shedcollective/neat-os (walk up or require.resolve)
  3. vendor           shedcollective/neat-os (Composer; PHP metadata only)
  4. sibling          ../neat-os
  5. checkout         TARGET itself is a neat-os tree

SHED_OS_ROOT, node_modules/@shedcollective/shed-os, vendor/shedcollective/shed-os,
and sibling ../shed-os still resolve. Each prints a deprecation warning.

Modes: env | node_modules | vendor | sibling | checkout | missing

Do not search the public web for “neat-os init”.
Vendoring means node_modules/ or vendor/, not a copy of skills into the client.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --) shift; break ;;
    -*)
      echo "error: unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      if [[ -n "$TARGET" ]]; then
        echo "error: unexpected argument: $1" >&2
        exit 2
      fi
      TARGET="$1"
      shift
      ;;
  esac
done

if [[ -z "$TARGET" ]]; then
  TARGET="$(git rev-parse --show-toplevel 2>/dev/null || true)"
fi

if [[ -z "$TARGET" ]]; then
  echo "error: not inside a git repository and no TARGET_DIR given" >&2
  exit 2
fi

if [[ ! -d "$TARGET" ]]; then
  echo "error: target is not a directory: $TARGET" >&2
  exit 2
fi

TARGET="$(cd "$TARGET" && pwd)"

if ! git -C "$TARGET" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "error: $TARGET is not a git repository" >&2
  exit 2
fi

is_os_tree() {
  local dir="$1"
  [[ -d "$dir/skills" && -d "$dir/templates" && -f "$dir/package.json" ]]
}

walk_up_for() {
  local start="$1"
  local rel="$2"
  local dir="$start"
  while true; do
    if [[ -e "$dir/$rel" ]]; then
      (cd "$dir/$rel" && pwd)
      return 0
    fi
    local parent
    parent="$(cd "$dir/.." && pwd)"
    if [[ "$parent" == "$dir" ]]; then
      return 1
    fi
    dir="$parent"
  done
}

read_env_root() {
  local name="$1"
  local raw="${2:-}"
  if [[ -z "$raw" ]]; then
    return 1
  fi
  if [[ "$raw" != /* ]]; then
    echo "warning: ${name} is set but is not an absolute path (${raw}); skipping" >&2
    return 1
  fi
  if is_os_tree "$raw"; then
    (cd "$raw" && pwd)
    return 0
  fi
  echo "warning: ${name} is set but is not a valid neat-os tree (${raw}); skipping" >&2
  return 1
}

ENV_ROOT=""
if ENV_ROOT="$(read_env_root NEAT_OS_ROOT "${NEAT_OS_ROOT:-}")"; then
  :
elif ENV_ROOT="$(read_env_root SHED_OS_ROOT "${SHED_OS_ROOT:-}")"; then
  echo "warning: SHED_OS_ROOT is deprecated; set NEAT_OS_ROOT" >&2
else
  ENV_ROOT=""
fi

walk_named() {
  local rel="$1"
  local hit=""
  if hit="$(walk_up_for "$TARGET" "$rel")"; then
    printf '%s\n' "$hit"
    return 0
  fi
  if [[ "$(pwd)" != "$TARGET" ]] && hit="$(walk_up_for "$(pwd)" "$rel")"; then
    printf '%s\n' "$hit"
    return 0
  fi
  return 1
}

NODE_PKG=""
if NODE_PKG="$(walk_named "node_modules/@shedcollective/neat-os")"; then
  :
elif NODE_PKG="$(walk_named "node_modules/@shedcollective/shed-os")"; then
  echo "warning: node_modules/@shedcollective/shed-os is deprecated; install @shedcollective/neat-os" >&2
else
  NODE_PKG=""
fi

VENDOR=""
if VENDOR="$(walk_named "vendor/shedcollective/neat-os")"; then
  :
elif VENDOR="$(walk_named "vendor/shedcollective/shed-os")"; then
  echo "warning: vendor/shedcollective/shed-os is deprecated; require shedcollective/neat-os" >&2
else
  VENDOR=""
fi

SIBLING=""
PARENT="$(cd "$TARGET/.." && pwd)"
if [[ "$PARENT" != "$TARGET" ]] && is_os_tree "$PARENT/neat-os"; then
  SIBLING="$(cd "$PARENT/neat-os" && pwd)"
elif [[ "$PARENT" != "$TARGET" ]] && is_os_tree "$PARENT/shed-os"; then
  SIBLING="$(cd "$PARENT/shed-os" && pwd)"
  echo "warning: sibling ../shed-os is deprecated; clone the tree as ../neat-os" >&2
fi

CHECKOUT=""
if is_os_tree "$TARGET"; then
  CHECKOUT="$TARGET"
fi

SKILLS_DIR=""
MODE=""
ROOT=""
if [[ -n "$ENV_ROOT" ]]; then
  MODE="env"
  ROOT="$ENV_ROOT"
  SKILLS_DIR="$ENV_ROOT/skills"
elif [[ -n "$NODE_PKG" ]]; then
  MODE="node_modules"
  ROOT="$NODE_PKG"
  if [[ -d "$NODE_PKG/skills" ]]; then
    SKILLS_DIR="$NODE_PKG/skills"
  fi
elif [[ -n "$VENDOR" ]]; then
  MODE="vendor"
  ROOT="$VENDOR"
elif [[ -n "$SIBLING" ]]; then
  MODE="sibling"
  ROOT="$SIBLING"
  SKILLS_DIR="$SIBLING/skills"
elif [[ -n "$CHECKOUT" ]]; then
  MODE="checkout"
  ROOT="$CHECKOUT"
  SKILLS_DIR="$CHECKOUT/skills"
fi

if [[ -z "$MODE" ]]; then
  MODE="missing"
fi

echo "target:       $TARGET"
echo "mode:         $MODE"
echo "root:         $ROOT"
echo "NEAT_OS_ROOT: ${ENV_ROOT:-}"
echo "sibling:      ${SIBLING:-}"
echo "checkout:     ${CHECKOUT:-}"
echo "node_modules: ${NODE_PKG:-}"
echo "vendor:       ${VENDOR:-}"
echo "skills_dir:   ${SKILLS_DIR:-}"

if [[ "$MODE" == "vendor" ]]; then
  echo "hint: Composer vendor/ is PHP metadata only. Resolve skills via NEAT_OS_ROOT, node_modules/@shedcollective/neat-os after file: or github:shedcollective/neat-os#tag, or sibling ../neat-os."
fi

if [[ "$MODE" == "missing" ]]; then
  echo "hint: Do not search the public web for “neat-os init” or invent install steps."
  echo "hint: IDE / single clone — pin git+ssh://git@github.com/shedcollective/neat-os.git#vX.Y.Z in package.json, then npm install. When that package is already in the lockfile, npm update @shedcollective/neat-os."
  echo "hint: Cloud / multi-repo — sibling ../neat-os or NEAT_OS_ROOT, or npm install ../neat-os (file:)."
  echo "hint: PHP: Composer VCS → vendor/shedcollective/neat-os (metadata only). Skills still need Node git pin or a checkout."
  echo "hint: Do not copy skills into the client. Install from git (file: sibling or github:#tag), not a Packages registry."
  exit 1
fi

exit 0
