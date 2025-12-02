/**
 * Static HTML Reporter for Playwright
 * 
 * A custom reporter that generates a static HTML report without JavaScript dependencies,
 * making it compatible with Argo Workflows' Content Security Policy restrictions.
 */

class StaticHtmlReporter {
  constructor(options = {}) {
    // Default options
    this.options = {
      outputFile: './dist/reports/static-report.html',
      pageTitle: 'Playwright Test Results',
      ...options
    };
    
    // Initialize results storage
    this.results = {
      startTime: null,
      endTime: null,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      tests: [],
      errors: []
    };
  }

  // Called when the test run starts
  onBegin(config, suite) {
    this.results.startTime = new Date();
    this.config = config;
    
    // Create directory structure if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const outputDir = path.dirname(this.options.outputFile);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  // Called when a test ends
  onTestEnd(test, result) {
    // Update counters
    if (result.status === 'passed') {
      if (result.retry > 0) {
        this.results.flaky++;
      } else {
        this.results.passed++;
      }
    } else if (result.status === 'failed') {
      this.results.failed++;
    } else if (result.status === 'skipped') {
      this.results.skipped++;
    }
    
    // Store test details
    const testInfo = {
      title: test.title,
      path: test.location.file,
      line: test.location.line,
      column: test.location.column,
      status: result.status,
      duration: result.duration,
      retry: result.retry,
      error: result.error ? {
        message: result.error.message,
        stack: result.error.stack
      } : null,
      attachments: result.attachments || []
    };
    
    this.results.tests.push(testInfo);
  }

  // Called when a test has an error
  onError(error) {
    this.results.errors.push(error);
  }

  // Called when the test run is complete
  async onEnd(result) {
    this.results.endTime = new Date();
    
    // Generate the HTML report
    await this.generateReport();
    
    // Return the result to Playwright
    return result;
  }

  // Generate the static HTML report
  async generateReport() {
    const fs = require('fs');
    
    // Calculate summary statistics
    const totalTests = this.results.passed + this.results.failed + this.results.skipped;
    const duration = this.results.endTime - this.results.startTime;
    const durationFormatted = this.formatDuration(duration);
    
    // Generate HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.options.pageTitle}</title>
  <style>
    /* Base styles */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    /* Header styles */
    header {
      margin-bottom: 30px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    
    h1 {
      margin-top: 0;
      color: #2c3e50;
    }
    
    /* Summary styles */
    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 30px;
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
    }
    
    .summary-item {
      flex: 1;
      min-width: 150px;
      text-align: center;
      padding: 15px;
      border-radius: 5px;
    }
    
    .summary-total {
      background-color: #e9ecef;
    }
    
    .summary-passed {
      background-color: #d4edda;
      color: #155724;
    }
    
    .summary-failed {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .summary-skipped {
      background-color: #fff3cd;
      color: #856404;
    }
    
    .summary-flaky {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    
    /* Test results table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    th {
      background-color: #f8f9fa;
      font-weight: bold;
    }
    
    tr:hover {
      background-color: #f5f5f5;
    }
    
    /* Status colors */
    .passed {
      color: #28a745;
    }
    
    .failed {
      color: #dc3545;
    }
    
    .skipped {
      color: #ffc107;
    }
    
    .flaky {
      color: #17a2b8;
    }
    
    /* Error details */
    .error-details {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-top: 10px;
      white-space: pre-wrap;
      font-family: monospace;
      font-size: 0.9em;
      overflow-x: auto;
    }
    
    .error-message {
      color: #721c24;
      background-color: #f8d7da;
      padding: 10px;
      border-radius: 3px;
      margin-bottom: 10px;
    }
    
    /* Footer */
    footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #6c757d;
      font-size: 0.9em;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .summary {
        flex-direction: column;
        gap: 10px;
      }
      
      table, th, td {
        font-size: 0.9em;
      }
      
      th, td {
        padding: 8px 10px;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>${this.options.pageTitle}</h1>
    <p>Report generated on ${this.results.endTime.toLocaleString()}</p>
  </header>
  
  <section class="summary">
    <div class="summary-item summary-total">
      <h2>Total</h2>
      <p>${totalTests} tests</p>
      <p>Duration: ${durationFormatted}</p>
    </div>
    <div class="summary-item summary-passed">
      <h2>Passed</h2>
      <p>${this.results.passed} tests</p>
      <p>${Math.round((this.results.passed / totalTests) * 100) || 0}%</p>
    </div>
    <div class="summary-item summary-failed">
      <h2>Failed</h2>
      <p>${this.results.failed} tests</p>
      <p>${Math.round((this.results.failed / totalTests) * 100) || 0}%</p>
    </div>
    <div class="summary-item summary-skipped">
      <h2>Skipped</h2>
      <p>${this.results.skipped} tests</p>
      <p>${Math.round((this.results.skipped / totalTests) * 100) || 0}%</p>
    </div>
    ${this.results.flaky > 0 ? `
    <div class="summary-item summary-flaky">
      <h2>Flaky</h2>
      <p>${this.results.flaky} tests</p>
      <p>${Math.round((this.results.flaky / totalTests) * 100) || 0}%</p>
    </div>` : ''}
  </section>
  
  <section class="test-results">
    <h2>Test Results</h2>
    <table>
      <thead>
        <tr>
          <th>Test</th>
          <th>Status</th>
          <th>Duration</th>
          <th>File</th>
        </tr>
      </thead>
      <tbody>
        ${this.results.tests.map(test => `
        <tr>
          <td>${this.escapeHtml(test.title)}</td>
          <td class="${test.status}">${test.status}${test.retry > 0 ? ' (flaky)' : ''}</td>
          <td>${this.formatDuration(test.duration)}</td>
          <td>${this.escapeHtml(test.path)}:${test.line}:${test.column}</td>
        </tr>
        ${test.error ? `
        <tr>
          <td colspan="4">
            <div class="error-details">
              <div class="error-message">${this.escapeHtml(test.error.message)}</div>
              <code>${this.escapeHtml(test.error.stack)}</code>
            </div>
          </td>
        </tr>` : ''}
        `).join('')}
      </tbody>
    </table>
  </section>
  
  ${this.results.errors.length > 0 ? `
  <section class="global-errors">
    <h2>Global Errors</h2>
    ${this.results.errors.map(error => `
    <div class="error-details">
      <div class="error-message">${this.escapeHtml(error.message || String(error))}</div>
      <code>${this.escapeHtml(error.stack || '')}</code>
    </div>
    `).join('')}
  </section>` : ''}
  
  <footer>
    <p>Generated by Static HTML Reporter for Playwright</p>
  </footer>
</body>
</html>`;
    
    // Write the HTML to the output file
    fs.writeFileSync(this.options.outputFile, html);
    
    console.log(`Static HTML report generated at: ${this.options.outputFile}`);
  }
  
  // Helper function to format duration in ms to a readable format
  formatDuration(durationMs) {
    if (durationMs < 1000) {
      return `${durationMs}ms`;
    } else if (durationMs < 60000) {
      return `${(durationMs / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(durationMs / 60000);
      const seconds = ((durationMs % 60000) / 1000).toFixed(2);
      return `${minutes}m ${seconds}s`;
    }
  }
  
  // Helper function to escape HTML special characters
  escapeHtml(text) {
    if (!text) return '';
    
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

module.exports = StaticHtmlReporter;
