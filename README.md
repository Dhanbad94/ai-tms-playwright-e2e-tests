# AI TMS Playwright E2E Tests ✅

This repository contains end-to-end (E2E) test automation for the TrackMyShuttle web application using Playwright + TypeScript.

## Quick overview

- Tests are in: `tests/TMS/*.spec.ts`
- Page objects live in: `pages/*.ts`
- Helpers and scripts are in: `helpers/` and `common/`
- Test runner script: `./run-tests` (helper that constructs an `npx playwright test` command)
- Playwright test results and artifacts: `test-results/` and `playwright-report/`

## Requirements

- Node.js (LTS) — this repo was verified with Node 22+.
- npm (or yarn) — to install dev dependencies.
- Playwright browsers and system deps — install with `npx playwright install --with-deps`.

Make sure you have a current Node install and permissions to install Playwright browsers.

## Install

```bash
# install dependencies
npm ci

# install Playwright browsers and system dependencies
npx playwright install --with-deps
```

If you prefer not to modify your global environment you can run the suite inside Docker or CI.

## Running tests locally

Run the repo-provided helper script (it defaults to the `staging` environment and runs all browsers):

```bash
# run all tests (chromium + firefox + webkit)
./run-tests

# run a subset using a filename filter (example: login) and Chromium only
./run-tests -f login --bc

# run all (convenience alias):
./run-tests -u
```

You can also run tests directly with Playwright commands:

```bash
npx playwright test --project=chromium
npx playwright show-report   # open HTML report from last run
npx playwright show-trace test-results/<run-folder>/trace.zip  # inspect trace for a failing test
```

## Test artifacts

After a run Playwright stores screenshots, traces and video in `test-results/` and builds an HTML report under `playwright-report/`.

Helpful commands:

```bash
npx playwright show-report    # opens the HTML report
npx playwright show-trace test-results/<folder>/trace.zip
```

## Troubleshooting / common failures

- Exit code 126 when executing `./run-tests` indicates the script is not executable. Fix with:
	```bash
	chmod +x run-tests
	```
- Playwright timeouts/navigation issues: increase timeout in tests, use `page.waitForURL(..., {timeout: <ms>})` or add more robust checks.
- Selector strict mode failures: refine locators to be unique (avoid locators that resolve to multiple elements).

## CI / GitHub Actions

This repo includes an example GitHub Actions workflow (`.github/workflows/playwright.yml`) you can use as a starting point. Ensure the runner environment includes required credentials and secrets.

## Contributing

If you contribute fixes or new tests please:

1. Create a feature branch
2. Run and verify tests locally
3. Add/update tests and adjust selectors/timeouts as needed
4. Open a PR with details and any failing test artifacts

---

If you'd like, I can also add CI improvements, convert JS helpers to TypeScript, and fix the failing tests listed when you ran the suite — shall I continue with the conversion step now? 🚀
