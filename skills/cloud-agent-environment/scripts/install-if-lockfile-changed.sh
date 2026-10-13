#!/usr/bin/env bash
# Run an install only when a lockfile hash differs from the stamp.
# The stamp lives outside the git worktree so a branch checkout cannot wipe it.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: install-if-lockfile-changed.sh [--stamp PATH] --lockfile PATH [--lockfile PATH...] -- COMMAND...

Hash each lockfile. When every hash matches the stamp, print "lockfile unchanged"
and do not run COMMAND. When any hash differs, or the stamp is missing, run
COMMAND. Write the stamp only after COMMAND exits 0. A failed COMMAND leaves
the previous stamp in place so the next run tries again.

The default stamp is $HOME/.cache/cloud-agent-environment/lockfiles.sha256.
Override it with --stamp or CLOUD_AGENT_LOCK_STAMP. Do not put the stamp inside
the git worktree: the agent checkout replaces that tree after the snapshot.

Exit 0 when the install ran or was skipped. Exit 1 when a lockfile is missing
or COMMAND fails. Exit 2 on a usage error.
EOF
}

STAMP="${CLOUD_AGENT_LOCK_STAMP:-}"
LOCKS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --stamp)
      shift
      if [[ $# -eq 0 ]]; then
        echo "error: --stamp needs a path" >&2
        exit 2
      fi
      STAMP="$1"
      shift
      ;;
    --lockfile)
      shift
      if [[ $# -eq 0 ]]; then
        echo "error: --lockfile needs a path" >&2
        exit 2
      fi
      LOCKS+=("$1")
      shift
      ;;
    --)
      shift
      break
      ;;
    -*)
      echo "error: unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      echo "error: unexpected argument: $1 (commands go after --)" >&2
      exit 2
      ;;
  esac
done

if [[ ${#LOCKS[@]} -eq 0 ]]; then
  echo "error: name at least one --lockfile" >&2
  exit 2
fi
if [[ $# -eq 0 ]]; then
  echo "error: missing command after --" >&2
  exit 2
fi
if [[ -z "$STAMP" ]]; then
  if [[ -z "${HOME:-}" ]]; then
    echo "error: HOME is unset; pass --stamp" >&2
    exit 2
  fi
  STAMP="${HOME}/.cache/cloud-agent-environment/lockfiles.sha256"
fi
if ! command -v sha256sum >/dev/null 2>&1; then
  echo "error: sha256sum is required" >&2
  exit 1
fi
if ! command -v realpath >/dev/null 2>&1; then
  echo "error: realpath is required" >&2
  exit 1
fi

fingerprint() {
  local file="$1"
  local hash key
  if [[ ! -f "$file" ]]; then
    echo "error: lockfile not found: $file" >&2
    exit 1
  fi
  hash="$(sha256sum "$file" | awk '{ print $1 }')"
  key="$(realpath "$file")"
  printf '%s %s\n' "$key" "$hash"
}

current="$(
  for file in "${LOCKS[@]}"; do
    fingerprint "$file"
  done | sort
)"

previous=""
if [[ -f "$STAMP" ]]; then
  previous="$(sed '/^#/d;/^$/d' "$STAMP" | sort)"
fi

if [[ -n "$previous" && "$previous" == "$current" ]]; then
  echo "lockfile unchanged"
  exit 0
fi

echo "lockfile changed"
"$@"
mkdir -p "$(dirname "$STAMP")"
tmp="$(mktemp "${STAMP}.XXXXXX")"
{
  echo "# lockfile-stamp v1"
  printf '%s\n' "$current"
} >"$tmp"
mv -f "$tmp" "$STAMP"
echo "lockfile stamp updated"
exit 0
