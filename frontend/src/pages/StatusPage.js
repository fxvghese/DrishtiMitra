/**
 * DrishtiMitra - StatusPage Component
 * System Diagnostics, Database Connectivity & Backend Settings
 */

import { renderStatusBadge } from '../components/StatusBadge.js';
import { renderButton } from '../components/Button.js';
import { renderLoadingSpinner } from '../components/LoadingSpinner.js';
import { icons } from '../assets/icons.js';
import { checkHealth } from '../services/api.js';
import { API_BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, AUTH_MODE } from '../utils/constants.js';
import { authContext } from '../context/AuthContext.js';

let statusState = {
  data: null,
  isLoading: false,
  error: null,
};

export function renderStatusPage() {
  const authState = authContext.getState();
  const currentMode = authState.authMode;

  return `
    <div class="status-page-container animate-fade-in" style="max-width: 720px; margin: 0 auto;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-6);">
        <div>
          <h1 style="font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary);">
            System Diagnostics & Settings
          </h1>
          <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 2px;">
            Real-time health verification of FastAPI backend, database, and auth configuration
          </p>
        </div>

        ${renderButton({
          id: 'btn-refresh-health',
          text: 'Refresh',
          variant: 'secondary',
          size: 'sm',
          icon: icons.refresh,
        })}
      </div>

      <div id="health-details-container">
        ${renderHealthDetails()}
      </div>

      <!-- Authentication Configuration Card -->
      <div class="card card-glass" style="margin-top: var(--space-6);">
        <div class="card-header">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <h3 class="card-title">${icons.user} Authentication & Supabase Config</h3>
            <span class="badge ${currentMode === 'supabase' ? 'badge-compliant' : 'badge-review'}">
              Mode: ${currentMode === 'supabase' ? 'Supabase JWT' : 'Dev Passthrough'}
            </span>
          </div>
        </div>
        <div class="card-body">
          <p style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-4); line-height: 1.5;">
            The backend authenticates requests by validating Supabase JWTs in the <code>Authorization: Bearer</code> header.
            When Supabase credentials are configured, the frontend signs in directly with Supabase Auth to obtain real JWTs.
            In development mode, requests use <code>development-token</code>, which FastAPI accepts in <code>APP_ENV=development</code>.
          </p>

          <div class="form-group" style="margin-bottom: var(--space-4);">
            <label class="form-label" for="supabase-url-input">Supabase Project URL</label>
            <input
              type="text"
              id="supabase-url-input"
              class="form-input"
              placeholder="https://xyzcompany.supabase.co"
              value="${window.localStorage.getItem('dm_supabase_url') || ''}"
              style="font-family: var(--font-mono); font-size: var(--text-xs);"
            />
          </div>

          <div class="form-group" style="margin-bottom: var(--space-4);">
            <label class="form-label" for="supabase-anon-key-input">Supabase Anon Key (Public Key)</label>
            <input
              type="password"
              id="supabase-anon-key-input"
              class="form-input"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value="${window.localStorage.getItem('dm_supabase_anon_key') || ''}"
              style="font-family: var(--font-mono); font-size: var(--text-xs);"
            />
            <span class="form-hint">Safe to store in browser localStorage. Never enter service_role secret keys.</span>
          </div>

          <div style="display: flex; gap: var(--space-3); margin-top: var(--space-4); flex-wrap: wrap;">
            ${renderButton({
              id: 'btn-save-supabase',
              text: 'Save Auth Credentials',
              variant: 'primary',
              size: 'sm',
              icon: icons.checkCircle,
            })}
            ${renderButton({
              id: 'btn-reset-supabase',
              text: 'Reset to Dev Passthrough',
              variant: 'secondary',
              size: 'sm',
            })}
          </div>
        </div>
      </div>

      <!-- Settings / Configuration Card -->
      <div class="card card-glass" style="margin-top: var(--space-6);">
        <div class="card-header">
          <h3 class="card-title">${icons.database} Backend Service URL Configuration</h3>
        </div>
        <div class="card-body">
          <p style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-3);">
            Configure the API base URL used by this frontend to interact with FastAPI.
          </p>
          <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
            <input type="text" id="api-base-url-input" class="form-input" value="${API_BASE_URL}" style="font-family: var(--font-mono); font-size: var(--text-xs); flex: 1; min-width: 200px;" />
            ${renderButton({
              id: 'btn-save-api-url',
              text: 'Save & Test',
              variant: 'primary',
              size: 'sm',
            })}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderHealthDetails() {
  if (statusState.isLoading) {
    return renderLoadingSpinner('Querying GET /health endpoint...');
  }

  if (statusState.error) {
    return `
      <div class="card card-glass" style="border-color: var(--color-danger-border); background: rgba(239, 68, 68, 0.05); padding: var(--space-5);">
        <div style="display: flex; align-items: center; gap: var(--space-3); color: var(--color-danger-text); margin-bottom: var(--space-2);">
          ${icons.xCircle}
          <h4 style="font-weight: 700;">Backend Disconnected or Unreachable</h4>
        </div>
        <p style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.5;">
          ${statusState.error}
        </p>
        <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-3);">
          Run in terminal: <code style="color: var(--primary-400);">python -m uvicorn backend.main:app --reload --port 8000</code>
        </p>
      </div>
    `;
  }

  const h = statusState.data;
  if (!h) return '';

  const isConnected = h.database?.status === 'CONNECTED';

  return `
    <div class="card card-glass animate-fade-in">
      <div class="card-header">
        <div style="display: flex; align-items: center; gap: var(--space-2);">
          <span style="width: 10px; height: 10px; border-radius: 50%; background: ${isConnected ? 'var(--color-success)' : 'var(--color-danger)'}; box-shadow: 0 0 8px ${isConnected ? 'var(--color-success)' : 'var(--color-danger)'};"></span>
          <h3 class="card-title">${h.app_name || 'Legal Metrology Compliance API'}</h3>
        </div>
        <span class="badge ${isConnected ? 'badge-compliant' : 'badge-non-compliant'}">
          ${h.status || 'unknown'}
        </span>
      </div>

      <div class="card-body">
        <div class="table-responsive">
          <table class="data-table">
            <tbody>
              <tr>
                <td style="font-weight: 600; width: 35%;">API Service Status</td>
                <td><span style="color: var(--color-success-text); font-weight: 700;">${h.status}</span></td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Environment</td>
                <td><span style="font-family: var(--font-mono); font-size: var(--text-xs);">${h.environment}</span></td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Backend Version</td>
                <td><span style="font-family: var(--font-mono); font-size: var(--text-xs);">v${h.version}</span></td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Database Engine</td>
                <td><span style="font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase;">${h.database?.engine}</span></td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Database Connectivity</td>
                <td>
                  <span style="font-weight: 700; color: ${isConnected ? 'var(--color-success-text)' : 'var(--color-danger-text)'};">
                    ${h.database?.status}
                  </span>
                  <div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">
                    ${h.database?.details || 'SELECT 1 connectivity verification passed'}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Supabase Client</td>
                <td>
                  <span style="font-family: var(--font-mono); font-size: var(--text-xs);">
                    ${h.database?.supabase_configured ? 'Configured (Cloud PostgreSQL)' : 'SQLite Local Fallback'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function attachStatusPageEvents() {
  const btnRefresh = document.getElementById('btn-refresh-health');
  const btnSaveUrl = document.getElementById('btn-save-api-url');
  const inputUrl = document.getElementById('api-base-url-input');

  const btnSaveSupabase = document.getElementById('btn-save-supabase');
  const btnResetSupabase = document.getElementById('btn-reset-supabase');
  const inputSupabaseUrl = document.getElementById('supabase-url-input');
  const inputSupabaseAnonKey = document.getElementById('supabase-anon-key-input');

  const fetchHealth = async () => {
    statusState.isLoading = true;
    statusState.error = null;

    const container = document.getElementById('health-details-container');
    if (container) container.innerHTML = renderHealthDetails();

    try {
      const data = await checkHealth();
      statusState.data = data;
    } catch (err) {
      statusState.error = err.message || 'Could not connect to /health.';
      statusState.data = null;
    } finally {
      statusState.isLoading = false;
      if (container) container.innerHTML = renderHealthDetails();
    }
  };

  if (btnRefresh) {
    btnRefresh.addEventListener('click', fetchHealth);
  }

  if (btnSaveUrl && inputUrl) {
    btnSaveUrl.addEventListener('click', () => {
      const newUrl = inputUrl.value.trim().replace(/\/+$/, '');
      if (newUrl) {
        window.localStorage.setItem('dm_api_base_url', newUrl);
        alert(`API base URL updated to ${newUrl}. Reloading health now...`);
        fetchHealth();
      }
    });
  }

  if (btnSaveSupabase && inputSupabaseUrl && inputSupabaseAnonKey) {
    btnSaveSupabase.addEventListener('click', () => {
      const url = inputSupabaseUrl.value.trim().replace(/\/+$/, '');
      const key = inputSupabaseAnonKey.value.trim();

      if (!url || !key) {
        alert('Please provide both a Supabase URL and an Anon Key.');
        return;
      }

      window.localStorage.setItem('dm_supabase_url', url);
      window.localStorage.setItem('dm_supabase_anon_key', key);
      alert('Supabase authentication configuration saved. The page will reload.');
      window.location.reload();
    });
  }

  if (btnResetSupabase) {
    btnResetSupabase.addEventListener('click', () => {
      window.localStorage.removeItem('dm_supabase_url');
      window.localStorage.removeItem('dm_supabase_anon_key');
      alert('Reset to Development Passthrough mode. The page will reload.');
      window.location.reload();
    });
  }

  // Initial fetch
  fetchHealth();
}
