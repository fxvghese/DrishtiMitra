/**
 * DrishtiMitra - StatusBadge Component
 * Soft pill badges matching the reference design:
 * - 🟢 Compliant (Soft green background)
 * - 🔴 Potential Non-Compliance (Soft red background)
 * - 🟡 Needs Review / Insufficient Evidence (Soft amber background)
 */

import { icons } from '../assets/icons.js';

export function renderStatusBadge(status, type = 'compliance') {
  if (!status) return `<span class="badge badge-neutral">Unknown</span>`;
  
  const s = String(status).toUpperCase();

  if (type === 'compliance') {
    switch (s) {
      case 'COMPLIANT':
        return `<span class="badge badge-compliant">${icons.check} Compliant</span>`;
      case 'NON_COMPLIANT':
      case 'POTENTIAL_NON_COMPLIANCE':
        return `<span class="badge badge-non-compliant">${icons.xCircle} Non-Compliant</span>`;
      case 'REVIEW':
      case 'INSUFFICIENT_EVIDENCE':
      case 'NEEDS_REVIEW':
        return `<span class="badge badge-review">${icons.clock} Needs Review</span>`;
      case 'PROCESSING':
        return `<span class="badge badge-info"><span class="animate-spin" style="display:inline-block;width:12px;height:12px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;"></span> Processing</span>`;
      default:
        return `<span class="badge badge-neutral">${s}</span>`;
    }
  }

  if (type === 'rule') {
    switch (s) {
      case 'PASS':
        return `<span class="badge badge-compliant">${icons.check} Pass</span>`;
      case 'FAIL':
        return `<span class="badge badge-non-compliant">${icons.xCircle} Fail</span>`;
      case 'REVIEW':
        return `<span class="badge badge-review">${icons.clock} Review</span>`;
      case 'NOT_APPLICABLE':
      case 'EXEMPT':
        return `<span class="badge badge-neutral">Exempt</span>`;
      default:
        return `<span class="badge badge-neutral">${s}</span>`;
    }
  }

  if (type === 'severity') {
    switch (s) {
      case 'HIGH':
        return `<span class="badge badge-non-compliant">High Priority</span>`;
      case 'MEDIUM':
        return `<span class="badge badge-review">Medium Priority</span>`;
      case 'LOW':
        return `<span class="badge badge-info">Low Priority</span>`;
      default:
        return `<span class="badge badge-neutral">${s}</span>`;
    }
  }

  if (type === 'extraction') {
    switch (s) {
      case 'CONFIDENT':
        return `<span class="badge badge-compliant">${icons.check} High Confidence</span>`;
      case 'AMBIGUOUS':
      case 'NEEDS_REVIEW':
        return `<span class="badge badge-review">${icons.alertTriangle} Needs Review</span>`;
      case 'MISSING':
      case 'INSUFFICIENT':
        return `<span class="badge badge-neutral">? Insufficient Evidence</span>`;
      default:
        return `<span class="badge badge-neutral">${s}</span>`;
    }
  }

  return `<span class="badge badge-neutral">${s}</span>`;
}
