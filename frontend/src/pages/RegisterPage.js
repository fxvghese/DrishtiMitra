/**
 * DrishtiMitra - RegisterPage Component
 * User registration interface supporting both Supabase Auth and Dev Mode simulation
 */

import { renderButton } from '../components/Button.js';
import { icons } from '../assets/icons.js';
import { authContext } from '../context/AuthContext.js';
import { router } from '../utils/router.js';

let registerState = {
  email: '',
  password: '',
  confirmPassword: '',
  localError: '',
  successMessage: '',
  emailConfirmationRequired: false,
};

export function renderRegisterPage() {
  const authState = authContext.getState();
  const isDevMode = authState.authMode === 'dev';

  return `
    <div class="login-page-container animate-fade-in" style="max-width: 480px; width: 100%; margin: var(--space-6) auto; padding: 0 var(--space-2);">
      <div style="text-align: center; margin-bottom: var(--space-6);">
        <div style="width: 52px; height: 52px; border-radius: var(--radius-lg); background: linear-gradient(135deg, var(--primary-600), #10b981); display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 0 20px var(--primary-glow); margin-bottom: var(--space-3);">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        <h2 style="font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary);">
          Officer Registration
        </h2>
        <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px;">
          Create your Legal Metrology inspection account
        </p>

        <div style="margin-top: var(--space-3); display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: var(--radius-full); font-size: var(--text-xs); font-family: var(--font-mono); background: ${isDevMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; border: 1px solid ${isDevMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}; color: ${isDevMode ? 'var(--primary-400)' : 'var(--color-success-text)'};">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: ${isDevMode ? 'var(--primary-400)' : 'var(--color-success)'};"></span>
          <span>Auth Mode: ${isDevMode ? 'Development Passthrough' : 'Supabase Production'}</span>
        </div>
      </div>

      <div class="card card-glass" style="margin-bottom: var(--space-4);">
        ${registerState.emailConfirmationRequired ? `
          <div style="text-align: center; padding: var(--space-4) 0;">
            <div style="margin-bottom: var(--space-3); color: var(--color-success-text);">
              ${icons.checkCircle}
            </div>
            <h4 style="font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-2);">
              Verification Email Sent
            </h4>
            <p style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.5; margin-bottom: var(--space-5);">
              A confirmation link was sent to <strong style="color: var(--text-primary);">${registerState.email}</strong>. Please check your inbox and verify your email before signing in.
            </p>
            ${renderButton({
              id: 'btn-go-to-login-after-register',
              text: 'Return to Sign In',
              variant: 'primary',
              icon: icons.user,
              attributes: 'style="width: 100%;"',
            })}
          </div>
        ` : `
          ${(registerState.localError || authState.error) ? `
            <div class="alert alert-danger" style="margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: var(--color-danger-text); font-size: var(--text-sm);">
              ${icons.alertTriangle}
              <span>${registerState.localError || authState.error}</span>
            </div>
          ` : ''}

          <form id="register-form">
            <div class="form-group" style="margin-bottom: var(--space-4);">
              <label class="form-label" for="register-email">Official Email</label>
              <input
                type="email"
                id="register-email"
                class="form-input"
                placeholder="officer@legalmetrology.gov.in"
                value="${registerState.email}"
                required
                autocomplete="email"
              />
              <span class="form-hint">Must be a valid email format</span>
            </div>

            <div class="form-group" style="margin-bottom: var(--space-4);">
              <label class="form-label" for="register-password">Password</label>
              <input
                type="password"
                id="register-password"
                class="form-input"
                placeholder="Minimum 6 characters"
                value="${registerState.password}"
                required
                minlength="6"
                autocomplete="new-password"
              />
              <span class="form-hint">At least 6 characters</span>
            </div>

            <div class="form-group" style="margin-bottom: var(--space-5);">
              <label class="form-label" for="register-confirm-password">Confirm Password</label>
              <input
                type="password"
                id="register-confirm-password"
                class="form-input"
                placeholder="Repeat password"
                value="${registerState.confirmPassword}"
                required
                minlength="6"
                autocomplete="new-password"
              />
            </div>

            <div style="margin-top: var(--space-5);">
              ${renderButton({
                type: 'submit',
                id: 'btn-submit-register',
                text: authState.isAuthenticating ? 'Registering Account...' : 'Create Officer Account',
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
            <span style="font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase;">or</span>
            <div style="flex: 1; height: 1px; background: var(--border-glass);"></div>
          </div>

          <div style="text-align: center;">
            <a href="#/login" class="nav-link" style="display: inline-flex; justify-content: center; width: 100%; padding: var(--space-2);">
              Already have an account? Sign In
            </a>
          </div>
        `}
      </div>

      <div style="text-align: center; font-size: var(--text-xs); color: var(--text-muted); line-height: 1.5;">
        ${isDevMode
          ? 'Development mode: Registration succeeds instantly with a local development session.'
          : 'Production mode: Accounts are verified and stored via Supabase Auth.'}
      </div>
    </div>
  `;
}

export function attachRegisterPageEvents() {
  const form = document.getElementById('register-form');
  const emailInput = document.getElementById('register-email');
  const passwordInput = document.getElementById('register-password');
  const confirmInput = document.getElementById('register-confirm-password');

  if (emailInput) {
    emailInput.addEventListener('input', (e) => {
      registerState.email = e.target.value;
      if (registerState.localError) {
        registerState.localError = '';
        authContext.clearError();
      }
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      registerState.password = e.target.value;
      if (registerState.localError) {
        registerState.localError = '';
        authContext.clearError();
      }
    });
  }

  if (confirmInput) {
    confirmInput.addEventListener('input', (e) => {
      registerState.confirmPassword = e.target.value;
      if (registerState.localError) {
        registerState.localError = '';
        authContext.clearError();
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput?.value.trim();
      const password = passwordInput?.value;
      const confirm = confirmInput?.value;

      // Validation
      if (!email || !email.includes('@')) {
        registerState.localError = 'Please provide a valid email address.';
        router.handleHashChange();
        return;
      }

      if (!password || password.length < 6) {
        registerState.localError = 'Password must be at least 6 characters long.';
        router.handleHashChange();
        return;
      }

      if (password !== confirm) {
        registerState.localError = 'Passwords do not match. Please re-enter.';
        router.handleHashChange();
        return;
      }

      registerState.localError = '';
      const result = await authContext.register(email, password);

      if (result.success) {
        if (result.requiresEmailConfirmation) {
          registerState.emailConfirmationRequired = true;
          router.handleHashChange();
        } else {
          // Auto-authenticated -> Navigate to dashboard
          router.navigate('/dashboard');
        }
      } else {
        // Error is captured in authContext.getState().error
        router.handleHashChange();
      }
    });
  }

  const btnReturn = document.getElementById('btn-go-to-login-after-register');
  if (btnReturn) {
    btnReturn.addEventListener('click', () => {
      registerState.emailConfirmationRequired = false;
      router.navigate('/login');
    });
  }
}
