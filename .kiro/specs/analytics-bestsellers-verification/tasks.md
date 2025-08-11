# Implementation Plan

- [ ] 1. Create comprehensive test file for bestsellers endpoint
  - Create new test file `server/tests/analytics.bestsellers.spec.ts` with Vitest setup
  - Implement test data setup with multiple vendors, products, orders, and reviews
  - Add proper cleanup functions for test isolation
  - _Requirements: 5.1, 5.2, 5.5_

- [ ] 2. Implement revenue calculation verification tests
  - Write test to verify revenue = SUM(orderItems.quantity * orderItems.unitPrice) per product
  - Create test scenarios with varied quantities and prices
  - Test edge case of zero-revenue products
  - _Requirements: 1.1, 2.1_

- [ ] 3. Implement units sold calculation verification tests
  - Write test to verify units = SUM(orderItems.quantity) per product
  - Create test scenarios with different quantity combinations
  - Test edge case of products with no orders
  - _Requirements: 1.2, 2.3_

- [ ] 4. Implement rating calculation verification tests
  - Write test to verify rating = AVG(reviews.rating) per product
  - Create test scenarios with various rating combinations
  - Test edge case of unrated products (should return null)
  - _Requirements: 1.3, 2.2_

- [ ] 5. Implement reorder rate calculation verification tests
  - Write test to verify reorderRate = repeatCustomers / totalCustomers for vendor
  - Create test scenarios with customers having ≥2 orders vs single orders
  - Test edge case of vendors with no repeat customers
  - _Requirements: 1.4, 2.4_

- [ ] 6. Implement vendor scoping security tests
  - Write test to verify only vendor's own products are returned
  - Create cross-vendor test scenarios to ensure data isolation
  - Test that calculations only include the specified vendor's data
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 7. Enhance controller to support new query parameters
  - Update `getBestSellers` function in `analyticsController.ts` to accept `from`, `to`, and `category` parameters
  - Modify the validation schema to include new parameters
  - Update the SQL query to handle date range and category filtering
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 8. Implement query parameter filtering tests
  - Write tests for `from` parameter date filtering
  - Write tests for `to` parameter date filtering
  - Write tests for `category` parameter filtering
  - Write tests for `limit` parameter functionality
  - Test combinations of multiple parameters
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 9. Fix calculation accuracy in controller implementation
  - Replace mock reorder rate calculation with accurate SQL query
  - Implement proper rating calculation using database joins
  - Ensure revenue and units calculations use correct formulas
  - Add proper handling of null values and edge cases
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 10. Enhance seed data for comprehensive testing
  - Extend `prisma/seed.ts` with at least 3 products per vendor
  - Add varied order scenarios with different quantities and dates
  - Include rating data for some products, leave others unrated
  - Create repeat customer scenarios for reorder rate testing
  - Add multiple product categories for filtering tests
  - _Requirements: 5.5_

- [ ] 11. Implement edge case handling tests
  - Write tests for invalid vendor IDs (should return 404)
  - Write tests for invalid query parameters (should return 400)
  - Write tests for empty result sets
  - Write tests for database error scenarios
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 12. Validate all tests pass and calculations are accurate
  - Run complete test suite to ensure all tests pass
  - Verify calculation accuracy against manual calculations
  - Test performance with larger datasets
  - Ensure no regressions in existing functionality
  - _Requirements: 5.1, 5.2, 5.3, 5.4_