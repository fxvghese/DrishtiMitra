/**
 * DrishtiMitra - Button Component Helper
 */

export function renderButton({
  id = '',
  text = '',
  variant = 'primary', // primary, secondary, success, danger, ghost
  size = 'md',        // sm, md, lg
  icon = '',
  type = 'button',
  disabled = false,
  className = '',
  attributes = '',
}) {
  const sizeClass = size === 'sm' ? 'btn-sm' : (size === 'lg' ? 'btn-lg' : '');
  const idAttr = id ? `id="${id}"` : '';
  const disabledAttr = disabled ? 'disabled' : '';

  return `
    <button 
      type="${type}" 
      class="btn btn-${variant} ${sizeClass} ${className}" 
      ${idAttr} 
      ${disabledAttr} 
      ${attributes}
    >
      ${icon ? `<span class="btn-icon">${icon}</span>` : ''}
      ${text ? `<span>${text}</span>` : ''}
    </button>
  `;
}
