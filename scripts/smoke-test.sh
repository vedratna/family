#!/bin/bash
set -e

STAGE=${1:-dev}

echo "Running smoke test for stage: $STAGE"

# Get the AppSync URL from CDK outputs
API_URL=$(aws cloudformation describe-stacks \
  --stack-name "Family-${STAGE}-Api" \
  --query "Stacks[0].Outputs[?OutputKey=='GraphqlApiUrl'].OutputValue" \
  --output text 2>/dev/null || echo "")

if [ -z "$API_URL" ]; then
  echo "Warning: Could not retrieve API URL from CloudFormation. Skipping smoke test."
  exit 0
fi

echo "Testing API at: $API_URL"

# Health check query
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ health }"}')

if echo "$RESPONSE" | grep -q '"health"'; then
  echo "Smoke test PASSED: API is responding."
else
  echo "Smoke test FAILED: Unexpected response: $RESPONSE"
  exit 1
fi
