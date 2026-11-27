# Conventions

How this repo is organized and the patterns every test/page-object change
should follow. Scaffolded from the code that already exists here — when in
doubt, match what the surrounding files do; update this doc in the same PR
if you deliberately deviate.

See also [`app-map.yaml`](app-map.yaml) (feature → URL → page object → spec →
tags) and [`docs/slack-report.md`](docs/slack-report.md) (CI/reporting).

## Folder layout

```
tests/
  auth.setup.ts, auth.teardown.ts   # storageState login/cleanup (see Auth below)
  TMSOnboarding/                    # login, activate account, forgot password, dashboard, profile
  ASAPSettings/
    fixtures/test-data.ts           # ASAP-specific fixtures (org config, tab hashes, test users...)
    *.spec.ts                       # one spec file per settings tab / feature
pages/
  *.ts                              # TMSOnboarding-era page objects (flat, snake_case files)
  ASAP/
    index.ts                        # barrel export — add new ASAP page objects here
    settings-base.page.ts           # shared tab nav + ensureAuthenticated, extend for new tabs
    *.page.ts                       # one page object per settings tab (kebab-case files)
constants/index.ts                  # global TIMEOUTS/VIEWPORTS/PATHS/TAGS (see "Two TIMEOUTS objects" below)
utils/test-data.ts                  # TMSOnboarding environment/credential resolution (TEST_DATA)
helpers/                            # cross-cutting utilities (report generation, Slack notify, cookie banner...)
common/                             # legacy utilities (result processing, XML, etc.) — mostly pre-existing, low churn
app-map.yaml                        # feature map (keep in sync with new specs/page objects)
```

Two page-object eras coexist: flat files directly under `pages/` (login,
dashboard, profile, activate account, forgot password, legacy settings) use
snake_case filenames; the newer `pages/ASAP/*.page.ts` set uses kebab-case and
is exported through `pages/ASAP/index.ts`. Follow whichever convention matches
the feature you're extending; default to the `ASAP/` pattern for new settings
tabs.

## Page Object pattern

- One class per page/feature, named `<Feature>Page` (e.g. `OrganizationSettingsPage`).
- Constructor takes `page: Page`, declares every locator as a `readonly Locator` field, built once in the constructor — never re-queried ad hoc inside methods unless it's dynamic (e.g. `getUserRowByEmail(email)`).
- Method naming: `goto()` / `navigateToX()` for navigation, `clickX()` for actions, `getX()` for reading a value, `verifyX()`/`expectX()` for assertions bundled into a helper, `isXEnabled()`/`isXVisible()` for booleans.
- Methods return `Promise<void>` for actions, typed objects for multi-field reads (see `getOrganizationInfo()`, `getUserData()`).
- New ASAP settings-tab page objects extend or compose `SettingsBasePage` (for `navigateToSettings`, `clickTab`, `ensureAuthenticated`) rather than duplicating tab-navigation logic.

## Locator strategy (in priority order)

1. **`getByRole`** (120+ uses) — the default. Use with `{ name: ... }`, and `{ exact: true }` whenever the visible text could be a substring of something else (see gotcha below).
2. **`getByText` / `getByPlaceholder`** when there's no meaningful role.
3. **CSS id/class `page.locator(...)`** when the element has a stable `id` (e.g. `#org_name`, `#editModalManager`) — common here because the app has very few `data-testid` attributes (only 2 occurrences in this whole repo, both in a documented fallback-selector list for the login form).
4. **Never XPath**, and never an auto-generated/positional class. (Zero XPath usage in this repo — keep it that way.)

When a locator can resolve to multiple elements (settings pages especially —
see gotchas below), scope it: `.first()` is a last resort; prefer scoping to
`:visible` or the specific active container so you don't silently read from a
hidden duplicate.

## Tagging

Tags actually in use (grep `tests/**/*.spec.ts` for the current source of truth):

| Tag | Meaning |
|---|---|
| `@smoke` | critical-path, fast, run on every environment incl. production |
| `@regression` | full coverage, not necessarily fast |
| `@prod` | read-only, safe to run against production/preprod (see "Prod-safety" below) |
| `@crud` | mutates data — never add `@prod` to a `@crud` test |
| `@negative` | invalid-input / error-path tests |
| `@e2e` | multi-step journeys spanning more than one page object |
| `@manager`, `@operator` | which role the test logs in as |
| `@asap`, `@settings`, `@whatsapp`, `@rbac`, `@profile` | feature-area grouping |
| `@performance` | has a timing assertion |
| `@navigation` | pure nav-flow check |
| `@system`, `@integration` | TMSOnboarding legacy classification |

`constants/index.ts` also defines a `TAGS` object with `@critical`, `@flaky`,
`@slow`, `@admin`, `@api` — these are **reserved/aspirational**, not yet
applied to any test. Don't assume they're wired into any workflow's `--grep`
filter; check `.github/workflows/*.yml` before relying on a tag to select a
CI run.

### Prod-safety rule
`@prod` means **strictly read-only** — verifies UI/state, navigates, client-side
validation only. It must never create/edit/delete data, submit a real form, or
toggle a persisted setting. The 2026-09 tagging pass removed `@prod` from every
test that failed when actually run against production, and from everything
carrying `@crud`/`@e2e`/`@negative` by default — follow that precedent for any
new test.

## Test IDs

Numeric/alpha prefixes per feature, kept sequential within a file:

| Prefix | Feature |
|---|---|
| `OS-` | Organization Settings (display) |
| `ORG-EDIT-`, `ORG-E2E-` | Organization edit flow |
| `NAV-MANAGE-` | "Manage" CTA navigation |
| `SN-`, `SET-NAV-` | Settings left-panel tab navigation |
| `UM-R/C/U/D/P-`, `UM-CRUD-` | User Management: Read/Create/Update/Delete/Password-reset, full lifecycle |
| `RBAC-` | Role-based access |
| `WA-NAV/READ/CRUD-` | WhatsApp settings |
| `PROF-NAV/VIEW/TABS/PWD/VAL-` | Profile page |

TMSOnboarding login/dashboard tests use descriptive titles instead of ID
prefixes ("should display...", "Operator: Login, verify menus..."). Either
style is fine — match whichever the file already uses.

## Fixtures & test data

Three layers — know which one you're reaching for:

- **`constants/index.ts`** — global, environment-independent constants (`TIMEOUTS`, `VIEWPORTS`, `PATHS`, `TAGS`, error/success message strings, selector fallbacks).
- **`utils/test-data.ts`** — `TEST_DATA`, resolved once from `process.env.ENV` (staging/preproduction/production), used by TMSOnboarding specs and `auth.setup.ts`.
- **`tests/ASAPSettings/fixtures/test-data.ts`** — ASAP-specific: `getCredentials(role)`, `getBaseUrl()`, `ASAP_ORG_CONFIG`, `SETTINGS_TAB_HASHES`/`SETTINGS_TAB_NAMES`, `EXISTING_USERS`, `generateTestUser()`, its own `TIMEOUTS`/`PERFORMANCE_THRESHOLDS`.

⚠️ **Two different `TIMEOUTS` objects exist** — `constants/index.ts` uses
UPPERCASE keys (`TIMEOUTS.ACTION`, `.NAVIGATION`, `.TEST_TIMEOUT`...) and is
what `playwright.config.ts` and `auth.setup.ts` use; the ASAPSettings fixtures
file uses lowercase keys (`TIMEOUTS.short`, `.medium`, `.navigation`) for specs
under `tests/ASAPSettings/`. They are **not the same object** — importing the
wrong one is a real, easy mistake. Check the import path, not just the name.

Dynamic test users: `generateTestUser(role)` produces
`test.user.<timestamp>@example.com` — always clean these up (even in a
`finally`/`afterEach`), because leftover accounts from interrupted runs
eventually hit the test org's user limit and make unrelated Create-User tests
fail with no obvious cause.

## Auth / storageState

- `tests/auth.setup.ts` logs in once per environment, saves
  `playwright/.auth/<env>.json`; the `chromium` project depends on `setup`
  and reuses that file. `auth.teardown.ts` deletes it after the run.
- A test that needs to start unauthenticated (login page tests, RBAC tests
  that log in as a specific role) uses `test.use({ storageState: { cookies: [], origins: [] } })`.
- The shared session can expire mid-run (observed ~5–15 min on staging).
  `SettingsBasePage.ensureAuthenticated(baseUrl)` detects a redirect to
  `/login` and transparently re-authenticates — call it (or route through
  `navigateToSettings`, which already does) rather than assuming the session
  is always valid.

## Assertion style

- Prefer Playwright's auto-waiting `expect(locator).toBeVisible()` /
  `.toHaveValue()` / `.toHaveURL()` over manual polling.
- `waitForTimeout` is used sparingly and only for documented, non-deterministic
  UI behavior (e.g. ~300ms after opening a Bootstrap popover, ~400–600ms after
  a toggle's auto-save) — don't add a bare `waitForTimeout` to paper over a
  flaky locator; fix the locator or the wait condition instead.
- Never weaken or delete an assertion to make a test pass. If you believe an
  assertion is checking the wrong thing, say so in the PR description and get
  it reviewed — don't silently loosen it.
- A test whose root cause is a live app bug (not a stale locator) should be
  **left failing** with the bug issue linked in a comment, not skipped —
  unless the whole file/feature is under active, fast-moving development (see
  User Management below), in which case the maintainer may choose to
  `test.describe.skip` the whole suite rather than chase a moving target.

## Known gotchas (read before touching the settings pages)

- **Active-tab signal:** the active settings tab carries no `active` class or
  `aria-expanded`; `aria-controls` is inconsistent across tabs. The only
  reliable signal is the **URL hash matching the tab's `href`**. For the
  hashless default tab (Organization), check its content heading instead.
- **`clickTab` on the heavy settings page:** the sidebar has a custom-scrollbar
  overlay that intercepts real pointer clicks even with `click({force:true})`.
  `settings-base.page.ts` dispatches the tab's own click via
  `tab.evaluate(el => el.click())`, which fires the Bootstrap handler directly.
  Don't regress this to a plain `.click()`.
- **Multiple tabpanels in the DOM:** the settings page renders ~8 tabpanels
  (most hidden). An unscoped `page.getByRole("tabpanel")` is a strict-mode
  violation — scope to the visible one (`.locator("visible=true").first()`).
- **WhatsApp-style toggles** are CSS switches with a `display:none` input —
  click the visible `.toggle-track` sibling, assert with `toBeAttached()` (not
  `toBeVisible()`) on the input itself.
- **Google Maps renders duplicate zoom controls** (one hidden) — scope to
  `:visible` or you'll get a strict-mode violation or click the wrong one.
- **"Manage" CTA / any substring-prone link name:** `getByRole("link", {name:"Manage"})`
  also matches `automated.manager@...` — always pass `exact: true` for short
  link/button names that could be substrings of something else on the page.
- **Organization edit modal currently has a live app bug**
  ([#19](https://github.com/Dhanbad94/ai-tms-playwright-e2e-tests/issues/19)):
  the edit button opens the modal directly (no longer via an intermediate
  popover link — don't resurrect the old `.popover.in a.manager_edit_org`
  pattern), but the form fields never populate because an AJAX call is firing
  at the literal string `javascript:void(0);`. `ORG-EDIT-001..004` are
  correctly red until this ships a fix.

## CI / environments

- `ENV` env var selects `staging | preproduction | production` everywhere
  (config, fixtures, auth). Credentials follow `<PREFIX>_<ROLE>_EMAIL/PASSWORD`.
- `./run-tests -e <env> -t <tag> --bc` is the CLI wrapper around
  `npx playwright test`; `package.json` also has `test:smoke`, `test:staging`,
  etc. for common combinations.
- GitHub Actions: `playwright.yml` (push/PR), `scheduled-staging.yml` (full
  suite), `scheduled-preprod.yml` / `scheduled-production.yml` (**`@prod`
  only — read-only**), `scheduled-full.yml` (weekly, chromium-only). Every
  workflow publishes a custom dashboard (`helpers/generate-report.ts`) and a
  Slack summary (`helpers/notify-slack.ts` or an inline rich block) with a
  "View Report Results" CTA — see `docs/slack-report.md`.
- **Never point any of this at production with a mutating test.** The prod/
  preprod scheduled workflows enforce `--grep @prod`; don't bypass that when
  running manually against those URLs.

## Git / PR workflow

- Work on a feature/fix branch, never commit straight to `main`.
- Commit messages: imperative summary line, body explaining *why*, ending with
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` when AI-assisted.
- Before pushing: `npx tsc --noEmit` must be clean, and any test you
  touched/added should be run against staging (not just type-checked) with
  evidence pasted into the PR description.

## Open gaps (fill in as these become available)

- `{{APP_REPO}}` is not available to automation yet — `app-map.yaml`'s
  `app_code_path` fields are all `unknown`. Diff-based impact analysis can't
  run until this exists.
- No second test organization exists — cross-org data-leak checks aren't
  automatable yet.
- `settings_driver_app` and `settings_escalations` have page objects but zero
  test coverage — good first targets for new test authoring.
