#!/usr/bin/env npx tsx
/**
 * Custom Test Report Generator
 *
 * Reads Playwright's test-results.json and produces:
 *   1. dashboard-report.html  - styled HTML dashboard (Total / Passed / Failed /
 *      Skipped / Passed-on-retry (flaky) / Retried / Pass Rate / Duration + per-file table)
 *   2. report-summary.json    - the computed metrics (single source of truth for CI/Slack)
 *   3. A console summary line
 *   4. (CI) a markdown summary appended to $GITHUB_STEP_SUMMARY when that env var is set
 *
 * Usage:
 *   npx tsx helpers/generate-report.ts
 *   # or:  npm run report:dashboard
 */

import * as fs from "fs";
import * as path from "path";

interface TestResult {
  status: string;
  duration: number;
  retry: number;
  error?: { message?: string };
}
interface TestCase {
  status: string;
  results: TestResult[];
}
interface Spec {
  title: string;
  tests: TestCase[];
}
interface Suite {
  title?: string;
  file?: string;
  suites?: Suite[];
  specs?: Spec[];
}
interface PlaywrightReport {
  stats: {
    expected: number;
    unexpected: number;
    skipped: number;
    flaky: number;
    duration: number;
    startTime: string;
  };
  suites: Suite[];
}

type RowStatus = "passed" | "failed" | "skipped" | "flaky";
interface TestRow {
  file: string;
  name: string;
  status: RowStatus;
  duration: number;
  retries: number;
  error?: string;
}

/** Walk the full suite tree (any nesting depth) and collect one row per test, grouped by file. */
function collectTests(suite: Suite, parentFile = ""): TestRow[] {
  const rows: TestRow[] = [];
  const file = suite.file || parentFile;

  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      const totalDuration = test.results?.reduce((s, r) => s + r.duration, 0) || 0;
      const retries = test.results ? test.results.length - 1 : 0;
      const lastResult = test.results?.[test.results.length - 1];

      let status: RowStatus = "passed";
      if (test.status === "skipped") status = "skipped";
      else if (test.status === "unexpected") status = "failed";
      else if (test.status === "flaky") status = "flaky";

      rows.push({
        file: (file || "unknown").replace(/.*\//, ""),
        name: spec.title,
        status,
        duration: totalDuration,
        retries,
        error: status === "failed" ? lastResult?.error?.message?.substring(0, 150) : undefined,
      });
    }
  }
  for (const child of suite.suites || []) {
    rows.push(...collectTests(child, file));
  }
  return rows;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const min = Math.floor(ms / 60000);
  const sec = Math.round((ms % 60000) / 1000);
  return `${min}m ${sec}s`;
}

interface Summary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number; // passed on retry
  retried: number; // tests that ran more than once
  passRate: number;
  durationMs: number;
  duration: string;
  environment: string;
  runDate: string;
}

function computeSummary(report: PlaywrightReport, rows: TestRow[]): Summary {
  const { stats } = report;
  const passed = stats.expected;
  const failed = stats.unexpected;
  const skipped = stats.skipped;
  const flaky = stats.flaky; // failed first, passed on retry
  const total = passed + failed + flaky + skipped;
  const executed = passed + failed + flaky; // excludes skipped
  // Ultimately-passing (incl. flaky which eventually passed) over executed tests.
  const passRate = executed > 0 ? Math.round(((passed + flaky) / executed) * 100) : 0;
  const retried = rows.filter((r) => r.retries > 0).length;

  return {
    total,
    passed,
    failed,
    skipped,
    flaky,
    retried,
    passRate,
    durationMs: stats.duration,
    duration: formatDuration(stats.duration),
    environment: process.env.ENV || "staging",
    runDate: new Date(stats.startTime).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  };
}

function generateHTML(s: Summary, rows: TestRow[]): string {
  const byFile = new Map<string, TestRow[]>();
  for (const row of rows) {
    const key = row.file || "unknown";
    if (!byFile.has(key)) byFile.set(key, []);
    byFile.get(key)!.push(row);
  }

  const icon = (st: string) =>
    st === "passed" ? "✅" : st === "failed" ? "❌" : st === "skipped" ? "⏭️" : st === "flaky" ? "⚠️" : "❓";

  let testRows = "";
  for (const [file, fileRows] of byFile) {
    const p = fileRows.filter((r) => r.status === "passed").length;
    const f = fileRows.filter((r) => r.status === "failed").length;
    const sk = fileRows.filter((r) => r.status === "skipped").length;
    const fl = fileRows.filter((r) => r.status === "flaky").length;
    const dur = fileRows.reduce((acc, r) => acc + r.duration, 0);
    testRows += `
      <tr class="file-header"><td colspan="5"><strong>📄 ${file}</strong>
        <span class="file-stats">${p}P / ${f}F / ${sk}S / ${fl}⚠ — ${formatDuration(dur)}</span></td></tr>`;
    for (const row of fileRows) {
      testRows += `
      <tr class="${row.status}">
        <td>${icon(row.status)}</td>
        <td>${row.name}</td>
        <td><span class="status-cell ${row.status}">${row.status.toUpperCase()}</span></td>
        <td>${formatDuration(row.duration)}</td>
        <td>${row.retries > 0 ? `🔄 ${row.retries}` : "—"}</td>
      </tr>`;
      if (row.error) {
        testRows += `
      <tr class="error-row"><td></td><td colspan="4" class="error-msg">${row.error
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</td></tr>`;
      }
    }
  }

  const rateColor = s.passRate >= 90 ? "#0d9e0d" : s.passRate >= 70 ? "#f9a825" : "#d93025";
  // Brand shared with the Slack notifier (REPORT_TITLE); default matches the
  // "TMS Rider — Test Dashboard" sample.
  const brand = process.env.REPORT_TITLE || "TMS Rider";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${brand} — Test Dashboard</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f7fa;color:#333}
  .header{background:linear-gradient(135deg,#1a73e8,#0d47a1);color:#fff;padding:30px 40px}
  .header h1{font-size:24px;margin-bottom:5px}
  .header .subtitle{opacity:.85;font-size:14px}
  .summary{display:flex;gap:20px;padding:25px 40px;flex-wrap:wrap}
  .card{background:#fff;border-radius:12px;padding:20px 25px;min-width:140px;box-shadow:0 2px 8px rgba(0,0,0,.08);text-align:center}
  .card .number{font-size:36px;font-weight:700}
  .card .label{font-size:12px;text-transform:uppercase;color:#666;margin-top:4px}
  .card.total .number{color:#1a73e8}.card.passed .number{color:#0d9e0d}.card.failed .number{color:#d93025}
  .card.skipped .number{color:#f9a825}.card.flaky .number{color:#e65100}.card.retried .number{color:#ff6d00}
  .card.duration .number{color:#5f6368;font-size:24px}.card.rate .number{color:${rateColor}}
  .progress-bar{height:6px;background:#e0e0e0;border-radius:3px;margin:20px 40px;overflow:hidden}
  .progress-bar .fill{height:100%;background:${rateColor};border-radius:3px}
  table{width:calc(100% - 80px);margin:10px 40px 40px;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
  th{background:#f8f9fa;padding:12px 16px;text-align:left;font-size:12px;text-transform:uppercase;color:#666;border-bottom:2px solid #e0e0e0}
  td{padding:10px 16px;border-bottom:1px solid #f0f0f0;font-size:13px}
  tr.file-header{background:#f0f4ff}.file-stats{float:right;font-size:12px;color:#666;font-weight:400}
  .status-cell{font-weight:600;font-size:11px;border-radius:4px;padding:3px 8px;display:inline-block}
  .status-cell.passed{background:#e6f4ea;color:#137333}.status-cell.failed{background:#fce8e6;color:#c5221f}
  .status-cell.skipped{background:#fef7e0;color:#b06000}.status-cell.flaky{background:#fff3e0;color:#e65100}
  .error-row td{padding:4px 16px 10px}.error-msg{font-family:monospace;font-size:11px;color:#c5221f;background:#fce8e6;padding:6px 10px;border-radius:4px;word-break:break-all}
  .footer{text-align:center;padding:20px;color:#999;font-size:12px}
</style></head>
<body>
  <div class="header">
    <h1>🚐 ${brand} — Test Dashboard</h1>
    <div class="subtitle">Run: ${s.runDate} | Environment: ${s.environment} | Duration: ${s.duration}</div>
  </div>
  <div class="summary">
    <div class="card total"><div class="number">${s.total}</div><div class="label">Total Tests</div></div>
    <div class="card passed"><div class="number">${s.passed}</div><div class="label">Passed</div></div>
    <div class="card failed"><div class="number">${s.failed}</div><div class="label">Failed</div></div>
    <div class="card skipped"><div class="number">${s.skipped}</div><div class="label">Skipped</div></div>
    <div class="card flaky"><div class="number">${s.flaky}</div><div class="label">Passed on Retry</div></div>
    <div class="card retried"><div class="number">${s.retried}</div><div class="label">Retried</div></div>
    <div class="card rate"><div class="number">${s.passRate}%</div><div class="label">Pass Rate</div></div>
    <div class="card duration"><div class="number">${s.duration}</div><div class="label">Duration</div></div>
  </div>
  <div class="progress-bar"><div class="fill" style="width:${s.passRate}%"></div></div>
  <table>
    <thead><tr><th width="30"></th><th>Test Name</th><th width="90">Status</th><th width="80">Duration</th><th width="60">Retry</th></tr></thead>
    <tbody>${testRows}</tbody>
  </table>
  <div class="footer">Generated by TMS E2E Test Framework</div>
</body></html>`;
}

function markdownSummary(s: Summary): string {
  return `## 🚐 TMS E2E Test Report — ${s.environment}

| Metric | Value |
|---|---|
| Total | ${s.total} |
| ✅ Passed | ${s.passed} |
| ❌ Failed | ${s.failed} |
| ⏭️ Skipped | ${s.skipped} |
| ⚠️ Passed on retry | ${s.flaky} |
| 🔄 Retried | ${s.retried} |
| 📊 Pass rate | ${s.passRate}% |
| ⏱️ Duration | ${s.duration} |

_Run: ${s.runDate}_
`;
}

// ---- Main ----
const reportPath = path.resolve(__dirname, "..", "test-results.json");
if (!fs.existsSync(reportPath)) {
  console.error("❌ test-results.json not found. Run the tests first.");
  process.exit(1);
}

const report: PlaywrightReport = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
const rows = report.suites.flatMap((s) => collectTests(s));
const summary = computeSummary(report, rows);

const root = path.resolve(__dirname, "..");
fs.writeFileSync(path.join(root, "dashboard-report.html"), generateHTML(summary, rows));
fs.writeFileSync(path.join(root, "report-summary.json"), JSON.stringify(summary, null, 2));

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdownSummary(summary));
}

console.log(
  `✅ Report generated → dashboard-report.html, report-summary.json\n` +
    `   Total: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed} | ` +
    `Skipped: ${summary.skipped} | Passed on retry: ${summary.flaky} | Retried: ${summary.retried} | ` +
    `Pass rate: ${summary.passRate}% | Duration: ${summary.duration}`
);
