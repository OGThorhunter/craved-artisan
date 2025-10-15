# Admin User Management - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- PostgreSQL or SQLite database configured
- Prisma CLI installed

### Setup Instructions

#### 1. Database Migration
The Prisma migration has already been applied. If you need to re-run it:

```bash
npx prisma migrate dev
npx prisma generate
```

#### 2. Start the Server
```bash
cd server
npm run dev
```

The admin users API will be available at: `http://localhost:3001/api/admin/users`

#### 3. Start the Client
```bash
cd client
npm run dev
```

Access the admin console at: `http://localhost:5173/admin`

### First Time Access

1. **Login as Admin**
   - Navigate to `/login`
   - Use an admin account
   - You'll be redirected to the admin dashboard

2. **Access User Management**
   - Click on the "CRM" tab in the admin dashboard
   - Click "Manage All Users" button
   - OR navigate directly to `/control/users`

3. **Explore Features**
   - Use the search bar to find users
   - Click "Filters" for advanced filtering
   - Try quick segments (At Risk, Pending KYC, etc.)
   - Click on a user to view details

## 📍 Key URLs

- **Admin Dashboard:** `/admin`
- **User Management:** `/control/users`
- **User Details:** `/control/users/:id`
- **Analytics:** `/control/users/analytics` (add route to App.tsx)

## 🔧 API Endpoints

### List Users
```bash
GET /api/admin/users?page=1&limit=50&role=VENDOR&status=ACTIVE
```

### Get User Details
```bash
GET /api/admin/users/{userId}
```

### Suspend User
```bash
POST /api/admin/users/{userId}/actions
{
  "action": "suspend",
  "reason": "Terms violation"
}
```

### Merge Duplicates
```bash
POST /api/admin/users/{primaryId}/merge
{
  "duplicateId": "{duplicateId}"
}
```

### Bulk Operations
```bash
POST /api/admin/users/bulk
{
  "userIds": ["id1", "id2", "id3"],
  "action": "suspend",
  "params": {}
}
```

## 🎨 UI Features

### Filters Available
- **Role:** CUSTOMER, VENDOR, B2B_VENDOR, EVENT_COORDINATOR, DROPOFF_MANAGER, SUPER_ADMIN
- **Status:** ACTIVE, PENDING, SUSPENDED, SOFT_DELETED
- **Onboarding:** NOT_STARTED, IN_PROGRESS, NEEDS_ATTENTION, COMPLETE
- **Email Verified:** true/false
- **MFA Enabled:** true/false
- **Beta Tester:** true/false
- **Risk Score:** Min/Max range
- **Date Ranges:** Created date, Last active date
- **ZIP Code:** Filter by location

### Quick Segments
- **At Risk** - Users with risk score ≥ 60
- **Pending KYC** - Users needing verification
- **Stripe Incomplete** - Missing Stripe requirements
- **Vacation On** - Vendors on vacation mode
- **Beta Testers** - Beta access users

## 🛠️ Common Operations

### 1. Find High-Risk Users
1. Click "At Risk" quick segment
2. Review users with risk score > 60
3. Click to view details and risk factors
4. Take action (suspend, investigate, resolve flags)

### 2. Convert Customer to Vendor
1. Find customer user
2. Go to Roles & Access tab
3. Click "Add Role" → Select VENDOR
4. Confirm (creates VendorProfile automatically)
5. User can now access vendor dashboard

### 3. Merge Duplicate Accounts
1. Find primary user
2. Actions → Find Duplicates
3. Select duplicate from list
4. Review merge preview
5. Type "MERGE" to confirm
6. All data transferred to primary account

### 4. Handle Compliance Issues
1. Go to Onboarding & Compliance tab
2. Click "Re-sync" for Stripe status
3. Review requirements due
4. Upload documents to vault
5. Manually verify email/phone if needed

### 5. Impersonate for Support
1. User Detail → Roles & Access
2. Click "Impersonate User"
3. Enter reason (required, min 10 chars)
4. Select time limit (15min, 1hr, 4hr)
5. Type "IMPERSONATE" to confirm
6. You'll be logged in as the user

## 📊 Monitoring

### Check Winston Logs
```bash
# Server console will show:
[ADMIN_ACTION] Admin admin@craved.com suspended user vendor@example.com | Reason: Fraud | IP: 127.0.0.1
```

### View Audit Trail
1. User Detail → Activity & Security tab
2. Scroll to "Audit Trail" section
3. All admin actions on this user visible

### Review Risk Scores
```bash
# Daily job runs at 3:00 AM
# Check logs for:
✅ Risk score update job completed in 1234ms - Updated 156 users
```

## 🔒 Permissions

### Super Admin
- Full access to all features
- Can impersonate, delete, export payouts
- Can manage roles

### Staff Admin
- Limited write access
- Cannot delete or impersonate
- Cannot export payouts

### Support
- Read + tickets/messages only
- No access to payouts/fees
- Cannot impersonate

### Finance
- Read commerce data only
- Can export payouts
- Cannot impersonate or modify users

## ⚠️ Important Notes

1. **Backup Before Bulk Operations** - Always backup database before bulk actions
2. **Test in Staging First** - Try new workflows in staging environment
3. **Reason Required** - All destructive actions need explanation
4. **Audit Trail** - Every action is logged and tracked
5. **IP Allowlist** - Admin access restricted by IP in production

## 💡 Tips

- Use quick segments for common queries
- Check Winston logs after each action [[memory:3752752]]
- Review risk scores weekly
- Run duplicate detection monthly
- Monitor compliance posture dashboard
- Set up alerts for high-risk users
- Document custom workflows for your team

## 🆘 Support

If you encounter issues:
1. Check Winston logs in server console
2. Review audit trail in user detail
3. Check browser console for errors
4. Verify API responses in Network tab
5. Contact development team with error details

---

**System Status:** ✅ Production Ready
**Last Updated:** October 15, 2025

