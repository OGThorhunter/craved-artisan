# 🚀 Redis Deployment & Testing Guide

## ✅ Pre-Deployment Verification

**Redis Connection Test:** ✅ **PASSED**
- Successfully connected to Upstash Redis
- Write/Read/Delete operations confirmed working
- Latency: ~200ms (acceptable for Upstash free tier)

---

## 📋 Step 1: Add Redis URL to Render Dashboard

### Instructions:

1. **Open Render Dashboard:**
   - Go to: https://dashboard.render.com
   - Login with your credentials

2. **Select Your API Service:**
   - Click on: `cravedartisan-api` (or your backend service name)

3. **Navigate to Environment Variables:**
   - Click the **"Environment"** tab in the left sidebar

4. **Add REDIS_URL:**
   - Click **"Add Environment Variable"**
   - **Key:** `REDIS_URL`
   - **Value:** `rediss://default:AW-TAAIjcDE1OGEyZTk2YjI5ZDg0ODU5YjQ3YzUxNjcwOGE2ODk1OXAxMA@organic-satyr-28563.upstash.io:6379`
   - Click **"Save Changes"**

5. **Trigger Deployment:**
   - Render will automatically redeploy with the new environment variable
   - Wait 3-5 minutes for deployment to complete

---

## 📊 Step 2: Monitor Deployment Logs

### What to Look For:

#### ✅ **Success Indicators:**

```
✅ Redis client connected successfully
✅ Redis client ready to accept commands
✅ Using Redis session store
🚀 Session-based auth server listening
```

#### ❌ **Failure Indicators:**

```
❌ Redis client error
⚠️ Redis not available - using memory store
Warning: connect.session() MemoryStore is not designed for production
```

### How to Access Logs:

1. In Render Dashboard, click your service
2. Click **"Logs"** tab
3. Watch for the success indicators above

---

## 🧪 Step 3: Test Redis Connection (After Deployment)

### Option A: Use Test HTML Page (Recommended)

1. **Open the test page:**
   ```bash
   # In your project directory
   start test-production-cors.html
   # (This will open in your default browser)
   ```

2. **Click "2. Comprehensive Status Check (New Endpoint)"**

3. **Look for:**
   ```json
   {
     "checks": {
       "redis": {
         "status": "healthy",
         "message": "Redis connected and operational"
       }
     }
   }
   ```

### Option B: Direct API Call

```bash
# PowerShell
$response = Invoke-RestMethod -Uri "https://cravedartisan-api.onrender.com/api/status"
$response.checks.redis
```

**Expected Output:**
```json
{
  "status": "healthy",
  "message": "Redis connected and operational",
  "latency": 234,
  "operations": ["set", "get", "del"]
}
```

---

## 🧪 Step 4: Test CORS Functionality

### Option A: Use Test HTML Page

1. **Open:** `test-production-cors.html`
2. **Click:** "6. Run All Tests"
3. **Check Results:**
   - ✅ Basic Health Check: PASSED
   - ✅ Comprehensive Status: PASSED (Redis healthy)
   - ✅ Session Endpoint: PASSED (no CORS errors)
   - ✅ Maintenance Status: PASSED
   - ✅ CORS Preflight: PASSED

### Option B: Test on Live Site

1. **Visit:** https://www.cravedartisan.com
2. **Open DevTools Console:** Press F12
3. **Check for CORS Errors:**
   - ❌ Should NOT see: `Access to XMLHttpRequest... blocked by CORS policy`
   - ✅ Should see: Normal API requests with 200/401 responses

4. **Test Signup Flow:**
   - Navigate to signup page
   - Attempt to create an account
   - Should work without CORS errors

---

## 📈 Step 5: Verify Session Persistence

### Test Session Across Requests:

1. **Login to the site**
2. **Refresh the page**
3. **Check if you're still logged in**
   - ✅ **With Redis:** You stay logged in
   - ❌ **Without Redis (Memory Store):** You get logged out

---

## 🎯 Success Criteria Checklist

After following all steps, verify:

- [ ] Render deployment completed successfully
- [ ] Logs show "✅ Redis client connected successfully"
- [ ] `/api/status` endpoint shows `redis.status: "healthy"`
- [ ] No CORS errors in browser console on www.cravedartisan.com
- [ ] Session endpoint returns 200/401 (not CORS error)
- [ ] Sessions persist across page refreshes
- [ ] Signup flow works without errors
- [ ] No "MemoryStore" warnings in logs

---

## 🔧 Troubleshooting

### Issue: Redis Still Showing "degraded" or "unhealthy"

**Check:**
1. Verify REDIS_URL is correctly set in Render Dashboard
2. Check for typos in the Redis URL
3. Ensure Upstash Redis instance is active
4. Check Render logs for specific error messages

**Fix:**
```bash
# Test connection locally again
node test-redis-connection.js
```

### Issue: CORS Errors Still Appearing

**Check:**
1. Clear browser cache and cookies
2. Hard refresh (Ctrl + F5)
3. Check Render logs for CORS request logs
4. Verify `www.cravedartisan.com` is in the allowed origins

### Issue: Sessions Not Persisting

**Check:**
1. Verify Redis is connected (not using memory store)
2. Check cookie settings in browser DevTools
3. Ensure `credentials: true` in fetch requests
4. Check SESSION_SECRET is set in Render

---

## 📞 Next Steps After Success

1. **Monitor Production:**
   - Set up uptime monitoring (e.g., UptimeRobot)
   - Point monitor to: `https://cravedartisan-api.onrender.com/api/status`

2. **Set Up Alerts:**
   - Create Render alerts for service downtime
   - Monitor Redis connection health

3. **Document for Team:**
   - Share Redis URL securely (use env var, never commit)
   - Document how to access Render dashboard

---

## 🎉 You're Done!

Once all checks pass, your production deployment is fully operational with:
- ✅ CORS working between frontend and backend
- ✅ Redis connected for session management
- ✅ Comprehensive health monitoring
- ✅ Database connectivity verified

**Estimated Total Time:** 10-15 minutes

