# Spec: Customer Google OAuth Authentication

## Context
Customer authentication was implemented with email/password but the user wants Google OAuth instead. The existing passport-google-oauth20 setup already works for admin auth. This spec replaces the email/password customer flow with Google OAuth, using the shared `admin_users` table and session-based `returnTo` to distinguish destinations.

## Approach
- Same Google OAuth for both admin and customers (shared `admin_users` table)
- Session `returnTo` param tells the callback where to land after OAuth
- Customer login page is a simple Google OAuth redirect (no form)
- Register page redirects to the same Google OAuth flow
- Both admin and customer share the same passport session (`req.user`)

## Architecture

### Backend Changes

**server/routes/auth.cjs**

1. Add `returnTo` to session before OAuth redirect:
   - Modify `GET /auth/google` to accept `?returnTo=<url>` query param
   - Store `returnTo` in `req.session.returnTo` before `passport.authenticate`
   - Default `returnTo` to `/admin` for admin, `/customer/account` for customers

2. Modify `GET /auth/google/callback`:
   - After successful auth, redirect to `req.session.returnTo || '/admin'`
   - Clear `returnTo` from session after use

3. Remove: `POST /auth/register`, `POST /auth/login`, `?type=customer` logic in `GET /auth/me`

4. Simplify `GET /auth/me`:
   - Return `req.user` if authenticated, 401 if not
   - No `type` query param needed — same passport session for both

5. Simplify `POST /auth/logout`:
   - Single `req.logout()` + `req.session.destroy()` handles both admin and customer

**server/routes/cart.cjs**
- `POST /api/carts/:id/complete` — uses `req.user?.id` from passport session to link order to customer

### Frontend Changes

**src/context/CustomerAuthContext.tsx**
- Remove `login()` and `register()` functions
- `checkAuth()` calls `GET /auth/me` — sets customer from `req.user`
- `logout()` POSTs to `/auth/logout`
- `Customer` interface uses `AdminUser` shape: `{ id, google_id, email, name, avatar_url }`

**src/pages/customer/Login.tsx**
- Remove all form state (email, password, error, loading)
- Single "Continue with Google" button: `window.location.href = '/auth/google?returnTo=/customer/account'`
- Shows loading state while redirect happens

**src/pages/customer/Register.tsx**
- Replace form with "Continue with Google" button (same redirect as Login)
- Remove "already have account" link since Google OAuth auto-creates/uses existing account

**src/pages/customer/Account.tsx**
- Fix link at line 73: `to="/orders"` → `to="/customer/orders"`

**src/components/Header.tsx** — no changes needed, already uses `useCustomerAuth()` correctly

**src/App.tsx** — no structural changes needed

## Data Flow

```
Customer on /customer/login
  → clicks "Continue with Google"
  → window.location.href = '/auth/google?returnTo=/customer/account'
  → server stores returnTo in session
  → passport.authenticate → Google OAuth consent screen
  → Google redirects to /auth/google/callback
  → passport finds/creates user in admin_users
  → req.user set by passport deserialize
  → redirect to /customer/account (req.session.returnTo)
  → CustomerAuthContext.checkAuth() calls GET /auth/me → req.user
  → customer set in context → dropdown shows in Header ✓
```

## Verification
1. `npm run dev:full` — both servers start
2. Navigate to `/customer/login` — see Google OAuth button
3. Click "Continue with Google" — Google consent screen appears
4. Approve → redirected to `/customer/account`, see user name in dropdown
5. Header shows avatar initial + name, dropdown has Account/Orders/Sign Out
6. Sign out → redirected to `/customer/login`
7. As admin, visit `/admin/login` → Google OAuth → redirected to `/admin`
8. Complete checkout as logged-in customer → order linked to `req.user.id`

## Files to Modify
- `server/routes/auth.cjs` — remove email/password, add returnTo session logic
- `src/context/CustomerAuthContext.tsx` — remove login/register, simplify
- `src/pages/customer/Login.tsx` — replace form with Google OAuth button
- `src/pages/customer/Register.tsx` — replace form with Google OAuth button
- `src/pages/customer/Account.tsx` — fix orders link

## Files to Remove
- `server/migrations/003_create_customers.sql` — customers table not used
- `server/routes/orders.cjs` — keep for order history API, but customer lookup uses `admin_users.id`
