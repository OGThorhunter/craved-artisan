# Vendor Tax Report Endpoint Implementation

## Overview
This document describes the implementation of the specific vendor tax report endpoint `/api/vendors/:vendorId/financials/tax-report` for Craved Artisan. This endpoint provides vendors with access to their payout data for tax reporting purposes.

## Endpoint Details

### Route Information
- **Path**: `/api/vendors/:vendorId/financials/tax-report`
- **Method**: `GET`
- **Authentication**: Required
- **Authorization**: Vendor owner or admin only
- **Middleware**: `requireAuth`, `isVendorOwnerOrAdmin`

### Request Parameters
- `vendorId` (path parameter): The ID of the vendor whose tax report is being requested

### Response Format
```json
{
  "vendorId": "string",
  "totalPaid": "number",
  "totalFees": "number", 
  "totalNet": "number",
  "payouts": [
    {
      "id": "string",
      "vendorId": "string",
      "amount": "number",
      "platformFee": "number",
      "date": "string (ISO date)",
      "method": "string",
      "referenceId": "string",
      "createdAt": "string (ISO date)"
    }
  ]
}
```

## Implementation Details

### Backend Structure
```
server/src/
├── routes/
│   └── vendor.ts                    # Vendor routes with tax report endpoint
└── middleware/
    └── isVendorOwnerOrAdmin.ts      # Authorization middleware
```

### Code Implementation
```typescript
// GET /api/vendors/:vendorId/financials/tax-report
router.get('/:vendorId/financials/tax-report', requireAuth, isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { vendorId } = req.params;

    const payouts = await prisma.payout.findMany({
      where: { vendorId },
      orderBy: { date: 'asc' }
    });

    const totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0);
    const totalFees = payouts.reduce((sum, p) => sum + p.platformFee, 0);

    res.json({
      vendorId,
      totalPaid,
      totalFees,
      totalNet: totalPaid - totalFees,
      payouts
    });
  } catch (error) {
    console.error('Error fetching tax report:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch tax report'
    });
  }
});
```

## Security Features

### Authentication
- Requires valid user session
- Uses `requireAuth` middleware

### Authorization
- Uses `isVendorOwnerOrAdmin` middleware
- Only allows vendor owners or admins to access the data
- Validates vendor existence before processing

### Access Control Logic
```typescript
// Allow access if user is ADMIN or the vendor owner
if (user.role === "ADMIN" || user.id === vendor.userId) {
  return next();
}
```

## Database Integration

### Payout Model
The endpoint relies on the `Payout` model in the Prisma schema:
```prisma
model Payout {
  id           String   @id @default(cuid())
  vendorId     String
  amount       Float
  platformFee  Float
  date         DateTime
  method       String // 'stripe' | 'paypal'
  referenceId  String
  createdAt    DateTime @default(now())

  // Relations
  vendor       VendorProfile @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@index([vendorId, date])
  @@map("payouts")
}
```

### Query Details
- Fetches all payouts for the specified vendor
- Orders by date in ascending order
- Calculates totals using JavaScript reduce functions

## Error Handling

### Error Scenarios
1. **Vendor Not Found (404)**: When the specified vendorId doesn't exist
2. **Access Denied (403)**: When user is not the vendor owner or admin
3. **Unauthorized (401)**: When user is not authenticated
4. **Internal Server Error (500)**: When database query fails

### Error Response Format
```json
{
  "error": "string",
  "message": "string"
}
```

## Testing

### Test Script
A comprehensive test script `test-vendor-tax-report-endpoint.ps1` is provided to verify:
- Endpoint functionality
- Authentication requirements
- Authorization controls
- Error handling
- Data accuracy

### Test Coverage
- ✅ Health check verification
- ✅ Authentication testing
- ✅ Vendor profile validation
- ✅ Tax report data retrieval
- ✅ Unauthorized access prevention
- ✅ Non-existent vendor handling
- ✅ Unauthenticated access blocking

## Usage Examples

### cURL Example
```bash
curl -X GET \
  "http://localhost:3001/api/vendors/vendor-id-123/financials/tax-report" \
  -H "Cookie: session=your-session-cookie" \
  -H "Content-Type: application/json"
```

### JavaScript Example
```javascript
const response = await fetch('/api/vendors/vendor-id-123/financials/tax-report', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
});

const taxReport = await response.json();
console.log('Total Paid:', taxReport.totalPaid);
console.log('Total Fees:', taxReport.totalFees);
console.log('Net Amount:', taxReport.totalNet);
```

## Integration Points

### Frontend Integration
This endpoint can be integrated with:
- Vendor dashboard tax reporting section
- Tax document generation components
- Financial summary displays
- Export functionality for tax preparation

### Related Endpoints
- `/api/tax-reports/:vendorId/:year` - Comprehensive tax reports
- `/api/tax-reports/:vendorId/:year/1099k` - 1099-K form generation
- `/api/tax-reports/:vendorId/summary` - Tax summary data

## Performance Considerations

### Database Optimization
- Uses indexed query on `vendorId` and `date`
- Efficient aggregation using JavaScript reduce
- Minimal data transfer (only necessary fields)

### Caching Opportunities
- Consider caching for frequently accessed vendor data
- Implement cache invalidation on new payouts
- Use Redis for session management

## Monitoring and Logging

### Logging
- Error logging for failed queries
- Access logging for security monitoring
- Performance logging for optimization

### Metrics
- Response time monitoring
- Error rate tracking
- Access pattern analysis

## Environment Variables

### Required
- Database connection (via Prisma)
- Session configuration

### Optional
- Logging configuration
- Cache settings

## Deployment Checklist

### Pre-deployment
- [ ] Run database migration for Payout model
- [ ] Verify middleware imports
- [ ] Test endpoint with sample data
- [ ] Validate authorization logic

### Post-deployment
- [ ] Monitor error rates
- [ ] Verify access controls
- [ ] Test with real vendor data
- [ ] Document any issues

## Troubleshooting

### Common Issues

#### 404 Vendor Not Found
- Verify vendor ID exists in database
- Check vendor profile creation process
- Validate user-vendor relationship

#### 403 Access Denied
- Verify user role and ownership
- Check middleware configuration
- Validate session data

#### 500 Internal Server Error
- Check database connection
- Verify Prisma schema
- Review error logs

### Debug Steps
1. Check server logs for detailed error messages
2. Verify database connectivity
3. Test middleware independently
4. Validate request parameters

## Future Enhancements

### Planned Features
- Date range filtering
- Pagination for large datasets
- Real-time data updates
- Export functionality
- Integration with external tax services

### Potential Improvements
- Add caching layer
- Implement rate limiting
- Add audit logging
- Enhance error messages
- Add data validation

## Support and Maintenance

### Documentation
- Keep this document updated
- Add usage examples
- Document any changes

### Monitoring
- Set up alerts for errors
- Monitor performance metrics
- Track usage patterns

### Updates
- Regular security reviews
- Performance optimization
- Feature enhancements
- Bug fixes

## Conclusion

The vendor tax report endpoint provides a secure, efficient way for vendors to access their payout data for tax reporting purposes. The implementation includes proper authentication, authorization, error handling, and comprehensive testing to ensure reliability and security. 