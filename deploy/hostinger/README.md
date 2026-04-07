# Hostinger VPS Deployment — cocofashionbrands.com

## Prerequisites (already on VPS)
- Node.js 20
- PM2
- Nginx
- PostgreSQL
- DNS pointing `cocofashionbrands.com` to VPS IP

## One-Time Server Setup

```bash
# SSH to VPS
ssh root@72.60.83.198

# Create app directory
mkdir -p /var/www/cocofashionbrands.com/current
```

## Deploy (after setup)

```bash
# From local machine — SSH and run deploy
ssh root@72.60.83.198 "bash /var/www/cocofashionbrands.com/current/deploy/hostinger/deploy.sh"
```

Or manually:
```bash
# On VPS
cd /var/www/cocofashionbrands.com/current
git pull origin main
npm ci && npm run build
npm --prefix server ci
pm2 startOrReload deploy/hostinger/pm2/ecosystem.config.cjs --update-env
pm2 save
```

## Nginx Setup (one-time)

```bash
# On VPS
sudo cp /var/www/cocofashionbrands.com/current/deploy/hostinger/nginx/cocofashionbrands.com.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/cocofashionbrands.com.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## SSL (Certbot — after DNS is active)

```bash
sudo certbot --nginx -d cocofashionbrands.com -d www.cocofashionbrands.com
```

## Environment Variables

Copy `.env.production` to `server/.env` on the VPS and fill in:
- `DB_PASSWORD` — your PostgreSQL password
- `SESSION_SECRET` — random string for sessions
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `GOOGLE_CALLBACK_URL` — `https://cocofashionbrands.com/auth/google/callback`

## Database Setup (first deploy only)

```bash
# On VPS — apply schema
psql -U postgres -d cocomacys -f cocomacys.sql
psql -U postgres -d cocomacys -f server/migrations/001_create_collections.sql
psql -U postgres -d cocomacys -f server/migrations/002_create_carts_orders.sql
psql -U postgres -d cocomacys -f server/migrations/003_create_customers.sql
```
