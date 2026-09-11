/**
 * DrishtiMitra - useInspection hook
 */

import { inspectionContext } from '../context/InspectionContext.js';

export function useInspection(onStateChange) {
  return inspectionContext.subscribe(onStateChange);
}
