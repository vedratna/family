# GitHub Repository Setup

> Step-by-step guide for configuring the GitHub repository.

## 1. Create Repository

```bash
gh repo create family-app --private --source=. --push
```

Or create via GitHub UI and add remote:

```bash
git remote add origin git@github.com:<your-org>/family-app.git
git push -u origin main
```

## 2. Branch Protection (Settings > Branches)

For the `main` branch:

- [x] Require a pull request before merging
  - [x] Require approvals: 1
  - [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require status checks to pass before merging
  - Required checks:
    - `Lint & Format`
    - `Type Check`
    - `Unit Tests`
    - `Integration Tests`
    - `Build Check`
    - `Security Audit`
- [x] Require conversation resolution before merging
- [x] Require linear history (squash merge)
- [x] Do not allow bypassing the above settings

## 3. GitHub Environments (Settings > Environments)

### `dev` environment

- No protection rules (auto-deploys on merge to main)

### `production` environment

- Required reviewers: 1+ team member
- Wait timer: 0 (approval is the gate)
- Deployment branches: `main` only

## 4. Repository Secrets (Settings > Secrets > Actions)

| Secret                  | Required For | How to Get                                      |
| ----------------------- | ------------ | ----------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | CDK deploy   | IAM user with CDK permissions                   |
| `AWS_SECRET_ACCESS_KEY` | CDK deploy   | Same IAM user                                   |
| `AWS_REGION`            | CDK deploy   | `ap-south-1`                                    |
| `EXPO_TOKEN`            | EAS builds   | `expo login` → Account Settings → Access Tokens |

## 5. Merge Settings (Settings > General > Pull Requests)

- [x] Allow squash merging (default commit message: PR title)
- [ ] Allow merge commits (disable)
- [ ] Allow rebase merging (disable)
- [x] Automatically delete head branches
