/**
 * DrishtiMitra - Application Main Entrypoint
 * Bootstraps routing, global state listeners, and view lifecycle
 * Flow: LOGIN → DASHBOARD → NEW INSPECTION → VERIFY → REPORT → SAVE → HISTORY → DETAILS
 */

import { router } from './utils/router.js';
import { renderMainLayout } from './layouts/MainLayout.js';
import { renderDashboardPage, attachDashboardPageEvents } from './pages/DashboardPage.js';
import { renderInspectionDetailPage, attachInspectionDetailPageEvents } from './pages/InspectionDetailPage.js';
import { renderScanPage, attachScanPageEvents } from './pages/ScanPage.js';
import { renderReviewPage, attachReviewPageEvents } from './pages/ReviewPage.js';
import { renderReportPage, attachReportPageEvents } from './pages/ReportPage.js';
import { renderCataloguePage, attachCataloguePageEvents } from './pages/CataloguePage.js';
import { renderLoginPage, attachLoginPageEvents } from './pages/LoginPage.js';
import { renderRegisterPage, attachRegisterPageEvents } from './pages/RegisterPage.js';
import { renderStatusPage, attachStatusPageEvents } from './pages/StatusPage.js';
import { checkHealth } from './services/api.js';
import { authContext } from './context/AuthContext.js';
import { inspectionContext } from './context/InspectionContext.js';

let backendHealthStatus = 'healthy';

async function updateBackendHealth() {
  try {
    const health = await checkHealth();
    backendHealthStatus = health?.status === 'healthy' ? 'healthy' : 'degraded';
  } catch {
    backendHealthStatus = 'disconnected';
  }
}

function initApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // ── Register All Routes with Authentication Requirements ─────────────────
  router.addRoute('/', {
    render: renderDashboardPage,
    attach: attachDashboardPageEvents,
  }, { requiresAuth: true });

  router.addRoute('/dashboard', {
    render: renderDashboardPage,
    attach: attachDashboardPageEvents,
  }, { requiresAuth: true });

  router.addRoute('/history', {
    render: renderDashboardPage,
    attach: attachDashboardPageEvents,
  }, { requiresAuth: true });

  router.addRoute('/scan', {
    render: renderScanPage,
    attach: attachScanPageEvents,
  }, { requiresAuth: true });

  router.addRoute('/inspections/:id/review', {
    render: renderReviewPage,
    attach: attachReviewPageEvents,
  }, { requiresAuth: true });

  router.addRoute('/inspections/:id/report', {
    render: renderReportPage,
    attach: attachReportPageEvents,
  }, { requiresAuth: true });

  router.addRoute('/inspections/:id/details', {
    render: renderInspectionDetailPage,
    attach: attachInspectionDetailPageEvents,
  }, { requiresAuth: true });

  router.addRoute('/catalogue', {
    render: renderCataloguePage,
    attach: attachCataloguePageEvents,
  }, { requiresAuth: false });

  router.addRoute('/login', {
    render: renderLoginPage,
    attach: attachLoginPageEvents,
  }, { requiresAuth: false });

  router.addRoute('/register', {
    render: renderRegisterPage,
    attach: attachRegisterPageEvents,
  }, { requiresAuth: false });

  router.addRoute('/status', {
    render: renderStatusPage,
    attach: attachStatusPageEvents,
  }, { requiresAuth: false });

  // Handle Route Transitions
  router.subscribe((route, params, path) => {
    const contentHtml = route.component.render(params);
    appContainer.innerHTML = renderMainLayout(contentHtml, path, backendHealthStatus);
    
    // Attach page-specific events
    if (typeof route.component.attach === 'function') {
      route.component.attach(params);
    }

    // Attach global navbar actions (e.g. Logout button)
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        await authContext.logout();
        router.navigate('/login');
      });
    }

    const btnMobileLogout = document.getElementById('btn-mobile-logout');
    if (btnMobileLogout) {
      btnMobileLogout.addEventListener('click', async () => {
        await authContext.logout();
        router.navigate('/login');
      });
    }

    // Attach Mobile Navigation Toggle
    const btnToggle = document.getElementById('btn-mobile-nav-toggle');
    const drawer = document.getElementById('mobile-nav-drawer');
    if (btnToggle && drawer) {
      btnToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        drawer.classList.toggle('open');
      });

      // Close drawer when any link inside is clicked
      drawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          drawer.classList.remove('open');
        });
      });

      // Close drawer on outside click
      document.addEventListener('click', (e) => {
        if (!drawer.contains(e.target) && e.target !== btnToggle) {
          drawer.classList.remove('open');
        }
      });
    }
  });

  // Re-render when auth changes
  authContext.subscribe(() => {
    router.handleHashChange();
  });

  // Re-render when inspection state changes
  inspectionContext.subscribe(() => {
    const hash = window.location.hash || '';
    if (hash.includes('/review') || hash.includes('/scan')) {
      router.handleHashChange();
    }
  });

  // Check health on boot and poll every 30s
  updateBackendHealth().then(() => {
    router.init();
  });
  setInterval(updateBackendHealth, 30000);
}

// Boot application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
