#!/usr/bin/env npx tsx
/**
 * Slack Notifier — posts the custom Test Dashboard summary to Slack with a
 * "View Report Results" CTA button that opens the full HTML dashboard.
 *
 * Reads report-summary.json (produced by helpers/generate-report.ts — the single
 * source of truth) and builds a Block Kit message that mirrors the dashboard:
 * a coloured header, the metric cards as fields, and the CTA.
 *
 * Environment:
 *   SLACK_WEBHOOK_URL  Incoming-webhook URL. If unset, runs in DRY-RUN: the
 *                      payload is written to slack-payload.json and printed.
 *   REPORT_URL         Public URL of the published dashboard-report.html (e.g.
 *                      the GitHub Pages URL). Used for the "View Report Results"
 *                      button. Falls back to RUN_URL when not set.
 *   RUN_URL            CI run URL (used for a secondary "CI Run" button, and as
 *                      the CTA target when REPORT_URL is absent).
 *   REPORT_TITLE       Branding for the header (default "TMS Rider").
 *
 * Usage:
 *   SLACK_WEBHOOK_URL=... REPORT_URL=... npx tsx helpers/notify-slack.ts
 *   # or:  npm run notify:slack
 */

import * as fs from "fs";
import * as path from "path";

interface Summary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number; // passed on retry
  retried: number;
  passRate: number;
  duration: string;
  environment: string;
  runDate: string;
}

const root = path.resolve(__dirname, "..");
const summaryPath = path.join(root, "report-summary.json");

if (!fs.existsSync(summaryPath)) {
  console.error(
    "❌ report-summary.json not found. Run `npm run report:dashboard` first."
  );
  process.exit(1);
}

const s: Summary = JSON.parse(fs.readFileSync(summaryPath, "utf-8"));

const title = process.env.REPORT_TITLE || "TMS Rider";
const reportUrl = process.env.REPORT_URL || "";
const runUrl = process.env.RUN_URL || "";
// The CTA needs a real http(s) URL; prefer the published report, fall back to CI.
const ctaUrl = reportUrl || runUrl;

// ── Outcome → header text + Slack attachment colour ──────────────────────────
let emoji = "✅";
let headline = `${title} — Tests Passed`;
let color = "#0d9e0d"; // green
let actionLine = "";

if (s.failed > 0) {
  emoji = "❌";
  headline = `${title} — Tests Failed`;
  color = "#d93025"; // red
  actionLine = `*:rotating_light: Action required:* ${s.failed} test${
    s.failed === 1 ? "" : "s"
  } failed — review the report before release.`;
} else if (s.flaky > 0) {
  emoji = "⚠️";
  headline = `${title} — Passed (with flakes)`;
  color = "#f9a825"; // amber
  actionLine = `*:warning:* ${s.flaky} test${
    s.flaky === 1 ? "" : "s"
  } passed only on retry — worth a look.`;
}

const field = (label: string, value: string | number) => ({
  type: "mrkdwn",
  text: `*${label}:*\n${value}`,
});

// ── Block Kit message ────────────────────────────────────────────────────────
const blocks: any[] = [
  {
    type: "header",
    text: { type: "plain_text", text: `${emoji} ${headline}`, emoji: true },
  },
  {
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `*Environment:* ${s.environment}  |  *Run:* ${s.runDate}  |  *Duration:* ${s.duration}`,
      },
    ],
  },
  {
    type: "section",
    fields: [
      field("Total", s.total),
      field("Pass Rate", `${s.passRate}%`),
      field("Passed", `:large_green_circle: ${s.passed}`),
      field("Failed", `:red_circle: ${s.failed}`),
      field("Skipped", `:white_circle: ${s.skipped}`),
      field("Passed on Retry", `:large_yellow_circle: ${s.flaky}`),
      field("Retried", `:arrows_counterclockwise: ${s.retried}`),
      field("Duration", s.duration),
    ],
  },
];

if (actionLine) {
  blocks.push({ type: "section", text: { type: "mrkdwn", text: actionLine } });
}

// "View Report Results" CTA — only when we have a real URL (Slack rejects empty).
const actionElements: any[] = [];
if (ctaUrl) {
  actionElements.push({
    type: "button",
    text: { type: "plain_text", text: "📊 View Report Results", emoji: true },
    url: ctaUrl,
    style: s.failed > 0 ? "danger" : "primary",
  });
}
if (runUrl && reportUrl) {
  // Keep a secondary link to the CI run when both URLs are distinct.
  actionElements.push({
    type: "button",
    text: { type: "plain_text", text: "CI Run", emoji: true },
    url: runUrl,
  });
}
if (actionElements.length) {
  blocks.push({ type: "actions", elements: actionElements });
} else {
  console.warn(
    "⚠️  Neither REPORT_URL nor RUN_URL set — the 'View Report Results' button is omitted."
  );
}

const payload = {
  // Plain-text fallback shown in notifications / unfurled previews.
  text: `${emoji} ${headline} — ${s.passed}/${s.total} passed (${s.passRate}%) on ${s.environment}`,
  attachments: [{ color, blocks }],
};

// ── Send (or dry-run) ────────────────────────────────────────────────────────
async function main() {
  const webhook = process.env.SLACK_WEBHOOK_URL;

  if (!webhook) {
    const out = path.join(root, "slack-payload.json");
    fs.writeFileSync(out, JSON.stringify(payload, null, 2));
    console.log(
      `ℹ️  SLACK_WEBHOOK_URL not set — DRY RUN. Payload written to ${out}\n` +
        `   CTA → ${ctaUrl || "(none)"}`
    );
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`❌ Slack responded ${res.status}: ${body}`);
    process.exit(1);
  }
  console.log(`✅ Slack notification sent (CTA → ${ctaUrl || "none"}).`);
}

main().catch((err) => {
  console.error("❌ Failed to send Slack notification:", err);
  process.exit(1);
});
