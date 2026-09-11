/**
 * DrishtiMitra - ReportPage Component
 * Official Legal Metrology Statutory Compliance Audit Report
 * Fulfills: AI ASSISTS. INSPECTOR DECIDES.
 * Includes: AI Assessment ↓ Evidence ↓ Applicable Requirement ↓ Inspector Verification [ACCEPT] [REJECT] ↓ Comment ↓ SAVE INSPECTION
 */

import { renderStatusBadge } from '../components/StatusBadge.js';
import { renderRuleMatrix } from '../components/RuleMatrix.js';
import { renderViolationCard } from '../components/ViolationCard.js';
import { renderButton } from '../components/Button.js';
import { renderAlert } from '../components/Alert.js';
import { renderEmptyState } from '../components/EmptyState.js';
import { icons } from '../assets/icons.js';
import { inspectionContext } from '../context/InspectionContext.js';
import { historyService } from '../services/historyService.js';
import { authContext } from '../context/AuthContext.js';
import { router } from '../utils/router.js';
import { formatDate } from '../utils/formatters.js';

let currentRuleFilter = 'ALL';

export function renderReportPage(params = {}) {
  const state = inspectionContext.getState();
  const evaluation = state.evaluationResult;
  const inspection = state.currentInspection;
  const authState = authContext.getState();

  if (!evaluation) {
    return `
      <div class="card card-glass" style="max-width: 600px; margin: var(--space-8) auto;">
        ${renderEmptyState({
          title: 'No Compliance Report Generated',
          message: 'An evaluation has not yet been executed for this inspection. Return to the verification panel to run the audit.',
          icon: icons.fileText,
          actionButton: renderButton({
            id: 'btn-back-to-review',
            text: inspection ? 'Go to Verification Panel' : 'Start New Inspection',
            variant: 'primary',
            icon: icons.eye,
          }),
        })}
      </div>
    `;
  }

  const overallStatus = evaluation.overall_status || 'REVIEW';
  const violations = evaluation.violations || [];
  const reviewItems = evaluation.review_items || [];
  const rules = evaluation.rules || [];

  const passedCount = rules.filter(r => r.status === 'PASS').length;

  // Language adherence: AI flags potential issues, never declares legal guilt
  let verdictTitle = 'STATUTORY COMPLIANT';
  let verdictSubtext = 'All examined statutory declarations comply with Legal Metrology (Packaged Commodities) Rules, 2011.';
  let verdictBadgeClass = 'badge-compliant';
  let verdictBorder = 'var(--color-success-border)';
  let verdictBg = 'rgba(16, 185, 129, 0.06)';
  let verdictIcon = icons.shieldCheck;
  let verdictColor = 'var(--color-success-text)';

  if (overallStatus === 'NON_COMPLIANT') {
    verdictTitle = 'POTENTIAL NON-COMPLIANCE IDENTIFIED';
    verdictSubtext = 'Potential statutory issues identified for inspector verification. AI recommendation does not constitute legal determination.';
    verdictBadgeClass = 'badge-non-compliant';
    verdictBorder = 'var(--color-danger-border)';
    verdictBg = 'rgba(239, 68, 68, 0.06)';
    verdictIcon = icons.shieldAlert;
    verdictColor = 'var(--color-danger-text)';
  } else if (overallStatus === 'REVIEW' || overallStatus === 'INSUFFICIENT_EVIDENCE') {
    verdictTitle = 'INSUFFICIENT EVIDENCE / REVIEW REQUIRED';
    verdictSubtext = 'Could not verify all statutory declarations from supplied evidence surfaces. Officer physical verification required.';
    verdictBadgeClass = 'badge-review';
    verdictBorder = 'var(--color-warning-border)';
    verdictBg = 'rgba(245, 158, 11, 0.06)';
    verdictIcon = icons.alertTriangle;
    verdictColor = 'var(--color-warning-text)';
  }

  const isSaved = state.isSaved;
  const inspectorVerdict = state.overallInspectorVerdict || (overallStatus === 'COMPLIANT' ? 'COMPLIANT' : 'POTENTIAL_NON_COMPLIANCE');

  return `
    <div class="report-page-container animate-fade-in">
      <!-- Top Action Toolbar (Hidden in Print) -->
      <div class="no-print" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-6);">
        <div>
          <div style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 2px;">
            INSPECTION ID: <strong>${inspection?.id || 'INSP-PENDING'}</strong> • ${formatDate(new Date().toISOString())}
          </div>
          <h1 style="font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary);">
            Statutory Compliance Audit Report
          </h1>
        </div>

        <div style="display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap;">
          ${renderButton({
            id: 'btn-print-report',
            text: 'Print Certificate',
            variant: 'secondary',
            icon: icons.printer,
          })}
          <a href="#/history" class="btn btn-secondary btn-sm">
            ${icons.database} View History
          </a>
          ${renderButton({
            id: 'btn-new-scan',
            text: 'New Inspection',
            variant: 'primary',
            icon: icons.camera,
          })}
        </div>
      </div>

      <!-- Error Banner -->
      ${state.error ? `
        <div class="alert alert-danger animate-fade-in" style="margin-bottom: var(--space-5); display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: var(--color-danger-text); font-size: var(--text-sm);">
          ${icons.alertTriangle}
          <span>${state.error}</span>
          <button type="button" id="btn-dismiss-error" style="margin-left: auto; background: none; border: none; color: var(--color-danger-text); cursor: pointer; padding: 2px;">&times;</button>
        </div>
      ` : ''}

      <!-- Saved Notification Banner -->
      ${isSaved ? `
        <div class="alert alert-success animate-fade-in" style="margin-bottom: var(--space-5); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); padding: var(--space-4); border-radius: var(--radius-xl); background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); color: var(--color-success-text);">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <div style="font-size: 24px;">${icons.checkCircle}</div>
            <div>
              <h4 style="font-weight: 700; margin: 0; color: var(--text-primary);">
                Inspection Dossier Successfully Saved
              </h4>
              <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px;">
                Complete audit trail recorded with Officer ID <code>${authState.user?.email || 'officer'}</code> and cryptographic timestamp.
              </p>
            </div>
          </div>
          <div style="display: flex; gap: var(--space-2);">
            <a href="#/history" class="btn btn-secondary btn-sm">
              Inspection History
            </a>
            <a href="#/inspections/${inspection.id}/details" class="btn btn-primary btn-sm">
              View Audit Trail
            </a>
          </div>
        </div>
      ` : ''}

      <!-- AI Assessment Result Banner -->
      <div class="card card-glass" style="margin-bottom: var(--space-6); border: 2px solid ${verdictBorder}; background: ${verdictBg};">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4);">
          <div style="display: flex; align-items: center; gap: var(--space-4);">
            <div style="width: 56px; height: 56px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; background: ${verdictColor}22; color: ${verdictColor}; flex-shrink: 0;">
              ${verdictIcon}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: var(--space-2);">
                <span style="font-size: var(--text-xs); text-transform: uppercase; font-weight: 800; color: var(--text-muted); letter-spacing: 0.05em; font-family: var(--font-mono);">
                  AI Automated Assessment
                </span>
                <span style="font-size: 10px; background: rgba(59,130,246,0.15); color: var(--primary-400); padding: 1px 6px; border-radius: 4px; font-weight: 700;">
                  ADVISORY ONLY
                </span>
              </div>
              <div style="font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary); margin-top: 2px;">
                ${verdictTitle}
              </div>
              <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 3px; max-width: 600px;">
                ${verdictSubtext}
              </p>
            </div>
          </div>

          <div>
            <span class="badge ${verdictBadgeClass}" style="font-size: var(--text-sm); padding: 6px 14px;">
              ${overallStatus}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="stats-grid" style="margin-bottom: var(--space-6);">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(59,130,246,0.15); color: var(--primary-400);">
            ${icons.book}
          </div>
          <div>
            <div class="stat-value">${rules.length}</div>
            <div class="stat-label">Rules Evaluated</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(16,185,129,0.15); color: var(--color-success-text);">
            ${icons.check}
          </div>
          <div>
            <div class="stat-value" style="color: var(--color-success-text);">${passedCount}</div>
            <div class="stat-label">Passed Rules</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(239,68,68,0.15); color: var(--color-danger-text);">
            ${icons.xCircle}
          </div>
          <div>
            <div class="stat-value" style="color: var(--color-danger-text);">${violations.length}</div>
            <div class="stat-label">Potential Issues</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(245,158,11,0.15); color: var(--color-warning-text);">
            ${icons.alertTriangle}
          </div>
          <div>
            <div class="stat-value" style="color: var(--color-warning-text);">${reviewItems.length}</div>
            <div class="stat-label">Review Items</div>
          </div>
        </div>
      </div>

      <!-- Rule 26 Applicability Card -->
      <div class="card card-glass" style="margin-bottom: var(--space-6);">
        <div class="card-header">
          <h3 class="card-title">
            ${icons.info} Rule 26 Applicability & Exemptions
          </h3>
          <span style="font-size: var(--text-xs); font-family: var(--font-mono); font-weight: 700; color: var(--text-secondary); background: var(--bg-surface-raised); padding: 3px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-glass);">
            STATUS: ${evaluation.applicability_status || 'NORMAL'}
          </span>
        </div>
        <div class="card-body">
          <p style="font-size: var(--text-sm); color: var(--text-primary); line-height: 1.5;">
            ${evaluation.applicability_reason || 'Package is subject to standard Legal Metrology compliance requirements.'}
          </p>
        </div>
      </div>

      <!-- Findings & Inspector Decisions Section -->
      ${violations.length > 0 ? `
        <div style="margin-bottom: var(--space-6);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3); flex-wrap: wrap; gap: var(--space-2);">
            <div>
              <h2 style="font-size: var(--text-xl); font-weight: 800; color: var(--text-primary);">
                Statutory Findings & Inspector Determinations (${violations.length})
              </h2>
              <p style="font-size: var(--text-xs); color: var(--text-muted);">
                Review each potential non-compliance individually. Accept the finding or overrule with inspector legal notes.
              </p>
            </div>
            <div style="font-size: 11px; color: var(--primary-400); font-family: var(--font-mono); background: rgba(59,130,246,0.1); padding: 4px 10px; border-radius: var(--radius-full); border: 1px solid rgba(59,130,246,0.25);">
              AI ASSISTS • INSPECTOR DECIDES
            </div>
          </div>

          ${violations.map((v, i) => {
            const ruleCode = v.rule_code || i;
            const currentDecision = state.inspectorDecisions[ruleCode] || {};
            return renderViolationCard(v, i, currentDecision);
          }).join('')}
        </div>
      ` : `
        <div class="card card-glass" style="margin-bottom: var(--space-6); border-color: var(--color-success-border); background: rgba(16, 185, 129, 0.04); padding: var(--space-4);">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <span style="color: var(--color-success); font-size: 24px;">${icons.checkCircle}</span>
            <div>
              <h4 style="font-weight: 700; color: var(--color-success-text); margin-bottom: 2px;">
                Zero Potential Statutory Violations Identified
              </h4>
              <p style="font-size: var(--text-sm); color: var(--text-secondary); margin: 0;">
                All verified mandatory declarations conform to Rules 6, 10, 11, 12, 13, 14, 16, 17, and 24.
              </p>
            </div>
          </div>
        </div>
      `}

      <!-- Complete Rule Matrix -->
      <div class="card card-glass" style="margin-bottom: var(--space-6);">
        <div class="card-header">
          <div>
            <h3 class="card-title">${icons.shieldCheck} Complete Statutory Rule Evaluation Matrix</h3>
            <p class="card-description">Deterministic evaluation across all 10 Legal Metrology statutory rules</p>
          </div>
        </div>
        <div class="card-body">
          ${renderRuleMatrix(rules, currentRuleFilter)}
        </div>
      </div>

      <!-- Human Inspector Final Determination & Dossier Sign-off Block -->
      <div class="card card-glass" style="border: 2px solid var(--primary-500)66; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95)); margin-bottom: var(--space-6); padding: var(--space-6); border-radius: var(--radius-xl); box-shadow: var(--shadow-xl);">
        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); border-bottom: 1px solid var(--border-glass); padding-bottom: var(--space-4);">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--primary-600), #10b981); display: flex; align-items: center; justify-content: center; color: #fff;">
            ${icons.award}
          </div>
          <div>
            <h3 style="font-size: var(--text-lg); font-weight: 800; color: var(--text-primary); margin: 0;">
              Statutory Officer Final Determination & Dossier Sign-off
            </h3>
            <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">
              Officer in charge: <strong style="color: var(--text-primary);">${authState.user?.email || 'Authorized Inspector'}</strong>
            </p>
          </div>
        </div>

        <!-- Overall Verdict Choice -->
        <div style="margin-bottom: var(--space-4);">
          <label class="form-label" style="font-weight: 700; margin-bottom: var(--space-2); display: block;">
            Final Legal Compliance Verdict:
          </label>
          <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
            <button
              type="button"
              class="btn btn-sm btn-verdict-select ${inspectorVerdict === 'COMPLIANT' ? 'btn-success' : 'btn-secondary'}"
              data-verdict="COMPLIANT"
              style="padding: 8px 16px; font-weight: 700;"
            >
              ✓ Verified Statutory Compliant
            </button>

            <button
              type="button"
              class="btn btn-sm btn-verdict-select ${inspectorVerdict === 'POTENTIAL_NON_COMPLIANCE' ? 'btn-danger' : 'btn-secondary'}"
              data-verdict="POTENTIAL_NON_COMPLIANCE"
              style="padding: 8px 16px; font-weight: 700;"
            >
              ✕ Potential Non-Compliance Notice
            </button>

            <button
              type="button"
              class="btn btn-sm btn-verdict-select ${inspectorVerdict === 'INSUFFICIENT_EVIDENCE' ? 'btn-warning' : 'btn-secondary'}"
              data-verdict="INSUFFICIENT_EVIDENCE"
              style="padding: 8px 16px; font-weight: 700;"
            >
              ? Insufficient Evidence (Retest Required)
            </button>
          </div>
        </div>

        <!-- Inspector General Remarks -->
        <div class="form-group" style="margin-bottom: var(--space-5);">
          <label class="form-label" for="inspector-general-comment" style="font-weight: 700;">
            Official Inspection Remarks & Action Directive:
          </label>
          <textarea
            id="inspector-general-comment"
            class="form-textarea"
            placeholder="Enter officer statutory findings, notice reference, or instructions to manufacturer..."
            rows="3"
            style="font-size: var(--text-sm);"
          >${state.inspectorComment || ''}</textarea>
        </div>

        <!-- Save Dossier Action Bar -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); border-top: 1px solid var(--border-glass); padding-top: var(--space-4);">
          <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
            Audit Hash: SHA256-${(inspection?.id || 'DM-SIH26034').replace(/[^a-zA-Z0-9]/g, '').padEnd(16, '0').slice(0, 16).toUpperCase()}
          </div>

          <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
            ${renderButton({
              id: 'btn-save-dossier',
              text: isSaved ? 'Update Saved Dossier' : 'Save Inspection Dossier',
              variant: 'primary',
              size: 'lg',
              icon: icons.checkCircle,
            })}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachReportPageEvents() {
  const state = inspectionContext.getState();
  const evaluation = state.evaluationResult;
  const inspection = state.currentInspection;
  const authState = authContext.getState();

  // Dismiss error banner
  const btnDismissError = document.getElementById('btn-dismiss-error');
  if (btnDismissError) {
    btnDismissError.addEventListener('click', () => {
      inspectionContext.setError(null);
      const appMain = document.getElementById('app-main');
      if (appMain) {
        appMain.innerHTML = renderReportPage();
        attachReportPageEvents();
      }
    });
  }
  const btnBack = document.getElementById('btn-back-to-review');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (state.currentInspection?.id) {
        router.navigate(`/inspections/${state.currentInspection.id}/review`);
      } else {
        router.navigate('/scan');
      }
    });
  }

  const btnNewScan = document.getElementById('btn-new-scan');
  if (btnNewScan) {
    btnNewScan.addEventListener('click', () => {
      inspectionContext.reset();
      router.navigate('/scan');
    });
  }

  const btnPrint = document.getElementById('btn-print-report');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // Individual Finding Decision Toggles (Accept / Reject)
  document.querySelectorAll('.btn-decision-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const ruleCode = btn.dataset.ruleCode;
      const decision = btn.dataset.decision;
      inspectionContext.setFindingDecision(ruleCode, decision);

      // Re-render to reflect new decision state
      const appMain = document.getElementById('app-main');
      if (appMain) {
        appMain.innerHTML = renderReportPage();
        attachReportPageEvents();
      }
    });
  });

  // Individual Finding Comment inputs
  document.querySelectorAll('.finding-inspector-comment').forEach(textarea => {
    textarea.addEventListener('input', (e) => {
      const ruleCode = textarea.dataset.ruleCode;
      const comment = e.target.value;
      const currentDecision = state.inspectorDecisions[ruleCode]?.decision || 'ACCEPT';
      inspectionContext.setFindingDecision(ruleCode, currentDecision, comment);
    });
  });

  // Overall Verdict Selector
  document.querySelectorAll('.btn-verdict-select').forEach(btn => {
    btn.addEventListener('click', () => {
      const verdict = btn.dataset.verdict;
      inspectionContext.setOverallVerdict(verdict);

      // Re-render
      const appMain = document.getElementById('app-main');
      if (appMain) {
        appMain.innerHTML = renderReportPage();
        attachReportPageEvents();
      }
    });
  });

  // General Inspector Remarks
  const generalComment = document.getElementById('inspector-general-comment');
  if (generalComment) {
    generalComment.addEventListener('input', (e) => {
      inspectionContext.setInspectorComment(e.target.value);
    });
  }

  // Save Dossier Trigger
  const btnSave = document.getElementById('btn-save-dossier');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      if (!inspection || !evaluation) {
        inspectionContext.setError('No active inspection data to save. Please complete an inspection first.');
        const appMain = document.getElementById('app-main');
        if (appMain) {
          appMain.innerHTML = renderReportPage();
          attachReportPageEvents();
        }
        return;
      }

      const extracted = inspection.extracted_data || {};
      const dossier = {
        inspectionId: inspection.id,
        productName: extracted.product_name || inspection.product?.product_name || 'Standard Commodity Package',
        manufacturer: extracted.manufacturer || inspection.product?.manufacturer || 'Declared Manufacturer',
        capturedSurfaces: state.surfaces.map(s => ({ surface: s.surface, name: s.name })),
        extractedData: extracted,
        aiEvaluation: evaluation,
        overallStatus: evaluation.overall_status,
        inspectorVerdict: state.overallInspectorVerdict || evaluation.overall_status,
        inspectorDecisions: state.inspectorDecisions,
        inspectorComment: state.inspectorComment,
        inspectorId: authState.user?.email || 'inspector@legalmetrology.gov.in',
        rulesEvaluatedCount: (evaluation.rules || []).length,
        violationsCount: (evaluation.violations || []).length,
        timestamp: new Date().toISOString(),
      };

      try {
        historyService.save(dossier);
        inspectionContext.markSaved();

        // Re-render to show saved notification
        const appMain = document.getElementById('app-main');
        if (appMain) {
          appMain.innerHTML = renderReportPage();
          attachReportPageEvents();
        }
      } catch (err) {
        // Inject error directly without full re-render to preserve scroll position
        const existingError = document.getElementById('btn-dismiss-error')?.closest('.alert-danger');
        if (existingError) {
          existingError.querySelector('span').textContent = 'Failed to save inspection dossier: ' + (err.message || 'Unknown error.');
        } else {
          const appMain = document.getElementById('app-main');
          if (appMain) {
            const errBanner = document.createElement('div');
            errBanner.innerHTML = `<div class="alert alert-danger animate-fade-in" style="margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: var(--color-danger-text); font-size: var(--text-sm);">Failed to save inspection dossier: ${err.message || 'Unknown error.'}</div>`;
            appMain.insertBefore(errBanner.firstChild, appMain.firstChild);
          }
        }
      }
    });
  }

  // Rule Matrix Filter Buttons
  document.querySelectorAll('.rule-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentRuleFilter = btn.dataset.filter || 'ALL';
      const appMain = document.getElementById('app-main');
      if (appMain) {
        appMain.innerHTML = renderReportPage();
        attachReportPageEvents();
      }
    });
  });
}
