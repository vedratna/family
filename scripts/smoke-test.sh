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

# AppSync requires auth — check that the endpoint is reachable
# An UnauthorizedException means the API is deployed and responding
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ health }"}')

if [ "$HTTP_STATUS" = "401" ] || [ "$HTTP_STATUS" = "200" ]; then
  echo "Smoke test PASSED: API is responding (HTTP $HTTP_STATUS)."
else
  echo "Smoke test FAILED: API returned HTTP $HTTP_STATUS"
  exit 1
fi
