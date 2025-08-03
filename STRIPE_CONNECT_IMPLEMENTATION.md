# Stripe Connect Standard Implementation - Craved Artisan

## Overview

This implementation provides a complete Stripe Connect Standard workflow for Craved Artisan with automated 2% commissions. The system handles vendor onboarding, payment processing, and automatic fund transfers without manual intervention.

## Key Features

- **Stripe Connect Standard**: Vendors connect via onboarding links
- **Automated 2% Commission**: Automatically deducted from every transaction
- **Direct Vendor Payouts**: Funds transfer directly to vendors via Stripe
- **No Manual Fund Handling**: Platform never touches customer funds
- **Secure Payment Processing**: PCI DSS compliant through Stripe

## Architecture

### Backend Components

1. **Stripe Service** (`server/src/utils/stripe.ts`)
   - Handles Stripe Connect account creation
   - Manages payment intent creation
   - Processes automatic transfers with commission calculation
   - Handles webhook events

2. **Stripe Routes** (`server/src/routes/stripe.ts`)
   - Payment intent creation
   - Connect account management
   - Onboarding URL generation
   - Webhook handling

3. **Database Schema Updates** (`prisma/schema.prisma`)
   - Added Stripe fields to VendorProfile
   - Added payment fields to Order model

### Frontend Components

1. **StripePaymentForm** (`client/src/components/StripePaymentForm.tsx`)
   - Secure payment form using Stripe Elements
   - Real-time commission calculation display
   - Payment processing with error handling

2. **VendorStripeOnboarding** (`client/src/components/VendorStripeOnboarding.tsx`)
   - Step-by-step vendor onboarding process
   - Account status monitoring
   - Onboarding URL generation

3. **VendorOnboardingPage** (`client/src/pages/VendorOnboardingPage.tsx`)
   - Complete onboarding page for vendors

## Implementation Details

### 1. Database Schema

```prisma
model VendorProfile {
  // ... existing fields
  stripeAccountId String? // Stripe Connect account ID
  stripeAccountStatus String? // 'pending', 'active', 'restricted', 'disabled'
  stripeOnboardingUrl String? // URL for vendor onboarding
}

model Order {
  // ... existing fields
  stripePaymentIntentId String? // Stripe Payment Intent ID
  stripeTransferId String? // Stripe Transfer ID for vendor payout
  commissionAmount Decimal @default(0) // 2% commission amount
  vendorPayoutAmount Decimal @default(0) // Amount sent to vendor (98%)
}
```

### 2. Commission Calculation

```typescript
const COMMISSION_RATE = 0.02; // 2%

// Calculate commission
const commissionAmount = totalAmount * COMMISSION_RATE;
const vendorPayoutAmount = totalAmount - commissionAmount;
```

### 3. Payment Flow

1. **Customer Checkout**:
   - Customer adds items to cart
   - Places order (creates order record)
   - Payment form appears with Stripe Elements
   - Customer enters payment information

2. **Payment Processing**:
   - Payment intent created on backend
   - Customer payment processed through Stripe
   - Webhook triggers on successful payment

3. **Automatic Transfer**:
   - System calculates 2% commission
   - Creates transfers to vendor Stripe accounts
   - Updates order with payment and transfer information

### 4. Vendor Onboarding Flow

1. **Account Creation**:
   - Vendor clicks "Create Stripe Account"
   - Backend creates Stripe Connect Standard account
   - Account status set to "pending"

2. **Onboarding Process**:
   - Vendor redirected to Stripe onboarding
   - Completes business information and verification
   - Account status updated to "active"

3. **Ready for Payments**:
   - Vendor can now receive automatic payouts
   - 98% of transaction value transferred automatically

## API Endpoints

### Payment Processing
- `POST /api/stripe/create-payment-intent` - Create payment intent for order
- `POST /api/stripe/webhook` - Handle Stripe webhook events

### Vendor Management
- `POST /api/stripe/create-connect-account` - Create Stripe Connect account
- `GET /api/stripe/onboarding-url/:vendorProfileId` - Get onboarding URL
- `GET /api/stripe/account-status/:vendorProfileId` - Get account status

### Commission
- `GET /api/stripe/commission-rate` - Get current commission rate
- `POST /api/stripe/calculate-commission` - Calculate commission for amount

## Environment Variables

### Backend (.env)
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:5174
```

### Frontend (.env)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Security Considerations

1. **PCI Compliance**: All payment data handled by Stripe
2. **Webhook Verification**: All webhooks verified with signature
3. **Authentication**: All endpoints require proper authentication
4. **Authorization**: Vendors can only access their own accounts

## Testing

### Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test Connect Accounts
- Use Stripe test mode for all Connect account testing
- Test onboarding flow with test business information

## Deployment Checklist

1. **Stripe Dashboard Setup**:
   - Enable Connect in Stripe Dashboard
   - Configure webhook endpoints
   - Set up Connect application settings

2. **Environment Variables**:
   - Set production Stripe keys
   - Configure webhook secrets
   - Update client URLs

3. **Database Migration**:
   - Run Prisma migration for new schema
   - Verify new fields are added

4. **Testing**:
   - Test payment flow end-to-end
   - Verify commission calculations
   - Test vendor onboarding process

## Monitoring and Analytics

### Key Metrics to Track
- Payment success rate
- Commission revenue
- Vendor onboarding completion rate
- Transfer success rate

### Logging
- All payment events logged
- Transfer creation logged
- Webhook events logged
- Error handling with detailed logs

## Troubleshooting

### Common Issues

1. **Payment Intent Creation Fails**:
   - Check Stripe secret key
   - Verify order exists and belongs to user
   - Ensure all vendors are connected

2. **Transfer Fails**:
   - Check vendor Stripe account status
   - Verify account has sufficient funds
   - Check transfer amount limits

3. **Webhook Not Received**:
   - Verify webhook endpoint URL
   - Check webhook secret configuration
   - Ensure endpoint is publicly accessible

### Debug Commands

```bash
# Check Stripe account status
curl -X GET "http://localhost:3001/api/stripe/account-status/vendor-id" \
  -H "Cookie: session=..."

# Calculate commission
curl -X POST "http://localhost:3001/api/stripe/calculate-commission" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
```

## Future Enhancements

1. **Dynamic Commission Rates**: Allow different rates per vendor/category
2. **Split Payments**: Handle orders with multiple vendors
3. **Payout Scheduling**: Allow vendors to set payout schedules
4. **Advanced Analytics**: Detailed commission and payout reporting
5. **Mobile Support**: Optimize onboarding for mobile devices

## Support

For technical support or questions about this implementation:
- Check Stripe documentation for Connect Standard
- Review webhook event logs
- Verify environment variable configuration
- Test with Stripe test mode first 