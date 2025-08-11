# Design Document

## Overview

This design outlines the comprehensive testing and enhancement of the `GET /api/vendor/:vendorId/analytics/bestsellers` endpoint. The current implementation has basic functionality but lacks proper query parameter support, accurate calculations, and comprehensive test coverage. We will enhance the endpoint to support filtering and pagination while ensuring all calculations are mathematically correct and properly tested.

## Architecture

### Current State Analysis
- The existing `getBestSellers` endpoint in `analyticsController.ts` has basic functionality
- Current implementation uses mock data for reorder rates and ratings
- Limited query parameter support (only `range` and `limit`)
- No comprehensive test coverage for calculation accuracy
- Vendor scoping exists but needs verification

### Enhanced Architecture
- **Controller Layer**: Enhanced `getBestSellers` function with expanded query parameter support
- **Data Layer**: Accurate calculations using proper SQL aggregations and joins
- **Test Layer**: Comprehensive Vitest test suite covering all calculation formulas and edge cases
- **Seed Layer**: Enhanced seed data with realistic scenarios for testing

## Components and Interfaces

### Enhanced Query Parameters Schema
```typescript
const enhancedBestSellersSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  from: z.string().optional(), // Date filter start
  to: z.string().optional(),   // Date filter end
  limit: z.number().min(1).max(50).default(10), // Result limit
  category: z.string().optional() // Product category filter
});
```

### BestSeller Interface (Enhanced)
```typescript
interface BestSeller {
  productId: string;
  name: string;
  revenue: number;        // SUM(orderItems.quantity * orderItems.unitPrice)
  units: number;          // SUM(orderItems.quantity)
  reorderRate: number;    // repeatCustomers / totalCustomers for vendor
  rating: number | null;  // AVG(reviews.rating) or null if no reviews
  stock: number;
  category: string;
}
```

### Test Data Structure
```typescript
interface TestScenario {
  vendors: VendorProfile[];
  products: Product[];
  users: User[];
  orders: Order[];
  orderItems: OrderItem[];
  reviews: Review[]; // If review model exists
}
```

## Data Models

### Revenue Calculation
- **Formula**: `SUM(orderItems.quantity * orderItems.unitPrice)` per product
- **SQL Implementation**: Join OrderItem with Order, filter by vendor and date range
- **Edge Cases**: Handle products with zero revenue, null values

### Units Sold Calculation
- **Formula**: `SUM(orderItems.quantity)` per product
- **SQL Implementation**: Simple aggregation on OrderItem table
- **Edge Cases**: Handle products with no orders

### Rating Calculation
- **Formula**: `AVG(reviews.rating)` per product
- **SQL Implementation**: Left join with Review table (if exists)
- **Edge Cases**: Return null for products with no reviews

### Reorder Rate Calculation
- **Formula**: `repeatCustomers / totalCustomers` for vendor where repeatCustomers have ≥2 orders
- **SQL Implementation**: Complex query with customer order counting
- **Edge Cases**: Handle vendors with no repeat customers

### Enhanced SQL Query Structure
```sql
SELECT 
  p.id AS "productId",
  p.name,
  COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue,
  COALESCE(SUM(oi.quantity), 0) AS units,
  COALESCE(AVG(r.rating), NULL) AS rating,
  p.stock_quantity AS stock,
  p.category,
  -- Reorder rate calculation (vendor-level)
  (SELECT 
    CASE 
      WHEN COUNT(DISTINCT o2.user_id) = 0 THEN 0
      ELSE COUNT(DISTINCT CASE WHEN user_order_counts.order_count >= 2 THEN o2.user_id END)::float / COUNT(DISTINCT o2.user_id)
    END
   FROM "Order" o2
   LEFT JOIN (
     SELECT user_id, COUNT(*) as order_count
     FROM "Order" 
     WHERE vendor_id = $1 AND status IN ('completed', 'delivered')
     GROUP BY user_id
   ) user_order_counts ON o2.user_id = user_order_counts.user_id
   WHERE o2.vendor_id = $1 AND o2.status IN ('completed', 'delivered')
  ) AS "reorderRate"
FROM "Product" p
LEFT JOIN "OrderItem" oi ON p.id = oi.product_id
LEFT JOIN "Order" o ON oi.order_id = o.id AND o.status IN ('completed', 'delivered')
LEFT JOIN "Review" r ON p.id = r.product_id -- If review table exists
WHERE p.vendor_id = $1
  AND ($2::date IS NULL OR o.created_at >= $2)
  AND ($3::date IS NULL OR o.created_at <= $3)
  AND ($4::text IS NULL OR p.category = $4)
GROUP BY p.id, p.name, p.stock_quantity, p.category
ORDER BY revenue DESC
LIMIT $5
```

## Error Handling

### Input Validation
- Validate date formats for `from` and `to` parameters
- Ensure `limit` is within acceptable range (1-50)
- Validate `category` against existing categories
- Return 400 for invalid parameters with detailed error messages

### Data Integrity
- Handle division by zero in reorder rate calculations
- Manage null values in rating calculations
- Ensure vendor scoping prevents cross-vendor data access
- Return 404 for non-existent vendors

### Database Errors
- Graceful handling of database connection issues
- Fallback to empty results rather than crashing
- Proper error logging for debugging

## Testing Strategy

### Unit Tests Structure
```typescript
describe('GET /api/vendor/:vendorId/analytics/bestsellers', () => {
  // Setup and teardown
  beforeAll(async () => { /* Create comprehensive test data */ });
  afterAll(async () => { /* Clean up test data */ });

  // Core calculation tests
  describe('Revenue Calculations', () => {
    it('should calculate revenue as SUM(quantity * unitPrice)');
    it('should handle zero revenue products');
    it('should handle products with no orders');
  });

  describe('Units Sold Calculations', () => {
    it('should calculate units as SUM(quantity)');
    it('should handle products with no sales');
  });

  describe('Rating Calculations', () => {
    it('should calculate average rating from reviews');
    it('should return null for unrated products');
  });

  describe('Reorder Rate Calculations', () => {
    it('should calculate repeat customer percentage');
    it('should handle vendors with no repeat customers');
  });

  // Query parameter tests
  describe('Query Parameters', () => {
    it('should filter by date range (from/to)');
    it('should limit results');
    it('should filter by category');
    it('should combine multiple filters');
  });

  // Edge cases and security
  describe('Edge Cases', () => {
    it('should enforce vendor scoping');
    it('should handle invalid vendor IDs');
    it('should validate query parameters');
  });
});
```

### Test Data Requirements
- **Minimum 3 products** per vendor with varied characteristics
- **Multiple vendors** to test scoping
- **Varied quantities and prices** for accurate revenue testing
- **Different rating scenarios** (no ratings, various averages)
- **Repeat customers** for reorder rate testing
- **Date ranges** for filtering tests
- **Multiple categories** for category filtering

### Seed Data Enhancements
```typescript
// Enhanced seed data structure
const seedData = {
  vendors: [
    { id: 'vendor1', business_name: 'Test Bakery 1' },
    { id: 'vendor2', business_name: 'Test Bakery 2' }
  ],
  products: [
    { vendor_id: 'vendor1', name: 'Artisan Bread', price: 8.50, category: 'Bread' },
    { vendor_id: 'vendor1', name: 'Croissant', price: 3.25, category: 'Pastries' },
    { vendor_id: 'vendor1', name: 'Coffee Beans', price: 15.00, category: 'Coffee' }
  ],
  // Complex order scenarios with varied quantities, dates, and customers
  orders: [/* Detailed order scenarios */],
  orderItems: [/* Corresponding order items */],
  reviews: [/* Rating scenarios */]
};
```

## Implementation Plan

### Phase 1: Controller Enhancement
1. Update `getBestSellers` function to accept new query parameters
2. Implement accurate SQL queries for all calculations
3. Add proper error handling and validation

### Phase 2: Test Suite Creation
1. Create comprehensive Vitest test file
2. Implement all calculation verification tests
3. Add edge case and security tests

### Phase 3: Seed Data Enhancement
1. Extend existing seed data with realistic scenarios
2. Ensure coverage of all test cases
3. Add data cleanup utilities

### Phase 4: Integration and Validation
1. Run all tests to ensure accuracy
2. Validate against existing functionality
3. Performance testing with larger datasets