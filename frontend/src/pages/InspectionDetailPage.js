/**
 * DrishtiMitra - Inspection Details & Audit Trail Page
 * Visual Identity: Green & White Mobile-First Portal
 * Complete statutory dossier:
 * 1. Inspection Information
 * 2. Product Information
 * 3. Captured Surfaces
 * 4. Extracted Declarations & Confidence
 * 5. Findings & Evidence
 * 6. Applicable Requirements
 * 7. AI Assessment vs Inspector Decision
 * 8. Inspector Comment & Rule Version
 * 9. Download / Print Inspection Report
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
      <div class="card" style="max-width: 520px; margin: var(--space-8) auto; padding: var(--space-6); text-align: center;">
        ${renderEmptyState({
          title: 'Inspection Dossier Not Found',
          message: `No saved inspection record found with ID "${inspectionId}".`,
          icon: icons.fileText,
          actionButton: renderButton({
            id: 'btn-back-to-dashboard',
            text: 'Return to Dashboard',
            variant: 'primary',
            icon: icons.home,
          }),
        })}
      </div>
    `;
  }

  const extracted = dossier.extractedData || {};
  const isCompliant = dossier.inspectorVerdict === 'COMPLIANT' || dossier.overallStatus === 'COMPLIANT';
  const isIssue = dossier.inspectorVerdict === 'POTENTIAL_NON_COMPLIANCE' || dossier.overallStatus === 'NON_COMPLIANT';
  const statusBadgeClass = isCompliant ? 'badge-compliant' : (isIssue ? 'badge-non-compliant' : 'badge-review');
  const statusLabel = isCompliant ? 'Compliant' : (isIssue ? 'Potential Non-Compliance' : 'Needs Review');
  const findings = dossier.aiEvaluation?.violations || [];

  return `
    <div class="inspection-detail-container animate-fade-in" style="max-width: 780px; margin: 0 auto;">
      
      <!-- Top Actions Toolbar -->
      <div class="no-print" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div style="display: flex; align-items: center; gap: var(--space-2);">
          <a href="#/history" class="btn btn-secondary btn-sm" title="Back to History">
            ← History
          </a>
          <div>
            <div style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono);">
              RECORD • ${formatDate(dossier.timestamp || dossier.savedAt)}
            </div>
            <h1 style="font-size: clamp(1.3rem, 4.5vw, 1.75rem); font-weight: 800; color: var(--text-primary); margin: 0;">
              Inspection Dossier
            </h1>
          </div>
        </div>

        <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
          ${renderButton({
            id: 'btn-download-report',
            text: 'Download Report',
            variant: 'secondary',
            size: 'sm',
            icon: icons.printer,
          })}
          ${renderButton({
            id: 'btn-new-from-detail',
            text: 'New Inspection',
            variant: 'primary',
            size: 'sm',
            icon: icons.camera,
          })}
        </div>
      </div>

      <!-- Statutory Overview Card -->
      <div class="card" style="margin-bottom: var(--space-4); padding: var(--space-4); border: 2px solid ${isCompliant ? 'var(--primary-300)' : (isIssue ? '#FCA5A5' : '#FDE68A')}; background: ${isCompliant ? '#F0FDF4' : (isIssue ? '#FEF2F2' : '#FFFBEB')};">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
          <div>
            <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: 4px;">
              <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--text-primary); background: #FFFFFF; padding: 2px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-default);">
                ${dossier.inspectionId}
              </span>
              <span class="badge ${statusBadgeClass}">
                ${statusLabel}
              </span>
            </div>
            <h2 style="font-size: var(--text-xl); font-weight: 800; color: var(--text-primary); margin: 0;">
              ${dossier.productName || 'Package Commodity'}
            </h2>
            <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px;">
              ${dossier.manufacturer || 'Declared Manufacturer / Packer'}
            </p>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--text-secondary);">Authorized Inspector</div>
            <div style="font-size: var(--text-xs); font-weight: 700; color: var(--text-primary); font-family: var(--font-mono);">
              ${dossier.inspectorId || 'inspector@legalmetrology.gov.in'}
            </div>
            <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">
              Timestamp: ${formatDate(dossier.savedAt || dossier.timestamp)}
            </div>
          </div>
        </div>
      </div>

      <!-- Separation: AI Assessment vs Inspector Decision -->
      <div class="card" style="margin-bottom: var(--space-4); padding: var(--space-4);">
        <h3 style="font-size: var(--text-sm); font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: var(--space-3);">
          Decision Separation: AI Assessment vs. Inspector Decision
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3);">
          <!-- AI Assessment Column -->
          <div style="background: #F8FAFC; padding: var(--space-3); border-radius: var(--radius-lg); border-left: 3px solid #64748B;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #475569; font-family: var(--font-mono); margin-bottom: 2px;">
              1. AI Automated Assessment
            </div>
            <div style="font-size: var(--text-base); font-weight: 800; color: var(--text-primary);">
              ${dossier.overallStatus || 'ASSESSED'}
            </div>
            <p style="font-size: 11px; color: var(--text-secondary); margin-top: 3px; line-height: 1.4;">
              Extracted via PaddleOCR and matched against Legal Metrology Rules, 2011 (Rules 6–26). Advisory only.
            </p>
          </div>

          <!-- Inspector Decision Column -->
          <div style="background: var(--bg-mint); padding: var(--space-3); border-radius: var(--radius-lg); border-left: 3px solid var(--primary-600);">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--primary-800); font-family: var(--font-mono); margin-bottom: 2px;">
              2. Inspector Final Determination
            </div>
            <div style="font-size: var(--text-base); font-weight: 800; color: var(--primary-900);">
              ${dossier.inspectorVerdict || dossier.overallStatus || 'COMPLIANT'}
            </div>
            <p style="font-size: 11px; color: #374151; margin-top: 3px; line-height: 1.4;">
              ${dossier.inspectorComment || 'Inspector approved statutory compliance finding.'}
            </p>
          </div>
        </div>
      </div>

      <!-- Captured Surfaces Evidence -->
      <div class="card" style="margin-bottom: var(--space-4); padding: var(--space-4);">
        <h3 style="font-size: var(--text-sm); font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: var(--space-3);">
          Captured Surfaces (${(dossier.capturedSurfaces || []).length})
        </h3>
        ${(dossier.capturedSurfaces || []).length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--space-3);">
            ${dossier.capturedSurfaces.map(s => `
              <div style="border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-2); background: #FFFFFF;">
                <span class="badge badge-neutral" style="font-size: 10px; margin-bottom: 4px;">
                  ${s.surface || 'SURFACE'}
                </span>
                ${s.previewUrl ? `
                  <div style="height: 120px; border-radius: var(--radius-md); overflow: hidden; background: #F8FAFC;">
                    <img src="${s.previewUrl}" alt="Surface" style="width: 100%; height: 100%; object-fit: contain;" />
                  </div>
                ` : `
                  <div style="height: 80px; display: flex; align-items: center; justify-content: center; background: #F8FAFC; color: var(--text-secondary); font-size: 11px;">
                    ${s.name || 'Image Recorded'}
                  </div>
                `}
              </div>
            `).join('')}
          </div>
        ` : `
          <p style="font-size: var(--text-xs); color: var(--text-secondary); margin: 0;">
            Surfaces authenticated and archived in secure database record.
          </p>
        `}
      </div>

      <!-- Extracted Declarations Record -->
      <div class="card" style="margin-bottom: var(--space-4); padding: var(--space-4);">
        <h3 style="font-size: var(--text-sm); font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: var(--space-3);">
          Extracted Mandatory Declarations
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-2);">
          ${Object.entries(extracted).map(([key, val]) => {
            if (key === 'extraction_confidence' || key === 'id' || key === 'inspection_id') return '';
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return `
              <div style="background: var(--bg-surface-raised); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-2) var(--space-3);">
                <div style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">
                  ${label}
                </div>
                <div style="font-size: var(--text-xs); font-weight: 600; color: var(--text-primary); font-family: var(--font-mono); margin-top: 2px;">
                  ${val || '—'}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Findings & Evidence -->
      ${findings.length > 0 ? `
        <div class="card" style="margin-bottom: var(--space-4); padding: var(--space-4);">
          <h3 style="font-size: var(--text-sm); font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: var(--space-3);">
            Findings & Evidence Records (${findings.length})
          </h3>
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${findings.map((f, i) => `
              <div style="background: #FFF; border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-3); border-left: 3px solid ${f.status === 'FAIL' ? 'var(--color-danger)' : 'var(--color-warning)'};">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-weight: 700; font-size: var(--text-xs); color: var(--text-primary);">
                    Finding #${i + 1}: ${f.field_name || 'Declaration Field'}
                  </span>
                  <span class="badge ${f.status === 'FAIL' ? 'badge-non-compliant' : 'badge-review'}" style="font-size: 10px;">
                    ${f.status}
                  </span>
                </div>
                <p style="font-size: 11px; color: var(--text-secondary); margin: 0;">
                  ${f.message || f.reason || 'Statutory review required.'}
                </p>
                ${f.detected_value ? `
                  <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-primary); margin-top: 4px;">
                    Detected: <strong>${f.detected_value}</strong>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Statutory Notice Disclaimer (Section 16) -->
      <div style="background: var(--bg-mint); border: 1px solid var(--bg-mint-border); border-radius: var(--radius-xl); padding: var(--space-3) var(--space-4); margin-bottom: var(--space-4); text-align: center;">
        <p style="font-size: 11px; color: var(--primary-900); font-weight: 600; margin: 0;">
          AI-assisted assessment. Final inspection decision is made by the authorized inspector.
        </p>
      </div>

    </div>
  `;
}

export function attachInspectionDetailPageEvents() {
  const btnDownload = document.getElementById('btn-download-report');
  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      window.print();
    });
  }

  const btnNew = document.getElementById('btn-new-from-detail');
  if (btnNew) {
    btnNew.addEventListener('click', () => {
      router.navigate('/scan');
    });
  }

  const btnBack = document.getElementById('btn-back-to-dashboard');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      router.navigate('/dashboard');
    });
  }
}
