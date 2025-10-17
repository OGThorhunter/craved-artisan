# 🚀 Quick Start: Deploy to Render in 30 Minutes

This is the fast-track guide. For detailed explanations, see `RENDER_DEPLOYMENT_GUIDE.md`.

---

## Prerequisites

- [ ] GitHub repository
- [ ] Render account (free): https://render.com
- [ ] Stripe API keys: https://dashboard.stripe.com/apikeys
- [ ] 30 minutes of focused time

---

## Step 1: Test Locally with PostgreSQL (10 minutes)

### Install PostgreSQL

**Windows:**
```powershell
choco install postgresql
# Or download: https://www.postgresql.org/download/windows/
```

**Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Create Local Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE craved_artisan_local;
\q
```

### Update Local Environment

Edit `server/.env`:
```bash
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/craved_artisan_local"
```

### Run Migrations

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init_postgres
```

### Test Application

```bash
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:client
```

**Verify:**
- [ ] Backend starts without errors
- [ ] Frontend loads
- [ ] Can create account
- [ ] Can login

---

## Step 2: Prepare Environment Variables (5 minutes)

### Get Stripe Keys

1. Go to: https://dashboard.stripe.com/apikeys
2. Copy **Secret key** (starts with `sk_test_`)
3. Copy **Publishable key** (starts with `pk_test_`)
4. Save for later

### Optional: Get Redis (Free)

1. Go to: https://upstash.com/
2. Create account
3. Create Redis database
4. Copy connection string (starts with `rediss://`)

---

## Step 3: Deploy to Render (10 minutes)

### 3.1. Create Render Account

1. Go to: https://render.com
2. Sign up with GitHub
3. Authorize repository access

### 3.2. Deploy via Blueprint

1. **Dashboard** → **New +** → **Blueprint**
2. Select `craved-artisan` repository
3. Click **Apply Blueprint**
4. Wait for services to create (~2 minutes)

### 3.3. Add Environment Variables

Go to **cravedartisan-api** → **Environment**:

**Add these manually:**
```bash
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_placeholder_update_later
```

**Optional (Recommended):**
```bash
REDIS_URL=rediss://default:password@host:6379
```

Click **Save Changes** (triggers redeploy)

### 3.4. Run Database Migrations

1. Go to **cravedartisan-api** → **Shell**
2. Run:
   ```bash
   npx prisma migrate deploy
   ```
3. Verify: Should see "Applying migration..."

### 3.5. Update Frontend

Go to **cravedartisan-web** → **Environment**:

**Verify these exist:**
```bash
VITE_API_BASE_URL=(should point to API service)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

If missing, add them and save.

---

## Step 4: Configure Stripe Webhook (3 minutes)

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. **Endpoint URL:** `https://cravedartisan-api.onrender.com/api/webhooks/stripe`
4. **Events:** Select:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy **Signing secret** (starts with `whsec_`)
7. Update in Render: **cravedartisan-api** → **Environment** → `STRIPE_WEBHOOK_SECRET`

---

## Step 5: Verify Deployment (2 minutes)

### Check Backend

```bash
curl https://cravedartisan-api.onrender.com/readyz
```

**Should return:** `{"status":"ok","uptime":...}`

### Check Frontend

1. Visit: `https://cravedartisan-web.onrender.com`
2. Should see login page
3. Open browser console (F12) - no errors

### Test Authentication

1. Create test account
2. Login
3. Refresh page
4. Should stay logged in (if Redis configured)

### Check Logs

1. Render Dashboard → **cravedartisan-api** → **Logs**
2. Look for:
   - ✅ "Database connected successfully"
   - ✅ "Server running on port"
   - ✅ "Redis client connected" (if configured)
3. No ❌ errors

---

## 🎉 You're Live!

**Your URLs:**
- Frontend: `https://cravedartisan-web.onrender.com`
- API: `https://cravedartisan-api.onrender.com`

**Cost:** $14/month (Starter tier)

---

## What's Disabled (For Now)

These features need additional setup:

- ❌ **File uploads** - Need Cloudinary (see `FILE_UPLOAD_WARNING.md`)
- ❌ **AI features** - Need OpenAI key (optional, costs $20-50/mo)
- ❌ **OAuth login** - Need Google/Facebook setup (optional)

**Everything else works:** ✅ Auth, products, orders, payments, marketplace

---

## Next Steps

### Immediate (Before Sharing)

- [ ] Test full user signup flow
- [ ] Test vendor dashboard
- [ ] Test marketplace browsing
- [ ] Create test product
- [ ] Test Stripe payment (use test card: 4242 4242 4242 4242)
- [ ] Monitor logs for 24 hours

### This Week

- [ ] Setup Cloudinary for file uploads
- [ ] Configure custom domain (optional)
- [ ] Setup monitoring alerts
- [ ] Enable SSL (automatic, just verify)
- [ ] Backup database

### Next Week

- [ ] Enable AI features if needed
- [ ] Setup OAuth if needed
- [ ] Optimize cron jobs
- [ ] Review performance metrics
- [ ] Scale up if needed

---

## Common Issues & Fixes

### "Cannot connect to database"

**Fix:** Check DATABASE_URL in environment variables

### "Session not persisting"

**Fix:** Add REDIS_URL or accept in-memory sessions (lost on restart)

### "CORS error in browser"

**Fix:** Verify FRONTEND_URL in backend environment matches your frontend URL

### "Stripe webhook failing"

**Fix:** Double-check webhook URL and signing secret

### "Build failing"

**Fix:** Check logs, ensure `npm run build` works locally

---

## Emergency Rollback

If something breaks:

1. **Render Dashboard** → **cravedartisan-api** → **Deploys**
2. Find last working deploy
3. Click **Rollback to this version**

---

## Support

- **Render Docs:** https://render.com/docs
- **Render Status:** https://status.render.com
- **Render Community:** https://community.render.com

---

## Monitoring Checklist

**Daily (First Week):**
- [ ] Check error logs
- [ ] Verify services running
- [ ] Test core functionality
- [ ] Check database size

**Weekly:**
- [ ] Review metrics (CPU, memory)
- [ ] Check costs
- [ ] Test all features
- [ ] Review user feedback

**Monthly:**
- [ ] Optimize queries
- [ ] Clean up old data
- [ ] Review scaling needs
- [ ] Update dependencies

---

**Deployment Time:** ~30 minutes
**Monthly Cost:** $14-16
**Difficulty:** 🟢 Beginner-friendly

**Status:** ✅ Ready to deploy!

