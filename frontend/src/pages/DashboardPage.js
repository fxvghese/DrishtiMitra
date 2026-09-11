/**
 * DrishtiMitra - Inspector Operational Dashboard & History
 * Visual Identity: Green & White Mobile-First Portal
 * Inspired by reference design:
 * 1. Hello, Inspector 👋 + Good Morning! + Notifications & Avatar
 * 2. Hero Card: Scan. Check. Comply. + Scanner graphic with corner brackets
 * 3. Primary Actions: Scan Product (Camera) & Upload Image (Gallery)
 * 4. 4-Column Real Statistics: Total, Compliant, Non-Compliant, Needs Review
 * 5. Recent Scans with soft status pills & drill-down to Inspection Details
 * 6. "Powered by AI + OCR + Compliance Rules" Trust Banner
 * 7. History mode with search & filter chips
 */

import { renderButton } from '../components/Button.js';
import { renderStatusBadge } from '../components/StatusBadge.js';
import { renderEmptyState } from '../components/EmptyState.js';
import { icons } from '../assets/icons.js';
import { historyService } from '../services/historyService.js';
import { authContext } from '../context/AuthContext.js';
import { router } from '../utils/router.js';
import { formatDate } from '../utils/formatters.js';

let dashboardFilterState = {
  query: '',
  status: 'ALL',
  showAllHistory: false,
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning!';
  if (hour < 17) return 'Good Afternoon!';
  return 'Good Evening!';
}

export function renderDashboardPage() {
  const authState = authContext.getState();
  const allInspections = historyService.getAll();
  const filtered = historyService.search(dashboardFilterState);

  // Compute actual backend metrics (no fake hardcoded numbers!)
  const totalCount = allInspections.length;
  const compliantCount = allInspections.filter(i => 
    (i.inspectorVerdict === 'COMPLIANT' || i.overallStatus === 'COMPLIANT')
  ).length;
  const issuesCount = allInspections.filter(i => 
    (i.inspectorVerdict === 'POTENTIAL_NON_COMPLIANCE' || i.overallStatus === 'NON_COMPLIANT')
  ).length;
  const reviewCount = allInspections.filter(i => 
    (i.inspectorVerdict === 'INSUFFICIENT_EVIDENCE' || i.overallStatus === 'REVIEW' || i.overallStatus === 'INSUFFICIENT_EVIDENCE')
  ).length;

  const officerName = authState.user?.email ? authState.user.email.split('@')[0] : 'Inspector';
  const officerInitials = (authState.user?.email || 'IN').substring(0, 2).toUpperCase();

  // Recent 5 inspections for dashboard feed
  const recentInspections = allInspections.slice(0, 5);
  const isHistoryView = window.location.hash.includes('/history') || dashboardFilterState.showAllHistory;

  return `
    <div class="dashboard-page-container animate-fade-in" style="max-width: 680px; margin: 0 auto;">
      
      <!-- 1. Top Inspector Header (Reference-Matched) -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); padding: var(--space-1) var(--space-1);">
        <div>
          <h1 style="font-size: clamp(1.3rem, 4.5vw, 1.65rem); font-weight: 800; color: var(--text-primary); margin: 0; line-height: 1.2;">
            Hello, Inspector 👋
          </h1>
          <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px; font-weight: 500;">
            ${getGreeting()}
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: var(--space-2);">
          <a href="#/status" class="icon-btn-badge" title="Notifications & System Health">
            ${icons.bell}
            <span class="notification-badge-dot"></span>
          </a>
          <a href="#/status" class="officer-avatar" title="Officer: ${officerName}">
            <span>${officerInitials}</span>
          </a>
        </div>
      </div>

      <!-- 2. Hero Card: "Scan. Check. Comply." -->
      <div class="hero-banner-card animate-fade-in">
        <div class="hero-banner-grid">
          <div>
            <h2 class="hero-title">
              Scan. Check.<br />Comply.
            </h2>
            <p class="hero-subtitle">
              Scan or upload a packaged product label and verify its compliance using AI, OCR and applicable rules.
            </p>
            <div class="hero-dots">
              <span class="hero-dot active"></span>
              <span class="hero-dot"></span>
              <span class="hero-dot"></span>
            </div>
          </div>

          <!-- Package Scanning Graphic with Corner Brackets & Subtle Laser -->
          <div class="scanner-graphic-box">
            <span class="scanner-bracket bracket-tl"></span>
            <span class="scanner-bracket bracket-tr"></span>
            <span class="scanner-bracket bracket-bl"></span>
            <span class="scanner-bracket bracket-br"></span>
            <div class="scanner-laser-line"></div>

            <!-- Crisp SVG Packaged Commodities Illustration -->
            <svg width="96" height="80" viewBox="0 0 120 90" fill="none" style="display: block;">
              <!-- Bottle (Oil/Liquid) -->
              <rect x="14" y="24" width="22" height="52" rx="4" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.5"/>
              <rect x="20" y="16" width="10" height="8" rx="2" fill="#EAB308"/>
              <rect x="18" y="40" width="14" height="18" rx="2" fill="#FFFFFF" stroke="#E2E8F0"/>
              <!-- Sugar / Flour Bag -->
              <path d="M42 22 L68 22 L72 76 L38 76 Z" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
              <rect x="44" y="38" width="22" height="14" rx="2" fill="#E2E8F0"/>
              <!-- Salt Canister -->
              <rect x="76" y="28" width="26" height="48" rx="3" fill="#3B82F6" stroke="#2563EB" stroke-width="1.5"/>
              <rect x="76" y="26" width="26" height="6" rx="2" fill="#60A5FA"/>
              <rect x="80" y="44" width="18" height="16" rx="2" fill="#FFFFFF"/>
              <!-- Biscuits Pack horizontally in front -->
              <rect x="26" y="62" width="68" height="18" rx="3" fill="#DC2626" stroke="#991B1B" stroke-width="1.5"/>
              <circle cx="76" cy="71" r="5" fill="#FDE047"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 3. Primary Action Cards Grid (Side by Side) -->
      <div class="action-cards-grid">
        <!-- Scan Product (Camera) -->
        <a href="#/scan" class="action-card" id="btn-action-scan-camera" style="border-left: 3px solid var(--primary-500);">
          <div class="action-card-header">
            <div class="action-icon-circle">
              ${icons.camera}
            </div>
            <div class="action-arrow-btn">
              ${icons.arrowRight}
            </div>
          </div>
          <div class="action-card-content">
            <div class="action-card-title">Scan Product</div>
            <div class="action-card-sub">Use Camera</div>
          </div>
        </a>

        <!-- Upload Image (Gallery) -->
        <a href="#/scan" class="action-card" id="btn-action-upload-gallery">
          <div class="action-card-header">
            <div class="action-icon-circle" style="background: #F1F5F9; color: var(--text-primary);">
              ${icons.gallery}
            </div>
            <div class="action-arrow-btn" style="background: var(--primary-600);">
              ${icons.arrowRight}
            </div>
          </div>
          <div class="action-card-content">
            <div class="action-card-title">Upload Image</div>
            <div class="action-card-sub">Select from Gallery</div>
          </div>
        </a>
      </div>

      <!-- 4. Statistics Row (4 Column Real Counts) -->
      <div class="stats-row-container">
        <!-- Total Scans -->
        <div class="stat-item-col">
          <div class="stat-badge-icon" style="background: var(--color-info-bg); color: var(--color-info-text);">
            ${icons.fileText}
          </div>
          <div class="stat-label-text">Total Scans</div>
          <div class="stat-number-text" style="color: var(--text-primary);">${totalCount}</div>
        </div>

        <!-- Compliant -->
        <div class="stat-item-col">
          <div class="stat-badge-icon" style="background: var(--color-success-bg); color: var(--color-success-text);">
            ${icons.check}
          </div>
          <div class="stat-label-text">Compliant</div>
          <div class="stat-number-text" style="color: var(--primary-600);">${compliantCount}</div>
        </div>

        <!-- Non-Compliant -->
        <div class="stat-item-col">
          <div class="stat-badge-icon" style="background: var(--color-danger-bg); color: var(--color-danger-text);">
            ${icons.xCircle}
          </div>
          <div class="stat-label-text">Non-Compliant</div>
          <div class="stat-number-text" style="color: var(--color-danger);">${issuesCount}</div>
        </div>

        <!-- Needs Review -->
        <div class="stat-item-col">
          <div class="stat-badge-icon" style="background: var(--color-warning-bg); color: var(--color-warning-text);">
            ${icons.clock}
          </div>
          <div class="stat-label-text">Needs Review</div>
          <div class="stat-number-text" style="color: var(--color-warning);">${reviewCount}</div>
        </div>
      </div>

      <!-- 5. Recent Scans or Full History -->
      <div class="recent-scans-wrapper">
        <div class="recent-scans-header">
          <div class="recent-scans-title">
            ${isHistoryView ? `All Inspection Records (${filtered.length})` : 'Recent Scans'}
          </div>
          <button type="button" id="btn-toggle-history-view" class="btn btn-ghost btn-sm view-all-link" style="padding: 2px 6px;">
            ${isHistoryView ? 'Show Recent' : 'View All >'}
          </button>
        </div>

        <!-- Search & Filter Bar if in History Mode -->
        ${isHistoryView ? `
          <div style="margin-bottom: var(--space-4);">
            <div style="position: relative; margin-bottom: var(--space-2);">
              <input
                type="search"
                id="history-search-input"
                class="form-input"
                placeholder="Search product, manufacturer, or inspection ID..."
                value="${dashboardFilterState.query}"
                style="padding-left: 2.2rem; font-size: var(--text-xs);"
              />
              <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">
                ${icons.search}
              </span>
            </div>

            <div style="display: flex; gap: var(--space-1); flex-wrap: wrap;">
              <button type="button" class="btn btn-sm btn-filter-chip ${dashboardFilterState.status === 'ALL' ? 'btn-primary' : 'btn-secondary'}" data-status="ALL" style="font-size: 11px; padding: 4px 10px;">
                All (${totalCount})
              </button>
              <button type="button" class="btn btn-sm btn-filter-chip ${dashboardFilterState.status === 'COMPLIANT' ? 'btn-primary' : 'btn-secondary'}" data-status="COMPLIANT" style="font-size: 11px; padding: 4px 10px;">
                Compliant (${compliantCount})
              </button>
              <button type="button" class="btn btn-sm btn-filter-chip ${dashboardFilterState.status === 'POTENTIAL_NON_COMPLIANCE' ? 'btn-primary' : 'btn-secondary'}" data-status="POTENTIAL_NON_COMPLIANCE" style="font-size: 11px; padding: 4px 10px;">
                Non-Compliant (${issuesCount})
              </button>
              <button type="button" class="btn btn-sm btn-filter-chip ${dashboardFilterState.status === 'INSUFFICIENT_EVIDENCE' ? 'btn-primary' : 'btn-secondary'}" data-status="INSUFFICIENT_EVIDENCE" style="font-size: 11px; padding: 4px 10px;">
                Needs Review (${reviewCount})
              </button>
            </div>
          </div>
        ` : ''}

        <!-- List of Scans -->
        ${(isHistoryView ? filtered : recentInspections).length === 0 ? `
          <div style="padding: var(--space-6) var(--space-2); text-align: center;">
            ${renderEmptyState({
              title: 'No Inspections Found',
              message: dashboardFilterState.query 
                ? `No records matched "${dashboardFilterState.query}".`
                : 'No inspection records saved yet. Start by scanning your first package.',
              icon: icons.camera,
              actionButton: renderButton({
                id: 'btn-empty-start-scan',
                text: 'Scan Product Now',
                variant: 'primary',
                icon: icons.camera,
              }),
            })}
          </div>
        ` : `
          <div class="recent-scans-list">
            ${(isHistoryView ? filtered : recentInspections).map(item => {
              const isCompliant = item.inspectorVerdict === 'COMPLIANT' || item.overallStatus === 'COMPLIANT';
              const isIssue = item.inspectorVerdict === 'POTENTIAL_NON_COMPLIANCE' || item.overallStatus === 'NON_COMPLIANT';
              const statusBadgeClass = isCompliant ? 'badge-compliant' : (isIssue ? 'badge-non-compliant' : 'badge-review');
              const statusLabel = isCompliant ? 'Compliant' : (isIssue ? 'Non-Compliant' : 'Needs Review');
              const statusIcon = isCompliant ? icons.check : (isIssue ? icons.xCircle : icons.clock);

              const dateObj = new Date(item.timestamp || item.savedAt || Date.now());
              const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

              const thumbUrl = item.imageUrl || (item.capturedSurfaces && item.capturedSurfaces[0]?.previewUrl);

              return `
                <a href="#/inspections/${item.inspectionId || item.id}/details" class="recent-scan-row">
                  <div class="scan-row-left">
                    <div class="scan-thumb-box">
                      ${thumbUrl ? `
                        <img src="${thumbUrl}" alt="Product" />
                      ` : `
                        <span style="color: var(--primary-600);">${icons.image}</span>
                      `}
                    </div>
                    <div class="scan-row-info">
                      <div class="scan-row-name">
                        ${item.productName || item.extractedData?.product_name || 'Packaged Commodity'}
                      </div>
                      <div class="scan-row-meta">
                        ${dateStr} • ${timeStr}
                      </div>
                    </div>
                  </div>

                  <div class="scan-row-right">
                    <span class="badge ${statusBadgeClass}">
                      ${statusIcon} ${statusLabel}
                    </span>
                    <span style="color: var(--text-muted); font-size: 14px;">
                      ${icons.chevronRight}
                    </span>
                  </div>
                </a>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- 6. Bottom Trust Banner (Reference-Matched) -->
      <div class="trust-banner-card">
        <div class="trust-banner-text">
          <div class="trust-shield-icon">
            ${icons.shieldCheck}
          </div>
          <div>
            <div class="trust-title">Powered by AI + OCR + Compliance Rules</div>
            <div class="trust-desc">Smart inspection. Accurate verification.</div>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function attachDashboardPageEvents() {
  // Empty state button
  const btnEmpty = document.getElementById('btn-empty-start-scan');
  if (btnEmpty) {
    btnEmpty.addEventListener('click', () => router.navigate('/scan'));
  }

  // Toggle full history / recent view
  const btnToggle = document.getElementById('btn-toggle-history-view');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      dashboardFilterState.showAllHistory = !dashboardFilterState.showAllHistory;
      refreshDashboard();
    });
  }

  // Search input
  const searchInput = document.getElementById('history-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      dashboardFilterState.query = e.target.value;
      refreshDashboard();
    });
  }

  // Filter chips
  document.querySelectorAll('.btn-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      dashboardFilterState.status = btn.dataset.status || 'ALL';
      refreshDashboard();
    });
  });

  function refreshDashboard() {
    const appMain = document.getElementById('app-main');
    if (appMain) {
      appMain.innerHTML = renderDashboardPage();
      attachDashboardPageEvents();
    }
  }
}
