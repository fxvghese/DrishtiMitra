/**
 * DrishtiMitra - ExtractedDataTable Component
 * Renders structured OCR extractions with integrity statuses:
 * - ✓ Confidently detected
 * - ⚠ Needs review
 * - ? Cannot verify (surface not captured)
 * - ✕ Potential issue (omission on captured surface)
 * Supports dual display (mobile cards vs desktop table)
 */

import { formatConfidence } from '../utils/formatters.js';

export function renderExtractedDataTable(extractedData = {}, capturedSurfaces = []) {
  const hasBack = capturedSurfaces.some(s => s.surface === 'BACK');
  const hasFront = capturedSurfaces.some(s => s.surface === 'FRONT');

  const fields = [
    { key: 'product_name', label: 'Product / Brand Name', rule: 'Rule 6', expectedSurface: 'FRONT' },
    { key: 'manufacturer', label: 'Manufacturer / Packer', rule: 'Rule 6 & 10', expectedSurface: 'BACK' },
    { key: 'net_quantity', label: 'Net Quantity', rule: 'Rule 11, 12, 13', expectedSurface: 'FRONT' },
    { key: 'mrp', label: 'Maximum Retail Price (MRP)', rule: 'Rule 6', expectedSurface: 'BACK' },
    { key: 'date', label: 'Mfg / Packaging Date', rule: 'Rule 6 & 16', expectedSurface: 'BACK' },
    { key: 'consumer_care', label: 'Consumer Care Contact', rule: 'Rule 6 & 24', expectedSurface: 'BACK' },
  ];

  const overallConfidence = extractedData.extraction_confidence ?? 95.0;

  function getFieldIntegrity(field, value) {
    const isPresent = Boolean(value && String(value).trim());
    if (isPresent) {
      if (overallConfidence < 65) {
        return {
          type: 'NEEDS_REVIEW',
          badge: '⚠ Needs review',
          badgeClass: 'chip-ambiguous',
          note: 'Detected with low OCR confidence. Physical verification advised.',
        };
      }
      return {
        type: 'CONFIDENT',
        badge: '✓ Confidently detected',
        badgeClass: 'chip-confident',
        note: null,
      };
    }

    // Value is not detected. Did we capture the expected surface?
    if (field.expectedSurface === 'BACK' && !hasBack && capturedSurfaces.length > 0) {
      return {
        type: 'CANNOT_VERIFY',
        badge: '? Cannot verify',
        badgeClass: 'chip-missing',
        note: 'Back information panel was not captured in evidence. Declaration cannot be verified.',
      };
    }

    return {
      type: 'POTENTIAL_ISSUE',
      badge: '✕ Potential issue',
      badgeClass: 'chip-missing',
      note: 'Not detected on captured package evidence. Possible omission under Rule 6.',
    };
  }

  return `
    <div class="extracted-data-wrapper">
      <!-- Confidence & Engine Meter Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); background: var(--bg-surface-raised); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-glass); flex-wrap: wrap; gap: var(--space-2);">
        <div>
          <span style="font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.04em;">
            AI Extraction Confidence
          </span>
          <div style="display: flex; align-items: center; gap: var(--space-3); margin-top: 4px;">
            <div style="width: 120px; height: 8px; background: rgba(255,255,255,0.1); border-radius: var(--radius-full); overflow: hidden;">
              <div style="width: ${Math.min(100, Math.max(0, overallConfidence))}%; height: 100%; background: linear-gradient(90deg, #10b981, #3b82f6); border-radius: var(--radius-full);"></div>
            </div>
            <span style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); font-family: var(--font-mono);">
              ${formatConfidence(overallConfidence)}
            </span>
          </div>
        </div>

        <div style="text-align: right;">
          <span style="font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase; font-weight: 700;">
            Model Engine
          </span>
          <div style="font-size: var(--text-xs); font-family: var(--font-mono); color: var(--color-info-text); font-weight: 600; margin-top: 2px;">
            PaddleOCR (PP-OCRv4)
          </div>
        </div>
      </div>

      <!-- Mobile Touch Cards View (< 768px) -->
      <div class="extracted-cards-mobile">
        ${fields.map(f => {
          const val = extractedData[f.key];
          const integrity = getFieldIntegrity(f, val);
          const isPresent = Boolean(val && String(val).trim());

          return `
            <div class="card card-glass" style="padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2); gap: var(--space-2); flex-wrap: wrap;">
                <div>
                  <div style="font-weight: 700; font-size: var(--text-sm); color: var(--text-primary);">${f.label}</div>
                  <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${f.rule}</div>
                </div>
                <span class="${integrity.badgeClass}" style="font-size: 11px;">
                  ${integrity.badge}
                </span>
              </div>

              <div style="background: var(--bg-surface-raised); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: var(--space-2) var(--space-3); word-break: break-word;">
                ${isPresent ? `
                  <span style="font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-primary); font-weight: 500;">
                    ${val}
                  </span>
                ` : `
                  <span style="color: var(--text-muted); font-style: italic; font-size: var(--text-xs);">
                    ${integrity.note || 'Not detected in evidence'}
                  </span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Desktop Table View (>= 768px) -->
      <div class="table-responsive extracted-table-desktop">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 26%;">Mandatory Field</th>
              <th style="width: 46%;">Detected Value</th>
              <th style="width: 28%; text-align: right;">Evidence Status</th>
            </tr>
          </thead>
          <tbody>
            ${fields.map(f => {
              const val = extractedData[f.key];
              const integrity = getFieldIntegrity(f, val);
              const isPresent = Boolean(val && String(val).trim());

              return `
                <tr>
                  <td>
                    <div style="font-weight: 600; color: var(--text-primary); font-size: var(--text-sm);">${f.label}</div>
                    <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">${f.rule}</div>
                  </td>
                  <td>
                    ${isPresent ? `
                      <span style="font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-primary); font-weight: 500;">
                        ${val}
                      </span>
                    ` : `
                      <span style="color: var(--text-muted); font-style: italic; font-size: var(--text-xs);">
                        ${integrity.note || 'Not detected'}
                      </span>
                    `}
                  </td>
                  <td style="text-align: right;">
                    <span class="${integrity.badgeClass}" style="display: inline-block;">
                      ${integrity.badge}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
