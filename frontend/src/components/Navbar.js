/**
 * DrishtiMitra - Navbar Component
 * Fully responsive navigation with desktop links & mobile slide-down drawer
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

  return `
    <header class="site-navbar">
      <div class="navbar-container">
        <!-- Brand Logo & Title -->
        <a href="#/dashboard" class="navbar-brand">
          <div class="navbar-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <circle cx="12" cy="11" r="3"/>
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
                <span>New Inspection</span>
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

        <!-- Right Side Actions & Mobile Toggle -->
        <div class="navbar-actions">
          <a href="#/status" class="health-indicator" title="FastAPI & Database Status: ${healthLabel}">
            <span class="${dotClass}"></span>
            <span>${healthLabel}</span>
          </a>

          ${authState.isAuthenticated ? `
            <div style="display: flex; align-items: center; gap: var(--space-2);">
              <div style="display: flex; align-items: center; gap: var(--space-2); padding: 4px 10px; background: var(--bg-surface-raised); border-radius: var(--radius-full); border: 1px solid var(--border-glass); font-size: var(--text-xs);">
                <span style="color: var(--primary-400);">${icons.user}</span>
                <span style="max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-primary); font-weight: 500;">
                  ${authState.user?.email || 'Officer'}
                </span>
              </div>
              <button type="button" id="btn-logout" class="btn btn-ghost btn-sm" title="Sign Out">
                ${icons.logOut}
              </button>
            </div>
          ` : `
            <div style="display: flex; align-items: center; gap: var(--space-2);">
              <a href="#/register" class="btn btn-ghost btn-sm">
                Register
              </a>
              <a href="#/login" class="btn btn-primary btn-sm">
                ${icons.user} Sign In
              </a>
            </div>
          `}

          <!-- Hamburger Button for Small Screens -->
          <button type="button" id="btn-mobile-nav-toggle" class="navbar-toggle-btn" aria-label="Toggle navigation menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Drawer -->
      <div id="mobile-nav-drawer" class="mobile-nav-drawer">
        <a href="#/dashboard" class="nav-link ${isDashboardActive ? 'active' : ''}">
          ${icons.fileText}
          <span>Inspector Dashboard & History</span>
        </a>
        <a href="#/scan" class="nav-link ${isScanActive ? 'active' : ''}">
          ${icons.camera}
          <span>New Inspection</span>
        </a>
        ${currentInspId ? `
          <a href="#/inspections/${currentInspId}/review" class="nav-link ${isReviewActive ? 'active' : ''}">
            ${icons.eye}
            <span>Verification Panel</span>
          </a>
          <a href="#/inspections/${currentInspId}/report" class="nav-link ${isReportActive ? 'active' : ''}">
            ${icons.shieldCheck}
            <span>Audit Report</span>
          </a>
        ` : ''}
        <a href="#/catalogue" class="nav-link ${isCatalogueActive ? 'active' : ''}">
          ${icons.search}
          <span>Reference Benchmark Catalogue</span>
        </a>
        <a href="#/status" class="nav-link ${isStatusActive ? 'active' : ''}">
          ${icons.database}
          <span>System Diagnostics & Health</span>
        </a>
        <div style="border-top: 1px solid var(--border-glass); margin-top: var(--space-2); padding-top: var(--space-2);">
          ${authState.isAuthenticated ? `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) 0;">
              <span style="font-size: var(--text-xs); color: var(--text-muted);">Signed in as: ${authState.user?.email || 'Officer'}</span>
              <button type="button" id="btn-mobile-logout" class="btn btn-danger btn-sm">
                ${icons.logOut} Sign Out
              </button>
            </div>
          ` : `
            <div style="display: flex; gap: var(--space-2);">
              <a href="#/register" class="btn btn-secondary btn-sm" style="flex: 1;">Register</a>
              <a href="#/login" class="btn btn-primary btn-sm" style="flex: 1;">Sign In</a>
            </div>
          `}
        </div>
      </div>
    </header>
  `;
}
