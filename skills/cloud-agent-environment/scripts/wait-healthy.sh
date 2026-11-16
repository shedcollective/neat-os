#!/usr/bin/env bash
# Wait until a local service answers. Exit 1 when the timeout expires.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: wait-healthy.sh [--timeout SECONDS] [--interval SECONDS] (--url URL | --tcp HOST:PORT | -- COMMAND...)

Retry until the check passes or the timeout expires. Print "healthy after=Ns"
on success. On timeout, print the last failure and exit 1.

--url URL           HTTP GET. Success is a 2xx response.
--expect-body RE    With --url, the body must also match this extended regex.
--tcp HOST:PORT     Success is a TCP connection. IPv4 host names only.
-- COMMAND...       Success is COMMAND exiting 0. One check mode only.

--timeout SECONDS   overall limit (default 60)
--interval SECONDS  pause between tries (default 2)

Exit 2 on a usage error.
EOF
}

TIMEOUT=60
INTERVAL=2
URL=""
EXPECT=""
TCP=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --timeout)
      shift
      if [[ $# -eq 0 ]]; then
        echo "error: --timeout needs a number of seconds" >&2
        exit 2
      fi
      TIMEOUT="$1"
      shift
      ;;
    --interval)
      shift
      if [[ $# -eq 0 ]]; then
        echo "error: --interval needs a number of seconds" >&2
        exit 2
      fi
      INTERVAL="$1"
      shift
      ;;
    --url)
      shift
      if [[ $# -eq 0 ]]; then
        echo "error: --url needs a URL" >&2
        exit 2
      fi
      URL="$1"
      shift
      ;;
    --expect-body)
      shift
      if [[ $# -eq 0 ]]; then
        echo "error: --expect-body needs a regex" >&2
        exit 2
      fi
      EXPECT="$1"
      shift
      ;;
    --tcp)
      shift
      if [[ $# -eq 0 ]]; then
        echo "error: --tcp needs HOST:PORT" >&2
        exit 2
      fi
      TCP="$1"
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
      echo "error: unexpected argument: $1 (a command goes after --)" >&2
      exit 2
      ;;
  esac
done

if [[ ! "$TIMEOUT" =~ ^[0-9]+$ ]] || [[ "$TIMEOUT" -lt 1 ]]; then
  echo "error: --timeout must be a positive integer" >&2
  exit 2
fi
if [[ ! "$INTERVAL" =~ ^[0-9]+$ ]] || [[ "$INTERVAL" -lt 1 ]]; then
  echo "error: --interval must be a positive integer" >&2
  exit 2
fi

modes=0
[[ -n "$URL" ]] && modes=$((modes + 1))
[[ -n "$TCP" ]] && modes=$((modes + 1))
[[ $# -gt 0 ]] && modes=$((modes + 1))
if [[ "$modes" -ne 1 ]]; then
  echo "error: pass exactly one of --url, --tcp, or a command after --" >&2
  exit 2
fi
if [[ -n "$EXPECT" && -z "$URL" ]]; then
  echo "error: --expect-body requires --url" >&2
  exit 2
fi

TCP_HOST=""
TCP_PORT=""
if [[ -n "$TCP" ]]; then
  if [[ ! "$TCP" =~ ^([A-Za-z0-9._-]+):([0-9]+)$ ]]; then
    echo "error: --tcp must be HOST:PORT" >&2
    exit 2
  fi
  TCP_HOST="${BASH_REMATCH[1]}"
  TCP_PORT="${BASH_REMATCH[2]}"
  if ! command -v timeout >/dev/null 2>&1; then
    echo "error: timeout is required for --tcp" >&2
    exit 1
  fi
fi
if [[ -n "$URL" ]] && ! command -v curl >/dev/null 2>&1; then
  echo "error: curl is required for --url" >&2
  exit 1
fi

last="not tried"
deadline=$((SECONDS + TIMEOUT))
while true; do
  if [[ -n "$URL" ]]; then
    body="$(mktemp)"
    set +e
    code="$(curl -sS --max-time "$INTERVAL" -o "$body" -w '%{http_code}' "$URL" 2>/dev/null)"
    set -e
    snippet="$(tr '\n' ' ' <"$body" | cut -c 1-180)"
    matched=0
    if [[ -z "$EXPECT" ]] || grep -E -q "$EXPECT" "$body"; then
      matched=1
    fi
    rm -f "$body"
    if [[ "$code" =~ ^2[0-9][0-9]$ && "$matched" -eq 1 ]]; then
      echo "healthy after=${SECONDS}s"
      exit 0
    fi
    if [[ "$code" =~ ^2[0-9][0-9]$ ]]; then
      last="http=${code} body did not match"
    else
      last="http=${code:-fail} ${snippet}"
    fi
  elif [[ -n "$TCP" ]]; then
    if timeout "$INTERVAL" bash -c "echo >/dev/tcp/${TCP_HOST}/${TCP_PORT}" 2>/dev/null; then
      echo "healthy after=${SECONDS}s"
      exit 0
    fi
    last="tcp ${TCP} closed"
  else
    set +e
    "$@" >/dev/null 2>&1
    status=$?
    set -e
    if [[ "$status" -eq 0 ]]; then
      echo "healthy after=${SECONDS}s"
      exit 0
    fi
    last="command exited ${status}"
  fi
  if [[ "$SECONDS" -ge "$deadline" ]]; then
    echo "error: not healthy after ${TIMEOUT}s: ${last}" >&2
    exit 1
  fi
  sleep "$INTERVAL"
done
