/**
 * DrishtiMitra - Loading Spinner Component
 */

export function renderLoadingSpinner(message = 'Processing Legal Metrology Data...') {
  return `
    <div class="loading-overlay animate-fade-in">
      <div class="spinner"></div>
      <p class="text-secondary" style="font-size: var(--text-sm); font-weight: 500;">
        ${message}
      </p>
    </div>
  `;
}
