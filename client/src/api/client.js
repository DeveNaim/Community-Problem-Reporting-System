import axios from 'axios';

const TOKEN_KEY = 'cprs_token';
const REFRESH_TOKEN_KEY = 'cprs_refresh_token';

// Read backend URL from .env (supports both BACKEND_URL and VITE_BACKEND_URL)
const rawBaseUrl =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.BACKEND_URL ||
  '';

export const BACKEND_URL = rawBaseUrl.replace(/\/+$/, '');

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(refreshToken) {
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function setAuthSession({ token, accessToken, refreshToken }) {
  const access = accessToken || token;
  if (access) setToken(access);
  if (refreshToken) setRefreshToken(refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Backwards compatibility alias
export const clearToken = clearTokens;

/**
 * Safely parse a JWT payload (base64 URL decode)
 */
export function parseJwt(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Checks whether an access token is expired, expiring soon, or >= 10 minutes old.
 * Access token total lifespan is 15 minutes; we proactively refresh every 10 minutes
 * or when within 60 seconds of expiration.
 */
export function shouldRefreshToken(token) {
  if (!token) return false;
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;

  const nowMs = Date.now();
  const expMs = decoded.exp * 1000;

  // 1. Expired or expiring within 60 seconds
  if (nowMs >= expMs - 60 * 1000) {
    return true;
  }

  // 2. Token has been alive for >= 10 minutes (600,000 ms)
  if (decoded.iat && nowMs - decoded.iat * 1000 >= 10 * 60 * 1000) {
    return true;
  }

  return false;
}

// Singleton in-flight refresh promise to prevent duplicate concurrent refresh calls
let refreshPromise = null;

/**
 * Executes a token refresh request to /api/auth/refresh using the refresh token.
 */
export async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  refreshPromise = (async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const data = response.data;
      const newAccess = data.token || data.accessToken;
      const newRefresh = data.refreshToken || refreshToken;

      if (newAccess) {
        setToken(newAccess);
      }
      if (newRefresh) {
        setRefreshToken(newRefresh);
      }

      window.dispatchEvent(
        new CustomEvent('cprs_token_refreshed', { detail: { user: data.user } })
      );

      return newAccess;
    } catch (err) {
      const isRestricted =
        err.response?.status === 403 &&
        (err.response?.data?.restricted || err.response?.data?.code === 'ACCOUNT_RESTRICTED');

      if (isRestricted) {
        window.dispatchEvent(
          new CustomEvent('cprs_account_restricted', { detail: err.response.data })
        );
      }

      clearTokens();
      window.dispatchEvent(new CustomEvent('cprs_auth_failed'));
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Checks token validity before a request, refreshing proactively if expired or older than 10 minutes.
 */
export async function ensureValidToken() {
  const currentToken = getToken();
  if (!currentToken) return null;

  if (shouldRefreshToken(currentToken)) {
    const refreshedToken = await refreshAccessToken();
    return refreshedToken || currentToken;
  }

  return currentToken;
}

// Create configured Axios instance
export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: check token validity before request and attach Authorization header
api.interceptors.request.use(
  async (config) => {
    // Skip token refresh on auth endpoints to avoid loops
    const isAuthEndpoint =
      config.url?.includes('/api/auth/login') ||
      config.url?.includes('/api/auth/register') ||
      config.url?.includes('/api/auth/refresh') ||
      config.url?.includes('/api/auth/forgot-password') ||
      config.url?.includes('/api/auth/reset-password');

    let token = getToken();

    if (!isAuthEndpoint && token) {
      // Check token validity before request: proactive refresh every 10 min / if expired
      token = await ensureValidToken();
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 token expiry retry and format errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized, not already retried, and we have a refresh token: try refreshing once
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh') &&
      !originalRequest.url?.includes('/api/auth/login')
    ) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Request failed';

    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    enhancedError.restricted = Boolean(
      error.response?.data?.restricted ||
      error.response?.data?.code === 'ACCOUNT_RESTRICTED' ||
      (error.response?.status === 403 && message.toLowerCase().includes('restricted'))
    );

    return Promise.reject(enhancedError);
  }
);

/**
 * Universal apiFetch wrapper using Axios for backward compatibility.
 * Returns response.data directly.
 */
export async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  let data = options.body;

  // Parse JSON string body if provided
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      // Keep as string if not JSON
    }
  }

  const config = {
    url: path,
    method,
    headers: { ...options.headers },
  };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && data !== undefined) {
    config.data = data;
  }

  const response = await api(config);
  return response.data;
}

/**
 * Upload helper using Axios multipart/form-data
 */
export async function apiUpload(path, formData) {
  const response = await api.post(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * File download helper using Axios with blob responseType
 */
export async function downloadAuthenticatedFile(path, filename) {
  const response = await api.get(path, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data]);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default api;
