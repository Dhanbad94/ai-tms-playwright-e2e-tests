# GitHub Workflows Documentation

This directory contains all automated CI/CD workflows for the AI TMS Playwright E2E Tests project.

## Overview

| Workflow | Trigger | Purpose | Schedule |
|----------|---------|---------|----------|
| [playwright.yml](#playwrightyml) | Push to main, PR, Manual | Runs Playwright tests on code changes | On push/PR to main |
| [scheduled-staging.yml](#scheduled-stagingyml) | Scheduled, Manual | Automated testing on staging environment | Daily smoke (6 AM UTC), Regression (Tue/Thu 8 AM UTC) |
| [scheduled-full.yml](#scheduled-fullyml) | Scheduled, Manual | Full multi-browser test suite | Saturday 5 AM UTC |
| [scheduled-production.yml](#scheduled-productionyml) | Scheduled, Manual | Production health checks (smoke/regression only) | Friday 10 AM UTC, Sunday 6 AM UTC |
| [scheduled-preprod.yml](#scheduled-prepprepd.ymlyml) | Scheduled, Manual | Pre-production validation | Custom schedule |
| [update-version.yml](#update-versionyml) | Manual dispatch | Automates version bumping in package files | On demand |

---

## Detailed Workflow Descriptions

### playwright.yml
**Purpose**: Validates Playwright tests on every PR and push to main
- **Triggers**: 
  - Push to `main` branch
  - Pull requests to `main` branch
  - Manual dispatch with environment/test type selection
- **What it does**:
  - Runs full test suite or filtered tests (smoke/regression/critical)
  - Tests can target specific environments (staging/preproduction/production)
  - Generates test reports
- **Configuration**: 
  - `environment`: staging, preproduction, production (default: staging)
  - `test_type`: all, smoke, regression, critical (default: all)

---

### scheduled-staging.yml
**Purpose**: Automated testing on staging environment
- **Schedule**:
  - **Smoke tests**: Monday-Friday at 6:00 AM UTC
  - **Regression tests**: Tuesday & Thursday at 8:00 AM UTC
- **Features**:
  - Secret verification before running tests
  - Slack notifications on failure
  - Test result uploads to test management system
  - Supports multiple test suites: ASAPSettings, TMSOnboarding
- **Configuration**:
  - `test_type`: smoke, regression, critical, all (default: smoke)
  - `test_suite`: all, ASAPSettings, TMSOnboarding (default: all)
- **Manual Trigger**: Yes, allows override of test type and suite

---

### scheduled-full.yml
**Purpose**: Comprehensive multi-browser testing on staging
- **Schedule**: Saturday at 5:00 AM UTC
- **Browsers**: Chromium, Firefox, WebKit (parallel execution)
- **What it does**:
  - Full cross-browser validation
  - Tests against multiple environments (staging/preproduction)
  - Parallel job execution for faster results
- **Configuration**:
  - `environment`: staging, preproduction (default: staging)
  - `browsers`: all, chromium, firefox, webkit (default: all)
  - `test_suite`: all, ASAPSettings, TMSOnboarding (default: all)

---

### scheduled-production.yml
**Purpose**: Production health checks (read-only, non-destructive tests only)
- **Schedule**:
  - **Smoke tests**: Friday at 10:00 AM UTC
  - **Regression tests**: Sunday at 6:00 AM UTC
- **⚠️ Safety Features**:
  - Requires manual confirmation (`CONFIRM` string) to run
  - Only smoke and read-only tests allowed
  - Non-destructive operations only
  - Triggers critical alerts on failure
  - Tests against production environment
- **Configuration**:
  - `test_type`: smoke, regression, critical (default: smoke)
  - `test_suite`: all, ASAPSettings, TMSOnboarding (default: all)
  - `confirm_production`: Must type "CONFIRM" to execute

---

### scheduled-preprod.yml
**Purpose**: Pre-production environment validation
- **Schedule**: Custom (check workflow file for cron expression)
- **Supports**: All test types and suites
- **Use case**: Validate changes before production deployment

---

### update-version.yml
**Purpose**: Automates semantic version bumping
- **Trigger**: Manual dispatch only (`workflow_dispatch`)
- **What it does**:
  - Bumps version in `package.json` and `package-lock.json`
  - Creates feature branch with version tag
  - Opens pull request for review
  - Creates GitHub Release (when run from `main` branch)
- **Version Bump Options**:
  - `major`: Increments major version (e.g., 1.0.0 → 2.0.0)
  - `minor`: Increments minor version (e.g., 1.0.0 → 1.1.0)
  - `patch`: Increments patch version (e.g., 1.0.0 → 1.0.1)

---

## Running Workflows Manually

### Via GitHub UI
1. Go to **Actions** tab in the repository
2. Select the workflow you want to run
3. Click **Run workflow** button
4. Select input parameters (if applicable)
5. Click **Run workflow** to execute

### Via GitHub CLI
```bash
# List available workflows
gh workflow list

# Run a specific workflow
gh workflow run playwright.yml -f test_type=smoke

# Run version update workflow
gh workflow run update-version.yml -f version_bump=minor
```

---

## Environment Configuration

Workflows rely on GitHub Secrets for credentials:
- `STAGING_USER_EMAIL`: Staging environment user
- `STAGING_USER_PASSWORD`: Staging environment password
- `PREPROD_USER_EMAIL`: Pre-prod environment user
- `PREPROD_USER_PASSWORD`: Pre-prod environment password
- `PROD_USER_EMAIL`: Production user (read-only)
- `PROD_USER_PASSWORD`: Production password (read-only)
- `SLACK_WEBHOOK_URL`: Slack notifications
- `TEST_RAIL_API_KEY`: TestRail integration (optional)

---

## Test Results & Reports

All workflows generate:
- **Playwright Reports**: HTML test reports with traces
- **JUnit XML**: Test result exports for CI integration
- **Slack Notifications**: Failure alerts to team channels
- **TestRail Sync**: Automatic test result uploads (when configured)

---

## Best Practices

1. **Always use environment selectors** when running tests across different environments
2. **Production tests should be read-only** — never run destructive operations
3. **Monitor scheduled runs** — check Slack notifications and test dashboards
4. **Review PRs from version workflows** before merging
5. **Keep secrets up-to-date** — rotate credentials regularly
6. **Use test type filters** for faster CI/CD on PRs (smoke tests recommended)

---

## Troubleshooting

### Tests failing in workflow but passing locally
- Check GitHub Secrets are set correctly
- Verify environment URLs are accessible
- Ensure test data is available in the target environment

### Workflow not triggering on schedule
- Verify cron syntax is correct
- Check branch protection rules don't block workflow
- Ensure workflow file is committed to the main branch

### Manual dispatch not showing input options
- Refresh GitHub Actions page
- Confirm workflow file syntax is valid (use `yamllint` to validate)

---

## Related Files
- [Main README](../README.md) — Project overview and setup
- [Playwright Config](../playwright.config.ts) — Test configuration
- [Test Data](../test-data.json) — Test fixtures and data
