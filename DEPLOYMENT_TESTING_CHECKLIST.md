# 🧪 Deployment Testing Checklist

## Current Status
- ✅ Frontend is loading (https://cravedartisan-web.onrender.com)
- ✅ Backend health endpoint is working
- ✅ API routing is fixed (404 errors resolved)
- ✅ Login authentication is working
- ❓ Database migrations status unknown
- ❓ Admin Console routing needs verification

---

## 🔍 **Step 1: Backend Health Check**

### Test Backend Endpoints
Run these commands to verify backend is fully operational:

```powershell
# Test health endpoint
Invoke-WebRequest -Uri "https://cravedartisan-api.onrender.com/health" -UseBasicParsing

# Test readyz endpoint  
Invoke-WebRequest -Uri "https://cravedartisan-api.onrender.com/readyz" -UseBasicParsing

# Test auth endpoint (should return 401, not 404)
try { Invoke-WebRequest -Uri "https://cravedartisan-api.onrender.com/api/auth/session" -UseBasicParsing } catch { Write-Host "Expected 401: $($_.Exception.Response.StatusCode)" }
```

**Expected Results:**
- ✅ `/health` → 200 OK with JSON
- ✅ `/readyz` → 200 OK with JSON  
- ✅ `/api/auth/session` → 401 Unauthorized (not 404)

---

## 🗄️ **Step 2: Database Migrations**

### Check Migration Status
1. **Go to Render Dashboard** → **`cravedartisan-api`** → **Shell** tab
2. **Run migration check:**
```bash
npx prisma migrate status
```

### Run Migrations (if needed)
```bash
npx prisma migrate deploy
npx prisma generate
```

**Expected Results:**
- ✅ No pending migrations
- ✅ Prisma client generated successfully

---

## 🔐 **Step 3: Authentication Testing**

### Test Login Flow
1. **Open**: https://cravedartisan-web.onrender.com
2. **Press F12** → **Network tab**
3. **Try to login** with `support@cravedartisan.com`
4. **Check Network tab** for API calls:
   - Should see calls to `https://cravedartisan-api.onrender.com/api/auth/login`
   - Should return 200 OK (not 404 or 500)

### Expected Login Flow
1. **Login request** → Backend API
2. **Authentication success** → User data returned
3. **Frontend redirect** → `/dashboard/admin`
4. **Admin Console loads** → No generic dashboard

---

## 🎯 **Step 4: Admin Console Verification**

### Check Admin Console Route
1. **After login**, you should land at: `/dashboard/admin`
2. **Verify URL**: https://cravedartisan-web.onrender.com/dashboard/admin
3. **Check page loads**: Should see Admin Console with SLO Dashboard, Revenue, Operations, etc.

### Admin Console Components
The Admin Console should include:
- ✅ SLO Dashboard
- ✅ Revenue Dashboard  
- ✅ Operations Dashboard
- ✅ Marketplace Dashboard
- ✅ Trust & Safety Dashboard
- ✅ Growth & Social Dashboard
- ✅ Security & Compliance Dashboard
- ✅ Health & Incidents View

---

## 🐛 **Step 5: Troubleshooting**

### If Login Redirects to Loading Page
**Possible causes:**
1. **Database connection issues** → Check migrations
2. **User role not set correctly** → Check user data in API response
3. **Frontend routing issues** → Check browser console errors

### Debug Steps
1. **Check browser console** (F12 → Console tab) for errors
2. **Check Network tab** for failed API calls
3. **Check Render logs** (Dashboard → Logs tab) for backend errors

---

## 📋 **Priority Order**

### High Priority (Do First)
1. ✅ **Backend Health Check** - Verify all endpoints working
2. ✅ **Database Migrations** - Ensure database is properly set up
3. ✅ **Authentication Test** - Verify login API calls work
4. ✅ **Admin Console Access** - Verify admin routing works

### Medium Priority (Do After Core is Working)
5. **User Management** - Test user creation/roles
6. **Data Persistence** - Test saving/loading data
7. **Feature Testing** - Test specific admin console features

### Low Priority (Do Last)
8. **Performance Optimization** - Page load times, caching
9. **UI Polish** - Styling, responsive design
10. **Advanced Features** - Complex admin functions

---

## 🎯 **Success Criteria**

### Core Functionality Working
- [ ] Backend health endpoints respond correctly
- [ ] Database migrations completed successfully  
- [ ] Login with `support@cravedartisan.com` works
- [ ] Admin Console loads without errors
- [ ] No generic dashboard landing page appears

### Admin Console Working
- [ ] Admin Console loads at `/dashboard/admin`
- [ ] All dashboard components render
- [ ] Navigation between sections works
- [ ] Data loads correctly (if applicable)

---

## 🚨 **If Issues Persist**

### Common Problems & Solutions

**Problem: Login redirects to loading page**
- **Cause**: Database migrations not run
- **Solution**: Run `npx prisma migrate deploy` in Render shell

**Problem: 404 errors on API calls**
- **Cause**: Backend not deployed or environment variables missing
- **Solution**: Check Render deployment status and environment variables

**Problem: Admin Console doesn't load**
- **Cause**: Frontend routing issue or missing components
- **Solution**: Check browser console for JavaScript errors

**Problem: Generic dashboard still appears**
- **Cause**: Frontend not redeployed with latest changes
- **Solution**: Trigger manual redeploy in Render dashboard

---

## 📞 **Next Steps**

1. **Start with Step 1** - Backend Health Check
2. **Report results** - Let me know what you find
3. **Move to Step 2** - Database Migrations if needed
4. **Continue systematically** - Don't skip steps

**Ready to start with Step 1?** Let me know what the backend health check results show!


