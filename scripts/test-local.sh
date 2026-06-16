#!/usr/bin/env bash
# Runs the full test suite (unit + integration + functional) against a local Docker Postgres.
# Usage:
#   bun run test:local              # all layers
#   bun run test:local unit         # only unit (no Docker needed)
#   bun run test:local integration
#   bun run test:local functional
set -euo pipefail

COMPOSE_FILE="docker-compose.test.yml"
LAYER="${1:-all}"
NEEDS_DB=true

if [ "$LAYER" = "unit" ]; then
  NEEDS_DB=false
fi

# ── Env ──────────────────────────────────────────────────────────────────────
if [ ! -f .env.test ]; then
  echo "❌  .env.test not found."
  echo "    Copy .env.test.example → .env.test and fill in the values."
  exit 1
fi

set -a
# shellcheck source=.env.test
source .env.test
set +a

# ── Docker lifecycle ──────────────────────────────────────────────────────────
if $NEEDS_DB; then
  cleanup() {
    echo ""
    echo "Stopping test database…"
    docker compose -f "$COMPOSE_FILE" down --remove-orphans
  }
  trap cleanup EXIT

  echo "Starting test database…"
  docker compose -f "$COMPOSE_FILE" up -d

  echo "Waiting for Postgres to be ready…"
  ATTEMPTS=0
  until docker compose -f "$COMPOSE_FILE" exec -T postgres \
      pg_isready -U postgres -d link_arch_test &>/dev/null; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ "$ATTEMPTS" -ge 30 ]; then
      echo "❌  Postgres did not become ready after 30 seconds."
      exit 1
    fi
    sleep 1
  done
  echo "✓  Postgres is ready."

  echo ""
  echo "Running migrations…"
  (cd packages/db && bun run src/migrate.ts)
  echo "✓  Migrations done."
fi

# ── Tests ─────────────────────────────────────────────────────────────────────
EXIT_CODE=0

run_suite() {
  local name="$1"
  local dir="$2"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  $name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  (cd apps/web && bun test "$dir") || EXIT_CODE=$?
}

case "$LAYER" in
  unit)
    run_suite "Unit Tests" "__tests__/unit"
    ;;
  integration)
    run_suite "Integration Tests" "__tests__/integration"
    ;;
  functional)
    run_suite "Functional Tests" "__tests__/functional"
    ;;
  all)
    run_suite "Unit Tests"        "__tests__/unit"
    run_suite "Integration Tests" "__tests__/integration"
    run_suite "Functional Tests"  "__tests__/functional"
    ;;
  *)
    echo "Unknown layer: $LAYER. Use: unit | integration | functional | all"
    exit 1
    ;;
esac

echo ""
if [ "$EXIT_CODE" -eq 0 ]; then
  echo "✓  All tests passed."
else
  echo "✗  Some tests failed (exit code $EXIT_CODE)."
fi

exit $EXIT_CODE
