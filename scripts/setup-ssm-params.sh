#!/bin/bash
set -e

STAGE=${1:-dev}
PREFIX="/family/${STAGE}"

echo "Setting up SSM parameters for stage: ${STAGE}"
echo "Parameters will be stored under: ${PREFIX}/"
echo ""

read -s -p "Google OAuth Client Secret: " GOOGLE_SECRET
echo ""
if [ -n "$GOOGLE_SECRET" ]; then
  aws ssm put-parameter \
    --name "${PREFIX}/google-client-secret" \
    --type SecureString \
    --value "$GOOGLE_SECRET" \
    --overwrite
  echo "  Stored: ${PREFIX}/google-client-secret"
fi

echo ""
echo "SSM parameters configured for stage: ${STAGE}"
echo ""
echo "To verify:"
echo "  aws ssm get-parameters-by-path --path ${PREFIX}/ --with-decryption"
