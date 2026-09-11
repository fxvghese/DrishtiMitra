/**
 * DrishtiMitra - Auth Context
 * Reactive state store for authentication.
 * Wraps AuthService with observable state, async loading, and error handling.
 */

import { AuthService } from '../services/authService.js';

class AuthState {
  constructor() {
    this.user = null;
    this.token = null;
    this.isLoading = true;   // true during session restore on boot
    this.isAuthenticating = false; // true during login/register/logout calls
    this.error = null;
    this.authMode = AuthService.getAuthMode();
    this.subscribers = new Set();
    this._unsubscribeSupabase = null;

    // Begin session restoration immediately
    this._restoreSession();
  }

  // ── Internal ────────────────────────────────────────────────────────────

  async _restoreSession() {
    this.isLoading = true;
    this.notify();

    try {
      const session = await AuthService.restoreSession();
      if (session) {
        this.token = session.token;
        this.user = session.user;
      } else {
        this.token = null;
        this.user = null;
      }
    } catch {
      this.token = null;
      this.user = null;
    } finally {
      this.isLoading = false;
      this.notify();
    }

    // Subscribe to Supabase auth state changes (no-op in dev mode)
    this._unsubscribeSupabase = await AuthService.subscribeToAuthChanges((event, session) => {
      if (session) {
        this.token = session.token;
        this.user = session.user;
      } else {
        this.token = null;
        this.user = null;
      }
      this.notify();
    });
  }

  // ── Observable ──────────────────────────────────────────────────────────

  subscribe(callback) {
    this.subscribers.add(callback);
    // Immediately call with current state
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
    return {
      user: this.user,
      token: this.token,
      isAuthenticated: Boolean(this.token),
      isLoading: this.isLoading,
      isAuthenticating: this.isAuthenticating,
      error: this.error,
      authMode: this.authMode,
    };
  }

  // ── Public Actions ──────────────────────────────────────────────────────

  /**
   * Login with email + password.
   * Sets isAuthenticating = true during the network call.
   * @returns {boolean} true on success
   */
  async login(email, password) {
    this.isAuthenticating = true;
    this.error = null;
    this.notify();

    try {
      const result = await AuthService.login(email, password);
      this.token = result.token;
      this.user = result.user;
      this.error = null;
      return true;
    } catch (err) {
      this.error = err.message || 'Login failed. Please try again.';
      return false;
    } finally {
      this.isAuthenticating = false;
      this.notify();
    }
  }

  /**
   * Register a new account.
   * @returns {{ success: boolean, requiresEmailConfirmation: boolean }}
   */
  async register(email, password) {
    this.isAuthenticating = true;
    this.error = null;
    this.notify();

    try {
      const result = await AuthService.register(email, password);

      if (result.requiresEmailConfirmation) {
        // Session not started yet — email confirmation required
        this.token = null;
        this.user = null;
        return { success: true, requiresEmailConfirmation: true };
      }

      this.token = result.token;
      this.user = result.user;
      this.error = null;
      return { success: true, requiresEmailConfirmation: false };
    } catch (err) {
      this.error = err.message || 'Registration failed. Please try again.';
      return { success: false, requiresEmailConfirmation: false };
    } finally {
      this.isAuthenticating = false;
      this.notify();
    }
  }

  /**
   * Logout the current session.
   */
  async logout() {
    this.isAuthenticating = true;
    this.notify();

    try {
      await AuthService.logout();
    } catch {
      // Best-effort; clear local state regardless
    } finally {
      this.token = null;
      this.user = null;
      this.error = null;
      this.isAuthenticating = false;
      this.notify();
    }
  }

  /**
   * Clear any auth error (e.g. when user starts typing again).
   */
  clearError() {
    this.error = null;
    this.notify();
  }

  /**
   * Handle a 401 Unauthorized response from the API.
   * Clears the session and forces re-login.
   */
  handleUnauthorized() {
    AuthService.logout().catch(() => {});
    this.token = null;
    this.user = null;
    this.error = 'Your session has expired. Please log in again.';
    this.notify();
  }
}

export const authContext = new AuthState();
