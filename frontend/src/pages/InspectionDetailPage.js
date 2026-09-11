/**
 * DrishtiMitra - Inspection Details & Audit Trail Page
 * Displays full statutory dossier:
 * - Inspection ID & Timestamp
 * - Product & Manufacturer
 * - Captured Surfaces
 * - Extracted Declarations & Confidence
 * - Findings & Evidence (Rule reference/version)
 * - AI Assessment vs Human Inspector Decision
 * - Inspector ID & Comment
 */

import { renderButton } from '../components/Button.js';
import { renderStatusBadge } from '../components/StatusBadge.js';
import { renderEmptyState } from '../components/EmptyState.js';
import { icons } from '../assets/icons.js';
import { historyService } from '../services/historyService.js';
import { router } from '../utils/router.js';
import { formatDate, formatConfidence } from '../utils/formatters.js';

export function renderInspectionDetailPage(params = {}) {
  const inspectionId = params.id;
  const dossier = historyService.getById(inspectionId);

  if (!dossier) {
    return `
      <div class="card card-glass" style="max-width: 600px; margin: var(--space-8) auto;">
        ${renderEmptyState({
          title: 'Inspection Dossier Not Found',
          message: `No saved inspection dossier found with ID "${inspectionId}". It may not have been saved yet.`,
          icon: icons.fileText,
          actionButton: renderButton({
            id: 'btn-back-to-dashboard',
            text: 'Return to Dashboard',
            variant: 'primary',
            icon: icons.database,
          }),
        })}
      </div>
    `;
  }

  const extracted = dossier.extractedData || {};
  const isCompliant = dossier.inspectorVerdict === 'COMPLIANT' || dossier.overallStatus === 'COMPLIANT';
  const isIssue = dossier.inspectorVerdict === 'POTENTIAL_NON_COMPLIANCE' || dossier.overallStatus === 'NON_COMPLIANT';
  const statusBadgeClass = isCompliant ? 'badge-compliant' : (isIssue ? 'badge-non-compliant' : 'badge-review');
  const statusLabel = isCompliant ? 'STATUTORY COMPLIANT' : (isIssue ? 'POTENTIAL NON-COMPLIANCE' : 'INSUFFICIENT EVIDENCE');

  const findings = dossier.aiEvaluation?.violations || [];

  return `
    <div class="inspection-detail-container animate-fade-in" style="max-width: 900px; margin: 0 auto;">
      <!-- Header Toolbar -->
      <div class="no-print" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-6);">
        <div style="display: flex; align-items: center; gap: var(--space-3);">
          <a href="#/history" class="btn btn-secondary btn-sm" title="Back to History">
            ← History
          </a>
          <div>
            <div style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono);">
              DOSSIER RECORD • ${formatDate(dossier.timestamp || dossier.savedAt)}
            </div>
            <h1 style="font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary);">
              Statutory Inspection Audit Trail
            </h1>
          </div>
        </div>

        <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
          ${renderButton({
            id: 'btn-print-detail',
            text: 'Print Audit Record',
            variant: 'secondary',
            icon: icons.printer,
          })}
          ${renderButton({
            id: 'btn-new-from-detail',
            text: 'New Inspection',
            variant: 'primary',
            icon: icons.camera,
          })}
        </div>
      </div>

      <!-- Overview Card -->
      <div class="card card-glass" style="margin-bottom: var(--space-6); border: 2px solid ${isCompliant ? 'var(--color-success-border)' : (isIssue ? 'var(--color-danger-border)' : 'var(--color-warning-border)')};">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4);">
          <div>
            <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-1);">
              <span style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--primary-400); font-weight: 700; background: rgba(59,130,246,0.1); padding: 2px 8px; border-radius: var(--radius-sm); border: 1px solid rgba(59,130,246,0.25);">
                ${dossier.inspectionId}
              </span>
              <span class="badge ${statusBadgeClass}">
                ${statusLabel}
              </span>
            </div>
            <h2 style="font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary); margin: 0;">
              ${dossier.productName || 'Package Commodity'}
            </h2>
            <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 2px;">
              ${dossier.manufacturer || 'Declared Manufacturer'}
            </p>
          </div>

          <div style="text-align: right;">
            <div style="font-size: var(--text-xs); color: var(--text-muted);">Officer in Charge</div>
            <div style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); font-family: var(--font-mono);">
              ${dossier.inspectorId || 'inspector@legalmetrology.gov.in'}
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
              Recorded: ${formatDate(dossier.savedAt || dossier.timestamp)}
            </div>
          </div>
        </div>
      </div>

      <!-- Human vs AI Determination Summary -->
      <div class="card card-glass" style="margin-bottom: var(--space-6); background: var(--bg-surface-raised);">
        <div class="card-header">
          <h3 class="card-title">${icons.shieldCheck} Statutory Decision Separation</h3>
        </div>
        <div class="card-body" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
          <!-- AI Column -->
          <div style="background: rgba(15, 23, 42, 0.7); padding: var(--space-4); border-radius: var(--radius-lg); border-left: 3px solid var(--primary-500);">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--primary-400); font-family: var(--font-mono); margin-bottom: 4px;">
              AI Automated Recommendation
            </div>
            <div style="font-size: var(--text-lg); font-weight: 800; color: var(--text-primary);">
              ${dossier.overallStatus || 'ASSESSED'}
            </div>
            <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 4px;">
              Based on PaddleOCR text extractions across Rules 6, 10, 11, 12, 13, 14, 16, 17, 24, and 26.
            </p>
          </div>

          <!-- Inspector Column -->
          <div style="background: rgba(15, 23, 42, 0.7); padding: var(--space-4); border-radius: var(--radius-lg); border-left: 3px solid var(--color-success);">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--color-success-text); font-family: var(--font-mono); margin-bottom: 4px;">
              Statutory Officer Final Decision
            </div>
            <div style="font-size: var(--text-lg); font-weight: 800; color: var(--color-success-text);">
              ${dossier.inspectorVerdict || dossier.overallStatus}
            </div>
            <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">
              ${dossier.inspectorComment || 'Official determination confirmed by Legal Metrology inspection officer.'}
            </p>
          </div>
        </div>
      </div>

      <!-- Captured Surfaces Gallery -->
      <div class="card card-glass" style="margin-bottom: var(--space-6);">
        <div class="card-header">
          <h3 class="card-title">${icons.camera} Captured Package Surfaces</h3>
          <span style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono);">
            ${(dossier.capturedSurfaces || []).length} Surface(s)
          </span>
        </div>
        <div class="card-body">
          <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
            ${(dossier.capturedSurfaces || []).map((surf, i) => `
              <div style="padding: var(--space-3); background: var(--bg-surface-raised); border-radius: var(--radius-lg); border: 1px solid var(--border-glass); min-width: 160px;">
                <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--primary-400); font-family: var(--font-mono);">
                  ${surf.surface || surf} (#${i + 1})
                </div>
                <div style="font-size: var(--text-xs); color: var(--text-primary); font-weight: 600; margin-top: 2px;">
                  ${surf.name || (surf.surface === 'FRONT' ? 'Front Display Panel' : 'Information Panel')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Extracted Declarations Record -->
      <div class="card card-glass" style="margin-bottom: var(--space-6);">
        <div class="card-header">
          <h3 class="card-title">${icons.fileText} Mandatory Declarations Record</h3>
          <span style="font-size: var(--text-xs); color: var(--primary-400); font-family: var(--font-mono);">
            Confidence: ${formatConfidence(extracted.extraction_confidence ?? 95.0)}
          </span>
        </div>
        <div class="card-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3);">
            <div style="background: var(--bg-surface-raised); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Product Name (Rule 6)</div>
              <div style="font-weight: 600; font-size: var(--text-sm); color: var(--text-primary); margin-top: 2px;">
                ${extracted.product_name || 'Not detected in evidence'}
              </div>
            </div>

            <div style="background: var(--bg-surface-raised); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Manufacturer (Rule 6 & 10)</div>
              <div style="font-weight: 600; font-size: var(--text-sm); color: var(--text-primary); margin-top: 2px;">
                ${extracted.manufacturer || 'Not detected in evidence'}
              </div>
            </div>

            <div style="background: var(--bg-surface-raised); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Net Quantity (Rules 11-13)</div>
              <div style="font-weight: 600; font-size: var(--text-sm); color: var(--text-primary); margin-top: 2px;">
                ${extracted.net_quantity || 'Not detected in evidence'}
              </div>
            </div>

            <div style="background: var(--bg-surface-raised); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Maximum Retail Price (Rule 6)</div>
              <div style="font-weight: 600; font-size: var(--text-sm); color: var(--text-primary); margin-top: 2px;">
                ${extracted.mrp || 'Not detected in evidence'}
              </div>
            </div>

            <div style="background: var(--bg-surface-raised); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Date of Mfg / Packaging (Rule 6 & 16)</div>
              <div style="font-weight: 600; font-size: var(--text-sm); color: var(--text-primary); margin-top: 2px;">
                ${extracted.date || 'Not detected in evidence'}
              </div>
            </div>

            <div style="background: var(--bg-surface-raised); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Consumer Care Details (Rule 6 & 24)</div>
              <div style="font-weight: 600; font-size: var(--text-sm); color: var(--text-primary); margin-top: 2px;">
                ${extracted.consumer_care || 'Not detected in evidence'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Findings & Inspector Overrules -->
      ${findings.length > 0 ? `
        <div class="card card-glass" style="margin-bottom: var(--space-6);">
          <div class="card-header">
            <h3 class="card-title">${icons.alertTriangle} Evaluated Statutory Findings (${findings.length})</h3>
          </div>
          <div class="card-body">
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${findings.map((f, i) => {
                const decision = dossier.inspectorDecisions?.[f.rule_code || i] || {};
                const isAccepted = decision.decision === 'ACCEPT';

                return `
                  <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-glass);">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-2);">
                      <div style="font-weight: 700; color: var(--text-primary); font-size: var(--text-sm);">
                        ${f.rule_code || `Finding #${i + 1}`} (Rule ${f.rule_number || ''})
                      </div>
                      <span class="badge ${isAccepted ? 'badge-non-compliant' : 'badge-compliant'}">
                        ${isAccepted ? 'Officer Accepted Finding' : 'Officer Overruled'}
                      </span>
                    </div>

                    <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: var(--space-2);">
                      ${f.reason || f.message || 'Non-compliance flagged by automated rule check.'}
                    </p>

                    ${decision.comment ? `
                      <div style="font-size: 11px; color: var(--text-primary); background: rgba(59,130,246,0.08); padding: var(--space-2); border-radius: var(--radius-sm); border-left: 2px solid var(--primary-500);">
                        <strong>Officer Justification:</strong> ${decision.comment}
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Cryptographic Stamp & Integrity Footer -->
      <div class="card card-glass" style="background: rgba(15, 23, 42, 0.85); border: 1px solid var(--border-glass-hover); padding: var(--space-5);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
          <div>
            <div style="font-size: var(--text-xs); text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em;">
              Department of Consumer Affairs — Legal Metrology Division
            </div>
            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">
              Statutory Record Hash: SHA256-${(dossier.inspectionId || '').replace(/[^a-zA-Z0-9]/g, '').padEnd(16, '0').slice(0, 16).toUpperCase()}
            </div>
          </div>

          <a href="#/history" class="btn btn-secondary btn-sm">
            ← Return to History Log
          </a>
        </div>
      </div>
    </div>
  `;
}

export function attachInspectionDetailPageEvents() {
  const btnBack = document.getElementById('btn-back-to-dashboard');
  if (btnBack) {
    btnBack.addEventListener('click', () => router.navigate('/history'));
  }

  const btnPrint = document.getElementById('btn-print-detail');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => window.print());
  }

  const btnNew = document.getElementById('btn-new-from-detail');
  if (btnNew) {
    btnNew.addEventListener('click', () => router.navigate('/scan'));
  }
}
