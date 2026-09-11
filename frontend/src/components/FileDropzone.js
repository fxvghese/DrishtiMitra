/**
 * DrishtiMitra - FileDropzone Component
 * Multi-surface evidence ingestion matching green & white mobile reference
 * Supports: FRONT (Display), BACK (Information), SIDE, OTHER
 * Features: View, Replace, Remove per captured surface, and completeness indicator
 */

import { icons } from '../assets/icons.js';

export function renderFileDropzone(surfaces = []) {
  const hasFront = surfaces.some(s => s.surface === 'FRONT');
  const hasBack = surfaces.some(s => s.surface === 'BACK');
  const hasSide = surfaces.some(s => s.surface === 'SIDE');

  return `
    <div class="dropzone-wrapper">
      <!-- Evidence Completeness Status Header -->
      <div style="background: var(--bg-mint); border: 1px solid var(--bg-mint-border); border-radius: var(--radius-2xl); padding: var(--space-3) var(--space-4); margin-bottom: var(--space-4);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2); margin-bottom: 6px;">
          <span style="font-size: var(--text-xs); font-weight: 700; color: var(--primary-800); text-transform: uppercase; letter-spacing: 0.03em;">
            Evidence Collected: ${surfaces.length} surface${surfaces.length === 1 ? '' : 's'}
          </span>
          <span class="badge ${surfaces.length >= 2 ? 'badge-compliant' : (surfaces.length === 1 ? 'badge-review' : 'badge-neutral')}">
            ${surfaces.length >= 2 ? '✓ Evidence Complete' : (surfaces.length === 1 ? '⚠ Partial (Add Back Panel)' : 'Awaiting Photos')}
          </span>
        </div>

        <div style="display: flex; gap: var(--space-2); flex-wrap: wrap; font-size: var(--text-xs);">
          <span style="display: inline-flex; align-items: center; gap: 4px; color: ${hasFront ? 'var(--primary-700)' : 'var(--text-secondary)'}; font-weight: ${hasFront ? '700' : '400'};">
            <span>${hasFront ? '✓' : '○'}</span> Front (Brand & Net Qty)
          </span>
          <span style="color: var(--border-hover);">•</span>
          <span style="display: inline-flex; align-items: center; gap: 4px; color: ${hasBack ? 'var(--primary-700)' : 'var(--text-secondary)'}; font-weight: ${hasBack ? '700' : '400'};">
            <span>${hasBack ? '✓' : '○'}</span> Back (MRP, Mfg, Dates)
          </span>
          <span style="color: var(--border-hover);">•</span>
          <span style="display: inline-flex; align-items: center; gap: 4px; color: ${hasSide ? 'var(--primary-700)' : 'var(--text-secondary)'}; font-weight: ${hasSide ? '700' : '400'};">
            <span>${hasSide ? '✓' : '○'}</span> Side/Other (Barcode)
          </span>
        </div>
      </div>

      <!-- Ingestion Dropzone & Two Primary Action Buttons -->
      <div id="dropzone" class="dropzone" style="margin-bottom: var(--space-4);">
        <div class="dropzone-icon">
          ${icons.camera}
        </div>
        <div>
          <h4 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
            Add Package Evidence
          </h4>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); max-width: 380px; margin: 0 auto;">
            Capture or choose photos of package panels. Supported formats: JPEG, PNG, WEBP.
          </p>
        </div>

        <!-- Primary Actions: [ 📷 Capture Package ] & [ Upload Image ] -->
        <div style="display: flex; gap: var(--space-3); margin-top: var(--space-2); flex-wrap: wrap; justify-content: center; width: 100%; max-width: 420px;">
          <label class="btn btn-primary" style="cursor: pointer; flex: 1; min-width: 150px; justify-content: center;">
            ${icons.camera} Capture Package
            <input type="file" id="file-input-camera" accept="image/*" capture="environment" style="display: none;">
          </label>
          <label class="btn btn-secondary" style="cursor: pointer; flex: 1; min-width: 150px; justify-content: center;">
            ${icons.gallery} Upload Image
            <input type="file" id="file-input-multi" multiple accept="image/jpeg,image/png,image/webp" style="display: none;">
          </label>
        </div>
      </div>

      <!-- Captured Surfaces Thumbnails Grid -->
      ${surfaces.length > 0 ? `
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3); flex-wrap: wrap; gap: var(--space-2);">
            <h3 style="font-size: var(--text-sm); font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.03em;">
              Surfaces Captured (${surfaces.length})
            </h3>
            <button type="button" id="btn-clear-images" class="btn btn-ghost btn-sm" style="color: var(--color-danger); font-size: 11px; padding: 2px 8px;">
              ${icons.trash} Remove All
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: var(--space-3);">
            ${surfaces.map((surf, idx) => {
              const previewUrl = surf.previewUrl || surf;
              const surfaceType = surf.surface || (idx === 0 ? 'FRONT' : (idx === 1 ? 'BACK' : 'SIDE'));

              return `
                <div class="card card-surface-thumb animate-fade-in" style="padding: var(--space-3); border-radius: var(--radius-xl); border: 1px solid var(--border-default); background: #FFFFFF;">
                  <!-- Thumbnail Header: Surface Tag + Remove -->
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span class="badge ${surfaceType === 'FRONT' ? 'badge-info' : (surfaceType === 'BACK' ? 'badge-compliant' : 'badge-neutral')}" style="font-size: 10px; font-weight: 700;">
                        ${surfaceType}
                      </span>
                      <span style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono);">
                        #${idx + 1}
                      </span>
                    </div>

                    <button type="button" class="btn-remove-surface" data-index="${idx}" title="Remove surface" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 2px 6px; font-size: 18px; line-height: 1;">
                      &times;
                    </button>
                  </div>

                  <!-- Large Thumbnail Preview with Click to Zoom -->
                  <div style="width: 100%; height: 170px; border-radius: var(--radius-lg); overflow: hidden; background: #F8FAFC; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-default); position: relative; cursor: pointer;" class="btn-lightbox-preview" data-src="${previewUrl}">
                    <img src="${previewUrl}" alt="Package Surface ${idx + 1}" style="width: 100%; height: 100%; object-fit: contain;" />
                    <span style="position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.55); color: #FFF; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
                      ${icons.eye} View
                    </span>
                  </div>

                  <!-- Surface Tag Selector & Replace Button -->
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); margin-top: var(--space-2);">
                    <select class="form-select select-surface-type" data-index="${idx}" style="font-size: var(--text-xs); padding: 4px 8px; border-radius: var(--radius-md);">
                      <option value="FRONT" ${surfaceType === 'FRONT' ? 'selected' : ''}>Front (Display)</option>
                      <option value="BACK" ${surfaceType === 'BACK' ? 'selected' : ''}>Back (Details)</option>
                      <option value="SIDE" ${surfaceType === 'SIDE' ? 'selected' : ''}>Side (Barcode)</option>
                      <option value="OTHER" ${surfaceType === 'OTHER' ? 'selected' : ''}>Other Surface</option>
                    </select>

                    <label class="btn btn-secondary btn-sm" style="cursor: pointer; padding: 4px 10px; font-size: 11px; white-space: nowrap;">
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
