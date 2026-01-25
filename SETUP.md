# Repository Setup Guide

## 1. Initial Git Setup

The repository has been initialized with Git. Follow these steps to push to GitHub:

```bash
# Rename branch from master to main (if needed)
git branch -M main

# Add your GitHub remote repository
git remote add origin https://github.com/<your-username>/ai-tms-playwright-e2e-tests.git

# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit: E2E test framework v1.1.0"

# Push to GitHub
git push -u origin main
```

## 2. Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

### Required Secrets by Environment

#### Staging (Required for basic CI/CD)
| Secret Name | Description |
|-------------|-------------|
| `STAGING_MANAGER_EMAIL` | Manager email for staging |
| `STAGING_MANAGER_PASSWORD` | Manager password for staging |
| `STAGING_OPERATOR_EMAIL` | Operator email for staging |
| `STAGING_OPERATOR_PASSWORD` | Operator password for staging |

#### Preproduction (Optional - enables preprod tests)
| Secret Name | Description |
|-------------|-------------|
| `PREPROD_MANAGER_EMAIL` | Manager email for preproduction |
| `PREPROD_MANAGER_PASSWORD` | Manager password for preproduction |
| `PREPROD_OPERATOR_EMAIL` | Operator email for preproduction |
| `PREPROD_OPERATOR_PASSWORD` | Operator password for preproduction |

#### Production (Optional - enables production tests)
| Secret Name | Description |
|-------------|-------------|
| `PROD_MANAGER_EMAIL` | Manager email for production |
| `PROD_MANAGER_PASSWORD` | Manager password for production |
| `PROD_OPERATOR_EMAIL` | Operator email for production |
| `PROD_OPERATOR_PASSWORD` | Operator password for production |

#### Notifications (Optional)
| Secret Name | Description |
|-------------|-------------|
| `SLACK_WEBHOOK_URL` | Slack webhook for test notifications |

> **Note:** Workflows will automatically skip if the required secrets for that environment are not configured.

## 3. Scheduled Test Runs

The following scheduled workflows are configured:

| Workflow | Schedule | Environment | Test Type |
|----------|----------|-------------|-----------|
| `scheduled-staging.yml` | Mon-Fri 6:00 AM UTC | Staging | Smoke |
| `scheduled-staging.yml` | Tue, Thu 8:00 AM UTC | Staging | Regression |
| `scheduled-preprod.yml` | Wed 7:00 AM UTC | Preproduction | Full Suite |
| `scheduled-production.yml` | Fri 10:00 AM UTC | Production | Smoke |
| `scheduled-production.yml` | Sun 6:00 AM UTC | Production | Regression |
| `scheduled-full.yml` | Sat 5:00 AM UTC | Staging | Multi-browser |

### Enabling/Disabling Schedules

- **To enable:** Add the required secrets for that environment
- **To disable:** Remove the secrets (workflows will skip gracefully)
- **Manual trigger:** All workflows support `workflow_dispatch` for on-demand runs

## 4. Configure Branch Protection Rules

Go to your GitHub repository → **Settings** → **Branches** → **Add rule**

### For `main` branch:

1. **Branch name pattern:** `main`

2. **Protect matching branches:**
   - [x] Require a pull request before merging
     - [x] Require approvals: 1
     - [x] Dismiss stale pull request approvals when new commits are pushed
   - [x] Require status checks to pass before merging
     - [x] Require branches to be up to date before merging
     - Status checks: `Run Playwright Tests`, `Test Summary`
   - [x] Require conversation resolution before merging
   - [x] Do not allow bypassing the above settings

3. **Rules applied to everyone including administrators:**
   - [x] Restrict who can push to matching branches
     - Add: Repository administrators only

## 5. Git Workflow

### Creating a Feature Branch

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create a new feature branch
git checkout -b feature/your-feature-name

# Make your changes...

# Stage and commit
git add .
git commit -m "feat: add new feature description"

# Push to remote
git push -u origin feature/your-feature-name
```

### Creating a Pull Request

1. Go to GitHub repository
2. Click "Compare & pull request"
3. Fill in the PR template
4. Request reviewers
5. Wait for CI checks to pass
6. Get approval and merge

### Commit Message Convention

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `test:` - Adding/updating tests
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks

## 6. Local Development Setup

```bash
# Clone the repository
git clone https://github.com/<your-username>/ai-tms-playwright-e2e-tests.git
cd ai-tms-playwright-e2e-tests

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
# NEVER commit .env.local!

# Install Playwright browsers
npm run install:browsers

# Run tests
./run-tests -e staging -f asapsettings --bc
```

## 7. Manual Workflow Triggers

You can manually trigger any workflow from GitHub Actions:

1. Go to **Actions** tab
2. Select the workflow
3. Click **Run workflow**
4. Select options (environment, test type, etc.)
5. Click **Run workflow**

### Available Manual Triggers

| Workflow | Options |
|----------|---------|
| Staging Tests | test_type (smoke/regression/critical/all), test_suite |
| Preprod Tests | test_type, test_suite |
| Production Tests | test_type, test_suite, **confirm_production** (must type "CONFIRM") |
| Full Suite | environment, browsers (all/chromium/firefox/webkit), test_suite |

## 8. Environment URLs

| Environment | URL |
|-------------|-----|
| Staging | https://staging.trackmyshuttle.com |
| Preproduction | https://preproduction.trackmyshuttle.com |
| Production | https://trackmyshuttle.com |

## 9. Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No hardcoded credentials in code
- [ ] GitHub Secrets configured for CI/CD
- [ ] Branch protection enabled on `main`
- [ ] CODEOWNERS file configured
- [ ] PR reviews required before merge
- [ ] Production tests require confirmation for manual runs

## 10. Troubleshooting

### Scheduled tests not running?
1. Check if secrets are configured for that environment
2. Verify the cron schedule (times are in UTC)
3. Check workflow run history for skip messages

### Tests failing in CI but passing locally?
1. Ensure `.env.local` matches GitHub Secrets
2. Check for timezone differences (CI uses UTC)
3. Review test artifacts in workflow run

### Need to disable a scheduled workflow?
1. Remove the corresponding secrets, OR
2. Comment out the `schedule` trigger in the workflow file
