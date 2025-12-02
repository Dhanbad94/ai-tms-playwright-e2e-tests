/**
 * Static HTML Reporter for Playwright (TypeScript)
 * Minimal typed conversion of the original JS reporter
 */

type TestResult = {
  title: string;
  path: string;
  line?: number;
  column?: number;
  status?: string;
  duration?: number;
  retry?: number;
  error?: { message?: string; stack?: string } | null;
  attachments?: any[];
};

type ReporterResults = {
  startTime: Date | null;
  endTime: Date | null;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  tests: TestResult[];
  errors: any[];
};

export default class StaticHtmlReporter {
  options: { outputFile: string; pageTitle: string };
  results: ReporterResults;
  config: any;

  constructor(options: Partial<{ outputFile: string; pageTitle: string }> = {}) {
    this.options = {
      outputFile: './dist/reports/static-report.html',
      pageTitle: 'Playwright Test Results',
      ...options,
    };

    this.results = {
      startTime: null,
      endTime: null,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      tests: [],
      errors: [],
    };
  }

  onBegin(_config: any, _suite: any) {
    this.results.startTime = new Date();
    this.config = _config;
    const fs = require('fs');
    const path = require('path');
    const outputDir = path.dirname(this.options.outputFile);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  }

  onTestEnd(test: any, result: any) {
    if (result.status === 'passed') {
      if (result.retry > 0) this.results.flaky++;
      else this.results.passed++;
    } else if (result.status === 'failed') this.results.failed++;
    else if (result.status === 'skipped') this.results.skipped++;

    const testInfo: TestResult = {
      title: test.title,
      path: test.location?.file,
      line: test.location?.line,
      column: test.location?.column,
      status: result.status,
      duration: result.duration,
      retry: result.retry,
      error: result.error ? { message: result.error.message, stack: result.error.stack } : null,
      attachments: result.attachments || [],
    };

    this.results.tests.push(testInfo);
  }

  onError(error: any) {
    this.results.errors.push(error);
  }

  async onEnd(_result: any) {
    this.results.endTime = new Date();
    await this.generateReport();
    return _result;
  }

  async generateReport() {
    const fs = require('fs');

    const totalTests = this.results.passed + this.results.failed + this.results.skipped;
    const duration = (this.results.endTime?.getTime() || 0) - (this.results.startTime?.getTime() || 0);
    const durationFormatted = this.formatDuration(duration);

    // For brevity we produce a simple report — match the original behaviour where practical
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${this.options.pageTitle}</title></head><body><h1>${this.options.pageTitle}</h1><p>Generated: ${this.results.endTime?.toLocaleString()}</p><p>Ran: ${totalTests} tests</p></body></html>`;

    fs.writeFileSync(this.options.outputFile, html, 'utf8');
    console.log(`Static HTML report generated at: ${this.options.outputFile}`);
  }

  formatDuration(durationMs: number): string {
    if (!durationMs) return '0ms';
    if (durationMs < 1000) return `${durationMs}ms`;
    if (durationMs < 60000) return `${(durationMs / 1000).toFixed(2)}s`;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(2);
    return `${minutes}m ${seconds}s`;
  }

  escapeHtml(text?: string) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
