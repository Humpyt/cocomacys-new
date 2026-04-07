import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

const API_BASE = '/api';

export interface AdminUser {
  id: number;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Auth routes are at /auth/* on Express (not /api/auth/*)
async function authFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(path, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await authFetch('/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authFetch('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, loading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
