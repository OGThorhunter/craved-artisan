# Webhook Implementation for Stripe Events

## Overview
This document describes the complete webhook implementation for Craved Artisan to handle Stripe events, including payment success, transfer completion, and vendor account updates. The webhook system ensures reliable processing of payment events and automatic order fulfillment.

## Architecture

### Backend Structure
```
server/src/
├── webhooks/
│   └── stripe.ts                    # Stripe webhook handler
├── routes/
│   └── webhooks.ts                  # Webhook routes
└── index.ts                         # Main server file
```

### Webhook Endpoint
- **URL**: `/api/webhooks/stripe`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Signature Verification**: Required

## Supported Events

### 1. Checkout Session Events
- **`checkout.session.completed`** - Payment completed successfully
- **`payment_intent.succeeded`** - Payment intent succeeded

### 2. Transfer Events
- **`transfer.created`** - Transfer created for vendor
- **`transfer.paid`** - Transfer paid to vendor

### 3. Account Events
- **`account.updated`** - Vendor account status updated

## Implementation Details

### Webhook Handler Structure

#### Main Handler
```typescript
export const handleStripeWebhook = async (req: express.Request, res: express.Response) => {
  // 1. Verify webhook signature
  // 2. Parse event
  // 3. Route to appropriate handler
  // 4. Return success response
};
```

#### Signature Verification
```typescript
const event = stripe.webhooks.constructEvent(
  req.body,
  sig as string,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

### Event Processing Flow

#### 1. Checkout Session Completed
```
Webhook Received → Extract Order Info → Update Order Status → 
Process Transfers → Send Notifications → Log Success
```

#### 2. Payment Intent Succeeded
```
Webhook Received → Find Order → Update Payment Status → 
Confirm Order → Log Success
```

#### 3. Transfer Events
```
Webhook Received → Extract Transfer Info → Update Order → 
Send Vendor Notifications → Log Success
```

## Key Features

### 1. Automatic Order Processing
- **Order Status Updates**: Automatically marks orders as 'paid'
- **Transfer Processing**: Handles vendor payouts
- **Commission Calculation**: Applies 2% commission automatically
- **Multi-vendor Support**: Processes orders with multiple vendors

### 2. Vendor Management
- **Account Status Tracking**: Monitors vendor account status
- **Transfer Notifications**: Notifies vendors of payouts
- **Order Notifications**: Alerts vendors of new orders

### 3. Customer Communication
- **Order Confirmations**: Sends confirmation emails
- **Payment Receipts**: Provides payment details
- **Status Updates**: Keeps customers informed

### 4. Security & Reliability
- **Signature Verification**: Ensures webhook authenticity
- **Error Handling**: Graceful error processing
- **Logging**: Comprehensive event logging
- **Idempotency**: Prevents duplicate processing

## Database Updates

### Order Status Flow
```sql
pending → paid → fulfilled → completed
```

### Order Model Updates
```prisma
model Order {
  // ... existing fields
  status String @default("pending")
  paidAt DateTime?
  stripePaymentIntentId String?
  stripeTransferId String?
  commissionAmount Decimal @default(0)
  vendorPayoutAmount Decimal @default(0)
}
```

### Vendor Profile Updates
```prisma
model VendorProfile {
  // ... existing fields
  stripeAccountStatus String?
  lastPayoutAt DateTime?
}
```

## Email Notifications

### Customer Notifications
- **Order Confirmation**: Order details and payment confirmation
- **Shipping Updates**: Order fulfillment status
- **Receipt**: Payment receipt with commission breakdown

### Vendor Notifications
- **New Order**: Order details and payout information
- **Payout Confirmation**: Transfer completion notification
- **Account Status**: Account activation/restriction alerts

### Email Templates
```typescript
// Order Confirmation Template
{
  to: customer.email,
  subject: `Order Confirmation - ${order.orderNumber}`,
  template: 'order-confirmation',
  data: {
    orderNumber: order.orderNumber,
    totalAmount: session.amount_total / 100,
    orderItems: order.orderItems,
    commissionAmount: commissionAmount / 100,
  },
}
```

## Error Handling

### Common Error Scenarios
1. **Invalid Signature**: Webhook signature verification fails
2. **Order Not Found**: Order ID not found in database
3. **Vendor Not Connected**: Vendor lacks Stripe account
4. **Transfer Failure**: Transfer creation fails
5. **Email Failure**: Notification email fails to send

### Error Responses
```json
{
  "error": "Webhook signature verification failed",
  "message": "Invalid signature provided"
}
```

### Retry Logic
- **Automatic Retries**: Failed webhooks are retried by Stripe
- **Manual Retry**: Admin can retry failed events
- **Dead Letter Queue**: Failed events are logged for manual review

## Security Features

### Webhook Security
- **Signature Verification**: Validates webhook authenticity
- **Event Type Validation**: Only processes known event types
- **Rate Limiting**: Prevents webhook abuse
- **IP Whitelisting**: Optional IP restriction

### Data Security
- **Input Validation**: Validates all webhook data
- **SQL Injection Prevention**: Uses parameterized queries
- **XSS Prevention**: Sanitizes all user data
- **CSRF Protection**: Built-in CSRF protection

## Monitoring & Logging

### Webhook Monitoring
- **Delivery Status**: Track webhook delivery success/failure
- **Processing Time**: Monitor webhook processing duration
- **Error Rates**: Track webhook error rates
- **Event Volume**: Monitor webhook event volume

### Logging
```typescript
console.log(`Received webhook event: ${event.type}`);
console.log(`Processing checkout session: ${session.id}`);
console.log(`Order ${orderId} marked as paid`);
console.log(`Transfer created for vendor ${vendorId}: ${transfer.id}`);
```

### Metrics
- Webhook delivery success rate
- Average processing time
- Error rate by event type
- Order completion rate
- Vendor payout success rate

## Testing

### Test Scripts
1. **`test-webhook-handling.ps1`** - Comprehensive webhook testing

### Test Coverage
- ✅ Webhook endpoint health check
- ✅ Event type handling
- ✅ Signature verification
- ✅ Order status updates
- ✅ Transfer processing
- ✅ Email notification preparation
- ✅ Error handling

### Test Scenarios
1. **Valid Webhook**: Proper signature and event data
2. **Invalid Signature**: Malformed or missing signature
3. **Unknown Event**: Unsupported event type
4. **Missing Data**: Incomplete event data
5. **Database Errors**: Database connection issues

## Environment Variables

### Required Variables
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (for notifications)
EMAIL_SERVICE_API_KEY=your_email_service_key
EMAIL_FROM_ADDRESS=noreply@cravedartisan.com
```

## Deployment Checklist

### Pre-deployment
- [ ] Set up Stripe webhook endpoint in dashboard
- [ ] Configure webhook secret in environment
- [ ] Test webhook endpoint with Stripe CLI
- [ ] Verify signature verification works
- [ ] Test all supported event types

### Production
- [ ] Switch to live Stripe keys
- [ ] Set up production webhook endpoint
- [ ] Configure monitoring and alerting
- [ ] Set up email service integration
- [ ] Test end-to-end payment flow

## Stripe Dashboard Configuration

### Webhook Endpoint Setup
1. **URL**: `https://yourdomain.com/api/webhooks/stripe`
2. **Events**: Select all supported events
3. **Version**: Use latest API version
4. **Status**: Enable webhook

### Supported Events List
- `checkout.session.completed`
- `payment_intent.succeeded`
- `transfer.created`
- `transfer.paid`
- `account.updated`

## Troubleshooting

### Common Issues

#### 1. "Webhook signature verification failed"
- Check webhook secret configuration
- Verify webhook endpoint URL
- Ensure raw body parsing is enabled

#### 2. "Order not found"
- Check order ID in webhook metadata
- Verify order exists in database
- Check webhook event data

#### 3. "Transfer creation failed"
- Verify vendor has active Stripe account
- Check vendor account status
- Ensure sufficient funds for transfer

#### 4. "Email sending failed"
- Check email service configuration
- Verify email templates exist
- Check email service API limits

### Debug Steps
1. Check webhook delivery in Stripe dashboard
2. Review server logs for errors
3. Verify environment variables
4. Test webhook endpoint manually
5. Check database connectivity

## Future Enhancements

### Planned Features
1. **Webhook Dashboard**: Real-time webhook monitoring UI
2. **Retry Management**: Manual webhook retry interface
3. **Event Filtering**: Selective event processing
4. **Advanced Analytics**: Detailed webhook analytics
5. **Webhook Testing**: Built-in webhook testing tools

### Integration Opportunities
1. **Slack Notifications**: Real-time webhook alerts
2. **SMS Notifications**: Text message alerts
3. **Webhook Analytics**: Advanced event analytics
4. **Automated Testing**: Automated webhook testing
5. **Performance Monitoring**: Webhook performance tracking

## Support & Documentation

### Stripe Documentation
- [Webhooks](https://stripe.com/docs/webhooks)
- [Event Types](https://stripe.com/docs/api/events)
- [Signature Verification](https://stripe.com/docs/webhooks/signatures)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)

### Internal Documentation
- `CHECKOUT_SESSION_IMPLEMENTATION.md` - Checkout session details
- `STRIPE_CONNECT_IMPLEMENTATION.md` - Stripe Connect setup
- `VENDOR_ONBOARDING_IMPLEMENTATION.md` - Vendor onboarding

## Conclusion

The webhook implementation provides a robust, secure, and reliable way to handle Stripe events and automate order processing. The system ensures accurate order fulfillment, vendor payouts, and customer communication while maintaining security and monitoring capabilities.

The implementation includes comprehensive error handling, security measures, and testing capabilities to ensure reliable webhook processing and accurate order management. 