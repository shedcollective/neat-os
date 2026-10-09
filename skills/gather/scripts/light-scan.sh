#!/usr/bin/env bash
# gather: write an evidence passport into the IDE spread (AGENTS.md, Agent
# Guide, project.md). Does not copy skills. Fills a missing/template Agent
# Guide; does not overwrite a hand-written .agents/README.md unless --force.
# Interactive TTY: ask for a ticket prefix. Non-interactive: env/flag or TODO / ask.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat <<'EOF'
Usage: light-scan.sh [--force] [--ticket-prefix=KEY] [TARGET_DIR]

Scan TARGET_DIR (default: current git root) and write an evidence passport
into AGENTS.md, .agents/README.md (Agent Guide), and .agents/project.md
(layout, Docker/Make, stack, CI, existing notes). This is gather, not init.
Does not invent client facts. Does not copy company skills. Fills a
missing/template Agent Guide; does not overwrite a hand-written
.agents/README.md or AGENTS.md unless --force.

Ticket prefix (Jira key for client repos, GH for GitHub Issues):
  --ticket-prefix=KEY      use this key (--jira-prefix is an alias)
  NEAT_OS_TICKET_PREFIX    env fallback (NEAT_OS_JIRA_PREFIX still honoured)
  SHED_OS_TICKET_PREFIX    deprecated fallback (SHED_OS_JIRA_PREFIX still honoured)
  OS repos                 neat-os / neat-os-platform-* / neat-os-tool-* get GH without asking
                           shed-os names still match
  interactive TTY          ask once
  otherwise                write a TODO / ask marker (Cloud Agent / CI)
EOF
}

ARGS=()
HAS_PREFIX=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --ticket-prefix|--jira-prefix)
      HAS_PREFIX=1
      ARGS+=("$1")
      if [[ $# -lt 2 || "$2" == -* ]]; then
        echo "error: $1 requires a value" >&2
        exit 2
      fi
      ARGS+=("$2")
      shift 2
      ;;
    --ticket-prefix=*|--jira-prefix=*)
      HAS_PREFIX=1
      ARGS+=("$1")
      shift
      ;;
    --force)
      ARGS+=("$1")
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
      ARGS+=("$1")
      shift
      ;;
  esac
done

while [[ $# -gt 0 ]]; do
  ARGS+=("$1")
  shift
done

if [[ "$HAS_PREFIX" -eq 0 && -z "${NEAT_OS_TICKET_PREFIX:-}" && -z "${NEAT_OS_JIRA_PREFIX:-}" && -z "${SHED_OS_TICKET_PREFIX:-}" && -z "${SHED_OS_JIRA_PREFIX:-}" && -t 0 && -t 1 ]]; then
  echo "Ticket prefix: Jira key for a client repo (e.g. ACME), GH for GitHub Issues. Leave blank to mark TODO / ask (OS repos default to GH)."
  read -r -p "> " PREFIX || true
  if [[ -n "${PREFIX:-}" ]]; then
    ARGS+=(--ticket-prefix="$PREFIX")
  fi
fi

if ! command -v node >/dev/null 2>&1; then
  echo "error: node is required for light-scan.js" >&2
  exit 1
fi

exec node "$SCRIPT_DIR/light-scan.js" "${ARGS[@]}"
