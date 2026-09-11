/**
 * DrishtiMitra - CatalogueCard Component
 * Reference benchmark product card
 */

import { formatCurrency } from '../utils/formatters.js';
import { icons } from '../assets/icons.js';

export function renderCatalogueCard(product = {}) {
  const sourceLabel = product.source === 'open_food_facts' ? 'Open Food Facts' : (product.source === 'flipkart' ? 'Flipkart' : product.source);

  return `
    <div class="catalogue-card card card-glass animate-fade-in" style="margin-bottom: var(--space-3); padding: var(--space-4);">
      <div style="display: flex; gap: var(--space-4); align-items: flex-start;">
        ${product.image_url ? `
          <div style="width: 70px; height: 70px; border-radius: var(--radius-md); overflow: hidden; background: #000; flex-shrink: 0; border: 1px solid var(--border-glass);">
            <img src="${product.image_url}" alt="${product.product_name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
          </div>
        ` : `
          <div style="width: 70px; height: 70px; border-radius: var(--radius-md); background: var(--bg-surface-raised); display: flex; align-items: center; justify-content: center; color: var(--text-muted); flex-shrink: 0;">
            ${icons.fileText}
          </div>
        `}

        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); margin-bottom: 2px;">
            <h4 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${product.product_name || 'Unnamed Product'}
            </h4>
            <span style="font-size: 10px; text-transform: uppercase; font-weight: 700; background: var(--bg-surface-raised); padding: 2px 6px; border-radius: 4px; color: var(--text-secondary); border: 1px solid var(--border-glass); flex-shrink: 0;">
              ${sourceLabel}
            </span>
          </div>

          <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: var(--space-2);">
            ${product.brand ? `<span>Brand: <strong style="color: var(--text-primary);">${product.brand}</strong></span> • ` : ''}
            ${product.category ? `<span>Category: ${product.category}</span>` : ''}
          </div>

          <div style="display: flex; align-items: center; gap: var(--space-4); font-size: var(--text-xs); font-family: var(--font-mono);">
            <span>Benchmark MRP: <strong style="color: var(--color-success-text);">${formatCurrency(product.mrp)}</strong></span>
            ${product.quantity ? `<span>Declared Qty: <strong style="color: var(--text-primary);">${product.quantity}</strong></span>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}
