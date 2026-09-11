/**
 * DrishtiMitra - MobileBottomNav Component
 * Mobile-first sticky touch navigation bar matching the visual reference design
 * Tabs: Home | Dashboard | [Scan (Elevated)] | History | Profile
 */

import { icons } from '../assets/icons.js';
import { inspectionContext } from '../context/InspectionContext.js';

export function renderMobileBottomNav(currentPath = '/') {
  const isHomeActive = currentPath === '/' || currentPath === '/dashboard';
  const isAnalyticsActive = currentPath.includes('view=metrics') || currentPath.includes('/catalogue');
  const isScanActive = currentPath === '/scan';
  const isHistoryActive = currentPath.includes('/history');
  const isProfileActive = currentPath.includes('/status') || currentPath.includes('/login');

  return `
    <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div class="bottom-nav-container">
        <!-- Tab 1: Home -->
        <a href="#/dashboard" class="bottom-nav-item ${isHomeActive ? 'active' : ''}" id="nav-item-home">
          <div class="bottom-nav-icon">
            ${icons.home}
          </div>
          <span class="bottom-nav-label">Home</span>
        </a>

        <!-- Tab 2: Analytics / Dashboard -->
        <a href="#/dashboard" class="bottom-nav-item ${isAnalyticsActive ? 'active' : ''}" id="nav-item-analytics">
          <div class="bottom-nav-icon">
            ${icons.barChart}
          </div>
          <span class="bottom-nav-label">Dashboard</span>
        </a>

        <!-- Tab 3: Prominent Elevated Scan Action -->
        <a href="#/scan" class="bottom-nav-item-scan ${isScanActive ? 'active' : ''}" id="nav-item-scan" title="New Package Inspection">
          <div class="scan-button-elevated">
            ${icons.scanBrackets}
          </div>
          <span class="bottom-nav-label">Scan</span>
        </a>

        <!-- Tab 4: History -->
        <a href="#/history" class="bottom-nav-item ${isHistoryActive ? 'active' : ''}" id="nav-item-history">
          <div class="bottom-nav-icon">
            ${icons.clock}
          </div>
          <span class="bottom-nav-label">History</span>
        </a>

        <!-- Tab 5: Profile / Status -->
        <a href="#/status" class="bottom-nav-item ${isProfileActive ? 'active' : ''}" id="nav-item-profile">
          <div class="bottom-nav-icon">
            ${icons.user}
          </div>
          <span class="bottom-nav-label">Profile</span>
        </a>
      </div>
    </nav>
  `;
}
