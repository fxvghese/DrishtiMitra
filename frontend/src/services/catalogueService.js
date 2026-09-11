/**
 * DrishtiMitra - Reference Product Catalogue Service
 * Maps strictly to backend/routes/catalogue.py
 */

import { request } from './api.js';

/**
 * Search reference product catalogue
 * Route: GET /api/v1/catalogue/search?q={query}&limit={limit}
 */
export async function searchCatalogue(query, limit = 5) {
  if (!query || !query.trim()) {
    return { success: true, data: [], message: 'Empty query' };
  }

  const encodedQuery = encodeURIComponent(query.trim());
  const encodedLimit = encodeURIComponent(limit);

  return request(`/api/v1/catalogue/search?q=${encodedQuery}&limit=${encodedLimit}`, {
    method: 'GET',
  });
}
