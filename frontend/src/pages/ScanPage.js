/**
 * DrishtiMitra - ScanPage Component
 * "New Inspection" - Multi-surface evidence ingestion & real pipeline processing
 * Visual Identity: Green & White Mobile-First Inspection System
 */

import { renderFileDropzone } from '../components/FileDropzone.js';
import { renderButton } from '../components/Button.js';
import { renderAlert } from '../components/Alert.js';
import { icons } from '../assets/icons.js';
import { inspectionContext } from '../context/InspectionContext.js';
import { submitScan } from '../services/inspectionService.js';
import { router } from '../utils/router.js';
import { validateImageFile } from '../utils/validators.js';

export function renderScanPage() {
  const state = inspectionContext.getState();

  // ── Technical Processing Screen Pipeline (Section 8) ────────────────────────
  if (state.isLoading) {
    return `
      <div class="processing-pipeline-card animate-fade-in">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--primary-100); color: var(--primary-600); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-3);">
          <div class="animate-spin" style="width: 28px; height: 28px; border: 3px solid var(--primary-200); border-top-color: var(--primary-600); border-radius: 50%;"></div>
        </div>

        <h3 style="font-size: var(--text-lg); font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
          Processing Package Evidence
        </h3>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); max-width: 380px; margin: 0 auto;">
          ${state.loadingMessage || 'Evaluating physical commodities against Legal Metrology Rules, 2011'}
        </p>

        <!-- Technical Pipeline Steps -->
        <div class="pipeline-step-list">
          <div class="pipeline-step-item">
            <span class="step-indicator-icon step-done">✓</span>
            <span style="font-weight: 600; color: var(--primary-800);">Image received & authenticated</span>
          </div>

          <div class="pipeline-step-item">
            <span class="step-indicator-icon step-done">✓</span>
            <span style="font-weight: 600; color: var(--primary-800);">Image quality & orientation checked</span>
          </div>

          <div class="pipeline-step-item">
            <span class="step-indicator-icon step-done">✓</span>
            <span style="font-weight: 600; color: var(--primary-800);">Reading package text (PaddleOCR)</span>
          </div>

          <div class="pipeline-step-item" style="border-color: var(--primary-400); background: var(--bg-mint);">
            <span class="step-indicator-icon step-active">●</span>
            <span style="font-weight: 700; color: var(--primary-900);">Extracting statutory declarations</span>
          </div>

          <div class="pipeline-step-item" style="opacity: 0.85;">
            <span class="step-indicator-icon step-pending">○</span>
            <span style="color: var(--text-secondary);">Checking applicable rules (Rules 6–26)</span>
          </div>

          <div class="pipeline-step-item" style="opacity: 0.7;">
            <span class="step-indicator-icon step-pending">○</span>
            <span style="color: var(--text-secondary);">Preparing evidence dossier</span>
          </div>
        </div>

        <!-- Technical Pipeline Breadcrumb Banner -->
        <div class="pipeline-chain-bar">
          <span>IMAGE</span>
          <span>→</span>
          <span>OCR</span>
          <span>→</span>
          <span>EXTRACTION</span>
          <span>→</span>
          <span>RULE CHECK</span>
          <span>→</span>
          <span>EVIDENCE</span>
          <span>→</span>
          <span>REVIEW</span>
        </div>
      </div>
    `;
  }

  const hasSurfaces = state.surfaces.length > 0;
  const hasBack = state.surfaces.some(s => s.surface === 'BACK');
  const hasFront = state.surfaces.some(s => s.surface === 'FRONT');

  return `
    <div class="scan-page-container animate-fade-in" style="max-width: 680px; margin: 0 auto;">
      <!-- Page Header -->
      <div style="margin-bottom: var(--space-4);">
        <div style="display: inline-flex; align-items: center; gap: 6px; background: var(--primary-100); color: var(--primary-700); padding: 3px 10px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-2); border: 1px solid var(--primary-200);">
          ${icons.shieldCheck} AI ASSISTS • INSPECTOR DECIDES
        </div>
        <h1 style="font-size: clamp(1.4rem, 5vw, 1.85rem); font-weight: 800; color: var(--text-primary); margin: 0;">
          New Inspection
        </h1>
        <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px;">
          Capture package evidence to begin inspection.
        </p>
      </div>

      <!-- Ingestion Error Alert -->
      ${state.error ? `
        <div style="margin-bottom: var(--space-4);">
          ${renderAlert({
            type: 'danger',
            title: 'Inspection Error',
            message: state.error,
          })}
        </div>
      ` : ''}

      <!-- Multi-Surface Evidence Dropzone -->
      <div class="card" style="margin-bottom: var(--space-4); padding: var(--space-4);">
        ${renderFileDropzone(state.surfaces)}
      </div>

      <!-- Optional Client Field Hints Accordion -->
      <div class="card" style="margin-bottom: var(--space-4); padding: var(--space-3) var(--space-4);">
        <details id="advanced-hints-accordion">
          <summary style="cursor: pointer; font-weight: 600; font-size: var(--text-xs); color: var(--text-secondary); display: flex; align-items: center; justify-content: space-between; user-select: none; padding: 4px 0;">
            <span style="display: flex; align-items: center; gap: var(--space-2);">
              ${icons.sparkles} Optional Field Hints & Scenario OCR Override
            </span>
            <span style="font-size: 11px; color: var(--primary-600); font-weight: 600;">(Expand)</span>
          </summary>

          <div style="margin-top: var(--space-3); border-top: 1px solid var(--border-default); padding-top: var(--space-3);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-3);">
              <div>
                <label class="form-label" for="hint-product-name">Product Name Hint</label>
                <input type="text" id="hint-product-name" class="form-input" placeholder="e.g. Pure Fine Sugar" value="${state.clientHints.productName || ''}">
              </div>
              <div>
                <label class="form-label" for="hint-manufacturer">Manufacturer Hint</label>
                <input type="text" id="hint-manufacturer" class="form-input" placeholder="e.g. Apex Foods, Delhi" value="${state.clientHints.manufacturer || ''}">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-3);">
              <div>
                <label class="form-label" for="hint-net-qty">Net Quantity Hint</label>
                <input type="text" id="hint-net-qty" class="form-input" placeholder="e.g. 1 kg" value="${state.clientHints.netQuantity || ''}">
              </div>
              <div>
                <label class="form-label" for="hint-mrp">MRP Hint</label>
                <input type="text" id="hint-mrp" class="form-input" placeholder="e.g. Rs. 48.00" value="${state.clientHints.mrp || ''}">
              </div>
            </div>

            <div>
              <label class="form-label" for="hint-ocr-text">
                Direct Label Text Override (Scenario Testing)
              </label>
              <textarea id="hint-ocr-text" class="form-textarea" rows="2" placeholder="Paste raw label text lines here...">${state.clientHints.ocrText || ''}</textarea>
            </div>
          </div>
        </details>
      </div>

      <!-- Action Footer: Analyze Package -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); padding-top: var(--space-2);">
        ${renderButton({
          id: 'btn-reset-scan',
          text: 'Clear All',
          variant: 'ghost',
          disabled: !hasSurfaces && !state.clientHints.ocrText,
        })}

        ${renderButton({
          id: 'btn-submit-scan',
          text: hasSurfaces ? `Analyze Package (${state.surfaces.length} Surface${state.surfaces.length > 1 ? 's' : ''})` : 'Analyze Package',
          variant: 'primary',
          size: 'lg',
          icon: icons.arrowRight,
          disabled: !hasSurfaces && !state.clientHints.ocrText,
        })}
      </div>
    </div>
  `;
}

export function attachScanPageEvents() {
  const state = inspectionContext.getState();

  // Multi-file browse input
  const fileInputMulti = document.getElementById('file-input-multi');
  if (fileInputMulti) {
    fileInputMulti.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      const validFiles = [];
      for (const f of files) {
        const check = validateImageFile(f);
        if (!check.valid) {
          inspectionContext.setError(check.error);
          return;
        }
        validFiles.push(f);
      }
      if (validFiles.length > 0) {
        inspectionContext.addFiles(validFiles);
      }
    });
  }

  // Camera file input
  const fileInputCamera = document.getElementById('file-input-camera');
  if (fileInputCamera) {
    fileInputCamera.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        const check = validateImageFile(files[0]);
        if (!check.valid) {
          inspectionContext.setError(check.error);
          return;
        }
        inspectionContext.addFiles([files[0]]);
      }
    });
  }

  // Clear images
  const btnClear = document.getElementById('btn-clear-images');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      inspectionContext.clearSurfaces();
    });
  }

  const btnReset = document.getElementById('btn-reset-scan');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      inspectionContext.reset();
    });
  }

  // Surface remove buttons
  document.querySelectorAll('.btn-remove-surface').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(btn.dataset.index, 10);
      inspectionContext.removeSurface(idx);
    });
  });

  // Surface type selector dropdowns
  document.querySelectorAll('.select-surface-type').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = parseInt(sel.dataset.index, 10);
      inspectionContext.updateSurfaceType(idx, e.target.value);
    });
  });

  // Surface replace file input
  document.querySelectorAll('.file-input-replace').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const idx = parseInt(inp.dataset.index, 10);
      const file = e.target.files?.[0];
      if (file) {
        const check = validateImageFile(file);
        if (!check.valid) {
          inspectionContext.setError(check.error);
          return;
        }
        inspectionContext.replaceSurfaceFile(idx, file);
      }
    });
  });

  // Submit scan trigger
  const btnSubmit = document.getElementById('btn-submit-scan');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', async () => {
      const curr = inspectionContext.getState();
      const files = curr.surfaces.map(s => s.file);

      // Collect client hints
      const productName = document.getElementById('hint-product-name')?.value || '';
      const manufacturer = document.getElementById('hint-manufacturer')?.value || '';
      const netQty = document.getElementById('hint-net-qty')?.value || '';
      const mrp = document.getElementById('hint-mrp')?.value || '';
      const ocrText = document.getElementById('hint-ocr-text')?.value || '';

      inspectionContext.setClientHints({
        productName,
        manufacturer,
        netQuantity: netQty,
        mrp,
        ocrText,
      });

      try {
        inspectionContext.setLoading(true, 'Extracting statutory declarations & aligning text blocks...');
        const res = await submitScan({
  files,
  productName,
  manufacturer,
  netQuantity: netQty,
  mrp,
  ocrText,
});

if (res && res.data) {
  inspectionContext.setScanResult(res.data);
  inspectionContext.setLoading(false);
  router.navigate(`/inspections/${res.data.id}/review`);
} else {
  throw new Error(res?.message || 'Server returned an invalid inspection response.');
}
      } catch (err) {
        console.error('Scan submission error:', err);
        inspectionContext.setError(err.message || 'Failed to analyze package.');
      }
    });
  }

  // Lightbox previews
  document.querySelectorAll('.btn-lightbox-preview').forEach(el => {
    el.addEventListener('click', () => {
      const src = el.dataset.src;
      const modal = document.getElementById('lightbox-modal');
      const img = document.getElementById('lightbox-image');
      if (modal && img) {
        img.src = src;
        modal.classList.remove('sr-only');
      }
    });
  });

  const lightboxClose = document.getElementById('lightbox-close-btn');
  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      const modal = document.getElementById('lightbox-modal');
      if (modal) modal.classList.add('sr-only');
    });
  }
}
