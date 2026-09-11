/**
 * DrishtiMitra - useAuth hook
 */

import { authContext } from '../context/AuthContext.js';

export function useAuth(onStateChange) {
  return authContext.subscribe(onStateChange);
}
