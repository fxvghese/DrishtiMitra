/**
 * DrishtiMitra - ViolationCard Component
 * Structured Finding Card with clear separation:
 * AI ASSESSMENT → EVIDENCE → APPLICABLE REQUIREMENT → INSPECTOR REVIEW → INSPECTOR DECISION
 * Visual Identity: Green & White theme
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
    <div class="card violation-card animate-fade-in" style="border-radius: var(--radius-2xl); border: 1px solid var(--border-default); background: #FFFFFF; padding: var(--space-4); margin-bottom: var(--space-4); box-shadow: var(--shadow-sm);">
      <!-- Card Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3); border-bottom: 1px solid var(--border-default); padding-bottom: var(--space-3);">
        <div style="display: flex; align-items: center; gap: var(--space-2);">
          <span style="color: ${isFail ? 'var(--color-danger)' : 'var(--color-warning)'};">
            ${isFail ? icons.xCircle : icons.alertTriangle}
          </span>
          <span style="font-weight: 800; font-size: var(--text-sm); color: var(--text-primary);">
            Finding #${index + 1}: ${ruleMeta.name} (${ruleCode})
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-2);">
          ${renderStatusBadge(violation.severity || 'HIGH', 'severity')}
          <span class="badge ${isFail ? 'badge-non-compliant' : 'badge-review'}">
            ${isFail ? 'Potential Non-Compliance Detected' : 'Inspector Verification Required'}
          </span>
        </div>
      </div>

      <!-- 1. AI Assessment -->
      <div style="margin-bottom: var(--space-3); background: #FEF2F2; border-left: 3px solid var(--color-danger); border-radius: var(--radius-md); padding: var(--space-3);">
        <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: 2px;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--color-danger); letter-spacing: 0.04em;">
            1. AI Assessment (Recommendation Only)
          </span>
        </div>
        <p style="font-size: var(--text-xs); color: var(--text-primary); margin: 0; line-height: 1.5;">
          ${violation.reason || violation.message || 'Potential statutory omission or discrepancy identified during automated scanning.'}
        </p>
      </div>

      <!-- 2. Evidence -->
      <div style="margin-bottom: var(--space-3); background: var(--bg-surface-raised); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-3);">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 4px;">
          2. Package Evidence
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-3); font-size: var(--text-xs); font-family: var(--font-mono);">
          <span>Inspected Field: <strong style="color: var(--text-primary);">${violation.field_name || 'Declaration Field'}</strong></span>
          ${violation.detected_value ? `
            <span>Detected Text: <strong style="color: var(--primary-700);">${violation.detected_value}</strong></span>
          ` : `
            <span style="color: var(--color-warning);">Detected Text: <em>None detected in captured evidence</em></span>
          `}
        </div>

        ${violation.bounding_box ? `
          <div style="margin-top: 4px; font-size: 11px; color: var(--text-secondary);">
            Evidence Coordinates: <code>[${violation.bounding_box.join(', ')}]</code>
          </div>
        ` : ''}
      </div>

      <!-- 3. Applicable Requirement -->
      <div style="margin-bottom: var(--space-4); background: #F8FAFC; border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-3);">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 2px;">
          3. Applicable Statutory Requirement
        </div>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); margin: 0; line-height: 1.5;">
          <strong>${ruleMeta.section || 'Legal Metrology Rules, 2011'}:</strong> ${ruleMeta.description}
        </p>
      </div>

      <!-- 4. Inspector Decision -->
      <div style="background: var(--bg-mint); border: 1px solid var(--bg-mint-border); border-radius: var(--radius-xl); padding: var(--space-3) var(--space-4);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3);">
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <span style="color: var(--primary-700);">${icons.shieldCheck}</span>
            <span style="font-weight: 800; font-size: var(--text-xs); text-transform: uppercase; color: var(--primary-900); letter-spacing: 0.03em;">
              4. Inspector Decision
            </span>
          </div>

          <!-- Accept / Reject Buttons -->
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
              ${currentDecision === 'REJECT' ? '✓ Overruled by Officer' : 'Overrule / Reject'}
            </button>
          </div>
        </div>

        <!-- Inspector Comment -->
        <div>
          <label class="form-label" style="font-size: 11px; color: var(--primary-900);">
            Add inspector comment:
          </label>
          <textarea
            class="form-textarea finding-inspector-comment"
            data-rule-code="${ruleCode}"
            placeholder="Add inspector comment or justification for legal audit dossier..."
            rows="2"
            style="font-size: var(--text-xs); padding: 8px 10px; background: #FFFFFF;"
          >${currentComment}</textarea>
        </div>
      </div>
    </div>
  `;
}
