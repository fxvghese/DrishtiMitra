/**
 * DrishtiMitra - EmptyState Component
 */

import { icons } from '../assets/icons.js';

export function renderEmptyState({
  title = 'No Data Available',
  message = 'There is currently no inspection information to display.',
  icon = icons.fileText,
  actionButton = '',
}) {
  return `
    <div class="empty-state animate-fade-in">
      <div class="state-icon">${icon}</div>
      <h3 style="font-size: var(--text-lg); font-weight: 700; color: var(--text-primary);">${title}</h3>
      <p style="max-width: 420px; font-size: var(--text-sm); color: var(--text-muted);">${message}</p>
      ${actionButton ? `<div style="margin-top: var(--space-4);">${actionButton}</div>` : ''}
    </div>
  `;
}
