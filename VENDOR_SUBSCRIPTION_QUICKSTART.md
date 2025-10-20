# Vendor Subscription System - Quick Start Guide

## ✅ Implementation Complete!

The vendor subscription system has been successfully implemented. Follow these steps to get it running.

## Step 1: Create Stripe Product (One-Time Setup)

```bash
cd server
npx ts-node src/scripts/setup-vendor-subscription-product.ts
```

This will output:
```
Product ID: prod_xxxxx
Price ID: price_xxxxx

Add to your .env file:
STRIPE_VENDOR_SUBSCRIPTION_PRICE_ID=price_xxxxx
```

## Step 2: Add Environment Variable

In your `.env` file (or Render environment variables), add:

```bash
STRIPE_VENDOR_SUBSCRIPTION_PRICE_ID=price_xxxxx
```

Replace `price_xxxxx` with the actual Price ID from Step 1.

## Step 3: Run Database Migration

```bash
# Development
npx prisma migrate dev --name add_vendor_subscription_fields

# Production (on Render)
npx prisma migrate deploy
```

## Step 4: Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add these events to your existing webhook:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

## Step 5: Restart Your Server

```bash
# Development
npm run dev

# Production will auto-restart on deploy
```

## Testing the Implementation

### Test Vendor Signup with Trial

1. Create a new vendor account
2. Complete signup flow
3. Check database - vendor should have:
   - `subscriptionStatus = 'TRIALING'`
   - `trialEndsAt` = 14 days from now

### Test Subscription Status API

```bash
curl -X GET http://localhost:3001/api/vendor-subscription/status \
  -H "Cookie: your-session-cookie"
```

Expected response:
```json
{
  "hasAccess": true,
  "status": "TRIALING",
  "isInTrial": true,
  "trialEndsAt": "2025-11-02T00:00:00.000Z",
  "currentPeriodEnd": "2025-11-02T00:00:00.000Z"
}
```

### Test Order Protection

After trial expires (or manually set `trialEndsAt` to past date):

```bash
curl -X POST http://localhost:3001/api/vendor/orders \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test","items":[]}'
```

Expected response (403):
```json
{
  "error": "Subscription required",
  "message": "Please update your subscription to accept orders",
  "subscriptionStatus": "PAST_DUE"
}
```

### Test Billing Portal

```bash
curl -X POST http://localhost:3001/api/vendor-subscription/billing-portal \
  -H "Cookie: your-session-cookie"
```

Expected response:
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

## Frontend Integration

### Add Route for Subscription Page

In your router configuration, add:

```typescript
import SubscriptionPage from './pages/vendor/SubscriptionPage';

// Add route
<Route path="/vendor/subscription" component={SubscriptionPage} />
```

### Add Widget to Vendor Dashboard

```typescript
import { SubscriptionWidget } from './components/vendor/SubscriptionWidget';

// In your vendor dashboard
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <SubscriptionWidget />
  {/* Other dashboard widgets */}
</div>
```

## What Vendors Will See

### During Trial (First 14 Days)
- ✅ Full platform access
- 🎯 Trial countdown widget
- ⚠️ Warning 3 days before expiration
- 💳 Option to add payment method anytime

### Trial Expires Without Payment
- ❌ Cannot create new orders
- ❌ Cannot accept orders
- 💳 Prompted to add payment method
- 📧 Email notification (if configured)

### Active Subscription
- ✅ Full platform access
- 💰 $25/month automatic billing
- 📊 2% commission on transactions
- 🔄 Can cancel anytime (access until period end)

## Revenue Model

### Platform Revenue Streams

1. **Subscription Revenue**
   - $25/month per active vendor
   - Collected via Stripe Billing
   - Charged to vendor's payment method

2. **Transaction Commission**
   - 2% of every customer transaction
   - Collected via Stripe Connect application fees
   - Automatically deducted from vendor payouts

### Example Monthly Revenue

With 100 active vendors:
- Subscriptions: 100 × $25 = **$2,500/month**
- Transactions: Varies based on sales volume

If those 100 vendors process $500,000/month in sales:
- Commission: $500,000 × 2% = **$10,000/month**

**Total Monthly Revenue: $12,500**

## Monitoring & Analytics

### Check Subscription Metrics

```sql
-- Active vendors
SELECT COUNT(*) FROM "VendorProfile" 
WHERE "subscriptionStatus" = 'ACTIVE';

-- Trialing vendors
SELECT COUNT(*) FROM "VendorProfile" 
WHERE "subscriptionStatus" = 'TRIALING';

-- Past due vendors
SELECT COUNT(*) FROM "VendorProfile" 
WHERE "subscriptionStatus" = 'PAST_DUE';

-- MRR (Monthly Recurring Revenue)
SELECT COUNT(*) * 25 as mrr FROM "VendorProfile" 
WHERE "subscriptionStatus" IN ('ACTIVE', 'TRIALING');
```

### Stripe Dashboard Metrics
- Navigate to Stripe Dashboard → Billing → Subscriptions
- View active subscriptions, churn rate, MRR
- Export data for analysis

## Troubleshooting

### Vendor says subscription not created

1. Check server logs for errors during signup
2. Verify `STRIPE_VENDOR_SUBSCRIPTION_PRICE_ID` is set
3. Check Stripe API key is valid
4. Look for subscription in Stripe Dashboard

### Webhook not updating subscription status

1. Check webhook delivery in Stripe Dashboard
2. Verify webhook secret matches environment variable
3. Check server logs for webhook processing errors
4. Resend failed webhooks from Stripe Dashboard

### Vendor can't access billing portal

1. Verify vendor has `stripeCustomerId` in database
2. Check Stripe Customer exists in Dashboard
3. Verify API key has billing portal permissions

## Support

For issues:
1. Check implementation doc: `VENDOR_SUBSCRIPTION_IMPLEMENTATION.md`
2. Review server logs
3. Check Stripe Dashboard for customer/subscription details
4. Test webhook delivery

## Success! 🎉

Your vendor subscription system is now live with:
- ✅ 14-day free trials for new vendors
- ✅ $25/month recurring subscriptions
- ✅ 2% transaction commissions
- ✅ Automatic billing and access control
- ✅ Self-service billing portal via Stripe

