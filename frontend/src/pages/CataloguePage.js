/**
 * DrishtiMitra - CataloguePage Component
 * Search and browse external reference products (Open Food Facts & Flipkart)
 */

import { renderCatalogueCard } from '../components/CatalogueCard.js';
import { renderButton } from '../components/Button.js';
import { renderAlert } from '../components/Alert.js';
import { renderEmptyState } from '../components/EmptyState.js';
import { renderLoadingSpinner } from '../components/LoadingSpinner.js';
import { icons } from '../assets/icons.js';
import { searchCatalogue } from '../services/catalogueService.js';

let catalogueState = {
  query: 'Amul',
  limit: 5,
  results: [],
  isLoading: false,
  hasSearched: false,
  error: null,
};

export function renderCataloguePage() {
  const quickFilters = ['Amul', 'Britannia', 'Parle', 'Nestle', 'Biscuits', 'Milk', 'Edible Oil'];

  return `
    <div class="catalogue-page-container animate-fade-in" style="max-width: 880px; margin: 0 auto;">
      <!-- Header -->
      <div style="margin-bottom: var(--space-6);">
        <div style="display: inline-flex; align-items: center; gap: var(--space-2); background: rgba(59,130,246,0.12); color: var(--primary-400); padding: 4px 12px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; border: 1px solid rgba(59,130,246,0.25); margin-bottom: var(--space-3);">
          ${icons.search} 28,000+ Commodity Benchmark Database
        </div>
        <h1 style="font-size: var(--text-3xl); font-weight: 800; color: var(--text-primary); letter-spacing: -0.025em;">
          Reference Commodity Catalogue
        </h1>
        <p style="font-size: var(--text-base); color: var(--text-secondary); max-width: 650px; margin-top: var(--space-2); line-height: 1.6;">
          Search verified commodity listings from Open Food Facts and commercial marketplaces to corroborate declared net quantity, packaging standards, and manufacturer declarations.
        </p>
      </div>

      <!-- Legal Metrology Statutory Disclaimer Banner -->
      ${renderAlert({
        type: 'info',
        title: 'Statutory Source of Truth Notice',
        message: 'Reference catalogue data is strictly auxiliary benchmark information. Physical package label evidence remains the authoritative legal determinant under the Legal Metrology Act.',
      })}

      <!-- Search Input Card -->
      <div class="card card-glass" style="margin-bottom: var(--space-6);">
        <div class="catalogue-search-row" style="display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: stretch;">
          <div class="catalogue-search-field" style="flex: 1; min-width: min(100%, 220px); position: relative;">
            <input 
              type="search" 
              id="catalogue-search-input" 
              class="form-input" 
              inputmode="search"
              enterkeyhint="search"
              placeholder="Search by brand, product, or category..." 
              value="${catalogueState.query}"
              style="padding-left: 2.25rem;"
            />
            <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">
              ${icons.search}
            </span>
          </div>

          <div class="catalogue-limit-field" style="width: auto; min-width: 100px;">
            <select id="catalogue-limit-select" class="form-select" style="height: 100%;">
              <option value="5" ${catalogueState.limit === 5 ? 'selected' : ''}>5 items</option>
              <option value="10" ${catalogueState.limit === 10 ? 'selected' : ''}>10 items</option>
              <option value="20" ${catalogueState.limit === 20 ? 'selected' : ''}>20 items</option>
            </select>
          </div>

          <div class="catalogue-search-btn-wrapper">
            ${renderButton({
              id: 'btn-search-catalogue',
              text: 'Search',
              variant: 'primary',
              icon: icons.search,
            })}
          </div>
        </div>

        <!-- Quick Filter Suggestion Chips -->
        <div style="display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-3); flex-wrap: wrap;">
          <span style="font-size: var(--text-xs); color: var(--text-muted); font-weight: 600;">Popular:</span>
          ${quickFilters.map(chip => `
            <button type="button" class="catalogue-chip-btn btn btn-ghost btn-sm" data-query="${chip}" style="padding: 2px 8px; font-size: 11px; background: var(--bg-surface-raised); border: 1px solid var(--border-glass); border-radius: var(--radius-full);">
              ${chip}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Results Container -->
      <div id="catalogue-results-container">
        ${renderCatalogueResults()}
      </div>
    </div>
  `;
}

function renderCatalogueResults() {
  if (catalogueState.isLoading) {
    return renderLoadingSpinner('Searching reference products database...');
  }

  if (catalogueState.error) {
    return renderAlert({
      type: 'danger',
      title: 'Search Error',
      message: catalogueState.error,
    });
  }

  if (!catalogueState.hasSearched) {
    return renderEmptyState({
      title: 'Search Benchmark Catalogue',
      message: 'Enter a product name, brand, or category query above to find reference commodity standards.',
      icon: icons.search,
    });
  }

  if (catalogueState.results.length === 0) {
    return renderEmptyState({
      title: 'No Matching Reference Products',
      message: `No products matching "${catalogueState.query}" were found in the reference catalogue. Unknown products are still fully evaluable from physical label evidence.`,
      icon: icons.xCircle,
    });
  }

  return `
    <div class="animate-fade-in">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
        <span style="font-size: var(--text-xs); color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
          Matches Found (${catalogueState.results.length})
        </span>
        <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
          Query: "${catalogueState.query}"
        </span>
      </div>

      ${catalogueState.results.map(prod => renderCatalogueCard(prod)).join('')}
    </div>
  `;
}

export function attachCataloguePageEvents() {
  const searchInput = document.getElementById('catalogue-search-input');
  const limitSelect = document.getElementById('catalogue-limit-select');
  const btnSearch = document.getElementById('btn-search-catalogue');

  const executeSearch = async () => {
    const q = searchInput?.value || '';
    const lim = parseInt(limitSelect?.value || '5', 10);

    if (!q.trim()) return;

    catalogueState.query = q;
    catalogueState.limit = lim;
    catalogueState.isLoading = true;
    catalogueState.error = null;

    const container = document.getElementById('catalogue-results-container');
    if (container) {
      container.innerHTML = renderCatalogueResults();
    }

    try {
      const response = await searchCatalogue(q, lim);
      catalogueState.results = response?.data || [];
      catalogueState.hasSearched = true;
    } catch (err) {
      catalogueState.error = err.message || 'Search failed.';
      catalogueState.results = [];
    } finally {
      catalogueState.isLoading = false;
      if (container) {
        container.innerHTML = renderCatalogueResults();
      }
    }
  };

  if (btnSearch) {
    btnSearch.addEventListener('click', executeSearch);
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeSearch();
      }
    });
  }

  if (limitSelect) {
    limitSelect.addEventListener('change', () => {
      if (catalogueState.hasSearched) {
        executeSearch();
      }
    });
  }

  // Quick Filter Chips Click
  document.querySelectorAll('.catalogue-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.dataset.query;
      if (query && searchInput) {
        searchInput.value = query;
        executeSearch();
      }
    });
  });

  // Auto trigger initial search if not yet searched
  if (!catalogueState.hasSearched && catalogueState.query) {
    executeSearch();
  }
}
