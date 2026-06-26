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

The CTA is live in **every** scheduled workflow. Each run's test job builds the
dashboard (`helpers/generate-report.ts`) and uploads `dashboard-report.html` +
`report-summary.json` as an artifact; the notify job posts to Slack with a
**View Report Results** button pointing at **that run's page** (where the
`dashboard-report.html` artifact lives) — so every message links to its *own*
run, and there is no shared-hosting dependency.

| Workflow | Approach |
|---|---|
| `scheduled-full.yml` | `notify` job runs `helpers/notify-slack.ts` (full Block Kit card); `RUN_URL` → the run. |
| `scheduled-preprod.yml` | existing rich block, button = **View Report Results** → `REPORT_URL` (the run). |
| `scheduled-staging.yml` | same as preprod. |
| `scheduled-production.yml` | same as preprod. |

### Optional: a one-click *rendered* report (GitHub Pages)
The CTA currently opens the run page (one click to the `dashboard-report.html`
artifact). For a directly-rendered link, enable **Settings → Pages → Source:
GitHub Actions**, then add a `publish-report` job that deploys the dashboard and
set `REPORT_URL` to its `page_url`:

```yaml
  publish-report:
    needs: [<test-job>]
    permissions: { pages: write, id-token: write }
    concurrency: { group: pages, cancel-in-progress: false }
    environment: { name: github-pages, url: "${{ steps.deploy.outputs.page_url }}" }
    outputs: { page_url: "${{ steps.deploy.outputs.page_url }}" }
    steps:
      - uses: actions/download-artifact@v4
        with: { name: <dashboard-artifact> }
        continue-on-error: true
      - run: mkdir -p _site && cp dashboard-report.html _site/index.html
      - uses: actions/upload-pages-artifact@v3
        with: { path: _site }
      - id: deploy
        uses: actions/deploy-pages@v4
```

> Notes: the `environment: github-pages` line shows an IDE warning until Pages is
> enabled (the environment is auto-created then) — it's a false positive.
> GitHub Pages serves **one site per repo**, so a Pages CTA opens the *latest*
> run's dashboard, not a per-run copy — which is why the default wiring links to
> the run instead.
