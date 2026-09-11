/**
 * DrishtiMitra - LoginPage Component
 * Authentication interface supporting both Supabase JWT & Development test-token login
 */

import { renderButton } from '../components/Button.js';
import { icons } from '../assets/icons.js';
import { authContext } from '../context/AuthContext.js';
import { router } from '../utils/router.js';

let loginFormState = {
  email: 'inspector@legalmetrology.gov.in',
  password: 'OfficerSecret2026!',
  localError: '',
};

export function renderLoginPage() {
  const authState = authContext.getState();
  const isDevMode = authState.authMode === 'dev';
  const query = router.getQuery();
  const redirectTarget = query.redirect || '/scan';

  return `
    <div class="login-page-container animate-fade-in" style="max-width: 480px; width: 100%; margin: var(--space-6) auto; padding: 0 var(--space-2);">
      <div style="text-align: center; margin-bottom: var(--space-6);">
        <div style="width: 52px; height: 52px; border-radius: var(--radius-lg); background: linear-gradient(135deg, var(--primary-600), #10b981); display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 0 20px var(--primary-glow); margin-bottom: var(--space-3);">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <circle cx="12" cy="11" r="3"/>
          </svg>
        </div>
        <h2 style="font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary);">
          Officer Portal Sign In
        </h2>
        <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px;">
          Legal Metrology Inspection & Compliance System
        </p>

        <div style="margin-top: var(--space-3); display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: var(--radius-full); font-size: var(--text-xs); font-family: var(--font-mono); background: ${isDevMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; border: 1px solid ${isDevMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}; color: ${isDevMode ? 'var(--primary-400)' : 'var(--color-success-text)'};">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: ${isDevMode ? 'var(--primary-400)' : 'var(--color-success)'};"></span>
          <span>Auth Mode: ${isDevMode ? 'Development Passthrough' : 'Supabase Production'}</span>
        </div>
      </div>

      <div class="card card-glass" style="margin-bottom: var(--space-4);">
        ${authState.isAuthenticated ? `
          <div style="text-align: center; padding: var(--space-4) 0;">
            <div style="margin-bottom: var(--space-2); color: var(--color-success-text);">
              ${icons.checkCircle}
            </div>
            <h4 style="font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
              Currently Authenticated
            </h4>
            <p style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono); margin-bottom: var(--space-4);">
              ${authState.user?.email || 'Officer Session'}
            </p>
            <div style="display: flex; gap: var(--space-3); justify-content: center;">
              ${renderButton({
                id: 'btn-go-to-scanner',
                text: 'Go to Dashboard',
                variant: 'primary',
                icon: icons.layout,
              })}
              ${renderButton({
                id: 'btn-sign-out-current',
                text: 'Sign Out',
                variant: 'danger',
                icon: icons.logOut,
              })}
            </div>
          </div>
        ` : `
          ${(loginFormState.localError || authState.error) ? `
            <div class="alert alert-danger" style="margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: var(--color-danger-text); font-size: var(--text-sm);">
              ${icons.alertTriangle}
              <span>${loginFormState.localError || authState.error}</span>
            </div>
          ` : ''}

          <form id="login-form">
            <div class="form-group" style="margin-bottom: var(--space-4);">
              <label class="form-label" for="login-email">Officer Email</label>
              <input
                type="email"
                id="login-email"
                class="form-input"
                placeholder="officer@legalmetrology.gov.in"
                value="${loginFormState.email}"
                required
                autocomplete="email"
              />
            </div>

            <div class="form-group" style="margin-bottom: var(--space-4);">
              <label class="form-label" for="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                class="form-input"
                placeholder="••••••••"
                value="${loginFormState.password}"
                required
                autocomplete="current-password"
              />
            </div>

            <div style="margin-top: var(--space-5);">
              ${renderButton({
                type: 'submit',
                id: 'btn-submit-login',
                text: authState.isAuthenticating ? 'Signing In...' : 'Sign In with Credentials',
                variant: 'primary',
                className: 'w-full',
                icon: authState.isAuthenticating ? icons.refresh : icons.user,
                disabled: authState.isAuthenticating,
                attributes: 'style="width: 100%;"',
              })}
            </div>
          </form>

          <div style="margin: var(--space-5) 0; display: flex; align-items: center; gap: var(--space-3);">
            <div style="flex: 1; height: 1px; background: var(--border-glass);"></div>
            <span style="font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase;">or instant inspector login</span>
            <div style="flex: 1; height: 1px; background: var(--border-glass);"></div>
          </div>

          ${renderButton({
            id: 'btn-demo-login',
            text: authState.isAuthenticating ? 'Authenticating...' : 'One-Click Authorized Inspector Login',
            variant: 'secondary',
            icon: icons.sparkles,
            disabled: authState.isAuthenticating,
            attributes: 'style="width: 100%;"',
          })}

          <div style="margin-top: var(--space-4); text-align: center;">
            <a href="#/register" class="nav-link" style="display: inline-flex; justify-content: center; width: 100%; padding: var(--space-2); font-size: var(--text-xs);">
              Don't have an account? Register Officer Account
            </a>
          </div>
        `}
      </div>

      <div style="text-align: center; font-size: var(--text-xs); color: var(--text-muted); line-height: 1.5;">
        ${isDevMode
          ? 'Development Mode Active: Backend accepts development-token for all legal metrology inspections.'
          : 'Protected by Supabase Auth with Row-Level Security (RLS). Inspections are strictly scoped to the authenticated officer ID.'}
      </div>
    </div>
  `;
}

export function attachLoginPageEvents() {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  if (emailInput) {
    emailInput.addEventListener('input', (e) => {
      loginFormState.email = e.target.value;
      if (loginFormState.localError) {
        loginFormState.localError = '';
        authContext.clearError();
      }
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      loginFormState.password = e.target.value;
      if (loginFormState.localError) {
        loginFormState.localError = '';
        authContext.clearError();
      }
    });
  }

  const handlePostLoginRedirect = () => {
    const query = router.getQuery();
    const destination = query.redirect || '/dashboard';
    router.navigate(destination);
  };

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput?.value.trim();
      const pwd = passwordInput?.value;

      if (!email || !email.includes('@')) {
        loginFormState.localError = 'Please enter a valid officer email address.';
        router.handleHashChange();
        return;
      }

      if (!pwd) {
        loginFormState.localError = 'Password cannot be blank.';
        router.handleHashChange();
        return;
      }

      loginFormState.localError = '';
      const success = await authContext.login(email, pwd);
      if (success) {
        handlePostLoginRedirect();
      } else {
        router.handleHashChange();
      }
    });
  }

  const btnDemo = document.getElementById('btn-demo-login');
  if (btnDemo) {
    btnDemo.addEventListener('click', async () => {
      loginFormState.localError = '';
      const success = await authContext.login('inspector@legalmetrology.gov.in', 'OfficerSecret2026!');
      if (success) {
        handlePostLoginRedirect();
      } else {
        router.handleHashChange();
      }
    });
  }

  const btnGo = document.getElementById('btn-go-to-scanner');
  if (btnGo) {
    btnGo.addEventListener('click', () => handlePostLoginRedirect());
  }

  const btnSignOut = document.getElementById('btn-sign-out-current');
  if (btnSignOut) {
    btnSignOut.addEventListener('click', async () => {
      await authContext.logout();
      router.navigate('/login');
    });
  }
}
