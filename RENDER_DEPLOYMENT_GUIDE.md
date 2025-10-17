# Render Deployment Guide - Craved Artisan

## 🚀 Quick Start

This guide walks you through deploying your Craved Artisan marketplace to Render.

---

## ✅ Pre-Deployment Checklist

### 1. Database Migration Completed
- ✅ Updated `prisma/schema.prisma` from SQLite to PostgreSQL
- ⏳ Test locally with PostgreSQL before deploying
- ⏳ Run migrations: `npx prisma migrate dev`

### 2. Configuration Files Ready
- ✅ `render.yaml` configured with starter plan ($7/mo)
- ✅ Environment templates created
- ⏳ Fill in production environment variables

### 3. External Services Setup
- ⏳ Stripe API keys (required for payments)
- ⏳ Redis instance (recommended - Upstash free tier)
- ⏳ OpenAI API key (optional - for AI features)
- ⏳ Cloud storage (optional - for file uploads)

---

## 📋 Step-by-Step Deployment

### Phase 1: Local Testing with PostgreSQL (REQUIRED)

**Why:** Ensure SQLite → PostgreSQL compatibility before deploying.

1. **Install PostgreSQL locally:**
   ```bash
   # Windows (with Chocolatey)
   choco install postgresql
   
   # Or download from: https://www.postgresql.org/download/
   ```

2. **Create local database:**
   ```bash
   psql -U postgres
   CREATE DATABASE craved_artisan_local;
   \q
   ```

3. **Update local .env:**
   ```bash
   # In server/.env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/craved_artisan_local"
   ```

4. **Generate Prisma client and run migrations:**
   ```bash
   cd server
   npx prisma generate
   npx prisma migrate dev --name init_postgres
   ```

5. **Test the application:**
   ```bash
   # Terminal 1 - Backend
   npm run dev:server
   
   # Terminal 2 - Frontend
   npm run dev:client
   ```

6. **Verify functionality:**
   - [ ] Can create an account
   - [ ] Can login and session persists
   - [ ] Can create/edit products
   - [ ] Database queries work correctly
   - [ ] No errors in console or logs

### Phase 2: Environment Variables Setup

1. **Get Stripe API Keys:**
   - Go to: https://dashboard.stripe.com/apikeys
   - Copy **Secret key** (sk_test_... or sk_live_...)
   - Copy **Publishable key** (pk_test_... or pk_live_...)
   - Create webhook endpoint later in Render

2. **Setup Redis (Recommended):**
   - Go to: https://upstash.com/
   - Create free account
   - Create Redis database
   - Copy connection string (rediss://...)
   - **Without Redis:** Sessions lost on deploy/restart

3. **Prepare environment values:**
   - Review `server/.env.production.template`
   - Review `client/.env.production.template`
   - Keep values ready for Render dashboard

### Phase 3: Deploy to Render

#### 3.1. Setup Render Account

1. Go to: https://render.com
2. Sign up with GitHub
3. Connect your repository

#### 3.2. Deploy Database First

1. **Render Dashboard** → **New +** → **PostgreSQL**
2. Configure:
   - **Name:** `cravedartisan-db`
   - **Database:** `cravedartisan`
   - **User:** `cravedartisan`
   - **Region:** `Oregon` (or closest to you)
   - **Plan:** `Starter` ($7/mo) or `Free` (256MB - test only)
3. Click **Create Database**
4. **Copy Internal Database URL** (shown after creation)

#### 3.3. Deploy Backend API

1. **Render Dashboard** → **New +** → **Blueprint**
2. Select your repository
3. Render will detect `render.yaml` automatically
4. Click **Apply Blueprint**
5. Configure services when prompted

**Manual Environment Variables to Add:**

Go to **cravedartisan-api** → **Environment** → Add:

```bash
# REQUIRED
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# RECOMMENDED
REDIS_URL=rediss://default:password@host:6379

# OPTIONAL
OPENAI_API_KEY=sk-...
```

#### 3.4. Run Database Migrations

After first deploy completes:

1. Go to **cravedartisan-api** → **Shell**
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

#### 3.5. Deploy Frontend

The frontend deploys automatically via `render.yaml` as `cravedartisan-web`.

**Verify environment variables:**
- `VITE_API_BASE_URL` should point to API service
- `VITE_STRIPE_PUBLISHABLE_KEY` should be set

#### 3.6. Configure Stripe Webhook

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. **Endpoint URL:** `https://cravedartisan-api.onrender.com/api/webhooks/stripe`
4. **Events to listen:** Select all `checkout` and `payment_intent` events
5. Copy **Signing secret** (whsec_...)
6. Update `STRIPE_WEBHOOK_SECRET` in Render environment

---

## 🧪 Post-Deployment Verification

### Critical Tests

1. **Backend Health Check:**
   ```bash
   curl https://cravedartisan-api.onrender.com/readyz
   # Should return: {"status":"ok","uptime":...}
   ```

2. **Frontend Loads:**
   - Visit: `https://cravedartisan-web.onrender.com`
   - Should see login/signup page
   - No console errors (F12)

3. **Authentication Flow:**
   - Create test account
   - Login
   - Refresh page (session should persist if Redis configured)
   - Logout

4. **Database Connection:**
   - Check Render logs for database connection success
   - Look for: "✅ Database connected successfully"

5. **Winston Logs Verification:**
   - Render Dashboard → **cravedartisan-api** → **Logs**
   - Look for startup messages
   - Check for any errors or warnings
   - Verify cron jobs started

### Performance Checks

- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] No memory leaks (monitor Render metrics)
- [ ] Database queries performing well

---

## 💰 Cost Breakdown

### Minimum Viable Production

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| API Service | Starter | $7/mo | Always-on, 512MB RAM |
| PostgreSQL | Starter | $7/mo | 1GB storage |
| Static Site | Free | $0/mo | Unlimited bandwidth |
| Redis (Upstash) | Free | $0/mo | 10k commands/day |
| **Total** | | **$14/mo** | |

### Optional Add-ons

| Service | Cost | When Needed |
|---------|------|-------------|
| OpenAI API | $5-50/mo | AI features enabled |
| Cloudinary | $0-25/mo | File uploads (images) |
| Sentry | $0-26/mo | Error tracking |
| Larger DB | $20-70/mo | Heavy usage |
| **Total Range** | **$14-181/mo** | Full featured |

### Cost Optimization Tips

1. **Start with Free Tier:**
   - PostgreSQL Free (256MB) for testing
   - Monitor usage before upgrading

2. **Disable AI Features Initially:**
   - Leave `OPENAI_API_KEY` blank
   - Save $5-50/mo

3. **Use Upstash Redis Free Tier:**
   - 10,000 commands/day included
   - Upgrade only if needed

4. **Disable Non-Critical Cron Jobs:**
   - Comment out in `server/src/services/cron-jobs.ts`
   - Reduce CPU usage

5. **Monitor Resource Usage:**
   - Render Dashboard → Metrics
   - Upgrade only when needed

---

## ⚠️ Known Limitations & Workarounds

### 1. File Uploads (BLOCKER)

**Issue:** Local file storage lost on deploy/restart

**Solutions:**

A. **Disable uploads temporarily:**
   ```typescript
   // In server/src/index.ts
   // Comment out these routes:
   // app.use('/api/products', productsImportRouter);
   // app.use('/api/ai', aiReceiptParserRouter);
   ```

B. **Configure Cloudinary (Recommended):**
   - Sign up: https://cloudinary.com/
   - Get credentials
   - Update environment variables
   - Modify multer middleware to use Cloudinary

C. **Use AWS S3:**
   - More complex setup
   - Better for large files

### 2. Sessions Without Redis

**Impact:** Sessions lost on deploy/restart, users logged out

**Solutions:**
- Use Upstash Redis free tier (recommended)
- Accept trade-off for testing
- JWT tokens instead of sessions (requires refactor)

### 3. Cold Starts on Free Tier

**Issue:** Service sleeps after 15min inactivity, 30s cold start

**Solutions:**
- Upgrade to Starter plan ($7/mo) for always-on
- Accept slow first load for testing
- Use cron-job.org to ping every 14 minutes (free)

### 4. Database Connection Pooling

**Issue:** PostgreSQL connection limits

**Solutions:**
- Render handles connection pooling automatically
- Use `?connection_limit=5` in DATABASE_URL if needed
- Monitor connection count in logs

---

## 🐛 Troubleshooting

### Build Fails

**Symptom:** Deployment fails during build

**Check:**
1. Build logs in Render dashboard
2. Run `npm run build` locally
3. Verify all dependencies in `package.json`
4. Check Node version compatibility

**Common fixes:**
```bash
# Clear Render build cache
# In Render dashboard: Manual Deploy → Clear build cache

# Or add to render.yaml:
buildCommand: |
  npm ci --legacy-peer-deps
  npx prisma generate
  npm run -w server build
```

### Database Connection Errors

**Symptom:** Can't connect to database

**Check:**
1. DATABASE_URL is correct
2. Database is running (Render dashboard)
3. Migration ran successfully
4. SSL mode is enabled (PostgreSQL requires)

**Fix:**
```bash
# Ensure DATABASE_URL ends with:
?sslmode=require

# Manually run migrations:
npx prisma migrate deploy
```

### Session Not Persisting

**Symptom:** Logged out on page refresh

**Check:**
1. REDIS_URL is set and valid
2. Redis connection successful in logs
3. Cookie settings correct
4. CORS configured properly

**Fix:**
```bash
# Verify Redis connection in logs
# Look for: "✅ Redis client connected"

# If not set, sessions use memory store
# Add REDIS_URL in Render environment
```

### API Calls Failing (CORS)

**Symptom:** Frontend can't reach backend

**Check:**
1. FRONTEND_URL environment variable
2. CORS configuration in `server/src/index.ts`
3. API URL in client environment

**Fix:**
```typescript
// Ensure CORS includes your domain
origin: [
  process.env.FRONTEND_URL,
  'https://cravedartisan-web.onrender.com'
]
```

### Stripe Webhook Failures

**Symptom:** Payments work but webhooks fail

**Check:**
1. Webhook endpoint is correct
2. STRIPE_WEBHOOK_SECRET is set
3. Webhook signature validation

**Fix:**
1. Check Stripe dashboard → Webhooks → Events
2. Verify endpoint URL matches deployment
3. Test webhook delivery

---

## 🔄 Updating Your Deployment

### Code Changes

```bash
# 1. Make changes locally
# 2. Test thoroughly
# 3. Commit and push
git add .
git commit -m "Your changes"
git push origin main

# 4. Render auto-deploys from main branch
# 5. Check deployment in Render dashboard
```

### Environment Variable Changes

1. Render Dashboard → Service → Environment
2. Update variables
3. **Important:** Click **Save** triggers re-deploy

### Database Schema Changes

```bash
# 1. Create migration locally
npx prisma migrate dev --name your_migration_name

# 2. Test locally
# 3. Commit migration files
git add prisma/migrations
git commit -m "Add migration"
git push

# 4. After deploy, run in Render shell:
npx prisma migrate deploy
```

---

## 📊 Monitoring & Logs

### Winston Logs

**Access:**
- Render Dashboard → cravedartisan-api → Logs
- Real-time stream
- Last 7 days searchable

**What to monitor:**
- ✅ Successful requests
- ❌ Error messages
- 🔄 Database queries
- ⏰ Cron job execution

### Metrics Dashboard

**Access:**
- Render Dashboard → Service → Metrics

**Monitor:**
- CPU usage (should be < 60%)
- Memory usage (should be < 80%)
- Request count
- Response time

### Alerts

**Setup:**
- Render Dashboard → Service → Notifications
- Email alerts for:
  - Deployment failures
  - Service crashes
  - High resource usage

---

## 🚨 Emergency Procedures

### Service Down

1. Check Render status page: https://status.render.com
2. Check logs for errors
3. Manual restart: Render Dashboard → Service → Manual Deploy
4. Rollback: Render Dashboard → Deploys → Rollback

### Database Issues

1. Check database status in Render dashboard
2. Verify connection string
3. Check connection pool limits
4. Contact Render support if needed

### Rollback Procedure

```bash
# In Render Dashboard:
# 1. Go to Deploys tab
# 2. Find last working deploy
# 3. Click "Rollback to this version"
# 4. Confirm rollback
```

### Data Backup

```bash
# Regular backups (automated by Render for paid plans)
# Manual backup:
pg_dump DATABASE_URL > backup_$(date +%Y%m%d).sql
```

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Prisma Docs:** https://www.prisma.io/docs
- **Stripe Docs:** https://stripe.com/docs

---

## ✨ Success Checklist

Before considering deployment complete:

- [ ] Backend API responds to health check
- [ ] Frontend loads without errors
- [ ] Users can sign up and login
- [ ] Sessions persist (if Redis configured)
- [ ] Database queries work
- [ ] Stripe test payment successful
- [ ] Logs show no errors
- [ ] SSL certificate active (automatic)
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring alerts set up
- [ ] Team has access to Render dashboard
- [ ] Documentation updated with URLs
- [ ] Cost monitoring enabled

---

## 🎉 You're Live!

Once all checks pass, your Craved Artisan marketplace is live on Render!

**Production URLs:**
- Frontend: `https://cravedartisan-web.onrender.com`
- API: `https://cravedartisan-api.onrender.com`
- Database: Internal Render network

**Next Steps:**
1. Test with real users
2. Monitor logs and metrics daily
3. Scale up as needed
4. Add custom domain
5. Enable production Stripe keys
6. Setup automated backups

---

**Questions or issues?** Check the troubleshooting section or open an issue in the repository.

