/**
 * DrishtiMitra - RuleMatrix Component
 * Comprehensive legal rule-by-rule evaluation results
 * - Responsive touch cards for mobile viewports (< 640px)
 * - Full data table for tablets & desktops (>= 640px)
 */

import { renderStatusBadge } from './StatusBadge.js';
import { LEGAL_RULES_REGISTRY } from '../utils/constants.js';

export function renderRuleMatrix(rules = [], activeFilter = 'ALL') {
  if (!rules || rules.length === 0) {
    return `
      <div style="padding: var(--space-6); text-align: center; color: var(--text-muted);">
        No rule evaluation results available yet. Run evaluation to view compliance matrix.
      </div>
    `;
  }

  // Count metrics
  const counts = {
    ALL: rules.length,
    FAIL: rules.filter(r => r.status === 'FAIL').length,
    REVIEW: rules.filter(r => r.status === 'REVIEW').length,
    PASS: rules.filter(r => r.status === 'PASS').length,
    EXEMPT: rules.filter(r => r.status === 'NOT_APPLICABLE').length,
  };

  const filteredRules = rules.filter(r => {
    if (activeFilter === 'FAIL') return r.status === 'FAIL';
    if (activeFilter === 'REVIEW') return r.status === 'REVIEW';
    if (activeFilter === 'PASS') return r.status === 'PASS';
    if (activeFilter === 'EXEMPT') return r.status === 'NOT_APPLICABLE';
    return true;
  });

  return `
    <div class="rule-matrix-container">
      <!-- Filter Bar (Touch-friendly horizontal scroll / wrap) -->
      <div class="rule-filter-bar" style="display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-4);">
        <button type="button" class="btn btn-sm ${activeFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'} rule-filter-btn" data-filter="ALL">
          All (${counts.ALL})
        </button>
        <button type="button" class="btn btn-sm ${activeFilter === 'FAIL' ? 'btn-danger' : 'btn-secondary'} rule-filter-btn" data-filter="FAIL">
          Failed (${counts.FAIL})
        </button>
        <button type="button" class="btn btn-sm ${activeFilter === 'REVIEW' ? 'btn-warning' : 'btn-secondary'} rule-filter-btn" data-filter="REVIEW">
          Review (${counts.REVIEW})
        </button>
        <button type="button" class="btn btn-sm ${activeFilter === 'PASS' ? 'btn-success' : 'btn-secondary'} rule-filter-btn" data-filter="PASS">
          Passed (${counts.PASS})
        </button>
        ${counts.EXEMPT > 0 ? `
          <button type="button" class="btn btn-sm ${activeFilter === 'EXEMPT' ? 'btn-ghost' : 'btn-secondary'} rule-filter-btn" data-filter="EXEMPT">
            Exempt (${counts.EXEMPT})
          </button>
        ` : ''}
      </div>

      <!-- Mobile Touch Cards View (< 640px) -->
      <div class="rules-cards-mobile">
        ${filteredRules.map(r => {
          const ruleMeta = LEGAL_RULES_REGISTRY[r.rule_code] || {
            name: `Rule ${r.rule_number}`,
            description: '',
          };

          return `
            <div class="card card-glass" style="padding: var(--space-4); border-radius: var(--radius-lg);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2); flex-wrap: wrap; gap: var(--space-2);">
                <div>
                  <span style="font-weight: 800; font-size: var(--text-sm); color: var(--text-primary);">
                    Rule ${r.rule_number}
                  </span>
                  <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-left: 4px;">
                    (${r.rule_code})
                  </span>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-2);">
                  ${renderStatusBadge(r.status, 'rule')}
                </div>
              </div>

              <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: var(--space-2); font-weight: 500;">
                ${ruleMeta.name}
              </div>

              <p style="font-size: var(--text-xs); color: var(--text-primary); line-height: 1.45; background: var(--bg-surface-raised); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-glass); margin-bottom: var(--space-2); word-break: break-word;">
                ${r.reason}
              </p>

              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2); font-size: 11px; color: var(--text-muted);">
                <span>Field: <strong style="color: var(--text-secondary); font-family: var(--font-mono);">${r.field_name || 'general'}</strong></span>
                ${r.detected_value ? `
                  <span style="font-family: var(--font-mono); color: var(--text-primary); background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 4px;">
                    "${r.detected_value}"
                  </span>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Desktop Table View (>= 640px) -->
      <div class="table-responsive rules-table-desktop">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 28%;">Legal Rule</th>
              <th style="width: 15%;">Status</th>
              <th style="width: 17%;">Target Field</th>
              <th style="width: 40%;">Finding & Statutory Rationale</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRules.map(r => {
              const ruleMeta = LEGAL_RULES_REGISTRY[r.rule_code] || {
                name: `Rule ${r.rule_number}`,
                description: '',
              };

              return `
                <tr>
                  <td>
                    <div style="font-weight: 700; color: var(--text-primary);">
                      Rule ${r.rule_number}
                      <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-left: 4px;">
                        (${r.rule_code})
                      </span>
                    </div>
                    <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px;">
                      ${ruleMeta.name}
                    </div>
                  </td>
                  <td>
                    ${renderStatusBadge(r.status, 'rule')}
                  </td>
                  <td>
                    <span style="font-family: var(--font-mono); font-size: var(--text-xs); background: var(--bg-surface-raised); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-glass);">
                      ${r.field_name || 'general'}
                    </span>
                  </td>
                  <td style="word-break: break-word;">
                    <div style="font-size: var(--text-sm); color: var(--text-primary); line-height: 1.4;">
                      ${r.reason}
                    </div>
                    ${r.detected_value ? `
                      <div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 4px; font-family: var(--font-mono);">
                        Detected: "${r.detected_value}"
                      </div>
                    ` : ''}
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
