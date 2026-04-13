#!/bin/bash
# Create demo users in Cognito for QA / first-time deploy.
# Run this after the auth stack is deployed.
#
# Usage:
#   COGNITO_USER_POOL_ID=ap-south-1_xxx ./scripts/cognito-seed-demo-users.sh
#
# Requires: aws CLI configured with permissions on the Cognito user pool.

set -e

if [ -z "$COGNITO_USER_POOL_ID" ]; then
  echo "ERROR: COGNITO_USER_POOL_ID env var required."
  echo "Find it in CDK output 'UserPoolId' from the Family-<stage>-Auth stack."
  exit 1
fi

REGION="${AWS_REGION:-ap-south-1}"

create_user() {
  local phone="$1"
  local name="$2"
  echo "Creating $name ($phone)..."

  aws cognito-idp admin-create-user \
    --region "$REGION" \
    --user-pool-id "$COGNITO_USER_POOL_ID" \
    --username "$phone" \
    --user-attributes Name=phone_number,Value="$phone" Name=name,Value="$name" Name=phone_number_verified,Value=true \
    --message-action SUPPRESS \
    > /dev/null

  echo "  ✓ Created (auto-confirmed)"
}

create_user "+919876543210" "Mickey Mouse"
create_user "+919876543211" "Bart Simpson"

echo ""
echo "Demo users created. Next steps:"
echo "  1. Set passwords via 'aws cognito-idp admin-set-user-password' (use derive-password.ts logic)"
echo "  2. Or have users go through forgot-password flow on first login"
