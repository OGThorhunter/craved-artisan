# Settings Page Testing Guide

## Quick Verification Steps

### 1. Backend Health Check

Test that all settings endpoints are accessible:

```bash
# Get all settings (requires admin auth)
curl -X GET http://localhost:3001/api/admin/settings \
  -H "Cookie: your-admin-session-cookie"

# Get integration statuses
curl -X GET http://localhost:3001/api/admin/settings/integrations/status \
  -H "Cookie: your-admin-session-cookie"

# Get public settings (no auth required)
curl -X GET http://localhost:3001/api/admin/settings/public
```

### 2. Frontend Access

1. **Navigate to Settings Page**
   - Go to http://localhost:5173/control/settings
   - Or click "Settings" tab in Admin Dashboard at http://localhost:5173/dashboard/admin

2. **Verify Tabs Display**
   - Should see 8 tabs in left sidebar:
     - Platform & Identity ✓
     - Authentication & Security
     - Payments & Fees
     - Notifications
     - AI & Feature Flags
     - Integrations ✓
     - Compliance & Legal
     - Maintenance

3. **Test Platform Identity Section**
   - Click "Platform & Identity" tab
   - Should see current settings:
     - Platform Name: "Craved Artisan"
     - Tagline: "Discover Handcrafted Artisan Products"
     - Contact Email: "support@cravedartisan.com"
     - Timezone: "Eastern Time"
     - Currency: "USD"
     - Environment badge showing current env (Dev/Staging/Prod)
   - Try editing Platform Name
   - Should see reason modal pop up
   - Enter reason (min 10 characters)
   - Confirm update

4. **Test Integrations Section**
   - Click "Integrations" tab
   - Should see status cards for:
     - Stripe (with status indicator)
     - SendGrid
     - Twilio
     - Redis (with memory usage)
     - Database (with table count)
     - S3 (with warning if not configured)
     - TaxJar (marked "Coming Soon")
   - Each card should show:
     - Status badge (OK/WARN/CRIT)
     - Connection details
     - Test button (where applicable)

5. **Verify S3 Warning**
   - If S3 credentials not configured, should see yellow warning banner:
     - "Warning: S3 not configured. Compliance uploads disabled."
     - Instructions to configure AWS environment variables

### 3. Audit Trail Verification

Check Winston logs for audit events:

1. **Update a setting** (e.g., Platform Name)
2. **Check server console logs** for:
   ```
   INFO: Setting updated { key: 'platform.name', updatedBy: 'user-id', reason: '...' }
   ```

3. **Query audit events** in database:
   ```sql
   SELECT * FROM AuditEvent 
   WHERE scope = 'CONFIG' 
   ORDER BY occurredAt DESC 
   LIMIT 10;
   ```

Should see events with actions:
- `CONFIG_SETTING_UPDATED`
- `CONFIG_SETTING_DELETED` (if you deleted any)
- `CONFIG_CACHE_CLEARED` (if you cleared cache)
- etc.

### 4. Integration Status Tests

Test each integration health check:

```bash
# Test Stripe
curl -X POST http://localhost:3001/api/admin/settings/integrations/stripe/test \
  -H "Cookie: your-admin-session-cookie"

# Test Redis
curl -X POST http://localhost:3001/api/admin/settings/integrations/redis/test \
  -H "Cookie: your-admin-session-cookie"

# Test Database
curl -X POST http://localhost:3001/api/admin/settings/integrations/database/test \
  -H "Cookie: your-admin-session-cookie"
```

Expected responses:
```json
{
  "success": true,
  "data": {
    "service": "Stripe",
    "status": "OK" | "WARN" | "CRIT",
    "message": "Connected successfully",
    "lastChecked": "2025-10-16T...",
    "details": { ... }
  }
}
```

### 5. Cache Verification

1. **Update a setting**
2. **Check Redis cache keys**:
   ```bash
   redis-cli KEYS "settings:*"
   ```
   
   Should see:
   - `settings:all`
   - `settings:category:PLATFORM_IDENTITY`
   - `settings:key:platform.name`
   - `settings:public`

3. **Wait 60 seconds** (cache TTL)
4. **Keys should expire** and be regenerated on next request

### 6. Staff Admin Read-Only Test

1. **Log in as Staff Admin** (not Super Admin)
2. **Navigate to /control/settings**
3. **Should see all settings** (read-only)
4. **Try to edit a setting**
5. **Should fail or show read-only warning**

### 7. Unsaved Changes Warning

1. **Edit Platform Name** (don't save)
2. **Try to navigate away** or close tab
3. **Should see browser warning**: "You have unsaved changes"
4. **Cancel navigation**
5. **Click Reset button**
6. **Changes should revert**

## Expected Behavior

### ✅ Success Indicators

- All tabs render without errors
- Platform Identity settings are editable
- Integration statuses display correctly
- Status badges show appropriate colors (green/yellow/red)
- Reason modal appears when editing settings
- Audit events are created in database
- Winston logs show CONFIG_* events
- Cache invalidation works
- S3 warning appears if not configured
- Environment badge shows correct environment

### ⚠️ Expected Warnings

- **S3 Warning**: "S3 not configured. Compliance uploads disabled."
  - This is normal if AWS credentials aren't set
  - Document uploads will save metadata only

- **Coming Soon Indicators**: 
  - TaxJar integration
  - Some SendGrid features
  - Some Twilio features
  - These are placeholders for future implementation

### ❌ Issues to Report

- **500 errors** when fetching settings
- **Audit events not being created**
- **Cache not invalidating** after updates
- **Integration status checks failing** unexpectedly
- **Linter errors** in console
- **TypeScript errors** in browser console
- **Reason modal not appearing** when editing

## Manual Test Checklist

- [ ] Settings page loads at /control/settings
- [ ] Admin Dashboard Settings tab navigates to page
- [ ] All 8 tabs are visible
- [ ] Platform Identity tab shows seeded settings
- [ ] Platform Name can be edited (with reason modal)
- [ ] Integrations tab shows all service cards
- [ ] Status indicators display correctly
- [ ] Stripe status shows OK (if configured)
- [ ] Redis status shows OK with memory stats
- [ ] Database status shows OK with table count
- [ ] S3 warning displays if not configured
- [ ] TaxJar shows "Coming Soon"
- [ ] Reason modal requires 10+ characters
- [ ] Unsaved changes warning works
- [ ] Audit events created on updates
- [ ] Winston logs show CONFIG_SETTING_UPDATED
- [ ] Cache keys exist in Redis
- [ ] Cache expires after 60 seconds
- [ ] Read-only mode works for Staff Admins

## Performance Checks

1. **Initial Page Load**: < 2 seconds
2. **Tab Switching**: Instant (no reload)
3. **Settings Fetch**: < 500ms (with cache)
4. **Integration Status**: < 2 seconds (parallel checks)
5. **Cache Hit Rate**: Should be high after initial load

## Debugging Tips

### Settings Not Loading
- Check if seeded: `SELECT COUNT(*) FROM ConfigSetting;` (should be 46)
- Check Redis connection
- Check server logs for errors

### Integration Status Errors
- Verify environment variables are set
- Check service connectivity (Stripe API, Redis, etc.)
- Review server logs for specific error messages

### Audit Events Not Creating
- Verify AuditEvent table exists
- Check user has valid ID
- Review server logs for Prisma errors

### Cache Issues
- Verify Redis is running
- Check REDIS_URL environment variable
- Review redis-cache.service.ts logs

## Quick Smoke Test

Run this quick test sequence:

1. ✅ Navigate to /control/settings
2. ✅ Click Platform & Identity
3. ✅ Change Platform Name to "Test Platform"
4. ✅ Enter reason: "Testing settings update"
5. ✅ Confirm
6. ✅ Check console logs for audit event
7. ✅ Click Integrations tab
8. ✅ Verify at least 3 services show OK status
9. ✅ Click Reset button
10. ✅ Verify Platform Name reverted

If all steps pass: **Implementation is working correctly! 🎉**

## Next Steps After Testing

Once basic functionality is verified:

1. **Expand remaining sections** (Auth, Payments, Notifications, AI, Compliance, Maintenance)
2. **Implement AWS S3** for document uploads
3. **Add SendGrid** test email functionality
4. **Add Twilio** test SMS functionality
5. **Build feature flags** sync from code
6. **Create config diff viewer** for audit history
7. **Add version rollback** functionality

