import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface Customer {
  id: number;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
}

interface CustomerAuthContextValue {
  customer: Customer | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

async function authFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(path, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await authFetch('/auth/customer/me');
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authFetch('/auth/customer/logout', { method: 'POST' });
    } finally {
      setCustomer(null);
      window.location.href = '/customer/login';
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, checkAuth, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
