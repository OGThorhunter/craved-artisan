# Vendor Payout History Implementation

## Overview
This document describes the complete vendor payout history implementation for Craved Artisan, allowing vendors to view their Stripe payout history both through direct links to their Stripe dashboard and by fetching payout data via the Stripe API.

## Architecture

### Backend Structure
```
server/src/
├── controllers/
│   └── vendor-payouts.ts              # Vendor payout controller
├── routes/
│   └── vendor-payouts.ts              # Vendor payout routes
└── index.ts                           # Main server file
```

### Frontend Structure
```
client/src/
├── components/
│   └── VendorPayoutHistory.tsx        # Payout history component
└── pages/
    └── VendorDashboardPage.tsx        # Vendor dashboard
```

## Key Features

### 1. Direct Stripe Dashboard Access
- **Dashboard Links**: Direct links to vendor's Stripe Connect dashboard
- **Section Navigation**: Quick access to payouts, transactions, settings
- **Account Management**: Easy access to account settings and documents

### 2. API-Based Payout Data
- **Payout History**: Fetch and display payout history from Stripe
- **Payout Summary**: Statistics and summary information
- **Account Status**: Real-time account verification status
- **Balance Information**: Available and pending balances

### 3. Comprehensive Payout Information
- **Payout Details**: Amount, status, method, dates
- **Status Tracking**: Paid, pending, failed, canceled statuses
- **Failure Information**: Error codes and messages for failed payouts
- **Metadata Support**: Additional payout metadata

## API Endpoints

### Vendor Payout Routes (`/api/vendor-payouts`)

#### Payout Data
- `GET /history/:vendorId` - Get vendor payout history
- `GET /summary/:vendorId` - Get vendor payout summary and statistics

#### Dashboard Access
- `GET /dashboard/:vendorId` - Get Stripe dashboard URLs
- `GET /status/:vendorId` - Get vendor account status

## Implementation Details

### Your Exact Implementation

#### Direct Dashboard Link
```tsx
<a href="https://dashboard.stripe.com/connect/accounts/{{vendor.stripeAccountId}}">
  View Payouts
</a>
```

#### API-Based Payout Fetching
```typescript
const payouts = await stripe.payouts.list({ 
  stripeAccount: vendor.stripeAccountId 
});
```

### Enhanced Implementation

#### Payout History Controller
```typescript
export const getVendorPayoutHistory = async (req: any, res: any) => {
  // Verify vendor exists and user has access
  // Check if vendor has Stripe account
  // Fetch payouts from Stripe
  // Format and return payout data
};
```

#### Payout Summary Controller
```typescript
export const getVendorPayoutSummary = async (req: any, res: any) => {
  // Get recent payouts for summary
  // Calculate summary statistics
  // Get account balance
  // Return comprehensive summary
};
```

## Database Integration

### Vendor Profile Model
```prisma
model VendorProfile {
  // ... existing fields
  stripeAccountId String? // Stripe Connect account ID
  stripeAccountStatus String? // Account status
  lastPayoutAt DateTime? // Last payout timestamp
}
```

### Order Model Integration
```prisma
model Order {
  // ... existing fields
  stripeTransferId String? // Stripe Transfer ID(s)
  commissionAmount Decimal @default(0) // 2% commission
  vendorPayoutAmount Decimal @default(0) // Vendor payout amount
}
```

## Frontend Components

### VendorPayoutHistory Component

#### Key Features
- **Summary Cards**: Available balance, pending balance, success rate, total payouts
- **Payout Statistics**: Detailed breakdown of payout statuses
- **Payout Table**: Comprehensive payout history with filtering
- **Quick Actions**: Direct links to Stripe dashboard sections
- **Real-time Updates**: Refresh functionality for latest data

#### Usage Example
```typescript
<VendorPayoutHistory vendorId={vendorId} />
```

#### Dashboard Integration
```typescript
// In vendor dashboard
import VendorPayoutHistory from '../components/VendorPayoutHistory';

// Usage
<VendorPayoutHistory vendorId={currentVendor.id} />
```

## Stripe Dashboard URLs

### Main Dashboard
```
https://dashboard.stripe.com/connect/accounts/{stripeAccountId}
```

### Specific Sections
- **Payouts**: `{dashboardUrl}/payouts`
- **Transactions**: `{dashboardUrl}/transactions`
- **Settings**: `{dashboardUrl}/settings`
- **Documents**: `{dashboardUrl}/documents`

## Security Features

### Authorization & Access Control
- **Vendor Ownership**: Vendors can only view their own payout data
- **Admin Access**: Admins can view any vendor's payout data
- **Role-based Access**: VENDOR and ADMIN roles required
- **Session Validation**: Ensures authenticated access

### Data Validation
- **Vendor Verification**: Validates vendor exists in database
- **Stripe Account Check**: Ensures vendor has connected Stripe account
- **Input Validation**: Validates query parameters and vendor IDs
- **Error Handling**: Comprehensive error responses

## Payout Data Structure

### Payout Object
```typescript
interface Payout {
  id: string;
  amount: number; // Amount in cents
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'canceled';
  type: string;
  method: string;
  arrival_date: number; // Unix timestamp
  created: number; // Unix timestamp
  description: string;
  failure_code?: string;
  failure_message?: string;
  metadata: any;
}
```

### Payout Summary
```typescript
interface PayoutSummary {
  totalPayouts: number;
  successfulPayouts: number;
  pendingPayouts: number;
  failedPayouts: number;
  successRate: number; // Percentage
  totalAmount: number; // Total successful payouts
  pendingAmount: number; // Total pending payouts
  availableBalance: number; // Current available balance
  pendingBalance: number; // Current pending balance
}
```

## Error Handling

### Common Error Scenarios
1. **Vendor Not Found**: Vendor ID doesn't exist in database
2. **Stripe Account Not Connected**: Vendor hasn't connected Stripe account
3. **Unauthorized Access**: User trying to access another vendor's data
4. **Stripe API Errors**: Network or API issues with Stripe
5. **Invalid Parameters**: Malformed vendor ID or query parameters

### Error Responses
```json
{
  "error": "Stripe account not connected",
  "message": "Vendor has not connected their Stripe account"
}
```

## Pagination Support

### Query Parameters
- `limit`: Number of payouts to return (default: 10)
- `starting_after`: Cursor for pagination
- `ending_before`: Cursor for reverse pagination

### Pagination Response
```json
{
  "payouts": [...],
  "hasMore": true,
  "totalCount": 25
}
```

## Testing

### Test Scripts
1. **`test-vendor-payouts.ps1`** - Comprehensive payout testing

### Test Coverage
- ✅ Payout history retrieval
- ✅ Payout summary calculation
- ✅ Dashboard URL generation
- ✅ Account status verification
- ✅ Pagination functionality
- ✅ Authorization enforcement
- ✅ Error handling
- ✅ URL format validation

### Test Scenarios
1. **Valid Vendor**: Vendor with connected Stripe account
2. **No Stripe Account**: Vendor without Stripe connection
3. **Unauthorized Access**: User accessing different vendor's data
4. **Non-existent Vendor**: Invalid vendor ID
5. **Pagination**: Large payout history with pagination
6. **API Errors**: Stripe API failures and network issues

## Environment Variables

### Required Variables
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## Usage Examples

### Fetching Payout History
```typescript
const response = await axios.get(`/api/vendor-payouts/history/${vendorId}?limit=25`);
const payouts = response.data.payouts;
```

### Getting Payout Summary
```typescript
const response = await axios.get(`/api/vendor-payouts/summary/${vendorId}`);
const summary = response.data.summary;
console.log(`Success Rate: ${summary.successRate}%`);
```

### Accessing Stripe Dashboard
```typescript
const response = await axios.get(`/api/vendor-payouts/dashboard/${vendorId}`);
const dashboardUrl = response.data.dashboardUrl;
window.open(dashboardUrl, '_blank');
```

## Integration with Existing Features

### Webhook Integration
- **Payout Status Updates**: Webhooks update payout status in real-time
- **Balance Updates**: Automatic balance refresh on payout events
- **Notification Triggers**: Payout completion notifications

### Vendor Dashboard Integration
- **Payout Widget**: Embed payout history in vendor dashboard
- **Quick Actions**: Direct links to Stripe dashboard sections
- **Status Indicators**: Real-time payout status display

### Order Management Integration
- **Transfer Tracking**: Link orders to specific payouts
- **Commission Display**: Show commission calculations
- **Payout History**: Order-specific payout information

## Monitoring & Analytics

### Key Metrics
- Payout success rate
- Average payout amount
- Payout frequency
- Failed payout rate
- Balance utilization

### Logging
```typescript
console.log(`Fetching payout history for vendor: ${vendorId}`);
console.log(`Retrieved ${payouts.length} payouts`);
console.log(`Payout summary: ${summary.totalPayouts} total, ${summary.successRate}% success`);
```

## Deployment Checklist

### Pre-deployment
- [ ] Set up Stripe Connect accounts for vendors
- [ ] Configure Stripe API keys
- [ ] Test payout history endpoints
- [ ] Verify dashboard URL generation
- [ ] Test authorization and access control

### Production
- [ ] Switch to live Stripe keys
- [ ] Set up monitoring for payout endpoints
- [ ] Configure error alerting
- [ ] Test with real vendor accounts
- [ ] Verify payout data accuracy

## Troubleshooting

### Common Issues

#### 1. "Stripe account not connected"
- Ensure vendor has completed Stripe Connect onboarding
- Check vendor account status in database
- Verify `stripeAccountId` is set

#### 2. "Unauthorized access"
- Check user authentication
- Verify user role (VENDOR or ADMIN)
- Ensure user owns the vendor account

#### 3. "Payout data not loading"
- Check Stripe API key configuration
- Verify vendor has payout history
- Check network connectivity to Stripe

#### 4. "Dashboard URL not working"
- Verify Stripe account ID format
- Check if account is active in Stripe
- Ensure proper URL construction

### Debug Steps
1. Check vendor profile in database
2. Verify Stripe account status
3. Test Stripe API calls directly
4. Review server logs for errors
5. Validate user permissions

## Future Enhancements

### Planned Features
1. **Payout Notifications**: Real-time payout status alerts
2. **Payout Scheduling**: Automated payout scheduling
3. **Payout Analytics**: Advanced payout analytics and reporting
4. **Multi-currency Support**: Support for multiple currencies
5. **Payout Templates**: Customizable payout templates

### Integration Opportunities
1. **Accounting Software**: QuickBooks integration
2. **Tax Services**: Automated tax calculations
3. **Banking Integration**: Direct bank account integration
4. **Mobile App**: Mobile payout tracking
5. **API Webhooks**: Real-time payout webhooks

## Support & Documentation

### Stripe Documentation
- [Connect Payouts](https://stripe.com/docs/connect/payouts)
- [Payouts API](https://stripe.com/docs/api/payouts)
- [Connect Dashboard](https://stripe.com/docs/connect/dashboard)
- [Account Management](https://stripe.com/docs/connect/account-management)

### Internal Documentation
- `STRIPE_CONNECT_IMPLEMENTATION.md` - Stripe Connect setup
- `VENDOR_ONBOARDING_IMPLEMENTATION.md` - Vendor onboarding
- `WEBHOOK_IMPLEMENTATION.md` - Webhook handling

## Conclusion

The vendor payout history implementation provides vendors with comprehensive access to their payout information through both direct Stripe dashboard links and API-based data retrieval. The system ensures secure access, real-time data, and a user-friendly interface for managing payout information.

The implementation includes robust error handling, security measures, and testing capabilities to ensure reliable payout tracking and vendor satisfaction. 