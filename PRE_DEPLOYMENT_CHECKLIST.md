# ✅ Pre-Deployment Checklist

Use this checklist to ensure you're ready to deploy to Render.

---

## 📋 Configuration Files

- [x] **Prisma Schema Updated** (`prisma/schema.prisma`)
  - Provider changed from `sqlite` to `postgresql`
  - DATABASE_URL environment variable configured

- [x] **Render Config Optimized** (`render.yaml`)
  - Plan downgraded from `standard` to `starter` ($7/mo)
  - Redis URL added (optional)
  - OpenAI key added (optional)
  - Database configured correctly

- [x] **Environment Templates Created**
  - `server/.env.production.template` with all required vars
  - `client/.env.production.template` with client vars
  - Documentation for each variable

---

## 🔧 Local Testing

### PostgreSQL Setup

- [ ] PostgreSQL installed locally
- [ ] Local database created (`craved_artisan_local`)
- [ ] `DATABASE_URL` updated in `server/.env`
- [ ] Prisma client generated: `npx prisma generate`
- [ ] Migrations run: `npx prisma migrate dev`

### Application Testing

- [ ] Backend starts without errors (`npm run dev:server`)
- [ ] Frontend loads without errors (`npm run dev:client`)
- [ ] Can create user account
- [ ] Can login successfully
- [ ] Session persists on refresh
- [ ] Database queries work
- [ ] No console errors in browser
- [ ] No errors in Winston logs

### Build Testing

- [ ] Server builds successfully: `cd server && npm run build`
- [ ] Client builds successfully: `cd client && npm run build`
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Built files look correct

---

## 🔐 External Services

### Required Services

- [ ] **Stripe API Keys**
  - [ ] Secret key obtained (sk_test_ or sk_live_)
  - [ ] Publishable key obtained (pk_test_ or pk_live_)
  - [ ] Webhook secret (get after Render deploy)
  - [ ] Keys ready to paste in Render dashboard

### Recommended Services

- [ ] **Redis (Session Storage)**
  - [ ] Decision made: Upstash free tier or skip
  - [ ] If yes: Upstash account created
  - [ ] If yes: Redis database created
  - [ ] If yes: Connection string copied
  - [ ] If no: Accept sessions will reset on deploy

### Optional Services

- [ ] **OpenAI (AI Features)**
  - [ ] Decision made: Enable or disable
  - [ ] If yes: OpenAI account created
  - [ ] If yes: API key obtained
  - [ ] If yes: Budget understood ($5-50/mo)
  - [ ] If no: Will skip AI features initially

- [ ] **Cloudinary (File Uploads)**
  - [ ] Decision made: Enable or disable
  - [ ] If yes: Cloudinary account created
  - [ ] If yes: Credentials obtained
  - [ ] If yes: Plan to integrate
  - [ ] If no: File uploads will be disabled

- [ ] **OAuth (Social Login)**
  - [ ] Decision made: Enable or disable
  - [ ] If yes: Google OAuth configured
  - [ ] If yes: Facebook OAuth configured
  - [ ] If no: Email/password only

---

## 🌐 Render Account Setup

- [ ] Render account created (https://render.com)
- [ ] GitHub repository connected
- [ ] Payment method added (for paid plans)
- [ ] Understand costs: $14/mo minimum for production
- [ ] Understand free tier limitations

---

## 📝 Environment Variables Ready

### Backend (Server)

**Required:**
- [ ] `STRIPE_SECRET_KEY` value ready
- [ ] `STRIPE_PUBLISHABLE_KEY` value ready
- [ ] `STRIPE_WEBHOOK_SECRET` (will get after deploy)

**Optional:**
- [ ] `REDIS_URL` ready (if using)
- [ ] `OPENAI_API_KEY` ready (if using)
- [ ] `GOOGLE_CLIENT_ID` ready (if using)
- [ ] `GOOGLE_CLIENT_SECRET` ready (if using)
- [ ] `FACEBOOK_APP_ID` ready (if using)
- [ ] `FACEBOOK_APP_SECRET` ready (if using)

### Frontend (Client)

**Required:**
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` value ready

**Optional:**
- [ ] `VITE_GOOGLE_CLIENT_ID` ready (if using)
- [ ] `VITE_FACEBOOK_APP_ID` ready (if using)

---

## 🚀 Deployment Readiness

### Code Quality

- [ ] All changes committed to git
- [ ] Working on main branch (or deployment branch)
- [ ] Recent changes tested locally
- [ ] No debug code left in (console.log, debugger, etc.)
- [ ] No hardcoded secrets in code
- [ ] `.env` files in `.gitignore`

### Documentation

- [ ] Team knows deployment is happening
- [ ] Downtime window communicated (if applicable)
- [ ] Rollback plan understood
- [ ] Emergency contacts ready

### Monitoring

- [ ] Plan to check logs after deploy
- [ ] Plan to test immediately after deploy
- [ ] Calendar reminder to check daily for first week

---

## 🎯 Feature Decisions

### Features to Enable at Launch

- [x] **Core Features** (Always enabled)
  - User authentication
  - Vendor dashboard
  - Product management
  - Marketplace browsing
  - Basic analytics
  - Order management

- [ ] **File Uploads**
  - [ ] Yes - Cloudinary configured
  - [ ] No - Routes disabled temporarily

- [ ] **AI Features**
  - [ ] Yes - OpenAI key configured
  - [ ] No - Features disabled to save costs

- [ ] **OAuth Login**
  - [ ] Yes - Google/Facebook configured
  - [ ] No - Email/password only

- [ ] **Redis Sessions**
  - [ ] Yes - Upstash configured
  - [ ] No - Memory store (sessions reset on deploy)

### Cron Jobs to Keep/Disable

Review `server/src/services/cron-jobs.ts`:

- [ ] **Health checks** (every 5 min) - Keep or disable?
- [ ] **DB maintenance** (hourly) - Keep or disable?
- [ ] **System cleanup** (daily 2 AM) - Keep or disable?
- [ ] **Audit verification** (weekly) - Keep or disable?
- [ ] **Cost snapshot** (daily 1 AM) - Keep or disable?
- [ ] **Monthly P&L** (monthly) - Keep or disable?
- [ ] **Support SLA** (every 10 min) - Keep or disable?

**Recommendation:** Keep only health checks initially, add others later.

---

## 💰 Budget Confirmation

### Monthly Costs Understood

- [ ] Render infrastructure: $14-25/mo
- [ ] Redis (optional): $0-10/mo
- [ ] OpenAI (optional): $0-50/mo
- [ ] Cloudinary (optional): $0-89/mo
- [ ] Stripe fees: 2.9% + $0.30 per transaction
- [ ] **Total understood:** $14-174/mo depending on features

### Cost Monitoring Plan

- [ ] Will check Render dashboard weekly
- [ ] Will monitor Stripe fees
- [ ] Will monitor OpenAI usage (if enabled)
- [ ] Will set up billing alerts
- [ ] Know how to scale down if needed

---

## 🧪 Testing Plan

### Immediate Post-Deploy (First Hour)

- [ ] Health check endpoint responds
- [ ] Frontend loads
- [ ] Can create account
- [ ] Can login
- [ ] Winston logs show no errors
- [ ] Database migrations completed
- [ ] Stripe webhook configured

### First Day Testing

- [ ] Test on desktop
- [ ] Test on mobile
- [ ] Test in different browsers
- [ ] Create test vendor account
- [ ] Create test products
- [ ] Test marketplace browsing
- [ ] Test search functionality
- [ ] Monitor error logs

### First Week Testing

- [ ] Invite beta users
- [ ] Monitor performance metrics
- [ ] Check database size growth
- [ ] Review cost actuals vs estimates
- [ ] Fix any reported issues
- [ ] Optimize slow queries

---

## 📞 Support Contacts

### Service Providers

- **Render Support:** https://render.com/support
- **Stripe Support:** https://support.stripe.com
- **Upstash Support:** https://upstash.com/docs
- **OpenAI Support:** https://help.openai.com

### Emergency Procedures

- [ ] Know how to rollback in Render
- [ ] Know how to check logs
- [ ] Know how to restart service
- [ ] Know how to scale up quickly
- [ ] Have backup database export ready

---

## 📚 Documentation Review

- [ ] Read `RENDER_DEPLOYMENT_GUIDE.md`
- [ ] Read `DEPLOYMENT_QUICK_START.md`
- [ ] Read `DEPLOYMENT_COST_CALCULATOR.md`
- [ ] Read `FILE_UPLOAD_WARNING.md`
- [ ] Understand each step before starting

---

## ⚠️ Risk Assessment

### Known Risks

- [ ] **Session loss without Redis:** Accept or mitigate?
- [ ] **File uploads won't work:** Accept or configure Cloudinary?
- [ ] **Cold starts on free tier:** Accept or use paid tier?
- [ ] **Database size limits:** Monitor and plan upgrade?
- [ ] **Cost overruns:** Set spending limits?

### Mitigation Plans

- [ ] Backup database before deploy
- [ ] Test rollback procedure
- [ ] Have Render support contact ready
- [ ] Document all environment variables
- [ ] Keep local development working

---

## 🎉 Ready to Deploy?

### Final Checks

- [ ] All required checkboxes above marked
- [ ] Confident in decision on optional features
- [ ] Budget approved
- [ ] Time allocated (2-3 hours)
- [ ] Not deploying late at night (in case issues arise)
- [ ] Team available for testing

### If All Checks Pass

✅ **You're ready!** Proceed to `DEPLOYMENT_QUICK_START.md`

### If Any Checks Fail

⚠️ **Stop!** Address the missing items before deploying.

Common blockers:
- PostgreSQL not tested locally → Do local testing first
- Stripe keys not ready → Get keys from Stripe dashboard
- Budget not approved → Get approval before deploying
- Don't understand costs → Review `DEPLOYMENT_COST_CALCULATOR.md`

---

## 📝 Deployment Notes

**Date:** ___________
**Time:** ___________
**Deployed by:** ___________

**Feature decisions:**
- File uploads: ☐ Enabled ☐ Disabled
- AI features: ☐ Enabled ☐ Disabled
- OAuth: ☐ Enabled ☐ Disabled
- Redis: ☐ Enabled ☐ Disabled

**Costs:**
- Render plan: $___/mo
- Optional services: $___/mo
- **Total estimated:** $___/mo

**URLs:**
- Frontend: ___________
- Backend: ___________

**Issues encountered:**
- _________________________________________________
- _________________________________________________

**Resolution:**
- _________________________________________________
- _________________________________________________

---

**Status:** ☐ Not Ready ☐ Ready ☐ Deployed ☐ Verified

**Last updated:** [Generated by deployment script]

