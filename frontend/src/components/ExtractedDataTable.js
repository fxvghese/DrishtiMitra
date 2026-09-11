/**
 * DrishtiMitra - ExtractedDataTable Component
 * Renders structured OCR extractions in clean inspection cards with confidence indicators:
 * - ✓ High confidence (Soft green pill)
 * - ⚠ Needs review (Soft amber pill)
 * - ? Insufficient evidence (Soft gray/neutral pill)
 * Visual Identity: Green & White inspection card format
 */

import { icons } from '../assets/icons.js';
import { formatConfidence } from '../utils/formatters.js';

export function renderExtractedDataTable(extractedData = {}, capturedSurfaces = []) {
  const hasBack = capturedSurfaces.some(s => s.surface === 'BACK');
  const hasFront = capturedSurfaces.some(s => s.surface === 'FRONT');

  const fields = [
    { key: 'product_name', label: 'Product / Generic Name', rule: 'Rule 6(1)(a)', expectedSurface: 'FRONT' },
    { key: 'net_quantity', label: 'Net Quantity', rule: 'Rule 11, 12, 13', expectedSurface: 'FRONT' },
    { key: 'mrp', label: 'Maximum Retail Price (MRP)', rule: 'Rule 6(1)(e)', expectedSurface: 'BACK' },
    { key: 'manufacturer', label: 'Manufacturer / Packer / Importer', rule: 'Rule 6(1)(b) & 10', expectedSurface: 'BACK' },
    { key: 'address', label: 'Address & Premise Details', rule: 'Rule 10', expectedSurface: 'BACK' },
    { key: 'date', label: 'Date of Mfg / Packaging', rule: 'Rule 6(1)(d) & 16', expectedSurface: 'BACK' },
    { key: 'consumer_care', label: 'Consumer Care Contact', rule: 'Rule 6(1)(h) & 24', expectedSurface: 'BACK' },
    { key: 'country_of_origin', label: 'Country of Origin (Imported)', rule: 'Rule 6(10)', expectedSurface: 'BACK' },
  ];

  const overallConfidence = extractedData.extraction_confidence ?? 95.0;

  function getFieldIntegrity(field, value) {
    const isPresent = Boolean(value && String(value).trim());
    if (isPresent) {
      if (overallConfidence < 65) {
        return {
          type: 'NEEDS_REVIEW',
          badge: '⚠ Needs review',
          badgeClass: 'badge badge-review',
          note: 'Detected with moderate confidence. Inspector verification advised.',
        };
      }
      return {
        type: 'CONFIDENT',
        badge: '✓ High confidence',
        badgeClass: 'badge badge-compliant',
        note: null,
      };
    }

    // Value missing
    if (field.expectedSurface === 'BACK' && !hasBack && capturedSurfaces.length > 0) {
      return {
        type: 'INSUFFICIENT',
        badge: '? Insufficient evidence',
        badgeClass: 'badge badge-neutral',
        note: 'Back information panel not captured in evidence.',
      };
    }

    return {
      type: 'POTENTIAL_ISSUE',
      badge: '⚠ Needs review',
      badgeClass: 'badge badge-review',
      note: 'Not detected on captured surfaces. Check physical label.',
    };
  }

  return `
    <div class="extracted-data-wrapper">
      <!-- Statutory Verification Banner -->
      <div style="background: var(--bg-mint); border: 1px solid var(--bg-mint-border); border-radius: var(--radius-xl); padding: var(--space-3) var(--space-4); margin-bottom: var(--space-4); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2);">
        <div style="display: flex; align-items: center; gap: var(--space-2);">
          <span style="color: var(--primary-600);">${icons.shieldCheck}</span>
          <span style="font-size: var(--text-xs); color: var(--primary-900); font-weight: 600;">
            AI/OCR extracted declarations requiring officer verification where necessary.
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: var(--space-2);">
          <span style="font-size: 11px; color: var(--text-secondary);">Overall Confidence:</span>
          <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--primary-700); background: #FFFFFF; padding: 2px 8px; border-radius: var(--radius-full); border: 1px solid var(--bg-mint-border);">
            ${formatConfidence(overallConfidence)}
          </span>
        </div>
      </div>

      <!-- Clean Cards List -->
      <div style="display: flex; flex-direction: column; gap: var(--space-2);">
        ${fields.map(f => {
          const val = extractedData[f.key];
          const integrity = getFieldIntegrity(f, val);
          const isPresent = Boolean(val && String(val).trim());

          return `
            <div class="card" style="padding: var(--space-3) var(--space-4); border: 1px solid var(--border-default); border-radius: var(--radius-xl); background: #FFFFFF;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-1); gap: var(--space-2); flex-wrap: wrap;">
                <div>
                  <span style="font-weight: 700; font-size: var(--text-sm); color: var(--text-primary);">${f.label}</span>
                  <span style="font-size: 11px; color: var(--text-secondary); margin-left: 6px; font-family: var(--font-mono);">${f.rule}</span>
                </div>
                <span class="${integrity.badgeClass}">
                  ${integrity.badge}
                </span>
              </div>

              <div style="background: var(--bg-surface-raised); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-2) var(--space-3); margin-top: 4px; word-break: break-word;">
                ${isPresent ? `
                  <span style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-primary); font-weight: 600;">
                    ${val}
                  </span>
                ` : `
                  <span style="color: var(--text-muted); font-style: italic; font-size: 11px;">
                    ${integrity.note || 'Declaration not detected in captured evidence'}
                  </span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
