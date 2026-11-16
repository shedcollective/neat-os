#!/usr/bin/env bash
# Fail when an install clones source instead of extracting an archive.
# With --composer, build GitHub auth in memory and refuse an app JWT.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: guard-no-source-fallback.sh [--composer] -- COMMAND...
       guard-no-source-fallback.sh --scan LOGFILE

Run COMMAND and fail if its output contains a source clone. The patterns are:

  Now trying to download from source
  Cloning into
  : Cloning

A command that exits non-zero keeps that status. A command that exits 0 and
still clones exits 1. Quiet success after a clone is the failure this guard
exists to catch.

--composer
  Use COMPOSER_GITHUB_TOKEN (a Cursor Runtime Secret). Reject it before any
  network call when it is empty, when it matches GITHUB_TOKEN, when it matches
  `gh auth token`, or when it looks like a JWT (eyJ) or a GitHub App
  installation token (ghs_). Build COMPOSER_AUTH in the environment of
  COMMAND. Do not write the token to disk. Set Composer store-auths false and
  source-fallback false. When COMMAND invokes composer, it must include
  --prefer-dist. Then GET https://api.github.com/rate_limit and require
  resources.core.limit 5000. An unauthenticated limit of 60 means the token
  was not sent.

--scan LOGFILE
  Check an existing log and do not run a command.

Exit 2 on a usage error.
EOF
}

COMPOSER=0
SCAN=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --composer)
      COMPOSER=1
      shift
      ;;
    --scan)
      shift
      if [[ $# -eq 0 ]]; then
        echo "error: --scan needs a log file" >&2
        exit 2
      fi
      SCAN="$1"
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

clone_patterns() {
  local log="$1"
  grep -F -e 'Now trying to download from source' -e 'Cloning into ' -e ': Cloning ' "$log"
}

report_clones() {
  local log="$1"
  echo "error: source clone detected. Dist install must extract archives. Refusing to continue." >&2
  clone_patterns "$log" | head -n 20 >&2 || true
}

if [[ -n "$SCAN" ]]; then
  if [[ "$COMPOSER" -eq 1 || $# -gt 0 ]]; then
    echo "error: --scan does not take --composer or a command" >&2
    exit 2
  fi
  if [[ ! -f "$SCAN" ]]; then
    echo "error: log file not found: $SCAN" >&2
    exit 2
  fi
  if clone_patterns "$SCAN" >/dev/null; then
    report_clones "$SCAN"
    exit 1
  fi
  echo "no source clone"
  exit 0
fi

if [[ $# -eq 0 ]]; then
  echo "error: missing command after --" >&2
  exit 2
fi

token_is_app_jwt() {
  local token="$1"
  [[ "$token" == eyJ* || "$token" == ghs_* ]]
}

if [[ "$COMPOSER" -eq 1 ]]; then
  token="${COMPOSER_GITHUB_TOKEN:-}"
  if [[ -z "$token" ]]; then
    echo "error: COMPOSER_GITHUB_TOKEN is unset. Add it as a Runtime Secret. Do not use GITHUB_TOKEN." >&2
    exit 1
  fi
  # Reject before any network call. An app JWT is not Composer auth.
  if token_is_app_jwt "$token"; then
    echo "error: COMPOSER_GITHUB_TOKEN looks like a JWT or a GitHub App installation token. Composer rejects those. Use the Runtime Secret." >&2
    exit 1
  fi
  if [[ -n "${GITHUB_TOKEN:-}" && "$token" == "$GITHUB_TOKEN" ]]; then
    echo "error: COMPOSER_GITHUB_TOKEN is the injected GITHUB_TOKEN. Composer rejects that JWT. Use the Runtime Secret." >&2
    exit 1
  fi
  if command -v gh >/dev/null 2>&1; then
    gh_token="$(gh auth token 2>/dev/null || true)"
    if [[ -n "$gh_token" && "$token" == "$gh_token" ]]; then
      unset gh_token
      echo "error: COMPOSER_GITHUB_TOKEN matches gh auth token. That token is an app JWT. Composer rejects it." >&2
      exit 1
    fi
    unset gh_token
  fi
  if [[ ! "$token" =~ ^[A-Za-z0-9_]+$ ]]; then
    echo "error: COMPOSER_GITHUB_TOKEN has unexpected characters. Refusing to build COMPOSER_AUTH." >&2
    exit 1
  fi
  if ! command -v curl >/dev/null 2>&1; then
    echo "error: curl is required to read the GitHub rate limit" >&2
    exit 1
  fi
  rate_body="$(curl -fsS --max-time 20 -H "Authorization: Bearer ${token}" -H "Accept: application/vnd.github+json" https://api.github.com/rate_limit)" || {
    echo "error: GET https://api.github.com/rate_limit failed. The token was not accepted or the host is blocked." >&2
    exit 1
  }
  if command -v node >/dev/null 2>&1; then
    limit="$(printf '%s' "$rate_body" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const j=JSON.parse(s); const n=j&&j.resources&&j.resources.core&&j.resources.core.limit; if(!Number.isInteger(n)) process.exit(1); process.stdout.write(String(n))})')" || {
      echo "error: rate_limit response had no resources.core.limit" >&2
      exit 1
    }
  else
    limit="$(printf '%s' "$rate_body" | tr -d ' \n' | sed -n 's/.*"core":{"limit":\([0-9][0-9]*\).*/\1/p')"
  fi
  unset rate_body
  if [[ "$limit" != "5000" ]]; then
    echo "error: GitHub core.limit is ${limit:-unknown}, expected 5000. Unauthenticated calls are limited to 60 an hour and Composer then clones." >&2
    exit 1
  fi
  if ! command -v composer >/dev/null 2>&1; then
    echo "error: composer is not on PATH" >&2
    exit 1
  fi
  invokes_composer=0
  saw_prefer_dist=0
  for arg in "$@"; do
    case "$arg" in
      composer|*/composer) invokes_composer=1 ;;
      --prefer-dist) saw_prefer_dist=1 ;;
    esac
  done
  if [[ "$invokes_composer" -eq 1 && "$saw_prefer_dist" -eq 0 ]]; then
    echo "error: composer install must pass --prefer-dist. --prefer-dist alone does not disable source fallback; source-fallback false does that." >&2
    exit 1
  fi
  composer config --global store-auths false
  if ! composer config --global source-fallback false; then
    echo "error: composer config source-fallback false failed. Upgrade Composer. The install was not started." >&2
    exit 1
  fi
  export COMPOSER_AUTH
  COMPOSER_AUTH="$(printf '{"github-oauth":{"github.com":"%s"}}' "$token")"
  unset token
fi

log="$(mktemp)"
trap 'rm -f "$log"' EXIT
set +e
"$@" 2>&1 | tee "$log"
status="${PIPESTATUS[0]}"
set -e

if clone_patterns "$log" >/dev/null; then
  report_clones "$log"
  if [[ "$status" -ne 0 ]]; then
    exit "$status"
  fi
  exit 1
fi
exit "$status"
