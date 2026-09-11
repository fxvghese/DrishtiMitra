/**
 * DrishtiMitra - Inspection API Service
 * Maps strictly to backend routes in backend/routes/inspections.py
 */

import { request } from './api.js';

/**
 * Submit product-label scan with one or multiple images
 * Route: POST /api/v1/inspections/scan
 * Content-Type: multipart/form-data
 */
export async function submitScan({
  files = [],
  ocrText = null,
  productName = null,
  manufacturer = null,
  netQuantity = null,
  mrp = null,
}) {
  const formData = new FormData();

  if (files.length === 1) {
    formData.append('image', files[0]);
  } else if (files.length > 1) {
    for (const f of files) {
      formData.append('images', f);
    }
  }

  if (ocrText && ocrText.trim()) {
    formData.append('ocr_text', ocrText.trim());
  }
  if (productName && productName.trim()) {
    formData.append('product_name', productName.trim());
  }
  if (manufacturer && manufacturer.trim()) {
    formData.append('manufacturer', manufacturer.trim());
  }
  if (netQuantity && netQuantity.trim()) {
    formData.append('net_quantity', netQuantity.trim());
  }
  if (mrp && mrp.trim()) {
    formData.append('mrp', mrp.trim());
  }

  return request('/api/v1/inspections/scan', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Evaluate Legal Metrology compliance rules for an inspection
 * Route: POST /api/v1/inspections/{inspection_id}/evaluate
 */
export async function evaluateInspection(inspectionId) {
  if (!inspectionId) {
    throw new Error('inspectionId is required for evaluation.');
  }

  return request(`/api/v1/inspections/${inspectionId}/evaluate`, {
    method: 'POST',
  });
}
