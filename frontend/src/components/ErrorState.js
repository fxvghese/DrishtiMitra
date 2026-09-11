/**
 * DrishtiMitra - ErrorState Component
 */

import { icons } from '../assets/icons.js';

export function renderErrorState({
  title = 'An Error Occurred',
  message = 'Failed to load backend resources. Please check your connectivity and try again.',
  actionButton = '',
}) {
  return `
    <div class="error-state animate-fade-in">
      <div class="state-icon" style="background: rgba(239, 68, 68, 0.15); color: var(--color-danger);">
        ${icons.alertTriangle}
      </div>
      <h3 style="font-size: var(--text-lg); font-weight: 700; color: var(--color-danger);">${title}</h3>
      <p style="max-width: 480px; font-size: var(--text-sm); color: var(--text-secondary);">${message}</p>
      ${actionButton ? `<div style="margin-top: var(--space-4);">${actionButton}</div>` : ''}
    </div>
  `;
}
