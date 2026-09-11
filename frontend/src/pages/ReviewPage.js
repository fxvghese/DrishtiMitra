/**
 * DrishtiMitra - ReviewPage Component
 * Verification Panel for reviewing OCR field extractions before compliance evaluation
 * Provides surface evidence check, ambiguity alerts, and execution trigger
 */

import { renderImageGallery } from '../components/ImageGallery.js';
import { renderExtractedDataTable } from '../components/ExtractedDataTable.js';
import { renderStatusBadge } from '../components/StatusBadge.js';
import { renderButton } from '../components/Button.js';
import { renderAlert } from '../components/Alert.js';
import { renderLoadingSpinner } from '../components/LoadingSpinner.js';
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
      <div class="card card-glass animate-fade-in" style="max-width: 720px; margin: var(--space-8) auto; text-align: center;">
        ${renderLoadingSpinner(state.loadingMessage || 'Executing Legal Metrology Rule Engine...')}
      </div>
    `;
  }

  if (!inspection) {
    return `
      <div class="card card-glass" style="max-width: 600px; margin: var(--space-8) auto;">
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
    <div class="review-page-container animate-fade-in">
      <!-- Breadcrumb Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-6);">
        <div>
          <div style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 4px;">
            <span>INSPECTION ID:</span>
            <span style="color: var(--text-primary); font-weight: 700;">${inspection.id}</span>
            <span>•</span>
            <span>${formatDate(inspection.created_at)}</span>
          </div>
          <h1 style="font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary);">
            Extraction Verification Panel
          </h1>
        </div>

        <div style="display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap;">
          ${renderStatusBadge(inspection.status || 'REVIEW', 'compliance')}
          <a href="#/scan" class="btn btn-secondary btn-sm">
            ${icons.camera} Add Surface / Retake
          </a>
        </div>
      </div>

      ${state.error ? `
        ${renderAlert({
          type: 'danger',
          title: 'Evaluation Error',
          message: state.error,
        })}
      ` : ''}

      ${isOnlyFront ? `
        <div class="alert alert-warning animate-fade-in" style="margin-bottom: var(--space-4); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: var(--color-warning-text); font-size: var(--text-sm);">
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            ${icons.info}
            <span><strong>Partial Surface Evidence:</strong> Only the Front display panel is captured. Declarations required on the Information panel (Manufacturer, MRP, Date, Consumer Care) cannot be confirmed absent without Back panel evidence.</span>
          </div>
          <a href="#/scan" class="btn btn-warning btn-sm" style="color: #000; font-weight: 600; white-space: nowrap;">
            + Capture Back Panel
          </a>
        </div>
      ` : ''}

      <!-- Main Layout: Evidence Photos + Extracted Fields -->
      <div class="review-split-layout" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr)); gap: var(--space-6); margin-bottom: var(--space-6);">
        <!-- Column 1: Image Evidence & Surfaces -->
        <div class="card card-glass">
          <div class="card-header">
            <h3 class="card-title">${icons.camera} Captured Surface Evidence</h3>
            <span style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono);">
              ${surfaces.length > 0 ? `${surfaces.length} surface(s)` : `${imageList.length} photo(s)`}
            </span>
          </div>
          <div class="card-body">
            <!-- Surface Badges List -->
            ${surfaces.length > 0 ? `
              <div style="display: flex; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-3);">
                ${surfaces.map((s, i) => `
                  <span style="font-size: 11px; padding: 2px 8px; border-radius: var(--radius-full); background: var(--bg-surface-raised); border: 1px solid var(--border-glass); font-family: var(--font-mono);">
                    <strong>${s.surface}</strong> (#${i + 1})
                  </span>
                `).join('')}
              </div>
            ` : ''}

            ${renderImageGallery({
              primaryImageUrl: inspection.image_url,
              imageUrls: imageList,
            })}
          </div>
        </div>

        <!-- Column 2: Structured Fields -->
        <div class="card card-glass">
          <div class="card-header">
            <div>
              <h3 class="card-title">${icons.fileText} Extracted Mandatory Declarations</h3>
              <p class="card-description">PaddleOCR extractions evaluated against Legal Metrology Rules, 2011</p>
            </div>
            <a href="#/catalogue" class="btn btn-ghost btn-sm" title="Search market reference catalogue">
              ${icons.search} Reference Match
            </a>
          </div>
          <div class="card-body">
            ${renderExtractedDataTable(extracted, surfaces)}
          </div>
        </div>
      </div>

      <!-- Action Banner -->
      <div class="card card-glass" style="background: linear-gradient(135deg, rgba(31,41,55,0.8), rgba(17,24,39,0.9)); border: 1px solid var(--border-glass-hover); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4);">
        <div>
          <h4 style="font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
            Ready for Statutory Compliance Assessment?
          </h4>
          <p style="font-size: var(--text-sm); color: var(--text-muted);">
            The backend engine will evaluate Rules 6, 10, 11, 12, 13, 14, 16, 17, 24, and 26 against this package evidence.
          </p>
        </div>

        <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
          ${renderButton({
            id: 'btn-run-evaluation',
            text: 'Run Compliance Audit',
            variant: 'success',
            size: 'lg',
            icon: icons.shieldCheck,
          })}
        </div>
      </div>
    </div>
  `;
}

export function attachReviewPageEvents() {
  // Empty state button
  const btnStart = document.getElementById('btn-start-scan');
  if (btnStart) {
    btnStart.addEventListener('click', () => router.navigate('/scan'));
  }

  // Run Evaluation Trigger
  const btnRun = document.getElementById('btn-run-evaluation');
  if (btnRun) {
    btnRun.addEventListener('click', async () => {
      const state = inspectionContext.getState();
      const inspectionId = state.currentInspection?.id;

      if (!inspectionId) {
        inspectionContext.setError('No valid inspection ID found. Please start a new inspection scan.');
        return;
      }

      try {
        inspectionContext.setLoading(true, 'Executing Legal Metrology Rule Engine against statutory rules...');
        const res = await evaluateInspection(inspectionId);

        if (res && res.data) {
          inspectionContext.setEvaluationResult(res.data);
          inspectionContext.setLoading(false);
          router.navigate(`/inspections/${inspectionId}/report`);
        } else {
          throw new Error(res?.message || 'Compliance evaluation returned an invalid response structure.');
        }
      } catch (err) {
        console.error('Compliance evaluation error:', err);
        inspectionContext.setError(err.message || 'Failed to execute compliance evaluation.');
      }
    });
  }
}
