/**
 * DrishtiMitra - Alert Component
 */

import { icons } from '../assets/icons.js';

export function renderAlert({
  type = 'info', // info, success, warning, danger
  title = '',
  message = '',
  id = '',
  className = '',
}) {
  let iconSvg = icons.info;
  if (type === 'success') iconSvg = icons.checkCircle;
  if (type === 'warning') iconSvg = icons.alertTriangle;
  if (type === 'danger') iconSvg = icons.xCircle;

  const idAttr = id ? `id="${id}"` : '';

  return `
    <div class="alert alert-${type} ${className}" ${idAttr} role="alert">
      <div class="alert-icon">${iconSvg}</div>
      <div class="alert-content">
        ${title ? `<div class="alert-title">${title}</div>` : ''}
        <div>${message}</div>
      </div>
    </div>
  `;
}
