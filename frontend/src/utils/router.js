/**
 * DrishtiMitra - Client-Side Hash Router
 * Lightweight, URL-pattern matching, history-enabled SPA router
 * Supports protected routes (requiresAuth), query parameters, and unsaved changes confirmation
 */

import { authContext } from '../context/AuthContext.js';
import { inspectionContext } from '../context/InspectionContext.js';

class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    this.currentParams = {};
    this.currentQuery = {};
    this.activePath = '';
    this.listeners = [];
    this.isNavigatingBack = false;

    window.addEventListener('hashchange', () => this.handleHashChange());

    // Window level beforeunload guard
    window.addEventListener('beforeunload', (e) => {
      if (inspectionContext.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = 'Your inspection has unsaved changes. Leave anyway?';
        return e.returnValue;
      }
    });
  }

  addRoute(pattern, component, options = {}) {
    // Pattern example: '/inspections/:id/review'
    const paramNames = [];
    const regexPattern = pattern
      .replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/?]+)';
      })
      .replace(/\//g, '\\/');

    const regex = new RegExp(`^${regexPattern}$`);
    this.routes.push({ pattern, regex, paramNames, component, options });
  }

  handleHashChange() {
    const rawHash = window.location.hash || '#/dashboard';
    // Strip leading '#'
    const rawPath = rawHash.replace(/^#/, '') || '/dashboard';

    // Parse path and query string
    const [pathOnly, queryString] = rawPath.split('?');
    const path = pathOnly || '/dashboard';

    // Check unsaved changes if navigating to a different destination
    if (!this.isNavigatingBack && this.activePath && this.activePath !== path) {
      // If moving from an active unsaved inspection to somewhere outside that inspection
      const isLeavingInspection = 
        (this.activePath.includes('/report') || this.activePath.includes('/review') || (this.activePath.includes('/scan') && inspectionContext.getState().surfaces.length > 0)) &&
        !path.includes(this.activePath);

      if (isLeavingInspection && inspectionContext.hasUnsavedChanges()) {
        const confirmLeave = window.confirm('Your inspection has unsaved changes. Leave anyway?');
        if (!confirmLeave) {
          this.isNavigatingBack = true;
          window.location.hash = '#' + this.activePath;
          setTimeout(() => { this.isNavigatingBack = false; }, 50);
          return;
        }
      }
    }

    // Parse query params
    const query = {};
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      for (const [key, value] of searchParams.entries()) {
        query[key] = value;
      }
    }

    let matched = null;
    let params = {};

    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (match) {
        matched = route;
        route.paramNames.forEach((name, index) => {
          params[name] = decodeURIComponent(match[index + 1]);
        });
        break;
      }
    }

    if (!matched) {
      // Fallback to default route ('/dashboard' or '/')
      const defaultRoute = this.routes.find(r => r.pattern === '/dashboard' || r.pattern === '/');
      matched = defaultRoute || this.routes[0];
      params = {};
    }

    // Auth Protection Check
    const authState = authContext.getState();
    const hasStoredToken = Boolean(window.localStorage.getItem('dm_access_token'));

    if (matched?.options?.requiresAuth) {
      // If we don't have a token and aren't authenticated, redirect to login
      if (!authState.isAuthenticated && !hasStoredToken && !authState.isLoading) {
        const redirectUrl = `#/login?redirect=${encodeURIComponent(path)}`;
        if (window.location.hash !== redirectUrl) {
          window.location.hash = redirectUrl;
          return;
        }
      }
    }

    this.activePath = path;
    this.currentRoute = matched;
    this.currentParams = params;
    this.currentQuery = query;
    this.notify(matched, params, path, query);
  }

  navigate(path) {
    const cleanPath = path.startsWith('#') ? path : `#${path.startsWith('/') ? path : `/${path}`}`;
    if (window.location.hash === cleanPath) {
      this.handleHashChange();
    } else {
      window.location.hash = cleanPath;
    }
  }

  getQuery() {
    return this.currentQuery;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(route, params, path, query) {
    for (const callback of this.listeners) {
      callback(route, params, path, query);
    }
  }

  init() {
    this.handleHashChange();
  }
}

export const router = new Router();
