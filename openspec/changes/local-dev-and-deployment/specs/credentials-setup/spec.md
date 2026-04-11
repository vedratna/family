## ADDED Requirements

### Requirement: Environment variable template
The system SHALL include a `.env.example` file listing every environment variable used by the project, grouped by service, with descriptions and example values. The file SHALL be committed to git. A `.env.local` file (gitignored) SHALL be used for actual values.

#### Scenario: Developer sets up local environment
- **WHEN** a developer copies `.env.example` to `.env.local`
- **THEN** they SHALL see every variable needed with descriptions, and can fill in values to get the system running

### Requirement: AWS SSM Parameter Store setup script
The system SHALL include a shell script (`scripts/setup-ssm-params.sh`) that creates all required SSM Parameter Store entries for a given stage. The script SHALL prompt for each secret value and store it as a SecureString.

#### Scenario: Admin sets up dev environment secrets
- **WHEN** an admin runs `./scripts/setup-ssm-params.sh dev`
- **THEN** the script SHALL prompt for Google OAuth secret, Apple Sign In keys, and store them in SSM under `/family/dev/` prefix

### Requirement: Credentials checklist with stage mapping
The system SHALL include documentation mapping every credential to: which stage needs it (local/dev/prod), where to obtain it, where to store it, and which service consumes it.

#### Scenario: Developer needs to know what credentials to set up for dev
- **WHEN** a developer reads the credentials checklist
- **THEN** they SHALL find a table showing exactly which credentials are needed for the dev stage, where to get them, and where to store them

### Requirement: CDK bootstrap instructions
The system SHALL include step-by-step instructions for bootstrapping CDK in a new AWS account, including: IAM user creation, CDK bootstrap command, and verification.

#### Scenario: First-time AWS setup
- **WHEN** a developer follows the CDK bootstrap instructions
- **THEN** they SHALL have a working CDK deployment capability in their AWS account

### Requirement: Credentials needed per stage
The system SHALL document the minimum credentials required at each stage:
- **Local (mock)**: None
- **Local (API)**: None (DynamoDB Local, no AWS)
- **Dev deploy**: AWS IAM credentials, CDK bootstrap
- **Dev with auth**: SNS SMS sandbox exit, Google OAuth, Apple Sign In
- **Dev with notifications**: APNs certificate, FCM key
- **Prod**: All of the above + Expo EAS token + App Store/Play Store credentials

#### Scenario: Developer wants to deploy to dev without auth providers
- **WHEN** a developer reads the per-stage requirements
- **THEN** they SHALL understand that dev deployment only requires AWS IAM + CDK bootstrap, and auth providers can be added later
