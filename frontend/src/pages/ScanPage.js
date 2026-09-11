/**
 * DrishtiMitra - ScanPage Component
 * Multi-surface evidence ingestion (Front, Back, Side, Other), image preview,
 * client hints, and PaddleOCR initiation with failure recovery
 */

import { renderFileDropzone } from '../components/FileDropzone.js';
import { renderButton } from '../components/Button.js';
import { renderAlert } from '../components/Alert.js';
import { renderLoadingSpinner } from '../components/LoadingSpinner.js';
import { icons } from '../assets/icons.js';
import { inspectionContext } from '../context/InspectionContext.js';
import { submitScan } from '../services/inspectionService.js';
import { router } from '../utils/router.js';
import { validateImageFile } from '../utils/validators.js';

export function renderScanPage() {
  const state = inspectionContext.getState();

  if (state.isLoading) {
    return `
      <div class="card card-glass animate-fade-in" style="max-width: 720px; margin: var(--space-8) auto; text-align: center;">
        ${renderLoadingSpinner(state.loadingMessage || 'Uploading package surfaces & executing PaddleOCR extraction...')}
        <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-2);">
          Preprocessing multi-surface images, aligning text blocks, and extracting statutory declarations.
        </p>
      </div>
    `;
  }

  const hasSurfaces = state.surfaces.length > 0;
  const hasBack = state.surfaces.some(s => s.surface === 'BACK');
  const hasFront = state.surfaces.some(s => s.surface === 'FRONT');

  return `
    <div class="scan-page-container animate-fade-in" style="max-width: 880px; margin: 0 auto;">
      <!-- Hero Header -->
      <div style="text-align: center; margin-bottom: var(--space-6);">
        <div style="display: inline-flex; align-items: center; gap: var(--space-2); background: rgba(59,130,246,0.12); color: var(--primary-400); padding: 5px 14px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; border: 1px solid rgba(59,130,246,0.28); margin-bottom: var(--space-3); letter-spacing: 0.04em;">
          ${icons.shieldCheck} AI ASSISTS. INSPECTOR DECIDES.
        </div>
        <h1 style="font-size: var(--text-3xl); font-weight: 800; color: var(--text-primary); letter-spacing: -0.025em; line-height: 1.2;">
          New Statutory Package Inspection
        </h1>
        <p style="font-size: var(--text-base); color: var(--text-secondary); max-width: 640px; margin: var(--space-2) auto 0; line-height: 1.6;">
          Capture or upload multi-surface package evidence (Front, Back, Side). DrishtiMitra extracts statutory declarations for officer verification under Legal Metrology Rules, 2011.
        </p>

        <!-- Statutory Feature Chips -->
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-2); margin-top: var(--space-4);">
          <span style="font-size: var(--text-xs); color: var(--text-secondary); background: var(--bg-surface-raised); border: 1px solid var(--border-glass); padding: 3px 10px; border-radius: var(--radius-full); display: inline-flex; align-items: center; gap: 5px;">
            <span style="color: var(--color-success-text);">&#10003;</span> Multi-Surface Fusion
          </span>
          <span style="font-size: var(--text-xs); color: var(--text-secondary); background: var(--bg-surface-raised); border: 1px solid var(--border-glass); padding: 3px 10px; border-radius: var(--radius-full); display: inline-flex; align-items: center; gap: 5px;">
            <span style="color: var(--color-success-text);">&#10003;</span> PaddleOCR Extractions
          </span>
          <span style="font-size: var(--text-xs); color: var(--text-secondary); background: var(--bg-surface-raised); border: 1px solid var(--border-glass); padding: 3px 10px; border-radius: var(--radius-full); display: inline-flex; align-items: center; gap: 5px;">
            <span style="color: var(--color-success-text);">&#10003;</span> Human Officer Overrule
          </span>
          <span style="font-size: var(--text-xs); color: var(--text-secondary); background: var(--bg-surface-raised); border: 1px solid var(--border-glass); padding: 3px 10px; border-radius: var(--radius-full); display: inline-flex; align-items: center; gap: 5px;">
            <span style="color: var(--color-success-text);">&#10003;</span> Audit Dossier & Stamp
          </span>
        </div>
      </div>

      <!-- Failure Recovery Banner -->
      ${state.error ? `
        <div class="card card-glass animate-fade-in" style="margin-bottom: var(--space-6); border-color: var(--color-danger-border); background: rgba(239, 68, 68, 0.05); padding: var(--space-4);">
          <div style="display: flex; align-items: flex-start; gap: var(--space-3);">
            <div style="color: var(--color-danger); font-size: 20px;">
              ${icons.alertTriangle}
            </div>
            <div style="flex: 1;">
              <h4 style="font-weight: 700; color: var(--color-danger-text); margin-bottom: 2px;">
                Inspection Ingestion Issue
              </h4>
              <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-3);">
                ${state.error}
              </p>
              <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
                ${renderButton({
                  id: 'btn-retry-scan',
                  text: 'Retry Analysis',
                  variant: 'primary',
                  size: 'sm',
                  icon: icons.refresh,
                })}
                <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                  ${icons.camera} Retake Image
                  <input type="file" id="file-input-retake" accept="image/*" capture="environment" style="display: none;">
                </label>
                <label class="btn btn-ghost btn-sm" style="cursor: pointer;">
                  + Capture Another Surface
                  <input type="file" id="file-input-add-surface" accept="image/*" style="display: none;">
                </label>
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Surface Coverage Advisory -->
      ${hasSurfaces && hasFront && !hasBack ? `
        <div class="alert alert-warning animate-fade-in" style="margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: var(--color-warning-text); font-size: var(--text-sm);">
          ${icons.info}
          <div>
            <strong>Partial Evidence Captured:</strong> Only the Front display panel is selected. Statutory information declarations (Manufacturer address, MRP, Date, and Consumer Care) usually appear on the Back information panel. Add the Back panel to avoid "Insufficient evidence" in the statutory evaluation.
          </div>
        </div>
      ` : ''}

      <!-- Main Upload & Evidence Card -->
      <div class="card card-glass" style="margin-bottom: var(--space-6);">
        <div class="card-header">
          <div>
            <h3 class="card-title">${icons.camera} 1. Package Surface Evidence</h3>
            <p class="card-description">Upload or capture package surfaces. Assign Front, Back, or Side tags for multi-panel analysis.</p>
          </div>
          <span class="badge ${hasSurfaces ? 'badge-compliant' : 'badge-exempt'}">
            ${hasSurfaces ? `${state.surfaces.length} surface(s) selected` : 'Awaiting evidence'}
          </span>
        </div>

        <div class="card-body">
          ${renderFileDropzone(state.surfaces)}
        </div>
      </div>

      <!-- Optional Client Field Hints (Collapsible Accordion) -->
      <div class="card card-glass" style="margin-bottom: var(--space-6);">
        <details id="advanced-hints-accordion">
          <summary style="cursor: pointer; font-weight: 600; font-size: var(--text-sm); color: var(--text-secondary); display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) 0; user-select: none;">
            <span style="display: flex; align-items: center; gap: var(--space-2);">
              ${icons.sparkles} 2. Optional Field Hints & Client OCR Override (Scenario Testing)
            </span>
            <span style="font-size: 11px; color: var(--primary-400); font-family: var(--font-mono);">(Click to expand)</span>
          </summary>

          <div style="margin-top: var(--space-4); border-top: 1px solid var(--border-glass); padding-top: var(--space-4);">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="hint-product-name">Product Name Hint</label>
                <input type="text" id="hint-product-name" class="form-input" placeholder="e.g. Good Bakes Cookies" value="${state.clientHints.productName || ''}">
              </div>
              <div class="form-group">
                <label class="form-label" for="hint-manufacturer">Manufacturer Hint</label>
                <input type="text" id="hint-manufacturer" class="form-input" placeholder="e.g. Good Bakes Ltd, Mumbai" value="${state.clientHints.manufacturer || ''}">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="hint-net-qty">Net Quantity Hint</label>
                <input type="text" id="hint-net-qty" class="form-input" placeholder="e.g. 200 g" value="${state.clientHints.netQuantity || ''}">
              </div>
              <div class="form-group">
                <label class="form-label" for="hint-mrp">MRP Hint</label>
                <input type="text" id="hint-mrp" class="form-input" placeholder="e.g. Rs. 50" value="${state.clientHints.mrp || ''}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="hint-ocr-text">
                Raw OCR Text Override (Scenario Testing)
                <span class="form-hint">Simulate label extractions directly for fast scenario audits</span>
              </label>
              <textarea id="hint-ocr-text" class="form-textarea" placeholder="Paste raw label text lines here...">${state.clientHints.ocrText || ''}</textarea>
            </div>
          </div>
        </details>
      </div>

      <!-- Action Footer -->
      <div class="scan-action-footer" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4); padding: var(--space-2) 0;">
        <div style="font-size: var(--text-xs); color: var(--text-muted); display: flex; align-items: center; gap: var(--space-2); max-width: 440px;">
          ${icons.info}
          <span>Package photos are processed securely through PaddleOCR and stored with signed access.</span>
        </div>

        <div class="scan-action-buttons" style="display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: center;">
          ${renderButton({
            id: 'btn-reset-scan',
            text: 'Clear All',
            variant: 'ghost',
            disabled: !hasSurfaces && !state.clientHints.ocrText,
          })}

          ${renderButton({
            id: 'btn-submit-scan',
            text: hasSurfaces ? `Analyze Package (${state.surfaces.length} Surface${state.surfaces.length > 1 ? 's' : ''})` : 'Select Photos to Scan',
            variant: 'primary',
            size: 'lg',
            icon: icons.sparkles,
            disabled: !hasSurfaces && !state.clientHints.ocrText,
          })}
        </div>
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

  // Recovery retake input
  const fileInputRetake = document.getElementById('file-input-retake');
  if (fileInputRetake) {
    fileInputRetake.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        inspectionContext.clearSurfaces();
        inspectionContext.addFiles([files[0]]);
      }
    });
  }

  // Recovery add surface input
  const fileInputAddSurface = document.getElementById('file-input-add-surface');
  if (fileInputAddSurface) {
    fileInputAddSurface.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        inspectionContext.addFiles([files[0]]);
      }
    });
  }

  // Dropzone drag & drop
  const dropzone = document.getElementById('dropzone');
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('active');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('active');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = Array.from(e.dataTransfer.files || []);
      const validFiles = [];
      for (const f of files) {
        const check = validateImageFile(f);
        if (check.valid) {
          validFiles.push(f);
        }
      }
      if (validFiles.length > 0) {
        inspectionContext.addFiles(validFiles);
      }
    });
  }

  // Remove individual surface card
  document.querySelectorAll('.btn-remove-surface').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index, 10);
      inspectionContext.removeSurface(idx);
    });
  });

  // Change surface type tag
  document.querySelectorAll('.select-surface-type').forEach(select => {
    select.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      const newType = e.target.value;
      inspectionContext.updateSurfaceType(idx, newType);
    });
  });

  // Replace surface image file
  document.querySelectorAll('.file-input-replace').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        const check = validateImageFile(files[0]);
        if (check.valid) {
          inspectionContext.replaceSurface(idx, files[0]);
        } else {
          inspectionContext.setError(check.error);
        }
      }
    });
  });

  // Clear all surfaces
  const btnClearImages = document.getElementById('btn-clear-images');
  if (btnClearImages) {
    btnClearImages.addEventListener('click', () => {
      inspectionContext.clearSurfaces();
    });
  }

  // Clear Form
  const btnReset = document.getElementById('btn-reset-scan');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      inspectionContext.reset();
    });
  }

  // Bind Field Hints
  const bindHint = (id, key) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        inspectionContext.setHints({ [key]: e.target.value });
      });
    }
  };

  bindHint('hint-product-name', 'productName');
  bindHint('hint-manufacturer', 'manufacturer');
  bindHint('hint-net-qty', 'netQuantity');
  bindHint('hint-mrp', 'mrp');
  bindHint('hint-ocr-text', 'ocrText');

  // Submit Scan Flow
  const triggerScan = async () => {
    const currentState = inspectionContext.getState();
    const filesToUpload = currentState.uploadedFiles;
    const hints = currentState.clientHints;

    if (filesToUpload.length === 0 && !hints.ocrText) {
      inspectionContext.setError('Please capture or upload at least one package surface image to continue.');
      return;
    }

    try {
      inspectionContext.setLoading(true, 'Uploading package surfaces & executing PaddleOCR extraction...');
      
      const res = await submitScan({
        files: filesToUpload,
        ocrText: hints.ocrText,
        productName: hints.productName,
        manufacturer: hints.manufacturer,
        netQuantity: hints.netQuantity,
        mrp: hints.mrp,
      });

      if (res && res.data) {
        inspectionContext.setScanResult(res.data);
        inspectionContext.setLoading(false);
        router.navigate(`/inspections/${res.data.id}/review`);
      } else {
        throw new Error(res?.message || 'Server returned an invalid response structure.');
      }
    } catch (err) {
      console.error('Scan submission error:', err);
      inspectionContext.setError(err.message || 'Failed to process package scan. Please verify backend is running and retry.');
    }
  };

  const btnSubmit = document.getElementById('btn-submit-scan');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', triggerScan);
  }

  const btnRetry = document.getElementById('btn-retry-scan');
  if (btnRetry) {
    btnRetry.addEventListener('click', triggerScan);
  }
}
