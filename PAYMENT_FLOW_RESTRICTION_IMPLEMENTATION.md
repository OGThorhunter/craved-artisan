# Payment Flow Restriction Implementation

## Overview
This document describes the implementation of payment flow restrictions that ensure only vendors with completed Stripe Connect onboarding can participate in payment processing. This is a critical security and business logic requirement that prevents payment processing for vendors who haven't completed their Stripe setup.

## Architecture

### Backend Structure
```
server/src/
├── routes/
│   ├── orders.ts                    # Order creation with vendor validation
│   ├── stripe.ts                    # Payment intent creation with validation
│   └── checkout.ts                  # Checkout session with validation
└── controllers/
    └── checkout.ts                  # Checkout controller with validation
```

### Validation Points
1. **Order Creation** (`/api/orders/checkout`) - Prevents order creation for non-Stripe vendors
2. **Payment Intent Creation** (`/api/stripe/create-payment-intent`) - Blocks payment processing
3. **Checkout Session Creation** (`/api/checkout/create-session`) - Prevents checkout for non-Stripe vendors

## Key Features

### 1. Early Validation
- **Order Creation Block**: Prevents orders from being created if vendors aren't Stripe-connected
- **Clear Error Messages**: Provides specific information about which vendors need to complete onboarding
- **Vendor Details**: Returns vendor information to help identify the issue

### 2. Comprehensive Coverage
- **All Payment Endpoints**: Every payment-related endpoint validates vendor Stripe connection
- **Multi-Vendor Support**: Handles orders with multiple vendors correctly
- **Consistent Validation**: Same validation logic across all payment flows

### 3. Security & Business Logic
- **Prevents Payment Processing**: Ensures no payments can be processed for non-Stripe vendors
- **Data Integrity**: Maintains consistent state between vendor profiles and payment capabilities
- **Audit Trail**: Clear error messages for debugging and monitoring

## Implementation Details

### 1. Order Creation Validation (`/api/orders/checkout`)

#### Validation Logic
```typescript
// Verify all vendors are connected to Stripe before allowing order creation
const productsWithVendors = await prisma.product.findMany({
  where: {
    id: { in: productIds }
  },
  include: {
    vendorProfile: true
  }
});

const vendorsNotConnected = productsWithVendors.filter(product => 
  !product.vendorProfile.stripeAccountId
);

if (vendorsNotConnected.length > 0) {
  return res.status(400).json({
    error: 'Vendors not connected',
    message: 'Some vendors are not connected to Stripe. Please contact support.',
    vendors: vendorsNotConnected.map(product => ({
      productId: product.id,
      productName: product.name,
      vendorId: product.vendorProfile.id,
      vendorName: product.vendorProfile.storeName,
    }))
  });
}
```

#### Key Features
- **Early Block**: Prevents order creation at the source
- **Detailed Information**: Returns specific vendor and product details
- **Multi-Vendor Support**: Handles orders with multiple vendors
- **Clear Error Message**: Explains the issue and suggests next steps

### 2. Payment Intent Validation (`/api/stripe/create-payment-intent`)

#### Validation Logic
```typescript
// Verify all vendors are connected to Stripe
const vendorsNotConnected = order.orderItems.filter(item => 
  !item.product.vendorProfile.stripeAccountId
);

if (vendorsNotConnected.length > 0) {
  return res.status(400).json({
    error: 'Vendors not connected',
    message: 'Some vendors are not connected to Stripe. Please contact support.',
    vendors: vendorsNotConnected.map(item => ({
      productId: item.product.id,
      vendorId: item.product.vendorProfile.id,
      vendorName: item.product.vendorProfile.storeName,
    }))
  });
}
```

#### Key Features
- **Order-Based Validation**: Validates based on existing order data
- **Consistent Error Format**: Same error structure across endpoints
- **Vendor Information**: Provides details about disconnected vendors

### 3. Checkout Session Validation (`/api/checkout/create-session`)

#### Validation Logic
```typescript
// Verify all vendors are connected to Stripe
const vendorsNotConnected = order.orderItems.filter(item => 
  !item.product.vendorProfile.stripeAccountId
);

if (vendorsNotConnected.length > 0) {
  return res.status(400).json({
    error: 'Vendors not connected',
    message: 'Some vendors are not connected to Stripe. Please contact support.',
    vendors: vendorsNotConnected.map(item => ({
      productId: item.product.id,
      vendorId: item.product.vendorProfile.id,
      vendorName: item.product.vendorProfile.storeName,
    }))
  });
}
```

#### Key Features
- **Pre-Payment Validation**: Ensures vendors are ready before payment processing
- **Transfer Preparation**: Validates vendors can receive transfers
- **Commission Calculation**: Ensures proper fee structure can be applied

## Database Integration

### VendorProfile Model
The validation relies on the `stripeAccountId` field in the `VendorProfile` model:

```prisma
model VendorProfile {
  id                    String   @id @default(cuid())
  userId                String   @unique
  storeName             String
  bio                   String?
  imageUrl              String?
  slug                  String   @unique
  stripeAccountId       String?  // Key field for payment validation
  stripeAccountStatus   String?
  stripeOnboardingUrl   String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### Validation Query
```typescript
// Fetch products with vendor profiles for validation
const productsWithVendors = await prisma.product.findMany({
  where: {
    id: { in: productIds }
  },
  include: {
    vendorProfile: true
  }
});

// Check for vendors without Stripe accounts
const vendorsNotConnected = productsWithVendors.filter(product => 
  !product.vendorProfile.stripeAccountId
);
```

## Error Handling

### 1. Standard Error Response
All validation failures return a consistent error format:

```typescript
{
  error: 'Vendors not connected',
  message: 'Some vendors are not connected to Stripe. Please contact support.',
  vendors: [
    {
      productId: 'prod_123',
      productName: 'Test Product',
      vendorId: 'vendor_456',
      vendorName: 'Test Vendor Store'
    }
  ]
}
```

### 2. HTTP Status Codes
- **400 Bad Request**: Vendor not connected to Stripe
- **403 Forbidden**: Unauthorized access to order
- **404 Not Found**: Order or product not found

### 3. Error Categories
- **Validation Errors**: Missing or invalid data
- **Authorization Errors**: User not authorized for action
- **Business Logic Errors**: Vendor not ready for payments

## User Flow

### 1. Normal Flow (Vendor Connected)
1. Customer creates order with products from Stripe-connected vendors
2. Order creation succeeds
3. Payment intent creation succeeds
4. Checkout session creation succeeds
5. Payment processing proceeds normally

### 2. Blocked Flow (Vendor Not Connected)
1. Customer attempts to create order with products from non-Stripe vendors
2. Order creation fails with "Vendors not connected" error
3. Customer sees clear error message with vendor details
4. Customer must wait for vendor to complete Stripe onboarding

### 3. Mixed Flow (Some Vendors Connected)
1. Customer creates order with products from both connected and disconnected vendors
2. Order creation fails with specific details about disconnected vendors
3. Customer can modify order to only include connected vendors

## Security Features

### 1. Multi-Layer Validation
- **Order Creation**: First line of defense
- **Payment Intent**: Secondary validation
- **Checkout Session**: Final validation before payment

### 2. Data Integrity
- **Consistent State**: Ensures vendor profiles match payment capabilities
- **No Bypass**: All payment flows go through validation
- **Audit Trail**: Clear error messages for monitoring

### 3. Authorization
- **User-Specific**: Users can only access their own orders
- **Role-Based**: Different validation for customers vs vendors
- **Session-Based**: Secure authentication required

## Testing

### Test Script: `test-payment-flow-restriction.ps1`
The test script verifies:
- Order creation restriction for non-Stripe vendors
- Payment intent creation restriction
- Checkout session creation restriction
- Vendor profile Stripe account validation
- Error handling for disconnected vendors

### Manual Testing Steps
1. **Test with non-Stripe vendor**:
   - Create product with vendor without `stripeAccountId`
   - Attempt to create order
   - Verify order creation is blocked

2. **Test with Stripe-connected vendor**:
   - Complete vendor Stripe onboarding
   - Create product with connected vendor
   - Verify order creation succeeds

3. **Test mixed vendor scenario**:
   - Create order with products from both connected and disconnected vendors
   - Verify order creation fails with specific vendor details

## Performance Considerations

### 1. Efficient Queries
- **Single Query**: Fetch products with vendor profiles in one query
- **Indexed Fields**: `stripeAccountId` field is indexed for fast lookups
- **Minimal Data**: Only fetch necessary fields for validation

### 2. Caching Strategy
- **Vendor Profile Caching**: Cache vendor profiles to reduce database queries
- **Validation Results**: Cache validation results for repeated checks
- **Error Response Caching**: Cache common error responses

### 3. Database Optimization
- **Proper Indexes**: Index on `stripeAccountId` for fast filtering
- **Query Optimization**: Use efficient joins and filters
- **Connection Pooling**: Optimize database connections

## Monitoring & Analytics

### 1. Error Tracking
- **Validation Failures**: Track frequency of vendor connection validation failures
- **Vendor Onboarding**: Monitor vendor onboarding completion rates
- **Payment Blocking**: Track orders blocked due to vendor issues

### 2. Business Metrics
- **Vendor Readiness**: Percentage of vendors with completed Stripe onboarding
- **Order Success Rate**: Orders successfully created vs blocked
- **Customer Experience**: Impact on customer checkout flow

### 3. Alerting
- **High Failure Rate**: Alert when validation failures spike
- **Vendor Issues**: Alert when specific vendors have connection problems
- **System Health**: Monitor overall payment flow health

## Environment Variables

No additional environment variables are required for this feature. It uses existing database connections and Stripe configuration.

## Deployment Checklist

### 1. Backend Deployment
- [ ] Deploy updated `orders.ts` with vendor validation
- [ ] Verify `stripe.ts` routes have validation
- [ ] Confirm `checkout.ts` controller has validation
- [ ] Test all payment endpoints

### 2. Database Verification
- [ ] Ensure `stripeAccountId` field exists in `VendorProfile` table
- [ ] Verify indexes are in place for performance
- [ ] Test validation queries with sample data

### 3. Testing
- [ ] Run `test-payment-flow-restriction.ps1`
- [ ] Test with vendors in different Stripe states
- [ ] Verify error messages are clear and helpful
- [ ] Test multi-vendor scenarios

## Troubleshooting

### Common Issues

#### 1. Validation Not Working
- **Cause**: Missing `stripeAccountId` field in database
- **Solution**: Check database schema and run migrations
- **Debug**: Verify vendor profile data structure

#### 2. Performance Issues
- **Cause**: Missing database indexes
- **Solution**: Add indexes on `stripeAccountId` field
- **Debug**: Check query execution plans

#### 3. Inconsistent Errors
- **Cause**: Different validation logic across endpoints
- **Solution**: Standardize validation functions
- **Debug**: Compare error responses across endpoints

### Debug Commands
```bash
# Test vendor profile endpoint
curl -X GET http://localhost:3001/api/vendor/profile \
  -H "Cookie: session=your-session-cookie"

# Test order creation with validation
curl -X POST http://localhost:3001/api/orders/checkout \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your-session-cookie" \
  -d '{"items":[...]}'

# Run test script
./test-payment-flow-restriction.ps1
```

## Future Enhancements

### 1. Advanced Validation
- **Account Status Check**: Validate `stripeAccountStatus` is 'active'
- **Requirements Check**: Ensure all Stripe requirements are met
- **Balance Check**: Verify vendor can receive transfers

### 2. Improved UX
- **Progressive Validation**: Show validation status during checkout
- **Vendor Notifications**: Notify vendors about connection requirements
- **Alternative Flows**: Provide options when vendors aren't connected

### 3. Enhanced Monitoring
- **Real-time Alerts**: Immediate notification of validation failures
- **Vendor Dashboard**: Show connection status in vendor dashboard
- **Analytics Dashboard**: Track validation metrics over time

## Related Documentation

- [VENDOR_ONBOARDING_CHECK_IMPLEMENTATION.md](./VENDOR_ONBOARDING_CHECK_IMPLEMENTATION.md)
- [STRIPE_CONNECT_IMPLEMENTATION.md](./STRIPE_CONNECT_IMPLEMENTATION.md)
- [CHECKOUT_SESSION_IMPLEMENTATION.md](./CHECKOUT_SESSION_IMPLEMENTATION.md)
- [WEBHOOK_IMPLEMENTATION.md](./WEBHOOK_IMPLEMENTATION.md)
- [VENDOR_PAYOUT_HISTORY_IMPLEMENTATION.md](./VENDOR_PAYOUT_HISTORY_IMPLEMENTATION.md)

## Conclusion

The payment flow restriction implementation provides a robust, secure, and user-friendly way to ensure only Stripe-connected vendors can participate in payment processing. The multi-layer validation approach prevents payment processing at multiple points, ensuring data integrity and providing clear feedback to users. This implementation is essential for maintaining the platform's payment security and ensuring all vendors are properly onboarded before receiving payments. 