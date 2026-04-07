# Customer Google OAuth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace email/password customer auth with Google OAuth, using shared admin_users table and session returnTo to distinguish admin vs customer post-login destinations.

**Architecture:** Google OAuth for both admin and customers (shared admin_users table). GET /auth/google accepts ?returnTo param stored in session. Callback redirects to stored returnTo. CustomerAuthContext reads from same passport session (req.user) as admin.

**Tech Stack:** passport-google-oauth20, express-session, React Context

---

## File Map

| File | Responsibility |
|------|----------------|
| `server/routes/auth.cjs` | Google OAuth routes, session returnTo, login/logout/me |
| `src/context/CustomerAuthContext.tsx` | Customer auth state (login/logout/checkAuth) |
| `src/pages/customer/Login.tsx` | Google OAuth redirect button |
| `src/pages/customer/Register.tsx` | Google OAuth redirect (no register form) |
| `src/pages/customer/Account.tsx` | Order history, fix link to orders page |

---

## Task 1: Simplify server/routes/auth.cjs

**Files:**
- Modify: `server/routes/auth.cjs`

- [ ] **Step 1: Remove email/password routes**

Replace the entire file content (keeping the passport Google strategy and admin routes) with this cleaned-up version:

```javascript
const express = require('express');
const router = express.Router();
const pool = require('../db.cjs');
const passport = require('passport');

// Lazy-load passport configuration only when needed
let passportConfigured = false;

function configurePassport() {
  if (passportConfigured) return;
  passportConfigured = true;

  const GoogleStrategy = require('passport-google-oauth20').Strategy;

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await pool.query(
        'SELECT * FROM admin_users WHERE google_id = $1',
        [profile.id]
      );

      if (existingUser.rows.length > 0) {
        return done(null, existingUser.rows[0]);
      }

      const newUser = await pool.query(
        `INSERT INTO admin_users (google_id, email, name, avatar_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          profile.id,
          profile.emails[0].value,
          profile.displayName,
          profile.photos[0]?.value
        ]
      );

      return done(null, newUser.rows[0]);
    } catch (error) {
      return done(error, null);
    }
  }
));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query('SELECT * FROM admin_users WHERE id = $1', [id]);
      done(null, result.rows[0] || null);
    } catch (error) {
      done(error, null);
    }
  });
}

// Google OAuth — stores returnTo in session, defaults to /admin
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env' });
  }
  configurePassport();
  req.session.returnTo = req.query.returnTo || '/admin';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Google OAuth not configured' });
    }
    configurePassport();
    next();
  },
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/admin/login?error=auth_failed`
  }),
  (req, res) => {
    const returnTo = req.session.returnTo || '/admin';
    delete req.session.returnTo;
    res.redirect(returnTo);
  }
);

router.get('/login-failed', (req, res) => {
  res.status(401).json({ error: 'Google authentication failed' });
});

router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
```

- [ ] **Step 2: Commit**

```bash
git add server/routes/auth.cjs && git commit -m "refactor(auth): simplify customer auth to Google OAuth only

- Remove email/password register and login routes
- Add returnTo query param to /auth/google stored in session
- Callback redirects to session.returnTo (defaults to /admin)
- Simplify GET /auth/me to return req.user only
- Simplify POST /logout to single passport handler

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Update CustomerAuthContext.tsx

**Files:**
- Modify: `src/context/CustomerAuthContext.tsx`

- [ ] **Step 1: Rewrite CustomerAuthContext with Google OAuth pattern**

Replace the entire file with:

```typescript
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
      const res = await authFetch('/auth/me');
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
      await authFetch('/auth/logout', { method: 'POST' });
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
```

- [ ] **Step 2: Commit**

```bash
git add src/context/CustomerAuthContext.tsx && git commit -m "refactor(auth): simplify CustomerAuthContext for Google OAuth

- Remove login() and register() functions (no longer needed)
- checkAuth() reads from GET /auth/me (same passport session as admin)
- Customer interface matches AdminUser shape
- logout() redirects to /customer/login after clearing state

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Replace Login.tsx with Google OAuth redirect

**Files:**
- Modify: `src/pages/customer/Login.tsx`

- [ ] **Step 1: Replace form with Google OAuth button**

Replace the entire file with:

```tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export function Login() {
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  // Already logged in — redirect to account
  useEffect(() => {
    if (customer) {
      navigate('/customer/account', { replace: true });
    }
  }, [customer, navigate]);

  const handleGoogleLogin = () => {
    setRedirecting(true);
    window.location.href = '/auth/google?returnTo=/customer/account';
  };

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-serif font-bold mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-8">
          Sign in to your Coco's Fashion Brands account
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={redirecting}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded px-6 py-3 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {redirecting ? (
            <span>Redirecting to Google...</span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="mt-6 text-xs text-gray-400">
          By signing in, you agree to our Terms of Use and Privacy Policy.
        </p>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Admin? <a href="/admin/login" className="underline">Sign in to admin</a>
          </p>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/customer/Login.tsx && git commit -m "refactor(customer): replace login form with Google OAuth redirect

- Remove email/password form entirely
- Single 'Continue with Google' button redirects to /auth/google?returnTo=/customer/account
- Redirects to account page if already authenticated

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Replace Register.tsx with Google OAuth redirect

**Files:**
- Modify: `src/pages/customer/Register.tsx`

- [ ] **Step 1: Replace form with Google OAuth button**

Replace the entire file with:

```tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export function Register() {
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (customer) {
      navigate('/customer/account', { replace: true });
    }
  }, [customer, navigate]);

  const handleGoogleRegister = () => {
    setRedirecting(true);
    window.location.href = '/auth/google?returnTo=/customer/account';
  };

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-serif font-bold mb-2">Create an Account</h1>
        <p className="text-gray-500 mb-8">
          Join Coco's Fashion Brands
        </p>

        <button
          onClick={handleGoogleRegister}
          disabled={redirecting}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded px-6 py-3 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {redirecting ? (
            <span>Redirecting to Google...</span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="mt-6 text-xs text-gray-400">
          By creating an account, you agree to our Terms of Use and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/customer/Register.tsx && git commit -m "refactor(customer): replace register form with Google OAuth redirect

- No account creation form needed
- Google OAuth auto-creates/uses account on first sign-in
- Same redirect as login page

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Fix Account.tsx orders link + update for new Customer type

**Files:**
- Modify: `src/pages/customer/Account.tsx`

- [ ] **Step 1: Update Account.tsx for new Customer type and fix orders link**

Replace the entire file with:

```tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { formatCurrency } from '../../lib/api';

interface Order {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  items: Array<{
    id: string;
    name: string;
    brand: string;
    quantity: number;
    unit_price: number;
    images: string[];
  }>;
}

export function Account() {
  const { customer, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!customer) {
      navigate('/customer/login', { replace: true });
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?customer_id=${customer.id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [customer, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/customer/login', { replace: true });
  };

  if (!customer) return null;

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-gray-50 rounded p-6">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
              {customer.name?.[0]?.toUpperCase() || customer.email[0].toUpperCase()}
            </div>
            <h2 className="font-bold text-lg">{customer.name || 'Welcome'}</h2>
            <p className="text-sm text-gray-500">{customer.email}</p>

            <nav className="mt-6 space-y-2">
              <Link to="/customer/account" className="block font-bold text-sm hover:underline">Account Overview</Link>
              <Link to="/customer/orders" className="block text-sm text-gray-600 hover:text-black hover:underline">My Orders</Link>
            </nav>

            <button
              onClick={handleLogout}
              className="mt-6 w-full border border-black py-2 text-sm font-bold hover:bg-black hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold mb-6">Account Overview</h1>

          {/* Order History */}
          <div className="bg-white border border-gray-200 rounded p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Recent Orders</h2>
              {orders.length > 0 && (
                <Link to="/customer/orders" className="text-sm underline">View all orders</Link>
              )}
            </div>

            {loadingOrders ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded"></div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No orders yet.</p>
                <Link to="/" className="inline-block mt-4 bg-black text-white px-6 py-2 font-bold text-sm hover:bg-gray-800">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-sm">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(order.total / 100)}</p>
                        <p className={`text-xs font-bold ${
                          order.status === 'confirmed' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {order.status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    {order.items && order.items[0] && (
                      <div className="flex items-center gap-3">
                        {order.items[0].images?.[0] && (
                          <img
                            src={order.items[0].images[0]}
                            alt={order.items[0].name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <p className="text-sm text-gray-600">
                          {order.items[0].name}
                          {order.items.length > 1 && ` +${order.items.length - 1} more item${order.items.length > 2 ? 's' : ''}`}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
```

Key change: `to="/orders"` → `to="/customer/orders"` on line 74.

- [ ] **Step 2: Commit**

```bash
git add src/pages/customer/Account.tsx && git commit -m "fix(customer): correct orders link to /customer/orders

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Verification

1. Navigate to http://localhost:3007/customer/login — shows Google OAuth button
2. Click "Continue with Google" — redirects to Google consent, then to /customer/account
3. Header shows avatar initial + name dropdown with Account/Orders/Sign Out
4. Sign out → redirects to /customer/login
5. Visit /admin/login → Google OAuth → redirects to /admin (admin sidebar shows)
6. Complete checkout as logged-in customer → order linked to req.user.id

---

## Spec Coverage Check

| Spec Requirement | Task |
|-----------------|------|
| Shared admin_users table | Task 1 |
| returnTo session param on /auth/google | Task 1 |
| Callback uses returnTo | Task 1 |
| Remove email/password routes | Task 1 |
| Simplify GET /auth/me | Task 1 |
| Simplify POST /logout | Task 1 |
| CustomerAuthContext uses req.user | Task 2 |
| Remove login/register from context | Task 2 |
| Login page = Google OAuth button | Task 3 |
| Register page = Google OAuth button | Task 4 |
| Fix /orders → /customer/orders | Task 5 |

**No gaps found.**
