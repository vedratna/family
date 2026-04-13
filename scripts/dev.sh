#!/bin/bash
# Start the full local development stack:
# 1. DynamoDB Local (Docker)
# 2. Seed data (idempotent)
# 3. API + Web concurrently

set -e

cd "$(dirname "$0")/.."

# Kill any leftover API server on port 4000
if lsof -ti:4000 > /dev/null 2>&1; then
  echo "Killing leftover process on port 4000..."
  lsof -ti:4000 | xargs kill -9 2>/dev/null || true
fi

echo "Starting DynamoDB Local..."
docker compose up dynamodb-local -d

echo "Waiting for DynamoDB Local to be ready..."
for i in {1..30}; do
  if nc -z localhost 8000 2>/dev/null; then
    echo "DynamoDB Local is ready."
    break
  fi
  if [ "$i" = "30" ]; then
    echo "ERROR: DynamoDB Local did not become ready in 30 seconds."
    exit 1
  fi
  sleep 1
done

echo "Seeding demo data (idempotent)..."
npm run seed

echo "Starting API + Web..."
exec npx concurrently -n api,web -c green,magenta \
  "npm run dev:api" \
  "npm run dev:web"
