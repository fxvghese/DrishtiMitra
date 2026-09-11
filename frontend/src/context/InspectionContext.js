/**
 * DrishtiMitra - Inspection Context
 * Reactive state store for multi-surface evidence, active scan, OCR extractions,
 * compliance evaluations, and inspector statutory decisions
 */

class InspectionState {
  constructor() {
    this.currentInspection = null;
    this.evaluationResult = null;
    
    // Multi-surface evidence: Array of { id, file, previewUrl, surface: 'FRONT'|'BACK'|'SIDE'|'OTHER', name }
    this.surfaces = [];
    
    this.clientHints = {
      productName: '',
      manufacturer: '',
      netQuantity: '',
      mrp: '',
      ocrText: '',
    };

    // Inspector decisions per finding
    this.inspectorDecisions = {}; // { [findingKey]: { decision: 'ACCEPT'|'REJECT', comment: '' } }
    this.overallInspectorVerdict = null; // 'COMPLIANT' | 'POTENTIAL_NON_COMPLIANCE' | 'INSUFFICIENT_EVIDENCE'
    this.inspectorComment = '';
    this.isSaved = false;

    this.isLoading = false;
    this.loadingMessage = '';
    this.error = null;
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.getState());
    return () => this.subscribers.delete(callback);
  }

  notify() {
    const state = this.getState();
    for (const callback of this.subscribers) {
      callback(state);
    }
  }

  getState() {
    const files = this.surfaces.map(s => s.file).filter(Boolean);
    const previewUrls = this.surfaces.map(s => s.previewUrl);

    return {
      currentInspection: this.currentInspection,
      evaluationResult: this.evaluationResult,
      surfaces: this.surfaces,
      uploadedFiles: files,
      previewUrls: previewUrls,
      clientHints: this.clientHints,
      inspectorDecisions: this.inspectorDecisions,
      overallInspectorVerdict: this.overallInspectorVerdict,
      inspectorComment: this.inspectorComment,
      isSaved: this.isSaved,
      hasUnsavedChanges: this.hasUnsavedChanges(),
      isLoading: this.isLoading,
      loadingMessage: this.loadingMessage,
      error: this.error,
    };
  }

  hasUnsavedChanges() {
    // If an inspection is loaded or files are added and it's not saved yet
    if (this.isSaved) return false;
    if (this.evaluationResult) return true;
    if (this.currentInspection) return true;
    if (this.surfaces.length > 0) return true;
    return false;
  }

  // ── Multi-Surface Evidence Management ────────────────────────────────────

  addSurface(file, surfaceType = 'FRONT', label = '') {
    const id = `surf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const previewUrl = URL.createObjectURL(file);
    const defaultName = label || (surfaceType === 'FRONT' ? 'Front Display Panel' :
      surfaceType === 'BACK' ? 'Back Information Panel' :
      surfaceType === 'SIDE' ? 'Side / Barcode Panel' : 'Additional Surface');

    this.surfaces.push({
      id,
      file,
      previewUrl,
      surface: surfaceType,
      name: defaultName,
    });
    this.isSaved = false;
    this.notify();
  }

  addFiles(files) {
    const defaultTypes = ['FRONT', 'BACK', 'SIDE', 'OTHER'];
    files.forEach((file, index) => {
      const existingCount = this.surfaces.length;
      const type = defaultTypes[Math.min(existingCount, defaultTypes.length - 1)];
      this.addSurface(file, type);
    });
  }

  updateSurfaceType(index, surfaceType) {
    if (index >= 0 && index < this.surfaces.length) {
      this.surfaces[index].surface = surfaceType;
      this.surfaces[index].name = surfaceType === 'FRONT' ? 'Front Display Panel' :
        surfaceType === 'BACK' ? 'Back Information Panel' :
        surfaceType === 'SIDE' ? 'Side / Barcode Panel' : 'Additional Surface';
      this.notify();
    }
  }

  replaceSurface(index, newFile) {
    if (index >= 0 && index < this.surfaces.length) {
      URL.revokeObjectURL(this.surfaces[index].previewUrl);
      this.surfaces[index].file = newFile;
      this.surfaces[index].previewUrl = URL.createObjectURL(newFile);
      this.isSaved = false;
      this.notify();
    }
  }

  removeSurface(index) {
    if (index >= 0 && index < this.surfaces.length) {
      URL.revokeObjectURL(this.surfaces[index].previewUrl);
      this.surfaces.splice(index, 1);
      this.notify();
    }
  }

  clearSurfaces() {
    this.surfaces.forEach(s => URL.revokeObjectURL(s.previewUrl));
    this.surfaces = [];
    this.notify();
  }

  getCapturedSurfaceTypes() {
    return Array.from(new Set(this.surfaces.map(s => s.surface)));
  }

  hasSurface(type) {
    return this.surfaces.some(s => s.surface === type);
  }

  // ── Client Hints ──────────────────────────────────────────────────────────

  setHints(hints) {
    this.clientHints = { ...this.clientHints, ...hints };
    this.notify();
  }

  // ── Loading & Errors ──────────────────────────────────────────────────────

  setLoading(loading, message = '') {
    this.isLoading = loading;
    this.loadingMessage = message;
    this.notify();
  }

  setError(err) {
    this.error = err;
    this.isLoading = false;
    this.notify();
  }

  // ── Scan & Evaluation Results ─────────────────────────────────────────────

  setScanResult(inspectionDetail) {
    this.currentInspection = inspectionDetail;
    this.evaluationResult = null; // reset previous eval
    this.inspectorDecisions = {};
    this.overallInspectorVerdict = null;
    this.inspectorComment = '';
    this.isSaved = false;
    this.error = null;
    this.notify();
  }

  setEvaluationResult(summary) {
    this.evaluationResult = summary;
    if (this.currentInspection) {
      this.currentInspection.status = summary.overall_status;
    }
    // Pre-populate inspector decisions map for findings
    const findings = summary.violations || [];
    this.inspectorDecisions = {};
    findings.forEach((f, idx) => {
      this.inspectorDecisions[f.rule_code || idx] = {
        decision: 'ACCEPT', // Default recommendation awaiting officer confirmation
        comment: '',
      };
    });

    // Default overall verdict based on AI assessment
    if (summary.overall_status === 'COMPLIANT') {
      this.overallInspectorVerdict = 'COMPLIANT';
    } else if (summary.overall_status === 'NON_COMPLIANT') {
      this.overallInspectorVerdict = 'POTENTIAL_NON_COMPLIANCE';
    } else {
      this.overallInspectorVerdict = 'INSUFFICIENT_EVIDENCE';
    }

    this.isSaved = false;
    this.error = null;
    this.notify();
  }

  // ── Inspector Verification Actions ────────────────────────────────────────

  setFindingDecision(ruleCode, decision, comment = '') {
    this.inspectorDecisions[ruleCode] = {
      decision,
      comment: comment || this.inspectorDecisions[ruleCode]?.comment || '',
    };
    this.notify();
  }

  setOverallVerdict(verdict, comment = '') {
    this.overallInspectorVerdict = verdict;
    if (comment) this.inspectorComment = comment;
    this.notify();
  }

  setInspectorComment(comment) {
    this.inspectorComment = comment;
    this.notify();
  }

  markSaved() {
    this.isSaved = true;
    this.notify();
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  reset() {
    this.clearSurfaces();
    this.currentInspection = null;
    this.evaluationResult = null;
    this.clientHints = {
      productName: '',
      manufacturer: '',
      netQuantity: '',
      mrp: '',
      ocrText: '',
    };
    this.inspectorDecisions = {};
    this.overallInspectorVerdict = null;
    this.inspectorComment = '';
    this.isSaved = false;
    this.isLoading = false;
    this.loadingMessage = '';
    this.error = null;
    this.notify();
  }
}

export const inspectionContext = new InspectionState();
