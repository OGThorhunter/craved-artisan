# Coming Soon Gateway - Setup & Usage Guide

The Coming Soon Gateway is a comprehensive maintenance mode system that allows you to block public access to Craved while continuing development and allowing beta testers to access the site.

## 🚀 Quick Setup

### 1. Environment Variables

Add these variables to your `.env` file:

```env
# Maintenance Mode Configuration
MAINTENANCE_MODE="false"  # Set to "true" to enable maintenance mode
BETA_ACCESS_KEY="your-secure-beta-access-key-here-make-it-long-and-random"
```

### 2. Database Migration

Run the Prisma migration to add the `betaTester` field:

```bash
npx prisma db push
# or
npx prisma migrate dev
```

### 3. Start the Application

The system is now ready! The maintenance gateway will automatically:
- Check environment variables and database settings
- Display the coming soon page when maintenance mode is active
- Allow bypass access for authorized users

## 🔧 How It Works

### Access Control Hierarchy

1. **Environment Override** (`MAINTENANCE_MODE=true`)
   - Highest priority - overrides database settings
   - Used for emergency maintenance or production deployments

2. **Database Toggle** (Admin Dashboard)
   - Controlled via Features tab in Admin Dashboard
   - Allows real-time toggling without code changes

3. **Bypass Mechanisms**
   - **Admin Users**: Always have access regardless of maintenance mode
   - **Beta Testers**: Users with `betaTester: true` flag in database
   - **Beta Key**: URL parameter `?beta=<BETA_ACCESS_KEY>` grants temporary access

### Coming Soon Page Features

- 🎨 Beautiful, responsive design matching Craved branding
- 📧 Newsletter signup integration
- ⭐ Feature teasers (without revealing all functionality)
- 🔒 Professional maintenance page for public users

## 📊 Admin Dashboard Controls

Access via: **Admin Dashboard → Features Tab**

### Maintenance Mode Panel
- **Status Display**: Shows if maintenance mode is active and source (ENV vs DB)
- **Environment Override Warning**: Alerts when ENV variable is controlling access
- **Database Toggle**: Real-time on/off switch (disabled if ENV override is active)
- **Statistics**: Beta tester count, access method, and beta key status

### Beta Tester Management
- **Add Beta Testers**: Enter email addresses to grant access
- **Remove Beta Testers**: Revoke access with one click
- **User Details**: View beta tester information and join dates

### Coming Soon Preview
- **Live Preview**: See exactly how the maintenance page appears to users
- **Direct Link**: Quick access to preview the coming soon page

## 🚀 Deployment Scenarios

### Development Mode
```env
MAINTENANCE_MODE="false"
```
- Site is fully accessible
- Use database toggle for testing maintenance mode
- Add team members as beta testers

### Pre-Launch (Staging/Production)
```env
MAINTENANCE_MODE="true"
BETA_ACCESS_KEY="super-secure-random-key-12345"
```
- Site shows coming soon page to public
- Team and beta testers can access via:
  - Admin users (automatic access)
  - Database beta tester flag
  - URL: `https://craved.com/?beta=super-secure-random-key-12345`

### Launch Day
```env
MAINTENANCE_MODE="false"
```
- Simply change environment variable
- Or use admin dashboard to disable database toggle
- Site becomes fully public

## 🔐 Security Features

### Multi-Layer Protection
- Server-side validation for all bypass attempts
- Rate limiting on maintenance status checks
- Secure session storage for temporary access
- Comprehensive audit logging

### Access Logging
Winston logs capture:
- Maintenance mode status checks
- Beta access validation attempts
- Admin maintenance mode toggles
- Beta tester additions/removals

### Beta Key Security
- Environment variable storage (not in database)
- URL parameter automatically cleaned after successful validation
- Session-based temporary access (expires on browser close)

## 📝 Usage Examples

### For Developers
```bash
# Enable maintenance mode for testing
echo 'MAINTENANCE_MODE="true"' >> .env

# Access site during maintenance
open "http://localhost:5173/?beta=your-secure-beta-access-key"
```

### For Admins
1. Login to admin dashboard
2. Navigate to **Features** tab
3. Toggle maintenance mode on/off
4. Add beta testers by email
5. Preview coming soon page

### For Beta Testers
- **Option 1**: Admin adds your email → automatic access when logged in
- **Option 2**: Use beta key URL provided by admin
- **Option 3**: Admins always have access

## 🔧 Troubleshooting

### Maintenance Mode Not Working
1. Check environment variable: `MAINTENANCE_MODE="true"`
2. Verify database connection for feature flags
3. Check browser cache - try incognito mode
4. Verify API endpoints are accessible: `/api/maintenance/status`

### Beta Access Not Working
1. Verify `BETA_ACCESS_KEY` environment variable is set
2. Check beta key in URL matches environment variable exactly
3. For beta testers: confirm user has `betaTester: true` in database
4. Clear browser session storage and try again

### Admin Dashboard Issues
1. Verify user has `ADMIN` role in database
2. Check admin authentication middleware
3. Verify API routes are properly mounted: `/api/maintenance/admin/*`

## 🎯 Best Practices

### Security
- Use long, random beta access keys (32+ characters)
- Rotate beta keys periodically
- Remove beta tester access after launch
- Monitor access logs for suspicious activity

### Development
- Test maintenance mode thoroughly before production
- Use database toggle for development testing
- Keep environment variables in deployment pipeline
- Document beta key distribution process

### Launch Planning
- Prepare beta tester list in advance
- Test all bypass mechanisms before launch
- Plan environment variable changes
- Monitor coming soon page analytics

## 📁 File Structure

```
├── client/src/
│   ├── components/MaintenanceGate.tsx    # Route protection component
│   ├── pages/ComingSoonPage.tsx          # Beautiful coming soon page
│   └── pages/AdminDashboardPage.tsx      # Admin controls (Features tab)
├── server/src/
│   ├── routes/maintenance.router.ts      # API endpoints
│   └── middleware/auth.ts                # Admin authentication
├── prisma/schema.prisma                  # Database schema (betaTester field)
└── server/.env.example                   # Environment configuration
```

## 🎉 Launch Checklist

- [ ] Test maintenance mode with environment variable
- [ ] Test admin dashboard controls
- [ ] Add team members as beta testers
- [ ] Verify coming soon page appearance
- [ ] Test beta key access mechanism
- [ ] Document beta key for distribution
- [ ] Plan launch day environment variable change
- [ ] Prepare newsletter signup monitoring
- [ ] Test removal of maintenance mode

---

**Ready to launch!** 🚀 Your coming soon gateway is fully configured and ready to protect your site while allowing seamless development and beta testing.

