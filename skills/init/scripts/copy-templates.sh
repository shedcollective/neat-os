#!/usr/bin/env bash
# Copy Agent Guide + project-slot templates into a target git repo.
# Scaffold only — does not fill from repo evidence (that is gather).
# Never copies company skills. Never clobbers existing files unless --force.
set -euo pipefail

FORCE=0
TARGET=""

usage() {
  cat <<'EOF'
Usage: copy-templates.sh [--force] [TARGET_DIR]

Copy the IDE spread from templates/ (AGENTS.md + .agents/ Agent Guide,
platforms slot, and project slots) into TARGET_DIR (default: current git
root). Existing files are skipped unless --force is set. Placeholders stay
unfilled — run gather to write the evidence passport / Agent Guide content
and any beneficial platform leaves (frontend/backend/…).

Does not copy neat-os skills, agency ops wrappers, day-file shapes, or bot
passports. Those stay in neat-os. Agents resolve skills with the locked order:
NEAT_OS_ROOT, then node_modules/@shedcollective/neat-os (file: or github:),
then vendor/shedcollective/neat-os (Composer metadata only), then sibling
../neat-os. SHED_OS_ROOT, @shedcollective/shed-os, vendor/shedcollective/shed-os,
and ../shed-os still resolve and are deprecated. Do not search the public web for neat-os.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE=1; shift ;;
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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OS_ROOT="${NEAT_OS_ROOT:-}"
if [[ -z "$OS_ROOT" && -n "${SHED_OS_ROOT:-}" ]]; then
  echo "warning: SHED_OS_ROOT is deprecated; set NEAT_OS_ROOT" >&2
  OS_ROOT="${SHED_OS_ROOT}"
fi

if [[ -z "$OS_ROOT" ]]; then
  # skills/init/scripts -> repo root
  CANDIDATE="$(cd "$SCRIPT_DIR/../../.." && pwd)"
  if [[ -d "$CANDIDATE/templates" && -d "$CANDIDATE/skills" ]]; then
    OS_ROOT="$CANDIDATE"
  fi
fi

if [[ -z "$OS_ROOT" ]]; then
  echo "error: could not locate neat-os (set NEAT_OS_ROOT to the clone that contains templates/ and skills/; SHED_OS_ROOT is a deprecated fallback)" >&2
  exit 1
fi

TEMPLATES="$OS_ROOT/templates"

if [[ ! -d "$TEMPLATES" ]]; then
  echo "error: templates directory missing at $TEMPLATES" >&2
  exit 1
fi

if [[ -z "$TARGET" ]]; then
  TARGET="$(git rev-parse --show-toplevel 2>/dev/null || true)"
fi

if [[ -z "$TARGET" ]]; then
  echo "error: not inside a git repository and no TARGET_DIR given" >&2
  exit 1
fi

if [[ ! -d "$TARGET" ]]; then
  echo "error: target is not a directory: $TARGET" >&2
  exit 1
fi

TARGET="$(cd "$TARGET" && pwd)"

if ! git -C "$TARGET" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "error: $TARGET is not a git repository" >&2
  exit 1
fi

copy_file() {
  local src="$1"
  local dest="$2"
  mkdir -p "$(dirname "$dest")"
  local rel="${dest#"$TARGET"/}"
  if [[ -e "$dest" && "$FORCE" -ne 1 ]]; then
    echo "skip (exists): $rel"
    return 0
  fi
  cp -a "$src" "$dest"
  echo "wrote: $rel"
}

echo "neat-os root: $OS_ROOT"
echo "target:       $TARGET"

while IFS= read -r -d '' src; do
  rel="${src#"$TEMPLATES"/}"
  case "$rel" in
    AGENTS.md|.agents/*) copy_file "$src" "$TARGET/$rel" ;;
  esac
done < <(find "$TEMPLATES" -type f -print0 | sort -z)

if [[ ! -e "$TARGET/README.md" ]]; then
  cat > "$TARGET/README.md" <<'EOF'
# Project

Agent start brief: [AGENTS.md](AGENTS.md). Agent Guide: [.agents/README.md](.agents/README.md). Structured facts: [.agents/project.md](.agents/project.md).
EOF
  echo "wrote: README.md (stub)"
fi

echo "scaffold: IDE spread structure only (unfilled templates; company skills stay in neat-os)"

RESOLVE="$SCRIPT_DIR/resolve-consume.sh"
if [[ -x "$RESOLVE" || -f "$RESOLVE" ]]; then
  echo ""
  if ! bash "$RESOLVE" "$TARGET"; then
    echo "consume: missing — do not web-search. Pin git+ssh://git@github.com/shedcollective/neat-os.git#vX.Y.Z and npm install (Node → node_modules/), or add a sibling checkout / Composer VCS (→ vendor/). See skills/init/SKILL.md."
  fi
fi

echo "done. Next: gather fills these slots from repo evidence + interview."
