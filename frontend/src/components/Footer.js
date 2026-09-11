/**
 * DrishtiMitra - Footer Component
 */

export function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-container">
        <div>
          <strong>DrishtiMitra</strong> — Ministry of Consumer Affairs, Food & Public Distribution
          <div style="margin-top: 2px; color: var(--text-muted);">
            Compliance Verification Platform under Legal Metrology (Packaged Commodities) Rules, 2011
          </div>
        </div>
        <div class="footer-links">
          <a href="#/scan">Inspection Intake</a>
          <a href="#/catalogue">Benchmark Database</a>
          <a href="#/status">System Diagnostics</a>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">FastAPI Docs</a>
        </div>
      </div>
    </footer>
  `;
}
