# Analytics API Documentation

## Overview

The Analytics API provides comprehensive business intelligence and reporting capabilities for vendors on the Craved Artisan platform. All endpoints are secured and require proper authentication.

## Base URL
```
http://localhost:3001/api
```

## Authentication
All endpoints require a valid session. The vendor ID in the URL must match the authenticated user's vendor profile.

## Endpoints

### 1. Revenue & Orders Trends

**Endpoint:** `GET /vendor/:vendorId/analytics/trends`

**Query Parameters:**
- `range` (optional): `daily` | `weekly` | `monthly` (default: `daily`)

**Response:**
```typescript
{
  success: boolean;
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  meta: {
    vendorId: string;
    vendorName: string;
    range: string;
    dataPoints: number;
    generatedAt: string;
  };
}
```

**Example Request:**
```bash
curl "http://localhost:3001/api/vendor/vendor_001/analytics/trends?range=daily"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "Dec 01",
      "revenue": 1250,
      "orders": 23
    },
    {
      "date": "Dec 02",
      "revenue": 980,
      "orders": 18
    }
  ],
  "meta": {
    "vendorId": "vendor_001",
    "vendorName": "Rustic Bakes",
    "range": "daily",
    "dataPoints": 30,
    "generatedAt": "2024-12-01T10:30:00.000Z"
  }
}
```

### 2. Analytics Summary

**Endpoint:** `GET /vendor/:vendorId/analytics/summary`

**Response:**
```typescript
{
  success: boolean;
  data: {
    vendorId: string;
    vendorName: string;
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    thisMonthRevenue: number;
    thisMonthOrders: number;
  };
}
```

**Example Request:**
```bash
curl "http://localhost:3001/api/vendor/vendor_001/analytics/summary"
```

### 3. Conversion Funnel

**Endpoint:** `GET /vendor/:vendorId/analytics/conversion`

**Query Parameters:**
- `range` (optional): `daily` | `weekly` | `monthly` (default: `monthly`)

**Response:**
```typescript
{
  success: boolean;
  data: {
    views: number;
    addToCart: number;
    checkoutStarted: number;
    purchases: number;
  };
  meta: {
    vendorId: string;
    vendorName: string;
    range: string;
    generatedAt: string;
  };
}
```

**Example Request:**
```bash
curl "http://localhost:3001/api/vendor/vendor_001/analytics/conversion?range=monthly"
```

### 4. Best Sellers & Product Performance

**Endpoint:** `GET /vendor/:vendorId/analytics/bestsellers`

**Query Parameters:**
- `range` (optional): `weekly` | `monthly` | `quarterly` (default: `monthly`)
- `limit` (optional): number (1-50, default: 10)

**Response:**
```typescript
{
  success: boolean;
  data: Array<{
    productId: string;
    name: string;
    revenue: number;
    units: number;
    reorderRate: number;
    rating: number;
    stock: number;
    category: string;
  }>;
  meta: {
    vendorId: string;
    vendorName: string;
    range: string;
    limit: number;
    generatedAt: string;
  };
}
```

**Example Request:**
```bash
curl "http://localhost:3001/api/vendor/vendor_001/analytics/bestsellers?range=monthly&limit=5"
```

### 5. Profit & Loss Statement

**Endpoint:** `GET /vendor/:vendorId/financials/profit-loss`

**Query Parameters:**
- `range` (optional): `monthly` | `quarterly` | `yearly` (default: `monthly`)

**Response:**
```typescript
{
  success: boolean;
  data: {
    income: {
      revenue: number;
      otherIncome: number;
    };
    expenses: {
      COGS: number;
      labor: number;
      marketing: number;
      other: number;
    };
    netProfit: number;
  };
  meta: {
    vendorId: string;
    vendorName: string;
    range: string;
    generatedAt: string;
  };
}
```

**Example Request:**
```bash
curl "http://localhost:3001/api/vendor/vendor_001/financials/profit-loss?range=monthly"
```

### 6. Portfolio Builder

**Endpoint:** `GET /vendor/:vendorId/analytics/portfolio`

**Response:**
```typescript
{
  success: boolean;
  data: Array<{
    category: string;
    revenue: number;
    percent: number;
    risk: 'low' | 'medium' | 'high';
  }>;
  meta: {
    vendorId: string;
    vendorName: string;
    generatedAt: string;
  };
}
```

**Example Request:**
```bash
curl "http://localhost:3001/api/vendor/vendor_001/analytics/portfolio"
```

### 7. Customer Insights by ZIP Code

**Endpoint:** `GET /vendor/:vendorId/analytics/customers/by-zip`

**Query Parameters:**
- `range` (optional): `monthly` | `quarterly` | `yearly` (default: `monthly`)

**Response:**
```typescript
{
  success: boolean;
  data: Array<{
    zip: string;
    customers: number;
    avgSpend: number;
    loyalty: number;
    totalRevenue: number;
  }>;
  meta: {
    vendorId: string;
    vendorName: string;
    range: string;
    generatedAt: string;
  };
}
```

**Example Request:**
```bash
curl "http://localhost:3001/api/vendor/vendor_001/analytics/customers/by-zip?range=monthly"
```

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request (Validation Error):**
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "range",
      "message": "Invalid range parameter"
    }
  ]
}
```

**404 Not Found (Vendor Not Found):**
```json
{
  "success": false,
  "error": "Vendor not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to fetch data"
}
```

## Database Schema Requirements

### Required Tables

1. **Order Table:**
```sql
CREATE TABLE "Order" (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  order_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL,
  -- other fields...
);
```

2. **OrderItem Table:**
```sql
CREATE TABLE "OrderItem" (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  -- other fields...
);
```

3. **Product Table:**
```sql
CREATE TABLE "Product" (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  stock_quantity INTEGER,
  -- other fields...
);
```

4. **User Table:**
```sql
CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  zip_code TEXT,
  loyalty_member BOOLEAN DEFAULT FALSE,
  -- other fields...
);
```

## Implementation Notes

### Data Aggregation

1. **Trends Data:**
   - Uses `TO_CHAR` and `DATE_TRUNC` for PostgreSQL date formatting
   - Groups by appropriate time periods
   - Filters for completed/delivered orders only

2. **Best Sellers:**
   - Joins Product, OrderItem, and Order tables
   - Calculates revenue as `SUM(price * quantity)`
   - Orders by revenue descending

3. **Profit & Loss:**
   - Revenue from completed orders
   - Expenses calculated as percentages of revenue (mock data)
   - Net profit = revenue - total expenses

4. **Portfolio Analysis:**
   - Groups products by category
   - Calculates revenue percentage per category
   - Risk assessment based on concentration

5. **Customer Insights:**
   - Groups orders by customer ZIP code
   - Calculates average spend and loyalty metrics
   - Limits to top 20 ZIP codes by revenue

### Mock Data Fallbacks

All endpoints include mock data generators as fallbacks when:
- Database queries fail
- No real data exists
- Development/testing purposes

### Performance Considerations

1. **Caching:**
   - Heavy queries cached for 5 minutes
   - Use React Query on frontend for client-side caching

2. **Indexing:**
   - Index on `vendor_id`, `order_date`, `status` in Order table
   - Index on `product_id` in OrderItem table
   - Index on `vendor_id` in Product table

3. **Query Optimization:**
   - Use `COALESCE` for null handling
   - Limit result sets where appropriate
   - Use appropriate date ranges

## Testing

Use the provided test script to verify all endpoints:

```bash
.\test-analytics-complete.ps1
```

This script tests:
- All endpoint responses
- Error handling
- Data validation
- Frontend integration

## Frontend Integration

The analytics components use React Query for data fetching:

```typescript
import { useQuery } from '@tanstack/react-query';

// Example usage
const { data, isLoading, error } = useQuery({
  queryKey: ['analytics', 'trends', vendorId, range],
  queryFn: () => fetchAnalyticsTrends(vendorId, range),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

## Security Considerations

1. **Authentication:** All endpoints require valid session
2. **Authorization:** Vendor ID must match authenticated user
3. **Input Validation:** All parameters validated with Zod
4. **SQL Injection:** Uses Prisma parameterized queries
5. **Rate Limiting:** Consider implementing rate limiting for production

## Future Enhancements

1. **Real-time Analytics:** WebSocket integration for live updates
2. **Advanced Filtering:** Date ranges, product categories, customer segments
3. **Export Functionality:** CSV/PDF report generation
4. **Custom Dashboards:** User-configurable analytics views
5. **Predictive Analytics:** AI-powered forecasting and insights 