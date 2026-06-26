# Slack Test Report + "View Report Results" CTA

Posts the custom **Test Dashboard** summary to Slack with a **View Report Results**
button that opens the full HTML dashboard.

## Pieces

| File | Role |
|---|---|
| [`helpers/generate-report.ts`](../helpers/generate-report.ts) | Reads `test-results.json` → writes `dashboard-report.html` (the dashboard) + `report-summary.json` (metrics, the single source of truth). |
| [`helpers/notify-slack.ts`](../helpers/notify-slack.ts) | Reads `report-summary.json` → posts a Block Kit message with the metrics + the **View Report Results** CTA. |

## Local usage

```bash
npm run report:dashboard   # build dashboard-report.html + report-summary.json
npm run notify:slack       # post to Slack (DRY-RUN prints the payload if no webhook)
npm run report:notify      # both, in order
```

Environment variables:

| Var | Purpose |
|---|---|
| `SLACK_WEBHOOK_URL` | Incoming-webhook URL. **Unset → dry-run** (writes `slack-payload.json`, prints it). |
| `REPORT_URL` | Public URL of the published `dashboard-report.html` (the CTA target). |
| `RUN_URL` | CI run URL. Used as the CTA fallback when `REPORT_URL` is unset, and as a secondary "CI Run" button. |
| `REPORT_TITLE` | Branding for the dashboard header + Slack header (default `TMS Rider`). |

The CTA degrades gracefully: `REPORT_URL` → else `RUN_URL` → else the button is omitted (with a warning).

## CI wiring

The CTA is live in **all five** workflows (`playwright.yml` + the four
`scheduled-*`). Each run: builds the dashboard → **publishes it to a per-run
`gh-pages` folder** → posts to Slack with a **View Report Results** button that
opens *that run's* rendered report.

```
generate-report.ts
 → Stage:   dashboard-report.html → public/index.html + public/dashboard-report.html (+ playwright-report/ for drill-down)
 → Publish: peaceiris/actions-gh-pages@v4   publish_dir: ./public   destination_dir: ${{ github.run_id }}   keep_files: true
 → Resolve: report_url = https://<owner>.github.io/<repo>/<run_id>/dashboard-report.html   (else → Actions run)
 → Notify:  Slack card, "View Report Results" → report_url
```

Why `peaceiris/actions-gh-pages` (and not `actions/deploy-pages`):
- **Per-run permanent URLs** (`destination_dir: <run_id>` + `keep_files: true`) — every message links to its own run, no "latest-only" overwrite.
- **No `github-pages` environment** — it pushes to a `gh-pages` branch with just `contents: write` + `GITHUB_TOKEN`, so there's no environment linter error.

| Workflow | Slack body |
|---|---|
| `playwright.yml`, `scheduled-preprod/staging/production` | self-contained **inline curl**, rich 10-field card |
| `scheduled-full.yml` | `helpers/notify-slack.ts` (multi-browser; reads chromium's `report-summary.json`) |

Both render the same metrics + the per-run **View Report Results** CTA.

### One-time setup
**Settings → Pages → Source: Deploy from a branch → `gh-pages` / `/ (root)`.**
The `peaceiris` action creates/pushes the `gh-pages` branch on the first run.
Until Pages is enabled the CTA falls back to the Actions run page (never
dead-links). If your org restricts Actions, allowlist `peaceiris/actions-gh-pages`.

`helpers/notify-slack.ts` is retained for local `npm run notify:slack` dry-runs.
