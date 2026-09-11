/**
 * DrishtiMitra - MobileBottomNav Component
 * Sticky touch-optimized mobile navigation bar for smartphone viewports (320px - 430px)
 * Native web mobile feel with safe-area support and active route highlights
 */

import { icons } from '../assets/icons.js';
import { inspectionContext } from '../context/InspectionContext.js';

export function renderMobileBottomNav(currentPath = '/') {
  const inspState = inspectionContext.getState();
  const currentInspId = inspState.currentInspection?.id;

  const isDashboardActive = currentPath === '/' || currentPath === '/dashboard' || currentPath.includes('/history');
  const isScanActive = currentPath === '/scan';
  const isReviewActive = currentPath.includes('/review');
  const isReportActive = currentPath.includes('/report');
  const isCatalogueActive = currentPath.includes('/catalogue');

  const reviewHref = currentInspId ? `#/inspections/${currentInspId}/review` : '#/scan';
  const reportHref = currentInspId ? `#/inspections/${currentInspId}/report` : '#/scan';

  return `
    <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div class="bottom-nav-container">
        <!-- Tab 1: Dashboard -->
        <a href="#/dashboard" class="bottom-nav-item ${isDashboardActive ? 'active' : ''}" id="nav-item-dashboard">
          <div class="bottom-nav-icon">
            ${icons.fileText}
          </div>
          <span class="bottom-nav-label">Dashboard</span>
        </a>

        <!-- Tab 2: Scan -->
        <a href="#/scan" class="bottom-nav-item ${isScanActive ? 'active' : ''}" id="nav-item-scan">
          <div class="bottom-nav-icon">
            ${icons.camera}
          </div>
          <span class="bottom-nav-label">New Scan</span>
        </a>

        <!-- Tab 3: Verify -->
        <a href="${reviewHref}" class="bottom-nav-item ${isReviewActive ? 'active' : ''} ${!currentInspId && !isReviewActive ? 'disabled-hint' : ''}" id="nav-item-verify" title="${currentInspId ? 'Verification Panel' : 'Scan a package first'}">
          <div class="bottom-nav-icon">
            ${icons.eye}
            ${currentInspId ? `<span class="bottom-nav-badge-dot"></span>` : ''}
          </div>
          <span class="bottom-nav-label">Verify</span>
        </a>

        <!-- Tab 4: Report -->
        <a href="${reportHref}" class="bottom-nav-item ${isReportActive ? 'active' : ''} ${!currentInspId && !isReportActive ? 'disabled-hint' : ''}" id="nav-item-report" title="${currentInspId ? 'Audit Report' : 'Run inspection first'}">
          <div class="bottom-nav-icon">
            ${icons.shieldCheck}
          </div>
          <span class="bottom-nav-label">Report</span>
        </a>

        <!-- Tab 5: Catalogue -->
        <a href="#/catalogue" class="bottom-nav-item ${isCatalogueActive ? 'active' : ''}" id="nav-item-catalogue">
          <div class="bottom-nav-icon">
            ${icons.search}
          </div>
          <span class="bottom-nav-label">Catalogue</span>
        </a>
      </div>
    </nav>
  `;
}
