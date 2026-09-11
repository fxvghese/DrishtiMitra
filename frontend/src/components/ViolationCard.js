/**
 * DrishtiMitra - ViolationCard Component
 * Structured Finding Card fulfilling:
 * AI Assessment ↓ Evidence ↓ Applicable Requirement ↓ Inspector Verification [ACCEPT] [REJECT] ↓ Comment
 * Clearly separates AI recommendation from statutory human inspector decision
 */

import { renderStatusBadge } from './StatusBadge.js';
import { icons } from '../assets/icons.js';
import { LEGAL_RULES_REGISTRY } from '../utils/constants.js';

export function renderViolationCard(violation = {}, index = 0, inspectorDecision = {}) {
  const isFail = violation.status === 'FAIL';
  const ruleCode = violation.rule_code || `RULE-${violation.rule_number || index}`;
  const ruleMeta = LEGAL_RULES_REGISTRY[ruleCode] || {
    name: `Rule ${violation.rule_number || ''}`,
    description: 'Mandatory declaration statutory requirement under Legal Metrology (Packaged Commodities) Rules, 2011.',
    section: 'Legal Metrology Rules, 2011',
  };

  const currentDecision = inspectorDecision.decision || 'ACCEPT';
  const currentComment = inspectorDecision.comment || '';

  return `
    <div class="violation-card animate-fade-in" style="background: var(--bg-surface); border: 1px solid var(--border-glass-hover); border-radius: var(--radius-xl); padding: var(--space-5); margin-bottom: var(--space-5); box-shadow: var(--shadow-md);">
      <!-- Card Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3); border-bottom: 1px solid var(--border-glass); padding-bottom: var(--space-3);">
        <div style="display: flex; align-items: center; gap: var(--space-2);">
          <span style="color: ${isFail ? 'var(--color-danger)' : 'var(--color-warning)'};">
            ${isFail ? icons.xCircle : icons.alertTriangle}
          </span>
          <span style="font-weight: 800; font-size: var(--text-base); color: var(--text-primary);">
            Finding #${index + 1}: ${ruleMeta.name} (${ruleCode})
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-2);">
          ${renderStatusBadge(violation.severity || 'HIGH', 'severity')}
          <span class="badge ${isFail ? 'badge-non-compliant' : 'badge-review'}">
            ${isFail ? 'Potential Issue Identified' : 'Inspector Verification Required'}
          </span>
        </div>
      </div>

      <!-- 1. AI Assessment -->
      <div style="margin-bottom: var(--space-4); background: rgba(15, 23, 42, 0.6); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border-left: 3px solid var(--primary-500);">
        <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: 4px;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary-400); font-family: var(--font-mono);">
            1. AI Assessment (Recommendation Only)
          </span>
        </div>
        <p style="font-size: var(--text-sm); color: var(--text-primary); line-height: 1.45; margin: 0;">
          ${violation.reason || violation.message || 'Potential non-compliance identified during automated extraction review.'}
        </p>
      </div>

      <!-- 2. Evidence -->
      <div style="margin-bottom: var(--space-4); background: var(--bg-surface-raised); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-glass);">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 6px;">
          2. Package Evidence
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-4); font-size: var(--text-xs); font-family: var(--font-mono);">
          <span>Inspected Field: <strong style="color: var(--text-primary);">${violation.field_name || 'Declaration Field'}</strong></span>
          ${violation.detected_value ? `
            <span>Detected Text: <strong style="color: var(--primary-300);">${violation.detected_value}</strong></span>
          ` : `
            <span>Detected Text: <em style="color: var(--color-warning-text);">None detected in captured surfaces</em></span>
          `}
        </div>

        ${violation.bounding_box ? `
          <div style="margin-top: var(--space-2); font-size: 11px; color: var(--text-muted);">
            Evidence Coordinates: <code>[${violation.bounding_box.join(', ')}]</code>
          </div>
        ` : ''}
      </div>

      <!-- 3. Applicable Statutory Requirement -->
      <div style="margin-bottom: var(--space-5); padding: var(--space-3) var(--space-4); background: rgba(59, 130, 246, 0.05); border: 1px dashed rgba(59, 130, 246, 0.3); border-radius: var(--radius-lg);">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary-400); font-family: var(--font-mono); margin-bottom: 4px;">
          3. Applicable Statutory Requirement
        </div>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; margin: 0;">
          <strong>${ruleMeta.section || 'Legal Metrology (Packaged Commodities) Rules, 2011'}:</strong> ${ruleMeta.description}
        </p>
      </div>

      <!-- 4. Human Inspector Verification -->
      <div class="inspector-decision-block" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95)); border: 1px solid var(--primary-600)44; border-radius: var(--radius-lg); padding: var(--space-4);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3);">
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <span style="color: var(--color-warning);">${icons.shieldCheck}</span>
            <span style="font-weight: 800; font-size: var(--text-xs); text-transform: uppercase; color: var(--text-primary); letter-spacing: 0.05em;">
              4. Statutory Officer Determination
            </span>
          </div>

          <!-- Accept / Reject Toggle Buttons -->
          <div style="display: flex; gap: var(--space-2);">
            <button
              type="button"
              class="btn btn-sm btn-decision-toggle ${currentDecision === 'ACCEPT' ? 'btn-danger' : 'btn-secondary'}"
              data-rule-code="${ruleCode}"
              data-decision="ACCEPT"
              style="font-size: 11px; padding: 4px 12px; font-weight: 700;"
            >
              ${currentDecision === 'ACCEPT' ? '✓ Accepted Finding' : 'Accept Finding'}
            </button>

            <button
              type="button"
              class="btn btn-sm btn-decision-toggle ${currentDecision === 'REJECT' ? 'btn-success' : 'btn-secondary'}"
              data-rule-code="${ruleCode}"
              data-decision="REJECT"
              style="font-size: 11px; padding: 4px 12px; font-weight: 700;"
            >
              ${currentDecision === 'REJECT' ? '✓ Overruled by Officer' : 'Overrule / Dismiss'}
            </button>
          </div>
        </div>

        <!-- Inspector Comment -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between;">
            <span>Inspector Statutory Notes / Legal Basis:</span>
            <span style="font-size: 10px; color: var(--text-muted);">(Saved in official audit trail)</span>
          </label>
          <textarea
            class="form-textarea finding-inspector-comment"
            data-rule-code="${ruleCode}"
            placeholder="Enter officer notes or justification for accepting/overruling this finding..."
            rows="2"
            style="font-size: var(--text-xs); padding: 8px 10px;"
          >${currentComment}</textarea>
        </div>
      </div>
    </div>
  `;
}
