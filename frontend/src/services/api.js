/**
 * DrishtiMitra - Base API Fetch Client
 * Handles CORS, error parsing, JWT Bearer headers, and 401 session expiry handling.
 */

import { API_BASE_URL } from '../utils/constants.js';

export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  
  // Attach token if present and not already specified
  const token = window.localStorage.getItem('dm_access_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Handle body: if not FormData, set Content-Type: application/json
  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  const config = {
    ...options,
    headers,
    body,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    // ── 401 Unauthorized: session has expired or token is invalid ──────────
    if (response.status === 401) {
      // Dynamically import authContext to avoid circular dependency at module load
      try {
        const { authContext } = await import('../context/AuthContext.js');
        authContext.handleUnauthorized();
      } catch {
        // Fallback: clear storage manually and redirect to login
        window.localStorage.removeItem('dm_access_token');
        window.localStorage.removeItem('dm_officer_user');
        window.location.hash = '#/login';
      }
      throw new ApiError(
        'Your session has expired. Please log in again.',
        401,
        null
      );
    }

    const contentType = response.headers.get('content-type') || '';
    let responseData = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      if (responseData && typeof responseData === 'object') {
        errorMessage = responseData.detail || responseData.message || errorMessage;
      }
      throw new ApiError(errorMessage, response.status, responseData);
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or CORS failure
    throw new ApiError(
      `Cannot connect to backend server at ${API_BASE_URL}. Ensure FastAPI is running.`,
      0,
      error
    );
  }
}

export async function checkHealth() {
  return request('/health', { method: 'GET' });
}
