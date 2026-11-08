// src/context/AuthContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStore.get());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  // Restore the session from a stored token; drop it if the API rejects it.
  useEffect(() => {
    if (!token) return;
    let alive = true;
    setLoading(true);
    api('/auth/me')
      .then((u) => alive && setUser(u))
      .catch(() => {
        if (!alive) return;
        tokenStore.clear();
        setToken(null);
        setUser(null);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [token]);

  const startSession = useCallback((data) => {
    tokenStore.set(data.token);
    setUser(data.user);
    setToken(data.token);
    return data.user;
  }, []);

  const login = useCallback(
    async (email, password) => startSession(await api('/auth/login', { method: 'POST', body: { email, password } })),
    [startSession]
  );

  const register = useCallback(
    async (name, email, password) =>
      startSession(await api('/auth/register', { method: 'POST', body: { name, email, password } })),
    [startSession]
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout }),
    [token, user, loading, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
