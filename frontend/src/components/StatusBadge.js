/**
 * DrishtiMitra - StatusBadge Component
 */

import { icons } from '../assets/icons.js';

export function renderStatusBadge(status, type = 'compliance') {
  if (!status) return `<span class="badge badge-exempt">Unknown</span>`;
  
  const s = String(status).toUpperCase();

  if (type === 'compliance') {
    switch (s) {
      case 'COMPLIANT':
        return `<span class="badge badge-compliant">${icons.shieldCheck} Compliant</span>`;
      case 'NON_COMPLIANT':
        return `<span class="badge badge-non-compliant">${icons.shieldAlert} Non-Compliant</span>`;
      case 'REVIEW':
        return `<span class="badge badge-review">${icons.alertTriangle} Review Required</span>`;
      case 'PROCESSING':
        return `<span class="badge badge-severity-low"><span class="spinner" style="width:12px;height:12px;border-width:2px;"></span> Processing</span>`;
      default:
        return `<span class="badge badge-exempt">${s}</span>`;
    }
  }

  if (type === 'rule') {
    switch (s) {
      case 'PASS':
        return `<span class="badge badge-pass">${icons.check} Pass</span>`;
      case 'FAIL':
        return `<span class="badge badge-fail">${icons.xCircle} Fail</span>`;
      case 'REVIEW':
        return `<span class="badge badge-review">${icons.alertTriangle} Review</span>`;
      case 'NOT_APPLICABLE':
      case 'EXEMPT':
        return `<span class="badge badge-not-applicable">N/A (Exempt)</span>`;
      default:
        return `<span class="badge badge-exempt">${s}</span>`;
    }
  }

  if (type === 'severity') {
    switch (s) {
      case 'HIGH':
        return `<span class="badge badge-severity-high">High Priority</span>`;
      case 'MEDIUM':
        return `<span class="badge badge-severity-medium">Medium Priority</span>`;
      case 'LOW':
        return `<span class="badge badge-severity-low">Low Priority</span>`;
      default:
        return `<span class="badge badge-exempt">${s}</span>`;
    }
  }

  if (type === 'extraction') {
    switch (s) {
      case 'CONFIDENT':
        return `<span class="chip-confident">Confident</span>`;
      case 'AMBIGUOUS':
        return `<span class="chip-ambiguous">${icons.alertTriangle} Ambiguous</span>`;
      case 'MISSING':
        return `<span class="chip-missing">Missing</span>`;
      default:
        return `<span class="chip-missing">${s}</span>`;
    }
  }

  return `<span class="badge badge-exempt">${s}</span>`;
}
