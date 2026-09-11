/**
 * DrishtiMitra - ImageGallery Component
 * Side-by-side or thumbnail gallery with lightbox zoom
 */

export function renderImageGallery({
  primaryImageUrl = '',
  imageUrls = [],
  title = 'Package Photos',
}) {
  const images = imageUrls.length > 0 ? imageUrls : (primaryImageUrl ? [primaryImageUrl] : []);

  if (images.length === 0) {
    return `
      <div style="background: var(--bg-surface-raised); border-radius: var(--radius-lg); padding: var(--space-8); text-align: center; color: var(--text-muted);">
        No package photos available
      </div>
    `;
  }

  return `
    <div class="image-gallery-container">
      <div class="gallery-main-view" style="width: 100%; aspect-ratio: 4/3; max-height: 400px; background: #000; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-glass); position: relative;">
        <img id="gallery-active-image" src="${images[0]}" alt="Package image" style="width: 100%; height: 100%; object-fit: contain; cursor: zoom-in;" />
        <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 4px;">
          Click to Zoom
        </div>
      </div>

      ${images.length > 1 ? `
        <div class="gallery-thumbs-strip" style="display: flex; gap: var(--space-2); margin-top: var(--space-3); overflow-x: auto; padding-bottom: 4px;">
          ${images.map((img, i) => `
            <button type="button" class="gallery-thumb-btn ${i === 0 ? 'active' : ''}" data-src="${img}" style="width: 64px; height: 64px; flex-shrink: 0; border-radius: var(--radius-md); overflow: hidden; border: 2px solid ${i === 0 ? 'var(--primary-500)' : 'var(--border-glass)'}; background: #000; padding: 0; cursor: pointer;">
              <img src="${img}" alt="Thumbnail ${i + 1}" style="width: 100%; height: 100%; object-fit: cover;" />
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}
