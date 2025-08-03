# Vendor Onboarding Check Implementation

## Overview
This document describes the implementation of the vendor onboarding check in the vendor dashboard. When a vendor accesses their dashboard, the system automatically checks if they have completed their Stripe Connect onboarding. If not, they are presented with an `OnboardingPrompt` component that guides them through the setup process.

## Architecture

### Frontend Structure
```
client/src/
├── components/
│   └── OnboardingPrompt.tsx              # Onboarding prompt component
└── pages/
    └── VendorDashboardPage.tsx           # Vendor dashboard with check
```

### Backend Dependencies
```
server/src/
├── routes/
│   └── vendor.ts                         # Vendor profile endpoint
└── controllers/
    └── stripe.ts                         # Stripe onboarding controller
```

## Key Features

### 1. Automatic Onboarding Check
- **Dashboard Load Check**: Automatically checks vendor's Stripe account status on dashboard load
- **Conditional Rendering**: Shows onboarding prompt or normal dashboard based on `stripeAccountId`
- **Real-time Status**: Fetches current vendor profile data on each dashboard visit

### 2. OnboardingPrompt Component
- **Comprehensive Information**: Explains benefits, commission structure, and setup process
- **Visual Design**: Modern, user-friendly interface with clear call-to-action
- **Guided Flow**: Direct link to onboarding page with step-by-step instructions

### 3. Commission Transparency
- **Clear Fee Structure**: Displays 2% platform fee and 98% vendor payout
- **Setup Timeline**: Shows expected payout time (24 hours)
- **Benefits Overview**: Highlights automated payments, security, and compliance

## Implementation Details

### VendorDashboardPage.tsx Changes

#### 1. Import OnboardingPrompt Component
```typescript
import OnboardingPrompt from '../components/OnboardingPrompt';
```

#### 2. Add Vendor Profile Fetch
```typescript
const fetchVendorProfile = async () => {
  const response = await axios.get('/api/vendor/profile', {
    withCredentials: true
  });
  return response.data;
};
```

#### 3. React Query Hook
```typescript
const { data: vendorProfile, isLoading: vendorProfileLoading } = useQuery({
  queryKey: ['vendor-profile'],
  queryFn: fetchVendorProfile,
  retry: 1,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

#### 4. Onboarding Check Logic
```typescript
// Check if vendor has completed Stripe onboarding
if (!vendorProfileLoading && vendorProfile && !vendorProfile.stripeAccountId) {
  return <OnboardingPrompt />;
}
```

### OnboardingPrompt.tsx Component

#### 1. Component Structure
- **Header Section**: Title, description, and credit card icon
- **Benefits Grid**: 4 key benefits with icons and descriptions
- **Commission Info**: Visual breakdown of fee structure
- **Setup Steps**: 3-step process explanation
- **Action Buttons**: Primary CTA and secondary options
- **Footer**: Important notice about requirement

#### 2. Key Features
- **Responsive Design**: Works on desktop and mobile
- **Accessibility**: Proper ARIA labels and semantic HTML
- **Visual Hierarchy**: Clear information architecture
- **Call-to-Action**: Prominent button to start onboarding

#### 3. Navigation
- **Primary Action**: Links to `/vendor/onboarding` page
- **Secondary Action**: "Learn More" button for additional information
- **Visual Cues**: Arrow icons and hover states for better UX

## Database Integration

### VendorProfile Model
The check relies on the `stripeAccountId` field in the `VendorProfile` model:

```prisma
model VendorProfile {
  id                    String   @id @default(cuid())
  userId                String   @unique
  storeName             String
  bio                   String?
  imageUrl              String?
  slug                  String   @unique
  stripeAccountId       String?  // Key field for onboarding check
  stripeAccountStatus   String?
  stripeOnboardingUrl   String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### API Endpoint
The `/api/vendor/profile` endpoint returns the full vendor profile including Stripe fields:

```typescript
router.get('/profile', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: req.session.userId },
  });
  res.json(vendor);
});
```

## User Flow

### 1. Vendor Dashboard Access
1. Vendor navigates to `/dashboard/vendor`
2. System fetches vendor profile data
3. Checks for `stripeAccountId` field

### 2. Conditional Rendering
- **If `stripeAccountId` exists**: Shows normal dashboard
- **If `stripeAccountId` is null/undefined**: Shows OnboardingPrompt

### 3. Onboarding Process
1. Vendor clicks "Start Stripe Setup" button
2. Redirected to `/vendor/onboarding` page
3. Completes Stripe Connect onboarding
4. Returns to dashboard (now shows normal view)

## Security Features

### 1. Authentication Required
- All vendor profile requests require authentication
- Role-based access control (VENDOR role only)
- Session-based authentication with cookies

### 2. Data Protection
- Vendor profile data is user-specific
- No cross-user data access
- Secure API endpoints with proper error handling

### 3. Error Handling
- Graceful handling of missing vendor profiles
- Clear error messages for debugging
- Fallback states for loading and error conditions

## Testing

### Test Script: `test-vendor-onboarding-check.ps1`
The test script verifies:
- Health check and authentication
- Vendor profile fetch with Stripe account check
- Onboarding status verification
- Commission information display
- Frontend dashboard access control

### Manual Testing Steps
1. **Test with vendor without Stripe account**:
   - Login as vendor without `stripeAccountId`
   - Navigate to dashboard
   - Verify OnboardingPrompt displays

2. **Test with vendor with Stripe account**:
   - Login as vendor with `stripeAccountId`
   - Navigate to dashboard
   - Verify normal dashboard displays

3. **Test onboarding flow**:
   - Click "Start Stripe Setup" from OnboardingPrompt
   - Verify redirect to `/vendor/onboarding`
   - Complete onboarding process
   - Verify dashboard now shows normal view

## Error Handling

### 1. Loading States
- Shows loading spinner while fetching vendor profile
- Prevents premature rendering of either component

### 2. Error States
- Handles API errors gracefully
- Shows appropriate error messages
- Provides fallback behavior

### 3. Edge Cases
- Handles missing vendor profile
- Manages network connectivity issues
- Provides retry mechanisms

## Performance Considerations

### 1. Caching Strategy
- Vendor profile cached for 5 minutes
- Reduces unnecessary API calls
- Improves dashboard load performance

### 2. Conditional Loading
- Only loads dashboard data if onboarding is complete
- Prevents unnecessary API calls for incomplete vendors
- Optimizes resource usage

### 3. React Query Benefits
- Automatic background refetching
- Optimistic updates
- Error retry logic

## Environment Variables

No additional environment variables are required for this feature. It uses existing Stripe configuration and database connections.

## Deployment Checklist

### 1. Frontend Deployment
- [ ] Deploy updated `VendorDashboardPage.tsx`
- [ ] Deploy new `OnboardingPrompt.tsx` component
- [ ] Verify component imports and routing

### 2. Backend Verification
- [ ] Ensure `/api/vendor/profile` endpoint is working
- [ ] Verify database schema includes `stripeAccountId` field
- [ ] Test authentication and authorization

### 3. Testing
- [ ] Run `test-vendor-onboarding-check.ps1`
- [ ] Test with vendors in different onboarding states
- [ ] Verify frontend behavior matches expected flow

## Troubleshooting

### Common Issues

#### 1. OnboardingPrompt Not Showing
- **Cause**: Vendor already has `stripeAccountId`
- **Solution**: Check vendor profile in database
- **Debug**: Use test script to verify profile data

#### 2. Dashboard Not Loading
- **Cause**: API endpoint issues or authentication problems
- **Solution**: Check server logs and authentication
- **Debug**: Verify API endpoints with test script

#### 3. Component Import Errors
- **Cause**: Missing or incorrect import paths
- **Solution**: Check file structure and import statements
- **Debug**: Verify component file exists and exports correctly

### Debug Commands
```bash
# Test vendor profile endpoint
curl -X GET http://localhost:3001/api/vendor/profile \
  -H "Cookie: session=your-session-cookie"

# Check database for vendor profile
npx prisma studio

# Run test script
./test-vendor-onboarding-check.ps1
```

## Future Enhancements

### 1. Progressive Onboarding
- Multi-step onboarding process
- Progress indicators
- Save partial progress

### 2. Enhanced Analytics
- Track onboarding completion rates
- Monitor time to complete onboarding
- Identify drop-off points

### 3. Improved UX
- Inline onboarding forms
- Real-time validation
- Better mobile experience

### 4. Advanced Features
- Bulk onboarding for multiple vendors
- Custom onboarding flows
- Integration with other payment providers

## Related Documentation

- [VENDOR_ONBOARDING_IMPLEMENTATION.md](./VENDOR_ONBOARDING_IMPLEMENTATION.md)
- [STRIPE_CONNECT_IMPLEMENTATION.md](./STRIPE_CONNECT_IMPLEMENTATION.md)
- [CHECKOUT_SESSION_IMPLEMENTATION.md](./CHECKOUT_SESSION_IMPLEMENTATION.md)
- [WEBHOOK_IMPLEMENTATION.md](./WEBHOOK_IMPLEMENTATION.md)
- [VENDOR_PAYOUT_HISTORY_IMPLEMENTATION.md](./VENDOR_PAYOUT_HISTORY_IMPLEMENTATION.md)

## Conclusion

The vendor onboarding check implementation provides a seamless user experience by automatically detecting when vendors need to complete their Stripe Connect setup. The `OnboardingPrompt` component guides vendors through the process with clear information about benefits, fees, and setup steps. This ensures all vendors can receive payments and contributes to the overall success of the platform. 