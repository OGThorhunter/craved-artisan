# Render Setup - Copy & Paste Commands

This file contains ready-to-use commands for setting up your Render deployment.

---

## 🔧 Environment Variables to Add

### Backend (`cravedartisan-api`)

Copy these and add them in Render Dashboard → cravedartisan-api → Environment:

```bash
NODE_ENV=production
FRONTEND_URL=https://cravedartisan-web.onrender.com
BACKEND_URL=https://cravedartisan-api.onrender.com
CLIENT_URL=https://cravedartisan-web.onrender.com
```

**You need to fill in these with your actual values:**

```bash
DATABASE_URL=<paste-your-neon-postgresql-url>
DIRECT_URL=<paste-same-url-as-DATABASE_URL>
SESSION_SECRET=<generate-random-32-char-string>
STRIPE_SECRET_KEY=<paste-from-stripe-dashboard>
STRIPE_PUBLISHABLE_KEY=<paste-from-stripe-dashboard>
STRIPE_WEBHOOK_SECRET=<paste-from-stripe-dashboard>
```

**Optional but recommended:**

```bash
REDIS_URL=<get-free-from-upstash.com>
OPENAI_API_KEY=<if-using-ai-features>
GOOGLE_CLIENT_ID=<if-using-google-oauth>
GOOGLE_CLIENT_SECRET=<if-using-google-oauth>
```

---

### Frontend (`cravedartisan-web`)

Copy this and add in Render Dashboard → cravedartisan-web → Environment:

```bash
VITE_API_BASE_URL=https://cravedartisan-api.onrender.com
```

**This is the critical fix for your 404 errors!**

---

## 🗄️ Database Migration Commands

After setting environment variables, run these in Render Shell:

**Render Dashboard → cravedartisan-api → Shell tab:**

```bash
npx prisma migrate deploy
npx prisma generate
```

Wait for success message. If you see errors, check your DATABASE_URL.

---

## ✅ Verification Commands

Run these in your local terminal to test the deployment:

### Test Backend Health
```bash
curl https://cravedartisan-api.onrender.com/health
```
Expected: `{"status":"ok","timestamp":"..."}`

```bash
curl https://cravedartisan-api.onrender.com/readyz
```
Expected: `200 OK`

### Test Auth Endpoint
```bash
curl -i https://cravedartisan-api.onrender.com/api/auth/session
```
Expected: `401 Unauthorized` (NOT 404 - this proves API is working!)

### Test Frontend (in browser)
1. Open: https://cravedartisan-web.onrender.com
2. Press F12 → Network tab
3. Try to login
4. Look at API requests - they should go to `cravedartisan-api.onrender.com`

---

## 🔐 Generate Secure Secrets

### Generate SESSION_SECRET

**Windows PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

**Online (if needed):**
https://generate-secret.vercel.app/32

---

## 📊 Where to Get Values

### DATABASE_URL (Neon PostgreSQL)
1. Go to https://console.neon.tech
2. Select your project
3. Click "Connection String"
4. Copy the connection string (starts with `postgresql://`)

### Stripe Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy:
   - **Secret key** (sk_test_... or sk_live_...)
   - **Publishable key** (pk_test_... or pk_live_...)

### Stripe Webhook Secret
1. Go to https://dashboard.stripe.com/webhooks
2. Create endpoint: `https://cravedartisan-api.onrender.com/webhooks/stripe`
3. Copy the webhook signing secret (whsec_...)

### Redis URL (Optional - Upstash)
1. Go to https://upstash.com
2. Create free Redis database
3. Copy the connection string (starts with `rediss://`)

### OpenAI API Key (Optional)
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy the key (sk-...)

---

## 🚨 Common Issues & Fixes

### Issue: Frontend still shows 404 errors

**Fix:**
1. Double-check `VITE_API_BASE_URL=https://cravedartisan-api.onrender.com` is set
2. Trigger manual redeploy of frontend
3. Clear browser cache and reload

### Issue: CORS errors

**Fix:**
Check backend CORS config allows `https://cravedartisan-web.onrender.com`

### Issue: Database connection failed

**Fix:**
1. Verify DATABASE_URL format is correct
2. Check Neon dashboard - database might be paused
3. Make sure DIRECT_URL is same as DATABASE_URL

### Issue: Session not persisting

**Fix:**
1. Check SESSION_SECRET is set (32+ characters)
2. Verify backend session config uses secure cookies for HTTPS

---

## 📝 Deployment Checklist

```
Phase 1: Environment Setup
[ ] Add VITE_API_BASE_URL to frontend
[ ] Add all required backend env vars
[ ] Generate and add SESSION_SECRET
[ ] Add Stripe keys
[ ] Add DATABASE_URL

Phase 2: Deploy
[ ] Trigger manual redeploy of backend
[ ] Trigger manual redeploy of frontend
[ ] Wait for builds to complete (~5 min each)

Phase 3: Database
[ ] Open Render Shell for backend
[ ] Run: npx prisma migrate deploy
[ ] Run: npx prisma generate
[ ] Check logs for success

Phase 4: Test
[ ] curl https://cravedartisan-api.onrender.com/health
[ ] curl https://cravedartisan-api.onrender.com/api/auth/session
[ ] Open https://cravedartisan-web.onrender.com
[ ] Try signup/login
[ ] Check Network tab - no 404s

Phase 5: Celebrate! 🎉
[ ] Everything works!
```

---

## 🆘 Need Help?

If you get stuck, share:
1. The specific error message
2. Screenshot of browser Network tab
3. Backend logs from Render Dashboard

The code changes are already pushed and ready. You just need to configure the environment variables!

