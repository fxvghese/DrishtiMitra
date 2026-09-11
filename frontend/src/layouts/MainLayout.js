/**
 * DrishtiMitra - MainLayout Component
 */

import { renderNavbar } from '../components/Navbar.js';
import { renderFooter } from '../components/Footer.js';
import { renderMobileBottomNav } from '../components/MobileBottomNav.js';

export function renderMainLayout(contentHtml, currentPath = '/', healthStatus = 'healthy') {
  return `
    <div class="main-layout">
      ${renderNavbar(currentPath, healthStatus)}

      <!-- Print Only Official Header -->
      <div class="print-certificate-header">
        <h1 style="font-size: 20pt; font-weight: 800; margin-bottom: 4px;">GOVERNMENT OF INDIA</h1>
        <h2 style="font-size: 14pt; font-weight: 700; color: #333;">DEPARTMENT OF CONSUMER AFFAIRS — LEGAL METROLOGY DIVISION</h2>
        <p style="font-size: 11pt; color: #555; margin-top: 6px;">
          Statutory Inspection Certificate under Legal Metrology (Packaged Commodities) Rules, 2011
        </p>
      </div>

      <main id="app-main" class="content-wrapper">
        <div id="global-alert-container"></div>
        ${contentHtml}
      </main>

      ${renderFooter()}

      <!-- Mobile Touch Navigation Bar (< 768px viewports) -->
      ${renderMobileBottomNav(currentPath)}

      <!-- Global Lightbox Zoom Modal -->
      <div id="lightbox-modal" class="modal-overlay sr-only" role="dialog" aria-modal="true">
        <div style="position: relative; max-width: 90vw; max-height: 90vh;">
          <img id="lightbox-image" src="" alt="Zoomed package photo" style="max-width: 100%; max-height: 85vh; object-fit: contain; border-radius: var(--radius-lg); border: 2px solid var(--border-glass-hover); box-shadow: var(--shadow-xl);" />
          <button type="button" id="lightbox-close-btn" class="btn btn-secondary btn-sm" style="position: absolute; top: 12px; right: 12px; border-radius: 50%; width: 32px; height: 32px; padding: 0;">
            &times;
          </button>
        </div>
      </div>
    </div>
  `;
}
