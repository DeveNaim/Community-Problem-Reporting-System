import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  apiFetch,
  clearTokens,
  getToken,
  getRefreshToken,
  refreshAccessToken,
  setAuthSession,
} from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restrictedNotice, setRestrictedNotice] = useState(null);

  const loadUser = useCallback(async () => {
    const token = getToken();
    const refreshToken = getRefreshToken();

    if (!token && !refreshToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch('/api/users/me');
      setUser(data.user);
      setRestrictedNotice(null);
    } catch (err) {
      if (err.restricted) {
        setRestrictedNotice(err.message);
      }
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Listen to cross-cutting token refresh and restriction events from api client
  useEffect(() => {
    function handleTokenRefreshed(e) {
      if (e.detail?.user) {
        setUser(e.detail.user);
      }
    }

    function handleAccountRestricted(e) {
      const msg =
        e.detail?.message ||
        'Your account has been restricted by an administrator. Please contact municipal support.';
      setRestrictedNotice(msg);
      setUser(null);
    }

    function handleAuthFailed() {
      setUser(null);
    }

    window.addEventListener('cprs_token_refreshed', handleTokenRefreshed);
    window.addEventListener('cprs_account_restricted', handleAccountRestricted);
    window.addEventListener('cprs_auth_failed', handleAuthFailed);

    return () => {
      window.removeEventListener('cprs_token_refreshed', handleTokenRefreshed);
      window.removeEventListener('cprs_account_restricted', handleAccountRestricted);
      window.removeEventListener('cprs_auth_failed', handleAuthFailed);
    };
  }, []);

  // Proactive background refresh every 10 minutes while user is authenticated
  useEffect(() => {
    if (!user) return;

    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const intervalId = setInterval(() => {
      refreshAccessToken().catch(() => {});
    }, TEN_MINUTES_MS);

    return () => clearInterval(intervalId);
  }, [user]);

  const login = useCallback(async (email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    setRestrictedNotice(null);

    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: normalizedEmail, password }),
    });

    setAuthSession({
      token: data.token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    setRestrictedNotice(null);
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setAuthSession({
      token: data.token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setRestrictedNotice(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await apiFetch('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      restrictedNotice,
      clearRestrictedNotice: () => setRestrictedNotice(null),
      login,
      register,
      logout,
      updateProfile,
      refreshUser: loadUser,
    }),
    [user, loading, restrictedNotice, login, register, logout, updateProfile, loadUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
