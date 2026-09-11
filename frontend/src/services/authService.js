/**
 * DrishtiMitra - Authentication Service
 * Two-mode auth: 'dev' (development-token) or 'supabase' (real JWT via Supabase Auth SDK)
 *
 * IMPORTANT: This service never stores Supabase service keys — only the public anon key.
 * The backend validates tokens independently; we just supply them as Bearer headers.
 */

import { AUTH_MODE, SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants.js';

const TOKEN_KEY = 'dm_access_token';
const USER_KEY = 'dm_officer_user';
const REFRESH_KEY = 'dm_refresh_token';

// ── Supabase SDK Singleton ──────────────────────────────────────────────────
let _supabaseClient = null;

async function getSupabaseClient() {
  if (_supabaseClient) return _supabaseClient;
  if (AUTH_MODE !== 'supabase') return null;

  // Load Supabase JS SDK from CDN only when supabase mode is active
  if (!window.__supabase) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Supabase SDK from CDN'));
      document.head.appendChild(script);
    });
  }

  const { createClient } = window.supabase || window.__supabase;
  _supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _supabaseClient;
}

// ── Token & User Persistence ────────────────────────────────────────────────
function persistSession(token, user, refreshToken = null) {
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_KEY);
  }
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  } else {
    window.localStorage.removeItem(REFRESH_KEY);
  }
}

function normalizeUser(supabaseUser) {
  if (!supabaseUser) return null;
  return {
    user_id: supabaseUser.id,
    email: supabaseUser.email,
    role: supabaseUser.role || 'authenticated',
    created_at: supabaseUser.created_at,
  };
}

// ── Public AuthService API ──────────────────────────────────────────────────
export class AuthService {

  /** Returns the current stored access token. */
  static getToken() {
    return window.localStorage.getItem(TOKEN_KEY);
  }

  /** Returns the parsed stored user object, or null. */
  static getUser() {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /** True if a token exists in localStorage. */
  static isAuthenticated() {
    return Boolean(this.getToken());
  }

  /** Returns the current auth mode for display. */
  static getAuthMode() {
    return AUTH_MODE;
  }

  /**
   * Login with email + password.
   * Dev mode: validates locally and sets development-token.
   * Supabase mode: calls supabase.auth.signInWithPassword().
   *
   * @returns {{ token: string, user: object, mode: string }}
   * @throws Error with user-facing message on failure
   */
  static async login(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    if (AUTH_MODE === 'dev') {
      // Development mode: accept any non-empty credentials
      // Backend accepts 'development-token' when APP_ENV=development
      const token = 'development-token';
      const user = {
        user_id: 'test-user-id-123',
        email: email,
        role: 'authenticated',
      };
      persistSession(token, user);
      return { token, user, mode: 'dev' };
    }

    // Supabase mode
    const client = await getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client could not be initialized. Check your Supabase URL and Anon Key in Settings.');
    }

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      // Map Supabase errors to user-friendly messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Incorrect email or password. Please try again.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please confirm your email address before logging in. Check your inbox.');
      }
      throw new Error(error.message || 'Login failed. Please try again.');
    }

    const token = data.session?.access_token;
    const refreshToken = data.session?.refresh_token;
    const user = normalizeUser(data.user);

    if (!token || !user) {
      throw new Error('Login succeeded but no session was returned. Please try again.');
    }

    persistSession(token, user, refreshToken);
    return { token, user, mode: 'supabase' };
  }

  /**
   * Register a new account with email + password.
   * Dev mode: simulates success without creating a real account.
   * Supabase mode: calls supabase.auth.signUp().
   *
   * @returns {{ token: string|null, user: object, requiresEmailConfirmation: boolean }}
   * @throws Error with user-facing message on failure
   */
  static async register(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    if (AUTH_MODE === 'dev') {
      // Dev mode: simulate registration → auto-login
      const token = 'development-token';
      const user = {
        user_id: 'test-user-id-123',
        email: email,
        role: 'authenticated',
      };
      persistSession(token, user);
      return { token, user, requiresEmailConfirmation: false, mode: 'dev' };
    }

    // Supabase mode
    const client = await getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client could not be initialized. Check your Supabase URL and Anon Key in Settings.');
    }

    const { data, error } = await client.auth.signUp({ email, password });
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        throw new Error('An account with this email already exists. Please log in instead.');
      }
      if (error.message.includes('Password should be')) {
        throw new Error('Password must be at least 6 characters long.');
      }
      throw new Error(error.message || 'Registration failed. Please try again.');
    }

    // Check if email confirmation is required (Supabase project setting)
    const requiresEmailConfirmation = !data.session;
    const token = data.session?.access_token || null;
    const refreshToken = data.session?.refresh_token || null;
    const user = normalizeUser(data.user);

    if (token && user) {
      persistSession(token, user, refreshToken);
    }

    return { token, user, requiresEmailConfirmation, mode: 'supabase' };
  }

  /**
   * Logout the current session.
   * Clears localStorage and signs out from Supabase if configured.
   */
  static async logout() {
    // Always clear local storage first
    persistSession(null, null, null);

    if (AUTH_MODE === 'supabase' && _supabaseClient) {
      try {
        await _supabaseClient.auth.signOut();
      } catch {
        // Best-effort; local session is already cleared
      }
    }
  }

  /**
   * Try to restore a session from localStorage.
   * In Supabase mode, also attempts to refresh an expired token using the refresh token.
   *
   * @returns {{ token: string, user: object }|null}
   */
  static async restoreSession() {
    const storedToken = this.getToken();
    const storedUser = this.getUser();

    if (!storedToken || !storedUser) {
      return null;
    }

    // In dev mode, any stored token is valid (backend validates per-request)
    if (AUTH_MODE === 'dev') {
      return { token: storedToken, user: storedUser };
    }

    // In Supabase mode: try to get an active session or refresh it
    try {
      const client = await getSupabaseClient();
      if (!client) return { token: storedToken, user: storedUser };

      const { data, error } = await client.auth.getSession();
      if (error || !data.session) {
        // Token may be expired — try refreshing
        const refreshToken = window.localStorage.getItem(REFRESH_KEY);
        if (refreshToken) {
          const { data: refreshData, error: refreshError } = await client.auth.refreshSession({ refresh_token: refreshToken });
          if (!refreshError && refreshData.session) {
            const newToken = refreshData.session.access_token;
            const newRefresh = refreshData.session.refresh_token;
            const newUser = normalizeUser(refreshData.user);
            persistSession(newToken, newUser, newRefresh);
            return { token: newToken, user: newUser };
          }
        }
        // Could not refresh — session expired; clear storage
        persistSession(null, null, null);
        return null;
      }

      // Session is valid; update stored token in case it was refreshed by SDK auto-refresh
      const freshToken = data.session.access_token;
      const freshUser = normalizeUser(data.session.user);
      persistSession(freshToken, freshUser, data.session.refresh_token);
      return { token: freshToken, user: freshUser };
    } catch {
      // If SDK fails, fall back to stored token (backend will reject if truly expired)
      return { token: storedToken, user: storedUser };
    }
  }

  /**
   * Register a Supabase onAuthStateChange listener.
   * In dev mode, this is a no-op that immediately returns an unsubscribe function.
   *
   * @param {Function} callback - called with (event, session) on auth state changes
   * @returns {Function} unsubscribe
   */
  static async subscribeToAuthChanges(callback) {
    if (AUTH_MODE !== 'supabase') {
      return () => {};
    }
    try {
      const client = await getSupabaseClient();
      if (!client) return () => {};

      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          persistSession(null, null, null);
          callback(event, null);
        } else if (session) {
          const token = session.access_token;
          const user = normalizeUser(session.user);
          persistSession(token, user, session.refresh_token);
          callback(event, { token, user });
        }
      });

      return () => subscription.unsubscribe();
    } catch {
      return () => {};
    }
  }
}
