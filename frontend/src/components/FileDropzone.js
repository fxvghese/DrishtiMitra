/**
 * DrishtiMitra - FileDropzone Component
 * Multi-surface drag-and-drop & camera capture zone with surface-tagging
 * Supports: FRONT (Display), BACK (Information), SIDE (Barcode/Batch), OTHER
 */

import { icons } from '../assets/icons.js';

export function renderFileDropzone(surfaces = []) {
  const hasFront = surfaces.some(s => s.surface === 'FRONT');
  const hasBack = surfaces.some(s => s.surface === 'BACK');
  const hasSide = surfaces.some(s => s.surface === 'SIDE');

  return `
    <div class="dropzone-wrapper">
      <!-- Surface Completeness Guidance Checklist -->
      <div class="surface-checklist" style="display: flex; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-4); padding: var(--space-3); background: var(--bg-surface-raised); border-radius: var(--radius-lg); border: 1px solid var(--border-glass);">
        <div style="flex: 1; min-width: 140px; display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-xs);">
          <span style="color: ${hasFront ? 'var(--color-success-text)' : 'var(--text-muted)'}; font-weight: 700;">
            ${hasFront ? '✓' : '○'}
          </span>
          <span style="color: ${hasFront ? 'var(--text-primary)' : 'var(--text-muted)'}; font-weight: ${hasFront ? '600' : '400'};">
            Front (Brand & Net Qty)
          </span>
        </div>

        <div style="flex: 1; min-width: 140px; display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-xs);">
          <span style="color: ${hasBack ? 'var(--color-success-text)' : 'var(--text-muted)'}; font-weight: 700;">
            ${hasBack ? '✓' : '○'}
          </span>
          <span style="color: ${hasBack ? 'var(--text-primary)' : 'var(--text-muted)'}; font-weight: ${hasBack ? '600' : '400'};">
            Back (MRP, Mfg, Dates)
          </span>
        </div>

        <div style="flex: 1; min-width: 140px; display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-xs);">
          <span style="color: ${hasSide ? 'var(--color-success-text)' : 'var(--text-muted)'}; font-weight: 700;">
            ${hasSide ? '✓' : '○'}
          </span>
          <span style="color: ${hasSide ? 'var(--text-primary)' : 'var(--text-muted)'}; font-weight: ${hasSide ? '600' : '400'};">
            Side / Other (Barcode)
          </span>
        </div>
      </div>

      <!-- Main Ingestion Area -->
      <div id="dropzone" class="dropzone">
        <div class="dropzone-icon">
          ${icons.uploadCloud}
        </div>
        <div>
          <h4 style="font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
            Capture Multi-Surface Package Evidence
          </h4>
          <p style="font-size: var(--text-xs); color: var(--text-muted); max-width: 440px; margin: 0 auto;">
            Capture Front (display) and Back (statutory information) surfaces for complete rule audit. Supported: JPEG, PNG, WEBP.
          </p>
        </div>

        <div class="dropzone-btn-group" style="display: flex; gap: var(--space-3); margin-top: var(--space-3); flex-wrap: wrap; justify-content: center; width: 100%; max-width: 420px;">
          <label class="btn btn-secondary" style="cursor: pointer; flex: 1; min-width: 140px; justify-content: center;">
            ${icons.uploadCloud} Browse Files
            <input type="file" id="file-input-multi" multiple accept="image/jpeg,image/png,image/webp,image/heic" style="display: none;">
          </label>
          <label class="btn btn-primary" style="cursor: pointer; flex: 1; min-width: 140px; justify-content: center;">
            ${icons.camera} Take Photo
            <input type="file" id="file-input-camera" accept="image/*" capture="environment" style="display: none;">
          </label>
        </div>
      </div>

      <!-- Captured Surfaces List / Grid -->
      ${surfaces.length > 0 ? `
        <div style="margin-top: var(--space-5);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3); flex-wrap: wrap; gap: var(--space-2);">
            <div>
              <span style="font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
                Captured Surfaces (${surfaces.length})
              </span>
              ${!hasBack ? `
                <div style="font-size: 11px; color: var(--color-warning-text); margin-top: 2px;">
                  ⚠️ Back panel not yet captured. Add Back panel to avoid "Insufficient evidence" for MRP and Manufacturer.
                </div>
              ` : ''}
            </div>

            <button type="button" id="btn-clear-images" class="btn btn-ghost btn-sm" style="color: var(--color-danger); padding: 4px 10px;">
              ${icons.trash} Clear All Surfaces
            </button>
          </div>

          <div class="surfaces-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: var(--space-4);">
            ${surfaces.map((surf, idx) => {
              const previewUrl = surf.previewUrl || surf;
              const surfaceType = surf.surface || (idx === 0 ? 'FRONT' : (idx === 1 ? 'BACK' : 'SIDE'));
              const surfaceBadgeColor = surfaceType === 'FRONT' ? 'var(--primary-400)' :
                surfaceType === 'BACK' ? 'var(--color-success-text)' :
                surfaceType === 'SIDE' ? '#a855f7' : 'var(--text-muted)';
              const surfaceBadgeBg = surfaceType === 'FRONT' ? 'rgba(59, 130, 246, 0.15)' :
                surfaceType === 'BACK' ? 'rgba(16, 185, 129, 0.15)' :
                surfaceType === 'SIDE' ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-surface-raised)';

              return `
                <div class="surface-card card card-glass animate-fade-in" style="padding: var(--space-3); display: flex; flex-direction: column; gap: var(--space-2); position: relative;">
                  <!-- Header: Surface Badge & Remove -->
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-2);">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: var(--radius-full); background: ${surfaceBadgeBg}; color: ${surfaceBadgeColor}; border: 1px solid ${surfaceBadgeColor}44;">
                        ${surfaceType}
                      </span>
                      <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
                        #${idx + 1}
                      </span>
                    </div>

                    <button type="button" class="btn-remove-surface" data-index="${idx}" title="Remove surface" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 2px 6px; font-size: 18px; line-height: 1;">
                      &times;
                    </button>
                  </div>

                  <!-- Thumbnail Image -->
                  <div style="width: 100%; height: 160px; border-radius: var(--radius-md); overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-glass);">
                    <img src="${previewUrl}" alt="Surface ${idx + 1}" style="width: 100%; height: 100%; object-fit: contain;" />
                  </div>

                  <!-- Surface Tag Selector -->
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); margin-top: var(--space-1);">
                    <select class="form-select select-surface-type" data-index="${idx}" style="font-size: var(--text-xs); padding: 4px 8px; height: auto;">
                      <option value="FRONT" ${surfaceType === 'FRONT' ? 'selected' : ''}>Front Display</option>
                      <option value="BACK" ${surfaceType === 'BACK' ? 'selected' : ''}>Back Information</option>
                      <option value="SIDE" ${surfaceType === 'SIDE' ? 'selected' : ''}>Side / Barcode</option>
                      <option value="OTHER" ${surfaceType === 'OTHER' ? 'selected' : ''}>Other Surface</option>
                    </select>

                    <label class="btn btn-secondary btn-sm" style="cursor: pointer; padding: 4px 8px; font-size: 11px; white-space: nowrap;">
                      Replace
                      <input type="file" class="file-input-replace" data-index="${idx}" accept="image/*" style="display: none;">
                    </label>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}
