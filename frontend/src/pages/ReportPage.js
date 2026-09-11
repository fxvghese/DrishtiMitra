/**
 * DrishtiMitra - ReportPage Component
 * Official Legal Metrology Compliance Audit Report
 * Fulfills: AI ASSISTS. INSPECTOR DECIDES.
 * Includes: AI Assessment ↓ Evidence ↓ Applicable Requirement ↓ Inspector Verification [ACCEPT] [REJECT] ↓ Comment ↓ SAVE INSPECTION
 * Save Confirmation: "INSPECTION SAVED" + [ VIEW INSPECTION ] [ NEW INSPECTION ]
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
      <div class="card" style="max-width: 520px; margin: var(--space-8) auto; padding: var(--space-6); text-align: center;">
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

  let verdictTitle = 'STATUTORY COMPLIANT';
  let verdictSubtext = 'All examined statutory declarations comply with Legal Metrology (Packaged Commodities) Rules, 2011.';
  let verdictBadgeClass = 'badge-compliant';
  let verdictIcon = icons.checkCircle;
  let verdictBg = '#F0FDF4';
  let verdictBorder = 'var(--bg-mint-border)';
  let verdictColor = 'var(--primary-700)';

  if (overallStatus === 'NON_COMPLIANT') {
    verdictTitle = 'POTENTIAL NON-COMPLIANCE DETECTED';
    verdictSubtext = 'Potential statutory issues identified for officer review. Inspector verification required.';
    verdictBadgeClass = 'badge-non-compliant';
    verdictIcon = icons.xCircle;
    verdictBg = '#FEF2F2';
    verdictBorder = '#FCA5A5';
    verdictColor = 'var(--color-danger)';
  } else if (overallStatus === 'REVIEW' || overallStatus === 'INSUFFICIENT_EVIDENCE') {
    verdictTitle = 'INSUFFICIENT EVIDENCE / REVIEW REQUIRED';
    verdictSubtext = 'Could not verify all statutory declarations from supplied surfaces. Inspector physical verification required.';
    verdictBadgeClass = 'badge-review';
    verdictIcon = icons.clock;
    verdictBg = '#FFFBEB';
    verdictBorder = '#FDE68A';
    verdictColor = 'var(--color-warning)';
  }

  const isSaved = state.isSaved;
  const inspectorVerdict = state.overallInspectorVerdict || (overallStatus === 'COMPLIANT' ? 'COMPLIANT' : 'POTENTIAL_NON_COMPLIANCE');

  return `
    <div class="report-page-container animate-fade-in" style="max-width: 780px; margin: 0 auto;">
      
      <!-- Top Action Toolbar (Hidden in Print) -->
      <div class="no-print" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div>
          <div style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono); margin-bottom: 2px;">
            INSPECTION ID: <strong>${inspection?.id || 'INSP-PENDING'}</strong> • ${formatDate(new Date().toISOString())}
          </div>
          <h1 style="font-size: clamp(1.3rem, 4.5vw, 1.75rem); font-weight: 800; color: var(--text-primary); margin: 0;">
            Compliance Audit Report
          </h1>
        </div>

        <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
          ${renderButton({
            id: 'btn-print-report',
            text: 'Print Certificate',
            variant: 'secondary',
            size: 'sm',
            icon: icons.printer,
          })}
          ${renderButton({
            id: 'btn-new-scan',
            text: 'New Inspection',
            variant: 'primary',
            size: 'sm',
            icon: icons.camera,
          })}
        </div>
      </div>

      <!-- Save Confirmation Banner (Section 13) -->
      ${isSaved ? `
        <div class="card animate-fade-in" style="margin-bottom: var(--space-4); border: 2px solid var(--primary-500); background: #F0FDF4; padding: var(--space-4);">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--primary-500); color: #FFF; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${icons.check}
              </div>
              <div>
                <h3 style="font-size: var(--text-base); font-weight: 800; color: var(--primary-900); margin: 0;">
                  INSPECTION SAVED
                </h3>
                <div style="font-size: var(--text-xs); color: var(--primary-800); margin-top: 2px;">
                  ID: <strong style="font-family: var(--font-mono);">${inspection?.id}</strong> • Inspector: <strong>${authState.user?.email || 'Officer'}</strong>
                </div>
                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
                  Status: ${renderStatusBadge(inspectorVerdict, 'compliance')}
                </div>
              </div>
            </div>

            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
              <a href="#/inspections/${inspection.id}/details" class="btn btn-primary btn-sm">
                View Inspection
              </a>
              <a href="#/scan" class="btn btn-secondary btn-sm">
                New Inspection
              </a>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- AI Compliance Assessment Banner (Section 10) -->
      <div class="card" style="margin-bottom: var(--space-4); border: 2px solid ${verdictBorder}; background: ${verdictBg}; padding: var(--space-4);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <div style="width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #FFFFFF; color: ${verdictColor}; box-shadow: var(--shadow-xs); flex-shrink: 0;">
              ${verdictIcon}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: var(--text-secondary); letter-spacing: 0.05em; font-family: var(--font-mono);">
                  AI ASSESSMENT
                </span>
                <span style="font-size: 10px; background: #E2E8F0; color: #475569; padding: 1px 6px; border-radius: 4px; font-weight: 700;">
                  ADVISORY
                </span>
              </div>
              <div style="font-size: var(--text-lg); font-weight: 800; color: var(--text-primary); margin-top: 2px;">
                ${verdictTitle}
              </div>
              <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px; line-height: 1.4;">
                ${verdictSubtext}
              </p>
            </div>
          </div>

          <div>
            <span class="badge ${verdictBadgeClass}" style="font-size: var(--text-xs); padding: 5px 12px;">
              ${overallStatus}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Stats Row (Evaluated, Passed, Potential Issues, Review Items) -->
      <div class="stats-row-container" style="margin-bottom: var(--space-4);">
        <div class="stat-item-col">
          <div class="stat-badge-icon" style="background: var(--color-info-bg); color: var(--color-info-text);">
            ${icons.book}
          </div>
          <div class="stat-label-text">Rules Checked</div>
          <div class="stat-number-text" style="color: var(--text-primary);">${rules.length}</div>
        </div>

        <div class="stat-item-col">
          <div class="stat-badge-icon" style="background: var(--color-success-bg); color: var(--color-success-text);">
            ${icons.check}
          </div>
          <div class="stat-label-text">Passed Rules</div>
          <div class="stat-number-text" style="color: var(--primary-600);">${passedCount}</div>
        </div>

        <div class="stat-item-col">
          <div class="stat-badge-icon" style="background: var(--color-danger-bg); color: var(--color-danger-text);">
            ${icons.xCircle}
          </div>
          <div class="stat-label-text">Potential Issues</div>
          <div class="stat-number-text" style="color: var(--color-danger);">${violations.length}</div>
        </div>

        <div class="stat-item-col">
          <div class="stat-badge-icon" style="background: var(--color-warning-bg); color: var(--color-warning-text);">
            ${icons.clock}
          </div>
          <div class="stat-label-text">Review Items</div>
          <div class="stat-number-text" style="color: var(--color-warning);">${reviewItems.length}</div>
        </div>
      </div>

      <!-- Rule 26 Applicability Card -->
      <div class="card" style="margin-bottom: var(--space-4); padding: var(--space-3) var(--space-4);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <h3 style="font-size: var(--text-xs); font-weight: 800; color: var(--text-primary); text-transform: uppercase;">
            ${icons.info} Rule 26 Applicability & Exemptions
          </h3>
          <span class="badge badge-neutral" style="font-size: 10px;">
            ${evaluation.applicability_status || 'STANDARD COMMODITY'}
          </span>
        </div>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); margin: 0; line-height: 1.4;">
          ${evaluation.applicability_reason || 'Package is subject to standard Legal Metrology (Packaged Commodities) Rules, 2011.'}
        </p>
      </div>

      <!-- Findings & Inspector Decisions (Section 11 & 12) -->
      ${violations.length > 0 ? `
        <div style="margin-bottom: var(--space-4);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3); flex-wrap: wrap; gap: var(--space-2);">
            <div>
              <h2 style="font-size: var(--text-base); font-weight: 800; color: var(--text-primary); margin: 0;">
                Statutory Findings & Inspector Verification (${violations.length})
              </h2>
              <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 1px;">
                Review each finding individually: Accept finding or Overrule with legal justification.
              </p>
            </div>
            <div style="font-size: 10px; color: var(--primary-700); font-weight: 700; background: var(--primary-100); padding: 3px 8px; border-radius: var(--radius-full);">
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
        <div class="card card-mint" style="margin-bottom: var(--space-4); padding: var(--space-4);">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <span style="color: var(--primary-600); font-size: 24px;">${icons.checkCircle}</span>
            <div>
              <h4 style="font-weight: 700; color: var(--primary-900); margin-bottom: 2px;">
                Zero Potential Statutory Violations Identified
              </h4>
              <p style="font-size: var(--text-xs); color: var(--text-secondary); margin: 0;">
                All verified mandatory declarations conform to Rules 6, 10, 11, 12, 13, 14, 16, 17, and 24.
              </p>
            </div>
          </div>
        </div>
      `}

      <!-- Complete Rule Matrix Accordion/Card -->
      <div class="card" style="margin-bottom: var(--space-4);">
        <div class="card-header">
          <div>
            <h3 class="card-title">${icons.shieldCheck} Complete Statutory Rule Evaluation Matrix</h3>
            <p class="card-description">Rules 6–26 under Legal Metrology Rules, 2011</p>
          </div>
        </div>
        <div class="card-body">
          ${renderRuleMatrix(rules, currentRuleFilter)}
        </div>
      </div>

      <!-- Human Inspector Final Decision & Dossier Sign-off Block (Section 12) -->
      <div class="card" style="border: 2px solid var(--primary-500); background: #FFFFFF; margin-bottom: var(--space-4); padding: var(--space-5); border-radius: var(--radius-2xl);">
        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); border-bottom: 1px solid var(--border-default); padding-bottom: var(--space-3);">
          <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--primary-100); color: var(--primary-700); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${icons.shieldCheck}
          </div>
          <div>
            <h3 style="font-size: var(--text-base); font-weight: 800; color: var(--text-primary); margin: 0;">
              Inspector Final Decision & Dossier Sign-off
            </h3>
            <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 1px;">
              Officer in charge: <strong style="color: var(--text-primary);">${authState.user?.email || 'Authorized Officer'}</strong>
            </p>
          </div>
        </div>

        <!-- Final Verdict Radio/Toggle Selection -->
        <div style="margin-bottom: var(--space-4);">
          <label class="form-label" style="font-weight: 700; margin-bottom: var(--space-2);">
            Final Statutory Compliance Verdict:
          </label>
          <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
            <button
              type="button"
              class="btn btn-sm btn-verdict-select ${inspectorVerdict === 'COMPLIANT' ? 'btn-success' : 'btn-secondary'}"
              data-verdict="COMPLIANT"
              style="padding: 6px 14px; font-weight: 700;"
            >
              ✓ Verified Compliant
            </button>

            <button
              type="button"
              class="btn btn-sm btn-verdict-select ${inspectorVerdict === 'POTENTIAL_NON_COMPLIANCE' ? 'btn-danger' : 'btn-secondary'}"
              data-verdict="POTENTIAL_NON_COMPLIANCE"
              style="padding: 6px 14px; font-weight: 700;"
            >
              ✕ Potential Non-Compliance Notice
            </button>

            <button
              type="button"
              class="btn btn-sm btn-verdict-select ${inspectorVerdict === 'INSUFFICIENT_EVIDENCE' ? 'btn-secondary' : 'btn-secondary'}"
              data-verdict="INSUFFICIENT_EVIDENCE"
              style="padding: 6px 14px; font-weight: 700; ${inspectorVerdict === 'INSUFFICIENT_EVIDENCE' ? 'border-color: var(--color-warning); color: var(--color-warning);' : ''}"
            >
              ? Insufficient Evidence
            </button>
          </div>
        </div>

        <!-- Inspector General Remarks -->
        <div style="margin-bottom: var(--space-4);">
          <label class="form-label" for="inspector-general-comment" style="font-weight: 700;">
            Add inspector comment:
          </label>
          <textarea
            id="inspector-general-comment"
            class="form-textarea"
            placeholder="Add inspector comment, directives, or inspection notice reference..."
            rows="3"
            style="font-size: var(--text-xs);"
          >${state.inspectorComment || ''}</textarea>
        </div>

        <!-- Save Inspection Button -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); border-top: 1px solid var(--border-default); padding-top: var(--space-3);">
          <div style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono);">
            Audit Record: ${(inspection?.id || 'DM-INSP').slice(0, 16)}
          </div>

          <div>
            ${renderButton({
              id: 'btn-save-dossier',
              text: isSaved ? 'Update Saved Inspection' : 'Save Inspection',
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

  // Finding Decision Toggles (Accept / Reject)
  document.querySelectorAll('.btn-decision-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const ruleCode = btn.dataset.ruleCode;
      const decision = btn.dataset.decision;
      inspectionContext.setFindingDecision(ruleCode, decision);

      const appMain = document.getElementById('app-main');
      if (appMain) {
        appMain.innerHTML = renderReportPage();
        attachReportPageEvents();
      }
    });
  });

  // Finding Comments
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

      const appMain = document.getElementById('app-main');
      if (appMain) {
        appMain.innerHTML = renderReportPage();
        attachReportPageEvents();
      }
    });
  });

  // General remarks textarea
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
        inspectionContext.setError('No active inspection data to save.');
        return;
      }

      const extracted = inspection.extracted_data || {};
      const dossier = {
        inspectionId: inspection.id,
        productName: extracted.product_name || inspection.product?.product_name || 'Standard Commodity Package',
        manufacturer: extracted.manufacturer || inspection.product?.manufacturer || 'Declared Manufacturer',
        capturedSurfaces: state.surfaces.map(s => ({ surface: s.surface, name: s.name, previewUrl: s.previewUrl })),
        imageUrl: inspection.image_url || state.surfaces[0]?.previewUrl,
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

        const appMain = document.getElementById('app-main');
        if (appMain) {
          appMain.innerHTML = renderReportPage();
          attachReportPageEvents();
        }
      } catch (err) {
        console.error('Save error:', err);
        inspectionContext.setError('Failed to save inspection: ' + err.message);
      }
    });
  }
}
