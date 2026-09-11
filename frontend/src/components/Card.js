/**
 * DrishtiMitra - Card Component
 */

export function renderCard({
  id = '',
  title = '',
  description = '',
  icon = '',
  actions = '',
  content = '',
  glass = false,
  className = '',
}) {
  const idAttr = id ? `id="${id}"` : '';
  const glassClass = glass ? 'card-glass' : '';

  const hasHeader = title || description || icon || actions;

  return `
    <div class="card ${glassClass} ${className}" ${idAttr}>
      ${hasHeader ? `
        <div class="card-header">
          <div>
            ${title ? `
              <h3 class="card-title">
                ${icon ? `<span>${icon}</span>` : ''}
                ${title}
              </h3>
            ` : ''}
            ${description ? `<p class="card-description">${description}</p>` : ''}
          </div>
          ${actions ? `<div class="card-actions">${actions}</div>` : ''}
        </div>
      ` : ''}
      <div class="card-body">
        ${content}
      </div>
    </div>
  `;
}
