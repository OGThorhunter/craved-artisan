# Admin P&L Dashboard - Testing Guide

## Overview
This guide will help you test the newly implemented Profit & Loss dashboard for the admin panel.

## What Was Implemented

### Database Models
1. **Enhanced CostSnapshot** - Added manual override fields for actual costs
2. **StaffMember** - Track staff roles, salaries, start/end dates
3. **ProfitLossSnapshot** - Monthly P&L aggregation with all metrics

### Backend Services
1. **Staff Management Service** - CRUD operations for staff members
2. **Cost Tracking Service** - Manual cost overrides and monthly aggregation
3. **Profit & Loss Service** - Monthly/yearly P&L generation and reporting
4. **Cron Job** - Automatic monthly P&L generation on 1st of each month at 3 AM

### API Endpoints
- `GET /api/admin/pl/monthly?month=YYYY-MM` - Get monthly P&L
- `GET /api/admin/pl/yearly?year=YYYY` - Get yearly P&L
- `POST /api/admin/pl/generate?month=YYYY-MM` - Manually trigger P&L generation
- `GET /api/admin/pl/trend?start=YYYY-MM&end=YYYY-MM` - Get P&L trend
- `GET /api/admin/pl/latest` - Get latest P&L
- `GET /api/admin/pl/staff` - List staff members
- `POST /api/admin/pl/staff` - Create staff member
- `PATCH /api/admin/pl/staff/:id` - Update staff member
- `DELETE /api/admin/pl/staff/:id` - Deactivate staff member
- `PATCH /api/admin/pl/costs/:date` - Update manual cost overrides
- `GET /api/admin/pl/costs/:date` - Get costs for specific date

### Frontend Components
1. **PLDashboard** - Main P&L view with KPIs, charts, and monthly/yearly toggle
2. **StaffManagement** - Add, edit, and deactivate staff members
3. **CostOverride** - Override estimated costs with actual expenses

## Testing Steps

### 1. Access the Admin Dashboard
```
Navigate to: /dashboard/admin
Click on: Revenue tab
You should see new navigation options: P&L Dashboard, Staff, Cost Overrides
```

### 2. Test Staff Management

#### Add Staff Members
1. Go to the **Staff** tab
2. Click "Add Staff Member"
3. Fill in the form:
   - Role: "Software Engineer"
   - Salary: $90,000
   - Start Date: 2024-01-01
   - Notes: "Full-time backend developer"
4. Click "Create Staff Member"
5. Verify Winston logs show staff creation

#### Add More Staff (for realistic testing)
- "Product Manager" - $110,000 - Started 2024-03-01
- "Marketing Specialist" - $75,000 - Started 2024-02-15

#### Deactivate a Staff Member
1. Click "Deactivate" on any staff member
2. Enter an end date
3. Verify the status changes to "Inactive"
4. Check Winston logs for deactivation

### 3. Test Cost Overrides

#### Update Manual Costs
1. Go to the **Cost Overrides** tab
2. Select a recent date (within last 30 days)
3. Override estimated costs with actual values:
   - Hosting: $32.00 (instead of estimated)
   - Redis: $5.00
   - Database: $7.00
   - Email: $19.95
   - Other Costs: $50.00 with note "Stripe, GitHub, Figma subscriptions"
4. Click "Save Overrides"
5. Verify Winston logs show the cost override with before/after values

### 4. Generate P&L Snapshot

#### Manual Generation
1. Open browser console
2. Make a POST request:
```bash
curl -X POST "http://localhost:3001/api/admin/pl/generate?month=2024-10" \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json"
```

Or use the browser's fetch:
```javascript
fetch('/api/admin/pl/generate?month=2024-10', {
  method: 'POST',
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

3. Check Winston logs for P&L generation with all totals

### 5. View P&L Dashboard

#### Monthly View
1. Go to the **P&L Dashboard** tab
2. Select "Monthly" view
3. Choose the month you generated
4. Verify you see:
   - Total Revenue
   - Total Costs (breakdown by category)
   - Staff Costs and count
   - Net Profit
   - Profit Margin percentage
5. Check the P&L Statement table shows all cost categories
6. Verify the 12-month trend chart displays
7. Check the cost breakdown pie chart

#### Yearly View
1. Switch to "Yearly" view
2. Select 2024
3. Verify aggregated yearly totals
4. Check that monthly breakdown is shown

### 6. Winston Logs Verification

Check your Winston logs for the following entries:

#### Staff Operations
```json
{
  "level": "info",
  "message": "Staff member created",
  "staffMemberId": "...",
  "role": "Software Engineer",
  "salaryCents": 9000000,
  "startDate": "2024-01-01T00:00:00.000Z"
}
```

#### Cost Override
```json
{
  "level": "info",
  "message": "Manual cost overrides updated",
  "date": "2024-10-15T00:00:00.000Z",
  "adminId": "...",
  "before": { ... },
  "after": { ... }
}
```

#### P&L Generation
```json
{
  "level": "info",
  "message": "Generated monthly P&L snapshot",
  "month": "2024-10-01T00:00:00.000Z",
  "totalRevenueCents": ...,
  "totalCostCents": ...,
  "netProfitCents": ...,
  "profitMarginPercent": ...
}
```

#### Monthly Cron Job
```json
{
  "level": "info",
  "message": "Generating monthly P&L snapshot..."
}
{
  "level": "info",
  "message": "Monthly P&L snapshot generated successfully",
  "month": "..."
}
```

## Expected Behavior

### Calculations
- **Gross Profit** = Total Revenue - Operating Costs (excluding staff)
- **Net Profit** = Total Revenue - Total Costs (including staff)
- **Profit Margin** = (Net Profit / Total Revenue) × 100
- **Staff Costs** = Prorated based on start/end dates within the period

### Prorated Staff Costs Example
If a staff member:
- Salary: $120,000/year
- Started: Oct 15, 2024
- Period: October 2024 (Oct 1-31)

Their cost for October = ($120,000 / 365) × 17 days = ~$5,589

### Data Sources
- **Revenue**: Aggregated from `RevenueSnapshot` table (platformRevenueCents)
- **Infrastructure Costs**: From `CostSnapshot` with manual overrides applied
- **Staff Costs**: Calculated from `StaffMember` table with proration
- **Payment Processing**: Stripe fees from `CostSnapshot` (stripeFeesCents)

## Troubleshooting

### No P&L Data Available
- Ensure you have `RevenueSnapshot` records for the month
- Check that cost snapshots exist (run the daily cron or create manually)
- Verify the P&L generation was successful (check logs)

### Incorrect Staff Costs
- Verify start/end dates are correct
- Check that salary is entered in dollars (not cents) in the UI
- Review Winston logs for the calculation details

### Cost Overrides Not Applied
- Ensure you saved the overrides
- Check the date matches the snapshot date
- Verify Winston logs show the update

## Cleanup (Optional)

To reset test data:
```sql
-- Delete test staff
DELETE FROM StaffMember WHERE role LIKE '%Test%';

-- Delete P&L snapshots
DELETE FROM ProfitLossSnapshot WHERE month >= '2024-01-01';

-- Reset cost overrides
UPDATE CostSnapshot 
SET manualRenderCostCents = NULL,
    manualRedisCostCents = NULL,
    manualDatabaseCostCents = NULL,
    manualSendGridCostCents = NULL,
    manualStorageCostCents = NULL,
    otherCostsCents = 0,
    otherCostsNote = NULL,
    updatedBy = NULL;
```

## Production Deployment Checklist

- [ ] Run database migration: `npx prisma migrate deploy`
- [ ] Restart the server to activate cron jobs
- [ ] Add initial staff members for accurate P&L
- [ ] Review and override automated cost estimates with actual bills
- [ ] Set up monthly reminders to review and update costs
- [ ] Monitor Winston logs for any errors in P&L generation
- [ ] Test the monthly cron job triggers correctly (wait for 1st of month or manually trigger)

## Features to Note

1. **Automatic Monthly P&L** - Generated on the 1st of each month at 3 AM
2. **Prorated Staff Costs** - Handles mid-month hires and departures
3. **Cost Override History** - Track who updated costs and when
4. **Historical Staff Tracking** - Keep records of past employees
5. **12-Month Trend** - Visual comparison over time
6. **Both Monthly & Yearly Views** - Flexible reporting periods
7. **Accessibility** - All form fields have proper labels and ARIA attributes
8. **Real-time Updates** - React Query automatically refetches data
9. **Toast Notifications** - User feedback for all actions
10. **Winston Logging** - Comprehensive audit trail of all P&L operations

