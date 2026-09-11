/**
 * DrishtiMitra - Navbar Component
 * Responsive navigation bar with green & white theme
 * Features live backend health status, statutory badge, and officer profile menu
 */

import { icons } from '../assets/icons.js';
import { authContext } from '../context/AuthContext.js';
import { inspectionContext } from '../context/InspectionContext.js';

export function renderNavbar(currentPath = '/', healthStatus = 'healthy') {
  const authState = authContext.getState();
  const inspState = inspectionContext.getState();
  const currentInspId = inspState.currentInspection?.id;

  let dotClass = 'health-dot';
  let healthLabel = 'Backend Online';
  if (healthStatus === 'degraded') {
    dotClass = 'health-dot degraded';
    healthLabel = 'Degraded';
  } else if (healthStatus === 'disconnected' || healthStatus === 'error') {
    dotClass = 'health-dot disconnected';
    healthLabel = 'Offline';
  }

  const isDashboardActive = currentPath === '/' || currentPath === '/dashboard' || currentPath.includes('/history');
  const isScanActive = currentPath === '/scan';
  const isReviewActive = currentPath.includes('/review');
  const isReportActive = currentPath.includes('/report');
  const isCatalogueActive = currentPath.includes('/catalogue');
  const isStatusActive = currentPath.includes('/status');

  const officerInitials = (authState.user?.email || 'IN').substring(0, 2).toUpperCase();

  return `
    <header class="site-navbar">
      <div class="navbar-container">
        <!-- Brand Logo & Title -->
        <a href="#/dashboard" class="navbar-brand">
          <div class="navbar-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <div class="brand-text-wrapper">
            <div class="brand-title">
              <span>DrishtiMitra</span>
              <span class="brand-badge">SIH 26034</span>
            </div>
            <div class="brand-subtitle">Legal Metrology Compliance Portal</div>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav>
          <ul class="navbar-nav">
            <li>
              <a href="#/dashboard" class="nav-link ${isDashboardActive ? 'active' : ''}">
                ${icons.fileText}
                <span>Dashboard</span>
              </a>
            </li>

            <li>
              <a href="#/scan" class="nav-link ${isScanActive ? 'active' : ''}">
                ${icons.camera}
                <span>Inspect</span>
              </a>
            </li>

            ${currentInspId ? `
              <li>
                <a href="#/inspections/${currentInspId}/review" class="nav-link ${isReviewActive ? 'active' : ''}">
                  ${icons.eye}
                  <span>Verification</span>
                </a>
              </li>
              <li>
                <a href="#/inspections/${currentInspId}/report" class="nav-link ${isReportActive ? 'active' : ''}">
                  ${icons.shieldCheck}
                  <span>Audit Report</span>
                </a>
              </li>
            ` : ''}

            <li>
              <a href="#/catalogue" class="nav-link ${isCatalogueActive ? 'active' : ''}">
                ${icons.search}
                <span>Catalogue</span>
              </a>
            </li>

            <li>
              <a href="#/status" class="nav-link ${isStatusActive ? 'active' : ''}">
                ${icons.database}
                <span>Status</span>
              </a>
            </li>
          </ul>
        </nav>

        <!-- Right Actions: Health + Profile -->
        <div class="navbar-actions">
          <a href="#/status" class="health-status-badge" title="FastAPI & Database Status: ${healthLabel}">
            <span class="${dotClass}"></span>
            <span>${healthLabel}</span>
          </a>

          ${authState.isAuthenticated ? `
            <div style="display: flex; align-items: center; gap: var(--space-2);">
              <a href="#/status" class="icon-btn-badge" title="Notifications & System Health">
                ${icons.bell}
                <span class="notification-badge-dot"></span>
              </a>
              <a href="#/status" class="officer-avatar" title="Officer: ${authState.user?.email || 'Officer'}">
                <span>${officerInitials}</span>
              </a>
              <button type="button" id="btn-logout" class="btn btn-ghost btn-sm" title="Sign Out" style="padding: 6px;">
                ${icons.logOut}
              </button>
            </div>
          ` : `
            <div style="display: flex; align-items: center; gap: var(--space-2);">
              <a href="#/login" class="btn btn-primary btn-sm">
                ${icons.user} Sign In
              </a>
            </div>
          `}
        </div>
      </div>
    </header>
  `;
}

export function attachNavbarEvents() {
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      authContext.signOut();
      window.location.hash = '#/login';
    });
  }
}
