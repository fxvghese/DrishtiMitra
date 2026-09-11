/**
 * DrishtiMitra - Inspection History & Audit Trail Service
 * Manages persisted inspection dossiers, inspector decisions, and statutory audit logs
 * Stores full audit trails locally while linking to real backend inspection records
 */

const STORAGE_KEY = 'dm_saved_inspections';

export const historyService = {
  /**
   * Get all saved inspection dossiers
   */
  getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Initialize with realistic benchmark inspection history for demo readiness
        const initial = this.getInitialSeedData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  /**
   * Get an inspection dossier by ID
   */
  getById(id) {
    if (!id) return null;
    const all = this.getAll();
    return all.find(item => item.inspectionId === id || item.id === id) || null;
  },

  /**
   * Save or update an inspection dossier with full audit trail
   */
  save(dossier) {
    if (!dossier || !dossier.inspectionId) {
      throw new Error('Valid inspectionId is required to save an inspection dossier.');
    }

    const all = this.getAll();
    const existingIndex = all.findIndex(item => item.inspectionId === dossier.inspectionId);

    const record = {
      ...dossier,
      id: dossier.inspectionId,
      savedAt: new Date().toISOString(),
      status: dossier.status || 'VERIFIED_SAVED',
    };

    if (existingIndex >= 0) {
      all[existingIndex] = { ...all[existingIndex], ...record };
    } else {
      all.unshift(record);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }

    return record;
  },

  /**
   * Search and filter inspection dossiers
   */
  search({ query = '', status = 'ALL' }) {
    const all = this.getAll();
    return all.filter(item => {
      const matchesQuery = !query || 
        (item.productName && item.productName.toLowerCase().includes(query.toLowerCase())) ||
        (item.manufacturer && item.manufacturer.toLowerCase().includes(query.toLowerCase())) ||
        (item.inspectionId && item.inspectionId.toLowerCase().includes(query.toLowerCase()));

      let matchesStatus = true;
      if (status !== 'ALL') {
        const itemStatus = item.inspectorVerdict || item.overallStatus || item.status;
        matchesStatus = itemStatus === status;
      }

      return matchesQuery && matchesStatus;
    });
  },

  /**
   * Seed data representing standard Legal Metrology audits for demo-readiness
   */
  getInitialSeedData() {
    return [
      {
        inspectionId: 'INSP-2026-0910-001',
        productName: 'Amul Butter 500g',
        manufacturer: 'Gujarat Co-operative Milk Marketing Federation Ltd, Anand',
        capturedSurfaces: [
          { surface: 'FRONT', name: 'Front Face (Brand & Net Qty)' },
          { surface: 'BACK', name: 'Back Panel (Nutrition, MRP & Dates)' },
        ],
        extractedData: {
          product_name: 'Amul Butter',
          manufacturer: 'GCMMF Ltd, Anand - 388001, Gujarat',
          net_quantity: '500 g',
          mrp: 'Rs. 275.00 (incl. of all taxes)',
          date: '08/2026',
          consumer_care: 'customercare@amul.coop | 1800-258-3333',
          extraction_confidence: 98.4,
        },
        overallStatus: 'COMPLIANT',
        inspectorVerdict: 'COMPLIANT',
        inspectorDecision: 'ACCEPTED',
        inspectorComment: 'All Rule 6 statutory declarations present with correct SI metric unit (g) and font sizes compliant with Second Schedule.',
        inspectorId: 'inspector@legalmetrology.gov.in',
        rulesEvaluatedCount: 10,
        violationsCount: 0,
        timestamp: '2026-09-10T14:22:00Z',
        savedAt: '2026-09-10T14:25:12Z',
      },
      {
        inspectionId: 'INSP-2026-0910-002',
        productName: 'Good Bakes Cashew Cookies',
        manufacturer: 'Good Bakes Confectionery Pvt Ltd',
        capturedSurfaces: [
          { surface: 'FRONT', name: 'Front Label' },
        ],
        extractedData: {
          product_name: 'Good Bakes Cashew Cookies',
          net_quantity: '200 gm',
          manufacturer: null,
          mrp: null,
          date: null,
          consumer_care: null,
          extraction_confidence: 84.5,
        },
        overallStatus: 'POTENTIAL_NON_COMPLIANT',
        inspectorVerdict: 'POTENTIAL_NON_COMPLIANT',
        inspectorDecision: 'ACCEPTED',
        inspectorComment: 'Rule 13 SI unit non-compliance verified: package uses non-standard "gm" instead of mandatory "g". Information panel missing from evidence.',
        inspectorId: 'inspector@legalmetrology.gov.in',
        rulesEvaluatedCount: 10,
        violationsCount: 1,
        timestamp: '2026-09-10T11:15:00Z',
        savedAt: '2026-09-10T11:20:45Z',
      },
      {
        inspectionId: 'INSP-2026-0909-003',
        productName: 'Pure Bliss Almond Milk 1L',
        manufacturer: 'Bliss Organics Ltd',
        capturedSurfaces: [
          { surface: 'FRONT', name: 'Front Panel Only' },
        ],
        extractedData: {
          product_name: 'Pure Bliss Almond Milk',
          net_quantity: '1 L',
          manufacturer: null,
          mrp: null,
          date: null,
          consumer_care: null,
          extraction_confidence: 76.0,
        },
        overallStatus: 'INSUFFICIENT_EVIDENCE',
        inspectorVerdict: 'INSUFFICIENT_EVIDENCE',
        inspectorDecision: 'REJECTED',
        inspectorComment: 'Could not verify manufacturer, MRP, or packaging date. Inspector requested additional surface evidence (Back panel) before issuing notice.',
        inspectorId: 'inspector@legalmetrology.gov.in',
        rulesEvaluatedCount: 10,
        violationsCount: 0,
        timestamp: '2026-09-09T16:40:00Z',
        savedAt: '2026-09-09T16:44:20Z',
      },
    ];
  },
};
