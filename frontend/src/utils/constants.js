/**
 * DrishtiMitra - Application Constants and Legal Rule Definitions
 */

export const API_BASE_URL = window.localStorage.getItem('dm_api_base_url') || 'http://localhost:8000';

// ── Supabase Client Configuration ──────────────────────────────────────────
// These are the PUBLIC anon/publishable keys — safe to store client-side.
// Configure them via the Status page UI; they are stored in localStorage only.
export const SUPABASE_URL = window.localStorage.getItem('dm_supabase_url') || '';
export const SUPABASE_ANON_KEY = window.localStorage.getItem('dm_supabase_anon_key') || '';

/**
 * AUTH_MODE:
 *  'supabase' — real Supabase JWT auth (when URL + key are configured)
 *  'dev'      — development-token passthrough (backend accepts this in APP_ENV=development)
 */
export const AUTH_MODE = (SUPABASE_URL && SUPABASE_ANON_KEY) ? 'supabase' : 'dev';

export const ROUTES = {
  HOME: '#/',
  SCAN: '#/scan',
  REVIEW: '#/inspections/:id/review',
  REPORT: '#/inspections/:id/report',
  CATALOGUE: '#/catalogue',
  LOGIN: '#/login',
  REGISTER: '#/register',
  STATUS: '#/status',
};

export const COMPLIANCE_STATUS = {
  COMPLIANT: 'COMPLIANT',
  NON_COMPLIANT: 'NON_COMPLIANT',
  REVIEW: 'REVIEW',
  PROCESSING: 'PROCESSING',
  ERROR: 'ERROR',
};

export const RULE_STATUS = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  REVIEW: 'REVIEW',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
};

export const SEVERITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

export const EXTRACTION_STATUS = {
  CONFIDENT: 'CONFIDENT',
  AMBIGUOUS: 'AMBIGUOUS',
  MISSING: 'MISSING',
  UNCERTAIN: 'UNCERTAIN',
};

export const LEGAL_RULES_REGISTRY = {
  LM026: {
    rule_number: '26',
    name: 'Rule 26: Exemptions and Applicability',
    description: 'Evaluates small quantity thresholds (<=10g/ml), pan masala amendments, fast food and farm produce exemptions.',
    field: 'exemption',
    severity: 'LOW',
  },
  LM006: {
    rule_number: '6',
    name: 'Rule 6: Mandatory Package Declarations',
    description: 'Mandatory declarations for manufacturer/packer/importer, net quantity, MRP, manufacturing date, and consumer care.',
    field: 'manufacturer',
    severity: 'HIGH',
  },
  LM010: {
    rule_number: '10',
    name: 'Rule 10: Manufacturer Name & Complete Address',
    description: 'Complete street, postal code, and premises address of the responsible party.',
    field: 'manufacturer',
    severity: 'HIGH',
  },
  LM011: {
    rule_number: '11',
    name: 'Rule 11: Quantity General Provisions',
    description: 'Exclusions, wrapper tares, and conditional "when packed" qualifiers.',
    field: 'net_quantity',
    severity: 'HIGH',
  },
  LM012: {
    rule_number: '12',
    name: 'Rule 12: Manner of Quantity Expression',
    description: 'Prohibits misleading/exaggerated prefixes like "approx", "not less than", or "minimum".',
    field: 'net_quantity',
    severity: 'HIGH',
  },
  LM013: {
    rule_number: '13',
    name: 'Rule 13: Standard Measurement Units',
    description: 'Permitted SI units and symbols. Strictly prohibits archaic count terms (e.g. dozen, score, gross).',
    field: 'net_quantity',
    severity: 'HIGH',
  },
  LM014: {
    rule_number: '14',
    name: 'Rule 14: Dimensions of Textile Commodities',
    description: 'Dimension declaration requirements for fabrics, bedsheets, sarees, and towels.',
    field: 'dimensions',
    severity: 'MEDIUM',
  },
  LM016: {
    rule_number: '16',
    name: 'Rule 16: Number of Usable Sheets',
    description: 'Usable sheet count and dimensions for paper products, tissues, and aluminum foils.',
    field: 'sheets',
    severity: 'MEDIUM',
  },
  LM017: {
    rule_number: '17',
    name: 'Rule 17: Container-Type Commodities',
    description: 'Capacity and shape-appropriate dimensions for bags, boxes, and cartons.',
    field: 'container',
    severity: 'MEDIUM',
  },
  LM024: {
    rule_number: '24',
    name: 'Rule 24: Wholesale Package Declarations',
    description: 'Mandatory wholesale identification, total quantity, and retail package breakdown count.',
    field: 'wholesale',
    severity: 'HIGH',
  },
};
