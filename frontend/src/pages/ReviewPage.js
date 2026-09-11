/**
 * DrishtiMitra - ReviewPage Component
 * Verification Panel for reviewing OCR field extractions before statutory rule evaluation
 * Visual Identity: Green & White inspection card format
 */

import { renderImageGallery } from '../components/ImageGallery.js';
import { renderExtractedDataTable } from '../components/ExtractedDataTable.js';
import { renderStatusBadge } from '../components/StatusBadge.js';
import { renderButton } from '../components/Button.js';
import { renderAlert } from '../components/Alert.js';
import { renderEmptyState } from '../components/EmptyState.js';
import { icons } from '../assets/icons.js';
import { inspectionContext } from '../context/InspectionContext.js';
import { evaluateInspection } from '../services/inspectionService.js';
import { router } from '../utils/router.js';
import { formatDate } from '../utils/formatters.js';

export function renderReviewPage(params = {}) {
  const state = inspectionContext.getState();
  const inspection = state.currentInspection;

  if (state.isLoading) {
    return `
      <div class="processing-pipeline-card animate-fade-in">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--primary-100); color: var(--primary-600); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-3);">
          <div class="animate-spin" style="width: 28px; height: 28px; border: 3px solid var(--primary-200); border-top-color: var(--primary-600); border-radius: 50%;"></div>
        </div>

        <h3 style="font-size: var(--text-lg); font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
          Evaluating Compliance Rules
        </h3>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); max-width: 380px; margin: 0 auto;">
          ${state.loadingMessage || 'Evaluating physical commodities against Legal Metrology Rules, 2011'}
        </p>

        <!-- Pipeline Steps -->
        <div class="pipeline-step-list">
          <div class="pipeline-step-item">
            <span class="step-indicator-icon step-done">✓</span>
            <span style="font-weight: 600; color: var(--primary-800);">Declarations extracted & mapped</span>
          </div>

          <div class="pipeline-step-item" style="border-color: var(--primary-400); background: var(--bg-mint);">
            <span class="step-indicator-icon step-active">●</span>
            <span style="font-weight: 700; color: var(--primary-900);">Running Rule Engine (Rules 6–26)</span>
          </div>

          <div class="pipeline-step-item" style="opacity: 0.85;">
            <span class="step-indicator-icon step-pending">○</span>
            <span style="color: var(--text-secondary);">Cross-checking reference catalogue</span>
          </div>

          <div class="pipeline-step-item" style="opacity: 0.7;">
            <span class="step-indicator-icon step-pending">○</span>
            <span style="color: var(--text-secondary);">Generating statutory findings dossier</span>
          </div>
        </div>
      </div>
    `;
  }

  if (!inspection) {
    return `
      <div class="card" style="max-width: 520px; margin: var(--space-8) auto; padding: var(--space-6); text-align: center;">
        ${renderEmptyState({
          title: 'No Active Inspection Found',
          message: 'Please start a new inspection scan or upload package photos to review extractions.',
          icon: icons.camera,
          actionButton: renderButton({
            id: 'btn-start-scan',
            text: 'Go to Inspection Scanner',
            variant: 'primary',
            icon: icons.camera,
          }),
        })}
      </div>
    `;
  }

  const extracted = inspection.extracted_data || {};
  const imageList = state.previewUrls.length > 0 ? state.previewUrls : (inspection.image_url ? [inspection.image_url] : []);
  const surfaces = state.surfaces;

  const hasBack = surfaces.some(s => s.surface === 'BACK');
  const hasFront = surfaces.some(s => s.surface === 'FRONT');
  const isOnlyFront = surfaces.length > 0 && hasFront && !hasBack;

  return `
    <div class="review-page-container animate-fade-in" style="max-width: 780px; margin: 0 auto;">
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div>
          <div style="display: flex; align-items: center; gap: var(--space-2); font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono); margin-bottom: 2px;">
            <span>ID: <strong style="color: var(--text-primary);">${inspection.id}</strong></span>
            <span>•</span>
            <span>${formatDate(inspection.created_at)}</span>
          </div>
          <h1 style="font-size: clamp(1.3rem, 4.5vw, 1.75rem); font-weight: 800; color: var(--text-primary); margin: 0;">
            Extraction Verification
          </h1>
        </div>

        <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
          ${renderStatusBadge(inspection.status || 'REVIEW', 'compliance')}
          <a href="#/scan" class="btn btn-secondary btn-sm">
            ${icons.camera} Add Surface
          </a>
        </div>
      </div>

      ${state.error ? `
        <div style="margin-bottom: var(--space-4);">
          ${renderAlert({
            type: 'danger',
            title: 'Evaluation Error',
            message: state.error,
          })}
        </div>
      ` : ''}

      ${isOnlyFront ? `
        <div class="card card-mint" style="margin-bottom: var(--space-4); padding: var(--space-3) var(--space-4); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); border-color: var(--color-warning);">
          <div style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-xs); color: var(--color-warning-text);">
            ${icons.alertTriangle}
            <span><strong>Partial Evidence:</strong> Only Front panel is captured. Add Back panel to verify MRP, Manufacturer, and Dates.</span>
          </div>
          <a href="#/scan" class="btn btn-sm" style="background: var(--color-warning); color: #FFF; font-size: 11px;">
            + Add Back Panel
          </a>
        </div>
      ` : ''}

      <!-- Main Layout: Evidence Photos + Extracted Fields -->
      <div style="display: flex; flex-direction: column; gap: var(--space-4); margin-bottom: var(--space-4);">
        <!-- Column 1: Image Evidence -->
        <div class="card" style="padding: var(--space-4);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
            <h3 style="font-size: var(--text-sm); font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.03em;">
              ${icons.camera} Package Evidence (${surfaces.length > 0 ? surfaces.length : imageList.length})
            </h3>
            ${surfaces.length > 0 ? `
              <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                ${surfaces.map((s, i) => `
                  <span class="badge badge-neutral" style="font-size: 10px;">
                    ${s.surface} #${i + 1}
                  </span>
                `).join('')}
              </div>
            ` : ''}
          </div>

          ${renderImageGallery({
            primaryImageUrl: inspection.image_url,
            imageUrls: imageList,
          })}
        </div>

        <!-- Column 2: Structured Declarations -->
        <div class="card" style="padding: var(--space-4);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
            <div>
              <h3 style="font-size: var(--text-sm); font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.03em;">
                ${icons.fileText} Mandatory Declarations
              </h3>
              <p style="font-size: 11px; color: var(--text-secondary); margin: 0;">
                Evaluated under Legal Metrology Rules, 2011
              </p>
            </div>
            <a href="#/catalogue" class="btn btn-ghost btn-sm" style="font-size: 11px;">
              ${icons.search} Reference Match
            </a>
          </div>

          ${renderExtractedDataTable(extracted, surfaces)}
        </div>
      </div>

      <!-- Action Card: Run Compliance Audit -->
      <div class="card card-mint" style="padding: var(--space-4); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
        <div>
          <h4 style="font-weight: 800; color: var(--primary-900); font-size: var(--text-sm); margin-bottom: 2px;">
            Ready for Statutory Compliance Assessment?
          </h4>
          <p style="font-size: var(--text-xs); color: #374151; margin: 0;">
            The engine evaluates Rules 6, 10, 11, 12, 13, 14, 16, 17, 24, and 26.
          </p>
        </div>

        <div>
          ${renderButton({
            id: 'btn-run-evaluation',
            text: 'Run Compliance Audit',
            variant: 'primary',
            size: 'lg',
            icon: icons.shieldCheck,
          })}
        </div>
      </div>
    </div>
  `;
}

export function attachReviewPageEvents() {
  const btnStart = document.getElementById('btn-start-scan');
  if (btnStart) {
    btnStart.addEventListener('click', () => router.navigate('/scan'));
  }

  const btnRun = document.getElementById('btn-run-evaluation');
  if (btnRun) {
    btnRun.addEventListener('click', async () => {
      const state = inspectionContext.getState();
      const inspectionId = state.currentInspection?.id;

      if (!inspectionId) {
        inspectionContext.setError('No valid inspection ID found. Please start a new scan.');
        return;
      }

      try {
        inspectionContext.setLoading(true, 'Executing Legal Metrology Rule Engine...');
        const res = await evaluateInspection(inspectionId);

        if (res && res.data) {
          inspectionContext.setEvaluationResult(res.data);
          inspectionContext.setLoading(false);
          router.navigate(`/inspections/${inspectionId}/report`);
        } else {
          throw new Error(res?.message || 'Compliance evaluation returned an invalid response.');
        }
      } catch (err) {
        console.error('Compliance evaluation error:', err);
        inspectionContext.setError(err.message || 'Failed to execute compliance evaluation.');
      }
    });
  }
}
