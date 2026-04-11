# AWS Bootstrap Guide

> First-time setup for deploying FamilyApp to AWS.

## Prerequisites

- AWS Account ([sign up](https://aws.amazon.com/free/))
- AWS CLI installed (`brew install awscli` on macOS)

## Step 1: Create an IAM User for Deployment

1. Go to AWS Console → IAM → Users → Create User
2. Name: `family-app-deploy`
3. Attach policy: `AdministratorAccess` (for CDK — scope down later)
4. Create access key (CLI use case)
5. Save the Access Key ID and Secret Access Key

## Step 2: Configure AWS CLI

```bash
aws configure
# AWS Access Key ID: <from step 1>
# AWS Secret Access Key: <from step 1>
# Default region: ap-south-1
# Default output format: json
```

Verify:

```bash
aws sts get-caller-identity
# Should show your account ID
```

## Step 3: Bootstrap CDK

CDK needs a one-time bootstrap per account/region:

```bash
cd packages/infra
npx cdk bootstrap aws://<ACCOUNT_ID>/ap-south-1
```

Verify:

```bash
npx cdk synth --context stage=dev
# Should output CloudFormation templates without errors
```

## Step 4: First Deploy

```bash
# See what will be created
npx cdk diff --context stage=dev

# Deploy all stacks
npx cdk deploy --all --context stage=dev
```

This creates:

- Cognito User Pool
- DynamoDB table (`family-dev`)
- S3 media bucket
- AppSync GraphQL API
- SNS notification topic
- EventBridge event bus

## Step 5: Add GitHub Secrets

Go to GitHub → Repository → Settings → Secrets → Actions:

| Secret                  | Value        |
| ----------------------- | ------------ |
| `AWS_ACCESS_KEY_ID`     | From Step 1  |
| `AWS_SECRET_ACCESS_KEY` | From Step 1  |
| `AWS_REGION`            | `ap-south-1` |

## Step 6: Verify Auto-Deploy

Push a commit to `main`. The deploy-dev workflow should:

1. Run CDK diff
2. Deploy all stacks
3. Run smoke test

Check GitHub Actions tab for results.

## Cost Estimate (Dev Environment)

| Service              | Estimated Monthly Cost        |
| -------------------- | ----------------------------- |
| DynamoDB (on-demand) | ~$0.01 (minimal traffic)      |
| Lambda               | ~$0 (free tier: 1M requests)  |
| S3                   | ~$0.01 (minimal storage)      |
| AppSync              | ~$0 (free tier: 250K queries) |
| Cognito              | ~$0 (free tier: 50K MAU)      |
| SNS                  | ~$0 (free tier: 1M publishes) |
| **Total**            | **< $1/month**                |
