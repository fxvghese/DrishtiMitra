/**
 * DrishtiMitra - Dashboard & Inspection History Page
 * Core Flow: LOGIN → DASHBOARD → NEW INSPECTION
 * Displays active metrics, search/filtering, and comprehensive inspection audit history
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
};

export function renderDashboardPage() {
  const authState = authContext.getState();
  const allInspections = historyService.getAll();
  const filtered = historyService.search(dashboardFilterState);

  // Compute metrics
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

  return `
    <div class="dashboard-page-container animate-fade-in" style="max-width: 980px; margin: 0 auto;">
      <!-- Welcome Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-6);">
        <div>
          <div style="display: inline-flex; align-items: center; gap: var(--space-2); background: rgba(59,130,246,0.12); color: var(--primary-400); padding: 4px 12px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; border: 1px solid rgba(59,130,246,0.25); margin-bottom: var(--space-2);">
            ${icons.shieldCheck} Legal Metrology Enforcement Portal
          </div>
          <h1 style="font-size: var(--text-3xl); font-weight: 800; color: var(--text-primary); letter-spacing: -0.025em;">
            Inspector Operational Dashboard
          </h1>
          <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px;">
            Officer: <strong style="color: var(--text-primary);">${authState.user?.email || 'Authorized Officer'}</strong> • Department of Consumer Affairs
          </p>
        </div>

        <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
          ${renderButton({
            id: 'btn-dashboard-new-scan',
            text: 'New Inspection',
            variant: 'primary',
            size: 'lg',
            icon: icons.camera,
          })}
        </div>
      </div>

      <!-- Quick KPI Stats Grid -->
      <div class="stats-grid" style="margin-bottom: var(--space-6);">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(59,130,246,0.15); color: var(--primary-400);">
            ${icons.fileText}
          </div>
          <div>
            <div class="stat-value">${totalCount}</div>
            <div class="stat-label">Total Inspected</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(16,185,129,0.15); color: var(--color-success-text);">
            ${icons.check}
          </div>
          <div>
            <div class="stat-value" style="color: var(--color-success-text);">${compliantCount}</div>
            <div class="stat-label">Verified Compliant</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(239,68,68,0.15); color: var(--color-danger-text);">
            ${icons.alertTriangle}
          </div>
          <div>
            <div class="stat-value" style="color: var(--color-danger-text);">${issuesCount}</div>
            <div class="stat-label">Potential Issues</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(245,158,11,0.15); color: var(--color-warning-text);">
            ${icons.eye}
          </div>
          <div>
            <div class="stat-value" style="color: var(--color-warning-text);">${reviewCount}</div>
            <div class="stat-label">Insufficient Evidence</div>
          </div>
        </div>
      </div>

      <!-- Search & Filter Bar Card -->
      <div class="card card-glass" style="margin-bottom: var(--space-6);">
        <div style="display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: center;">
          <div style="flex: 1; min-width: min(100%, 240px); position: relative;">
            <input
              type="search"
              id="history-search-input"
              class="form-input"
              placeholder="Search by Product Name, Manufacturer, or Inspection ID..."
              value="${dashboardFilterState.query}"
              style="padding-left: 2.25rem;"
            />
            <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">
              ${icons.search}
            </span>
          </div>

          <!-- Filter Pills -->
          <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
            <button
              type="button"
              class="btn btn-sm btn-filter-chip ${dashboardFilterState.status === 'ALL' ? 'btn-primary' : 'btn-secondary'}"
              data-status="ALL"
              style="font-size: 11px; padding: 6px 12px;"
            >
              All (${totalCount})
            </button>
            <button
              type="button"
              class="btn btn-sm btn-filter-chip ${dashboardFilterState.status === 'COMPLIANT' ? 'btn-success' : 'btn-secondary'}"
              data-status="COMPLIANT"
              style="font-size: 11px; padding: 6px 12px;"
            >
              Compliant (${compliantCount})
            </button>
            <button
              type="button"
              class="btn btn-sm btn-filter-chip ${dashboardFilterState.status === 'POTENTIAL_NON_COMPLIANCE' ? 'btn-danger' : 'btn-secondary'}"
              data-status="POTENTIAL_NON_COMPLIANCE"
              style="font-size: 11px; padding: 6px 12px;"
            >
              Issues (${issuesCount})
            </button>
            <button
              type="button"
              class="btn btn-sm btn-filter-chip ${dashboardFilterState.status === 'INSUFFICIENT_EVIDENCE' ? 'btn-warning' : 'btn-secondary'}"
              data-status="INSUFFICIENT_EVIDENCE"
              style="font-size: 11px; padding: 6px 12px;"
            >
              Insufficient (${reviewCount})
            </button>
          </div>
        </div>
      </div>

      <!-- Inspection History List -->
      <div style="margin-bottom: var(--space-6);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
          <h3 style="font-size: var(--text-lg); font-weight: 800; color: var(--text-primary); margin: 0;">
            Statutory Inspection Records (${filtered.length})
          </h3>
          <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
            Official Audit Trail
          </span>
        </div>

        ${filtered.length === 0 ? `
          <div class="card card-glass" style="padding: var(--space-8) var(--space-4);">
            ${renderEmptyState({
              title: 'No Matching Inspections',
              message: dashboardFilterState.query 
                ? `No inspection records matched "${dashboardFilterState.query}". Try a different product name or clear filters.`
                : 'No inspection records currently on file. Click below to start your first statutory inspection.',
              icon: icons.search,
              actionButton: renderButton({
                id: 'btn-empty-new-scan',
                text: 'Start New Inspection',
                variant: 'primary',
                icon: icons.camera,
              }),
            })}
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${filtered.map(item => {
              const isCompliant = item.inspectorVerdict === 'COMPLIANT' || item.overallStatus === 'COMPLIANT';
              const isIssue = item.inspectorVerdict === 'POTENTIAL_NON_COMPLIANCE' || item.overallStatus === 'NON_COMPLIANT';
              const statusBadgeClass = isCompliant ? 'badge-compliant' : (isIssue ? 'badge-non-compliant' : 'badge-review');
              const statusLabel = isCompliant ? 'Compliant' : (isIssue ? 'Potential Issue' : 'Insufficient Evidence');

              return `
                <div class="card card-glass animate-fade-in" style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); border-radius: var(--radius-xl); transition: border-color var(--transition-fast);">
                  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2);">
                    <div style="display: flex; align-items: center; gap: var(--space-2);">
                      <span style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--primary-400); font-weight: 700; background: rgba(59,130,246,0.1); padding: 2px 8px; border-radius: var(--radius-sm); border: 1px solid rgba(59,130,246,0.2);">
                        ${item.inspectionId}
                      </span>
                      <span style="font-size: 11px; color: var(--text-muted);">
                        ${formatDate(item.timestamp || item.savedAt)}
                      </span>
                    </div>

                    <div style="display: flex; align-items: center; gap: var(--space-2);">
                      <span class="badge ${statusBadgeClass}">
                        ${statusLabel}
                      </span>
                    </div>
                  </div>

                  <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
                    <div>
                      <h4 style="font-size: var(--text-base); font-weight: 800; color: var(--text-primary); margin: 0;">
                        ${item.productName || 'Package Commodity'}
                      </h4>
                      <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px;">
                        ${item.manufacturer || 'Declared Manufacturer'}
                      </p>

                      <!-- Captured Surfaces Badges -->
                      ${(item.capturedSurfaces || []).length > 0 ? `
                        <div style="display: flex; gap: var(--space-1); margin-top: var(--space-2); flex-wrap: wrap;">
                          ${item.capturedSurfaces.map(s => `
                            <span style="font-size: 9px; font-family: var(--font-mono); padding: 1px 6px; border-radius: 4px; background: var(--bg-surface-raised); border: 1px solid var(--border-glass); color: var(--text-muted);">
                              ${s.surface || s}
                            </span>
                          `).join('')}
                        </div>
                      ` : ''}
                    </div>

                    <div style="display: flex; gap: var(--space-2); align-items: center;">
                      <a href="#/inspections/${item.inspectionId}/details" class="btn btn-secondary btn-sm" style="font-weight: 600;">
                        ${icons.eye} View Details
                      </a>
                    </div>
                  </div>

                  ${item.inspectorComment ? `
                    <div style="font-size: var(--text-xs); color: var(--text-muted); background: var(--bg-surface-raised); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); border-left: 2px solid var(--primary-500); word-break: break-word;">
                      <strong>Officer Note:</strong> ${item.inspectorComment}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

export function attachDashboardPageEvents() {
  const btnNew = document.getElementById('btn-dashboard-new-scan');
  if (btnNew) {
    btnNew.addEventListener('click', () => router.navigate('/scan'));
  }

  const btnEmpty = document.getElementById('btn-empty-new-scan');
  if (btnEmpty) {
    btnEmpty.addEventListener('click', () => router.navigate('/scan'));
  }

  // Search input handler
  const searchInput = document.getElementById('history-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      dashboardFilterState.query = e.target.value;
      refreshDashboard();
    });
  }

  // Filter chip buttons
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
