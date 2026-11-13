#!/usr/bin/env bash
# Report whether each host answers DNS and HTTPS from this machine.
# Exit 1 when any host is blocked so a setup script cannot ignore it.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: probe-hosts.sh [--timeout SECONDS] [--file PATH] HOST [HOST...]

Check each host from this machine. For every host, print one line:

  host=NAME dns=ok|fail tls=ok|fail http=CODE|fail

DNS uses getent. TLS and HTTP are one request to https://HOST/ on port 443.
Redirects are not followed: a code means this host answered. A timeout, a
refused connection, or a TLS error is fail.

Exit 0 when every host answers. Exit 1 when any host is blocked. Exit 2 on
a usage error.

--timeout SECONDS   connect and total time limit (default 8)
--file PATH         more hosts, one per line; blank lines and # comments ignored
EOF
}

TIMEOUT=8
FILE=""
HOSTS=()

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
    --file)
      shift
      if [[ $# -eq 0 ]]; then
        echo "error: --file needs a path" >&2
        exit 2
      fi
      FILE="$1"
      shift
      ;;
    --)
      shift
      while [[ $# -gt 0 ]]; do
        HOSTS+=("$1")
        shift
      done
      ;;
    -*)
      echo "error: unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      HOSTS+=("$1")
      shift
      ;;
  esac
done

if [[ ! "$TIMEOUT" =~ ^[0-9]+$ ]] || [[ "$TIMEOUT" -lt 1 ]]; then
  echo "error: --timeout must be a positive integer" >&2
  exit 2
fi

if [[ -n "$FILE" ]]; then
  if [[ ! -f "$FILE" ]]; then
    echo "error: host file not found: $FILE" >&2
    exit 2
  fi
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    if [[ -n "$line" ]]; then
      HOSTS+=("$line")
    fi
  done <"$FILE"
fi

if [[ ${#HOSTS[@]} -eq 0 ]]; then
  echo "error: name at least one host" >&2
  usage >&2
  exit 2
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "error: curl is required" >&2
  exit 1
fi
if ! command -v getent >/dev/null 2>&1; then
  echo "error: getent is required" >&2
  exit 1
fi
if ! command -v timeout >/dev/null 2>&1; then
  echo "error: timeout is required" >&2
  exit 1
fi

valid_host() {
  [[ "$1" =~ ^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$ ]]
}

blocked=0
for host in "${HOSTS[@]}"; do
  if ! valid_host "$host"; then
    echo "error: not a host name: $host" >&2
    exit 2
  fi
  dns=fail
  tls=fail
  http=fail
  if timeout "$TIMEOUT" getent hosts "$host" >/dev/null 2>&1; then
    dns=ok
    set +e
    code="$(curl -sS --connect-timeout "$TIMEOUT" --max-time "$TIMEOUT" --max-redirs 0 -o /dev/null -w '%{http_code}' "https://${host}/" 2>/dev/null)"
    status=$?
    set -e
    if [[ "$status" -eq 0 && "$code" =~ ^[0-9]{3}$ && "$code" != "000" ]]; then
      tls=ok
      http="$code"
    fi
  fi
  printf 'host=%s dns=%s tls=%s http=%s\n' "$host" "$dns" "$tls" "$http"
  if [[ "$dns" != ok || "$tls" != ok || "$http" == fail ]]; then
    blocked=$((blocked + 1))
  fi
done

if [[ "$blocked" -gt 0 ]]; then
  echo "error: ${blocked} host(s) blocked" >&2
  exit 1
fi
exit 0
