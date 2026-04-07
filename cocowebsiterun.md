# Deployment Guide: Replacing Old cocos-fashion with New cocomacys

**For:** Developer with SSH access to the VPS at `root@72.60.83.198`
**Author:** Claude (AI Assistant)
**Last Updated:** 2026-04-07

---

## Overview

This document explains how to deploy the **new cocomacys e-commerce project** to the Hostinger VPS at `72.60.83.198`, replacing the old cocos-fashion project that is currently running.

### What You Need to Know

| | Old Project (cocos-fashion) | New Project (cocomacys) |
|---|---|---|
| **Frontend** | Built separately, served by Nginx | Built via Vite, served by Express |
| **Backend** | Express + Prisma ORM | Express + raw `pg` library (no Prisma) |
| **Database** | Supabase (cloud PostgreSQL) | Local PostgreSQL on VPS |
| **Server Port** | 4000 | **4000** (same) |
| **Frontend Build** | `npm run build` | `npm run build` → `dist/` |
| **Server Start** | `node server/dist/index.js` | `node server/index.cjs` (no build step for server) |
| **GitHub Repo** | github.com/Humpyt/cocos-fashion | github.com/Humpyt/cocomacys |

### Key Difference for Deployment
The new project does **NOT** use Prisma. The server is plain CommonJS (`server/index.cjs`) and runs directly with `node`. There is no `server/dist/` folder — the server does not need to be built separately.

---

## Part 1: Assess Current VPS State

SSH to the VPS and run the following commands to understand what is currently deployed:

```bash
# Check what's running
pm2 list

# Check Nginx status
sudo systemctl status nginx

# Check if old project is at /var/www/
ls -la /var/www/

# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if port 4000 is in use
sudo ss -tlnp | grep 4000

# Check Node version
node --version

# Check PM2 version
pm2 --version
```

**Expected current state (old project):**
- PM2 shows `cocos-fashion-api` running on port 4000
- Nginx configured for old project
- PostgreSQL installed (old project may have used Supabase instead)
- `/var/www/cocofashionbrands.com/current/` contains old project files

---

## Part 2: Key Decision — Keep Existing Database or Start Fresh?

**If products/orders data should be preserved:**
- The old project used **Supabase** (cloud PostgreSQL). If the database is on Supabase, you will need the Supabase connection string.
- The new project uses `localhost` PostgreSQL. You may need to either:
  - Set up port forwarding from VPS to Supabase, OR
  - Migrate data from Supabase to a local PostgreSQL instance

**If starting fresh is acceptable:**
- Set up a new local PostgreSQL database on the VPS
- Apply the new schema (see Part 4 below)

**Talk to the project owner to determine which applies.**

---

## Part 3: Deployment Files

All files below are located in the project at `D:\WEB PROJECTS\Cocomacys\cocomacys\` on the local machine. The developer with server access needs to copy them to the VPS.

### File Locations on Local Machine

| File | Purpose |
|------|---------|
| `deploy/hostinger/pm2/ecosystem.config.cjs` | PM2 process config — tells PM2 how to run the server |
| `deploy/hostinger/nginx/cocofashionbrands.com.conf` | Nginx site config — routes traffic |
| `deploy/hostinger/deploy.sh` | Automated deployment script (optional) |
| `.env.production` | Environment variables template (fill in values first) |
| `cocomacys.sql` | Base database schema (products, admin_users, session tables) |
| `server/migrations/001_create_collections.sql` | Collections table |
| `server/migrations/002_create_carts_orders.sql` | Carts, cart_items, orders tables |
| `server/migrations/003_create_customers.sql` | Customers table (for Google OAuth users) |

### Where to Place Files on VPS

```
/var/www/cocofashionbrands.com/current/
├── server/
│   ├── index.cjs          ← server entry point (from repo)
│   ├── .env               ← environment variables (CREATE THIS)
│   ├── db.cjs             ← database connection (from repo)
│   ├── routes/            ← API routes (from repo)
│   ├── migrations/        ← database migrations (from repo)
│   └── ...other server files
├── dist/                  ← frontend build output (from repo, after npm run build)
├── deploy/
│   └── hostinger/
│       ├── pm2/
│       │   └── ecosystem.config.cjs   ← COPY THIS
│       └── nginx/
│           └── cocofashionbrands.com.conf  ← COPY THIS
├── package.json           ← from repo
└── .env.production       ← COPY THIS (rename to server/.env after filling in)
```

---

## Part 4: Step-by-Step Deployment

### Step 1: Ensure PostgreSQL is Running on VPS

```bash
# Check if PostgreSQL is installed
psql --version

# If not installed, install it:
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify it's running
sudo systemctl status postgresql
```

### Step 2: Create PostgreSQL Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In the psql shell, run:
CREATE DATABASE cocomacys;
CREATE USER postgres WITH PASSWORD 'YOUR_PASSWORD_HERE';  -- use actual password
GRANT ALL PRIVILEGES ON DATABASE cocomacys TO postgres;
\q
```

**Remember this password** — it goes in the `.env` file below.

### Step 3: Apply Database Schema

The schema must be applied in order:

```bash
# As postgres user, apply each migration in order:
sudo -u postgres psql -d cocomacys -f /var/www/cocofashionbrands.com/current/cocomacys.sql
sudo -u postgres psql -d cocomacys -f /var/www/cocofashionbrands.com/current/server/migrations/001_create_collections.sql
sudo -u postgres psql -d cocomacys -f /var/www/cocofashionbrands.com/current/server/migrations/002_create_carts_orders.sql
sudo -u postgres psql -d cocomacys -f /var/www/cocofashionbrands.com/current/server/migrations/003_create_customers.sql
```

### Step 4: Clone or Update the Project on VPS

```bash
# Navigate to web root
cd /var/www/cocofashionbrands.com/current

# If directory already has old project, pull new code:
git fetch --all
git checkout main
git pull origin main

# If directory is empty, clone the new repo:
# git clone https://github.com/Humpyt/cocomacys.git /var/www/cocofashionbrands.com/current
```

### Step 5: Create Environment Variables

Create the file `/var/www/cocofashionbrands.com/current/server/.env`:

```bash
nano /var/www/cocofashionbrands.com/current/server/.env
```

Paste and fill in:

```env
# Server
PORT=4000
NODE_ENV=production
SESSION_SECRET=<generate a strong random string, e.g. openssl rand -hex 32>
FRONTEND_URL=https://cocofashionbrands.com

# PostgreSQL Database — match what you set in Step 2
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cocomacys
DB_USER=postgres
DB_PASSWORD=<YOUR_PASSWORD_FROM_STEP_2>

# Google OAuth — CRITICAL
# You MUST create new credentials at console.cloud.google.com
# OR update the redirect URI of existing credentials to:
# https://cocofashionbrands.com/auth/google/callback
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
GOOGLE_CALLBACK_URL=https://cocofashionbrands.com/auth/google/callback

# Vite (used at build time)
VITE_API_URL=https://cocofashionbrands.com
```

**Important about Google OAuth:**
- The `GOOGLE_CALLBACK_URL` in Google Cloud Console must match exactly: `https://cocofashionbrands.com/auth/google/callback`
- If the old project had `http://localhost:3001/auth/google/callback` as the redirect URI, you need to ADD the new production URI (not replace the old one, unless you want to break local dev).
- To create new credentials: https://console.cloud.google.com → APIs & Services → Credentials → Create Credentials → OAuth Client ID → Add authorized redirect URIs

### Step 6: Copy PM2 Ecosystem Config

```bash
sudo cp /var/www/cocofashionbrands.com/current/deploy/hostinger/pm2/ecosystem.config.cjs /var/www/cocofashionbrands.com/current/
```

### Step 7: Install Dependencies and Build

```bash
cd /var/www/cocofashionbrands.com/current

# Install frontend dependencies
npm ci

# Build frontend (outputs to dist/)
npm run build

# Install server dependencies
npm --prefix server ci
```

### Step 8: Configure Nginx

```bash
# Copy Nginx config
sudo cp /var/www/cocofashionbrands.com/current/deploy/hostinger/nginx/cocofashionbrands.com.conf /etc/nginx/sites-available/

# If there's an old Nginx config, remove or disable it:
sudo rm -f /etc/nginx/sites-enabled/default  # if it conflicts
sudo ln -sf /etc/nginx/sites-available/cocofashionbrands.com.conf /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 9: Start Server with PM2

```bash
cd /var/www/cocofashionbrands.com/current

# Stop old PM2 process if running
pm2 delete cocos-fashion-api 2>/dev/null || true
pm2 delete cocomacys-api 2>/dev/null || true

# Start new server
pm2 start ecosystem.config.cjs

# Save PM2 state (so it restarts after reboot)
pm2 save

# Make PM2 start on boot
pm2 startup
# (follow the output — it will give you a command to run, e.g.: sudo env PATH=... systemctl pm2-root)
```

### Step 10: Verify Deployment

```bash
# Check PM2 status
pm2 list

# Check server health
curl http://127.0.0.1:4000/api/health
# Expected: {"status":"ok","timestamp":"2026-..."}

# Check if site is accessible
curl -I https://cocofashionbrands.com
```

### Step 11: Set Up SSL (Certbot)

```bash
# Only do this AFTER DNS is fully propagated (cocofashionbrands.com resolves to 72.60.83.198)
sudo certbot --nginx -d cocofashionbrands.com -d www.cocofashionbrands.com

# Certbot will ask for an email and agree to terms.
# It will also ask if you want to redirect HTTP to HTTPS — YES.
```

---

## Part 5: Nginx Configuration Explained

The Nginx config (`cocofashionbrands.com.conf`) does two things:

**1. Serves the frontend (SPA routing)**
```
location / {
    try_files $uri $uri/ /index.html;
}
```
This serves `dist/index.html` for all routes that don't match a file. The React Router handles routing from there.

**2. Proxies API/auth/upload requests to Express**
```
location ~ ^/(api|auth|uploads) {
    proxy_pass http://127.0.0.1:4000;
}
```
- `/api/*` → Express API routes (`/api/products`, `/api/carts`, `/api/orders`, etc.)
- `/auth/*` → Google OAuth routes (`/auth/google`, `/auth/google/callback`, etc.)
- `/uploads/*` → Uploaded product images

---

## Part 6: Troubleshooting

### Server won't start
```bash
# Check PM2 logs
pm2 logs cocomacys-api

# Common issues:
# - PORT already in use: sudo lsof -i :4000 (find and kill old process)
# - Missing .env: pm2 will crash if server/.env doesn't exist
# - Wrong DB_PASSWORD: server will crash if PostgreSQL credentials are wrong
```

### Nginx 502 Bad Gateway
```bash
# Server is not running or not on port 4000
pm2 list
curl http://127.0.0.1:4000/api/health
# If curl fails, server is not running — check PM2 logs

# If server IS running but 502 still appears:
# Nginx config may not be reloaded
sudo systemctl reload nginx
```

### Database connection fails
```bash
# Test PostgreSQL connection
sudo -u postgres psql -d cocomacys -c "SELECT 1;"

# If it fails, check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in server/.env
```

### Google OAuth not working
```bash
# Verify callback URL in Google Cloud Console is:
# https://cocofashionbrands.com/auth/google/callback

# Test auth locally:
curl http://127.0.0.1:4000/auth/google
# Should redirect to Google
```

### SSL/HTTPS not working
```bash
# Check if Certbot certificate exists
sudo certbot certificates

# If certs exist but HTTPS doesn't work, reload nginx:
sudo systemctl reload nginx

# If certs don't exist, run certbot again:
sudo certbot --nginx -d cocofashionbrands.com -d www.cocofashionbrands.com
```

### Frontend builds but shows blank page
```bash
# Check that dist/index.html exists
ls /var/www/cocofashionbrands.com/current/dist/

# Check Nginx is pointing to correct root
# The Nginx config should have: root /var/www/cocofashionbrands.com/current/dist;
sudo grep "root" /etc/nginx/sites-available/cocofashionbrands.com.conf
```

### PM2 process keeps restarting (OOM)
```bash
# Check memory limit — PM2 ecosystem.config.cjs has max_memory_restart: "400M"
pm2 list
# If memory is fine, check logs:
pm2 logs cocomacys-api --lines 50
```

---

## Part 7: Updating the Deployment (Future Deployments)

When you need to update the site (new code pushed to GitHub):

```bash
cd /var/www/cocofashionbrands.com/current
git pull origin main
npm ci
npm run build
npm --prefix server ci
pm2 restart cocomacys-api
pm2 save
```

Or use the deploy script:
```bash
bash /var/www/cocofashionbrands.com/current/deploy/hostinger/deploy.sh
```

---

## Part 8: Important File Reference

### PM2 Ecosystem Config (`ecosystem.config.cjs`)
This file tells PM2 how to run the server:
- `cwd`: `/var/www/cocofashionbrands.com/current` — project root
- `script`: `server/index.cjs` — server entry point (NOT server/dist/index.js like old project)
- `PORT`: 4000 (set via environment in `env` block)
- `exec_mode`: `fork` (not cluster — no server-side rendering)

### Environment Variables That Must Be Set in `server/.env`

| Variable | Notes |
|----------|-------|
| `PORT` | Must be `4000` |
| `NODE_ENV` | Must be `production` |
| `SESSION_SECRET` | Generate with: `openssl rand -hex 32` |
| `DB_HOST` | `localhost` (local PostgreSQL) |
| `DB_PORT` | `5432` (default PostgreSQL port) |
| `DB_NAME` | `cocomacys` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | Whatever you set when creating the DB user |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `https://cocofashionbrands.com/auth/google/callback` |
| `FRONTEND_URL` | `https://cocofashionbrands.com` |
| `VITE_API_URL` | `https://cocofashionbrands.com` |

---

## Contact

For questions about the project, refer to:
- `CLAUDE.md` — Full project documentation
- `docs/superpowers/` — Design specs and plans
- GitHub repo: https://github.com/Humpyt/cocomacys
