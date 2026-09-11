/**
 * DrishtiMitra - Modal Component
 */

export function renderModal({
  id = '',
  title = '',
  body = '',
  footer = '',
  isOpen = false,
}) {
  return `
    <div id="${id}" class="modal-overlay ${isOpen ? '' : 'sr-only'}" role="dialog" aria-modal="true">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="card-title">${title}</h3>
          <button type="button" class="btn btn-ghost btn-sm modal-close-btn" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
          ${body}
        </div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    </div>
  `;
}
