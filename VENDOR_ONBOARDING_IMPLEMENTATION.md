# Vendor Onboarding Implementation

## Overview
This document describes the complete vendor onboarding implementation for Craved Artisan using Stripe Connect Standard. The implementation provides both a service-based approach and a controller-based approach for maximum flexibility.

## Architecture

### Backend Structure
```
server/src/
├── controllers/
│   └── stripe.ts                    # Controller-based approach
├── routes/
│   ├── stripe.ts                    # Service-based routes
│   └── stripe-controller.ts         # Controller-based routes
├── utils/
│   └── stripe.ts                    # Stripe service class
└── index.ts                         # Main server file
```

### Frontend Structure
```
client/src/
├── components/
│   ├── VendorStripeOnboarding.tsx           # Service-based component
│   └── VendorStripeOnboardingController.tsx # Controller-based component
└── pages/
    └── VendorOnboardingPage.tsx             # Onboarding page
```

## Implementation Approaches

### 1. Service-Based Approach (Original)
- **File**: `server/src/routes/stripe.ts`
- **Component**: `VendorStripeOnboarding.tsx`
- **Features**: Comprehensive Stripe integration with service layer

### 2. Controller-Based Approach (New)
- **File**: `server/src/controllers/stripe.ts`
- **Routes**: `server/src/routes/stripe-controller.ts`
- **Component**: `VendorStripeOnboardingController.tsx`
- **Features**: Streamlined controller pattern matching your preferred structure

## API Endpoints

### Controller-Based Endpoints (`/api/stripe-controller`)

#### Vendor Onboarding
- `POST /onboarding/create` - Create Stripe Connect account
- `GET /onboarding/status/:vendorProfileId` - Get onboarding status
- `POST /onboarding/refresh/:vendorProfileId` - Refresh onboarding link
- `POST /onboarding/complete/:vendorProfileId` - Complete onboarding

#### Commission Management
- `GET /commission/info` - Get commission information
- `POST /commission/calculate` - Calculate commission for amount

### Service-Based Endpoints (`/api/stripe`)
- `POST /create-connect-account` - Create Connect account
- `GET /onboarding-url/:vendorProfileId` - Get onboarding URL
- `GET /account-status/:vendorProfileId` - Get account status
- `POST /create-payment-intent` - Create payment intent
- `POST /webhook` - Handle Stripe webhooks

## Controller Implementation

### `createStripeOnboarding`
```typescript
export const createStripeOnboarding = async (req, res) => {
  // 1. Validate required fields
  // 2. Verify vendor profile ownership
  // 3. Create Stripe Connect Standard account
  // 4. Generate onboarding link
  // 5. Save account info to database
  // 6. Return onboarding URL
};
```

### Key Features
- **Stripe Connect Standard**: Uses Standard accounts for simplified onboarding
- **Automatic Commission**: 2% commission rate built-in
- **Security**: Validates vendor profile ownership
- **Error Handling**: Comprehensive error responses
- **Database Integration**: Updates vendor profile with Stripe data

## Frontend Components

### VendorStripeOnboardingController
- **Status Display**: Shows current onboarding status
- **Commission Info**: Displays commission structure
- **Action Buttons**: Create account, refresh link, complete onboarding
- **Real-time Updates**: Refreshes status automatically
- **Error Handling**: User-friendly error messages

### Key Features
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Shows loading indicators
- **Toast Notifications**: Success/error feedback
- **External Links**: Opens Stripe onboarding in new tab
- **Status Tracking**: Monitors account activation

## Database Schema

### VendorProfile Model
```prisma
model VendorProfile {
  // ... existing fields
  stripeAccountId String? // Stripe Connect account ID
  stripeAccountStatus String? // 'pending', 'active', 'restricted', 'disabled'
  stripeOnboardingUrl String? // URL for vendor onboarding
}
```

### Order Model
```prisma
model Order {
  // ... existing fields
  stripePaymentIntentId String? // Stripe Payment Intent ID
  stripeTransferId String? // Stripe Transfer ID for vendor payout
  commissionAmount Decimal @default(0) // 2% commission amount
  vendorPayoutAmount Decimal @default(0) // Amount sent to vendor (98%)
}
```

## Commission Structure

### Fixed 2% Commission
- **Platform Fee**: 2% of transaction amount
- **Vendor Payout**: 98% of transaction amount
- **Automatic Calculation**: Built into payment processing
- **Transparent**: Clearly displayed to vendors

### Example Calculation
```
Transaction Amount: $100.00
Commission (2%): $2.00
Vendor Payout: $98.00
```

## Security Features

### Authentication & Authorization
- **Session-based**: Uses Express sessions
- **Role-based**: VENDOR role required
- **Ownership Validation**: Vendors can only access their own profiles
- **CSRF Protection**: Built-in CSRF protection

### Data Validation
- **Input Validation**: Zod schemas for all endpoints
- **Type Safety**: TypeScript throughout
- **Error Handling**: Comprehensive error responses
- **Sanitization**: Input sanitization and validation

## Testing

### Test Scripts
1. **`test-vendor-onboarding.ps1`** - Tests controller-based endpoints
2. **`test-stripe-integration.ps1`** - Tests service-based endpoints

### Test Coverage
- ✅ Health check
- ✅ Commission calculations
- ✅ Authentication
- ✅ Vendor profile retrieval
- ✅ Onboarding status
- ✅ Account creation
- ✅ Link refresh
- ✅ Completion check

## Environment Variables

### Required Variables
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Client Configuration
CLIENT_URL=http://localhost:5174
```

## Deployment Checklist

### Pre-deployment
- [ ] Set up Stripe Connect Standard account
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Test with Stripe test keys

### Production
- [ ] Switch to live Stripe keys
- [ ] Set up webhook endpoints
- [ ] Configure SSL certificates
- [ ] Monitor webhook delivery

## Usage Examples

### Creating a Connect Account
```typescript
const response = await axios.post('/api/stripe-controller/onboarding/create', {
  vendorProfileId: 'vendor-id',
  email: 'vendor@example.com',
  businessName: 'My Business'
});
```

### Checking Status
```typescript
const status = await axios.get('/api/stripe-controller/onboarding/status/vendor-id');
```

### Calculating Commission
```typescript
const calculation = await axios.post('/api/stripe-controller/commission/calculate', {
  amount: 100.00
});
```

## Error Handling

### Common Errors
1. **Invalid API Key**: Check Stripe configuration
2. **Account Already Exists**: Prevent duplicate accounts
3. **Unauthorized Access**: Validate user permissions
4. **Missing Fields**: Validate required input

### Error Responses
```json
{
  "error": "Error type",
  "message": "User-friendly message",
  "details": "Additional error information"
}
```

## Monitoring & Analytics

### Key Metrics
- Onboarding completion rate
- Account activation time
- Commission calculations
- Payment processing success
- Webhook delivery status

### Logging
- Winston logger integration
- Error tracking
- Performance monitoring
- Audit trails

## Future Enhancements

### Planned Features
1. **Express Accounts**: Support for Express accounts
2. **Custom Commission Rates**: Variable commission rates
3. **Advanced Analytics**: Detailed vendor analytics
4. **Bulk Operations**: Batch onboarding support
5. **Webhook Dashboard**: Webhook monitoring UI

### Integration Opportunities
1. **Accounting Software**: QuickBooks integration
2. **Tax Services**: Automated tax calculations
3. **Compliance**: KYC/AML integration
4. **Reporting**: Advanced financial reporting

## Support & Troubleshooting

### Common Issues
1. **Onboarding Link Expired**: Use refresh endpoint
2. **Account Not Activated**: Check requirements
3. **Commission Not Applied**: Verify payment processing
4. **Webhook Failures**: Check endpoint configuration

### Debug Steps
1. Check environment variables
2. Verify Stripe account status
3. Review server logs
4. Test webhook endpoints
5. Validate database records

## Documentation References

### Stripe Documentation
- [Stripe Connect Standard](https://stripe.com/docs/connect/standard-accounts)
- [Account Links API](https://stripe.com/docs/api/account_links)
- [Webhook Events](https://stripe.com/docs/api/events)
- [Transfer API](https://stripe.com/docs/api/transfers)

### Internal Documentation
- `STRIPE_CONNECT_IMPLEMENTATION.md` - Complete Stripe integration
- `STRIPE_KEYS_SETUP.md` - Environment setup guide
- `DEPLOYMENT.md` - Deployment instructions

## Conclusion

The vendor onboarding implementation provides a robust, secure, and user-friendly way for vendors to connect with Stripe and start accepting payments. The dual approach (service-based and controller-based) ensures flexibility while maintaining all necessary functionality for a successful marketplace operation.

The implementation includes comprehensive error handling, security measures, and testing capabilities to ensure a smooth onboarding experience for vendors and reliable payment processing for the platform. 