# Checkout Session Implementation with 2% Application Fee

## Overview
This document describes the complete checkout session implementation for Craved Artisan using Stripe Checkout with automatic 2% application fees and vendor transfers. The implementation handles both single-vendor and multi-vendor orders seamlessly.

## Architecture

### Backend Structure
```
server/src/
├── controllers/
│   └── checkout.ts                    # Checkout session controller
├── routes/
│   └── checkout.ts                    # Checkout routes
└── index.ts                           # Main server file
```

### Frontend Structure
```
client/src/
├── components/
│   └── StripeCheckoutSession.tsx      # Checkout session component
└── pages/
    └── CheckoutPage.tsx               # Checkout page
```

## Key Features

### 1. Automatic 2% Application Fee
- **Fixed Commission Rate**: 2% of transaction amount
- **Automatic Calculation**: Built into checkout session creation
- **Transparent Pricing**: Clearly displayed to customers
- **Platform Revenue**: Automatic platform fee collection

### 2. Single vs Multi-Vendor Handling
- **Single Vendor Orders**: Direct transfer using `transfer_data`
- **Multi-Vendor Orders**: Manual transfer processing after payment
- **Automatic Detection**: Determines order type automatically
- **Optimized Transfers**: Minimizes Stripe fees

### 3. Stripe Checkout Integration
- **Hosted Checkout**: Uses Stripe's hosted checkout page
- **Secure Payments**: PCI compliant payment processing
- **Mobile Optimized**: Responsive checkout experience
- **Automatic Redirects**: Success/cancel URL handling

## API Endpoints

### Checkout Session Routes (`/api/checkout`)

#### Session Management
- `POST /create-session` - Create Stripe checkout session
- `GET /session/:sessionId` - Get checkout session status

#### Transfer Processing
- `POST /transfers/:orderId` - Process multi-vendor transfers

#### Commission Calculation
- `GET /commission/:orderId` - Get commission breakdown

## Implementation Details

### Checkout Session Creation

#### Single Vendor Order
```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: lineItems,
  mode: 'payment',
  customer_email: customerEmail,
  success_url: successUrl,
  cancel_url: cancelUrl,
  payment_intent_data: {
    application_fee_amount: Math.round(totalAmount * 0.02),
    transfer_data: {
      destination: vendor.stripeAccountId,
    },
  },
});
```

#### Multi-Vendor Order
```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: lineItems,
  mode: 'payment',
  customer_email: customerEmail,
  success_url: successUrl,
  cancel_url: cancelUrl,
  payment_intent_data: {
    application_fee_amount: Math.round(totalAmount * 0.02),
    metadata: {
      multiVendor: 'true',
    },
  },
});
```

### Commission Calculation

#### Fixed 2% Rate
```typescript
const COMMISSION_RATE = 0.02;
const applicationFeeAmount = Math.round(totalAmount * COMMISSION_RATE);
const vendorPayoutAmount = totalAmount - applicationFeeAmount;
```

#### Vendor Breakdown
```typescript
// Group order items by vendor
const vendorGroups = order.orderItems.reduce((groups, item) => {
  const vendorId = item.product.vendorProfile.id;
  if (!groups[vendorId]) {
    groups[vendorId] = {
      vendor: item.product.vendorProfile,
      items: [],
      totalAmount: 0,
    };
  }
  groups[vendorId].items.push(item);
  groups[vendorId].totalAmount += item.price * item.quantity;
  return groups;
}, {});
```

## Database Schema

### Order Model Updates
```prisma
model Order {
  // ... existing fields
  stripePaymentIntentId String? // Stripe Payment Intent ID
  stripeTransferId String? // Stripe Transfer ID(s) for vendor payout
  commissionAmount Decimal @default(0) // 2% commission amount
  vendorPayoutAmount Decimal @default(0) // Amount sent to vendor(s)
}
```

### Vendor Profile Model
```prisma
model VendorProfile {
  // ... existing fields
  stripeAccountId String? // Stripe Connect account ID
  stripeAccountStatus String? // Account status
}
```

## Frontend Components

### StripeCheckoutSession Component

#### Key Features
- **Commission Display**: Shows 2% fee breakdown
- **Vendor Breakdown**: Multi-vendor order details
- **Order Summary**: Complete order information
- **Checkout Button**: Creates Stripe session
- **Loading States**: User feedback during processing

#### Usage Example
```typescript
<StripeCheckoutSession orderId={orderId} />
```

#### Commission Breakdown Display
```typescript
// Shows commission structure
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>Total Amount: ${totalAmount}</div>
  <div>Platform Fee (2%): ${commissionAmount}</div>
  <div>Vendor Payout: ${vendorPayoutAmount}</div>
</div>
```

## Payment Flow

### 1. Single Vendor Order Flow
```
Customer → Create Order → Checkout Session → Stripe Payment → 
Automatic Transfer to Vendor → Success Page
```

### 2. Multi-Vendor Order Flow
```
Customer → Create Order → Checkout Session → Stripe Payment → 
Manual Transfer Processing → Multiple Vendor Transfers → Success Page
```

### 3. Commission Flow
```
Total Amount: $100.00
Platform Fee (2%): $2.00
Vendor Payout: $98.00
```

## Security Features

### Authentication & Authorization
- **Session-based**: Uses Express sessions
- **Role-based**: CUSTOMER role required for checkout
- **Ownership Validation**: Users can only checkout their own orders
- **Vendor Verification**: Ensures vendors are connected to Stripe

### Data Validation
- **Input Validation**: Comprehensive request validation
- **Amount Validation**: Ensures positive amounts
- **Currency Validation**: Supports USD by default
- **Email Validation**: Validates customer email

## Error Handling

### Common Scenarios
1. **Vendor Not Connected**: Prevents checkout if vendor lacks Stripe account
2. **Invalid Order**: Validates order ownership and existence
3. **Payment Failure**: Handles Stripe payment failures gracefully
4. **Transfer Failure**: Manages multi-vendor transfer errors

### Error Responses
```json
{
  "error": "Vendors not connected",
  "message": "Some vendors are not connected to Stripe",
  "vendors": [
    {
      "productId": "product-id",
      "vendorId": "vendor-id",
      "vendorName": "Vendor Name"
    }
  ]
}
```

## Testing

### Test Scripts
1. **`test-checkout-session.ps1`** - Comprehensive checkout testing

### Test Coverage
- ✅ Health check
- ✅ Authentication
- ✅ Order creation
- ✅ Commission calculation
- ✅ Checkout session creation
- ✅ Session status retrieval
- ✅ Multi-vendor transfers
- ✅ Commission rate validation

### Test Scenarios
1. **Single Vendor Order**: Direct transfer testing
2. **Multi-Vendor Order**: Manual transfer testing
3. **Commission Calculation**: 2% fee validation
4. **Error Handling**: Invalid scenarios testing

## Environment Variables

### Required Variables
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Client Configuration
CLIENT_URL=http://localhost:5174
```

## Usage Examples

### Creating a Checkout Session
```typescript
const response = await axios.post('/api/checkout/create-session', {
  orderId: 'order-id',
  customerEmail: 'customer@example.com',
  lineItems: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Product Name',
          description: 'Product Description'
        },
        unit_amount: 5000 // $50.00 in cents
      },
      quantity: 2
    }
  ],
  totalAmount: 10000, // $100.00 in cents
  currency: 'usd'
});
```

### Getting Commission Breakdown
```typescript
const breakdown = await axios.get('/api/checkout/commission/order-id');
console.log(`Commission: $${breakdown.data.commissionAmount / 100}`);
```

### Processing Multi-Vendor Transfers
```typescript
const transfers = await axios.post('/api/checkout/transfers/order-id');
console.log(`Processed ${transfers.data.totalTransfers} transfers`);
```

## Monitoring & Analytics

### Key Metrics
- Checkout session creation rate
- Payment success rate
- Commission collection
- Transfer processing time
- Multi-vendor order percentage

### Logging
- Checkout session creation logs
- Payment processing logs
- Transfer processing logs
- Error tracking and monitoring

## Deployment Checklist

### Pre-deployment
- [ ] Set up Stripe Connect accounts for vendors
- [ ] Configure environment variables
- [ ] Test with Stripe test keys
- [ ] Verify webhook endpoints

### Production
- [ ] Switch to live Stripe keys
- [ ] Set up production webhooks
- [ ] Monitor payment processing
- [ ] Test commission calculations

## Troubleshooting

### Common Issues

#### 1. "Vendors not connected" Error
- Ensure all vendors have completed Stripe Connect onboarding
- Check vendor account status in Stripe dashboard
- Verify `stripeAccountId` is set in database

#### 2. "Payment intent creation failed"
- Check Stripe API key configuration
- Verify account has sufficient funds
- Check Stripe account status

#### 3. "Transfer processing failed"
- Verify payment intent status is 'succeeded'
- Check vendor account is active
- Ensure sufficient funds for transfer

### Debug Steps
1. Check Stripe dashboard for payment status
2. Verify environment variables
3. Review server logs for errors
4. Test with Stripe test cards
5. Validate database records

## Future Enhancements

### Planned Features
1. **Dynamic Commission Rates**: Variable commission based on vendor tier
2. **Split Payments**: More granular payment splitting
3. **Recurring Payments**: Subscription support
4. **Advanced Analytics**: Detailed payment analytics
5. **Webhook Dashboard**: Real-time payment monitoring

### Integration Opportunities
1. **Accounting Software**: QuickBooks integration
2. **Tax Services**: Automated tax calculations
3. **Fraud Detection**: Advanced fraud prevention
4. **Reporting**: Comprehensive financial reporting

## Support & Documentation

### Stripe Documentation
- [Stripe Checkout](https://stripe.com/docs/checkout)
- [Application Fees](https://stripe.com/docs/connect/application-fees)
- [Transfers](https://stripe.com/docs/connect/transfers)
- [Webhooks](https://stripe.com/docs/webhooks)

### Internal Documentation
- `STRIPE_CONNECT_IMPLEMENTATION.md` - Vendor onboarding
- `VENDOR_ONBOARDING_IMPLEMENTATION.md` - Vendor setup
- `STRIPE_KEYS_SETUP.md` - Environment configuration

## Conclusion

The checkout session implementation provides a robust, secure, and user-friendly way for customers to complete purchases while automatically handling 2% platform fees and vendor transfers. The dual approach for single and multi-vendor orders ensures optimal performance and cost efficiency.

The implementation includes comprehensive error handling, security measures, and testing capabilities to ensure reliable payment processing and accurate commission calculations for the platform. 