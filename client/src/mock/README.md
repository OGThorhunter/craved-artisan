# Mock Data & Testing Utilities

This directory contains comprehensive mock data and testing utilities for the Craved Artisan application.

## 📁 Files Overview

### Core Mock Data
- **`storefrontData.ts`** - Vendor storefront data (products, events, store info)
- **`enhancedAnalyticsData.ts`** - Analytics dashboard data (KPIs, trends, insights)
- **`analyticsData.ts`** - Original analytics mock data (legacy)

### Utilities
- **`mockDataLoader.ts`** - Mock API responses and testing utilities
- **`index.ts`** - Central export file for all mock data

### Testing Interface
- **`TestDataPage.tsx`** - Interactive testing dashboard (accessible at `/test-data`)

## 🚀 Quick Start

### 1. Access Testing Dashboard
Navigate to `/test-data` in your browser to access the interactive testing interface.

### 2. Import Mock Data
```typescript
import { 
  mockStoreData, 
  mockProducts, 
  enhancedMockKpis,
  allMockData 
} from '../mock';
```

### 3. Use Mock API Responses
```typescript
import { mockApiResponses } from '../mock';

// Simulate API calls
const storeData = await mockApiResponses.getStoreData();
const products = await mockApiResponses.getProducts();
const analytics = await mockApiResponses.getAnalyticsSummary('vendor-123');
```

## 📊 Available Mock Data

### Storefront Data
- **Store Information**: Complete store details, contact info, business hours
- **Products**: 8 realistic products with availability, pricing, ratings
- **Events**: 5 upcoming events with capacity and booking info
- **Order Windows**: 4 different pickup/delivery options

### Analytics Data
- **KPIs**: 6 key performance indicators with trends
- **Trend Data**: Daily, weekly, and monthly revenue/order trends
- **Best Sellers**: Top 5 products with performance metrics
- **AI Insights**: 4 AI-generated business recommendations
- **Financial Metrics**: Revenue, profit, customer metrics
- **Tax Data**: Quarterly tax information
- **Customer Insights**: Segmentation and retention data
- **Inventory Metrics**: Stock levels and alerts
- **Performance Metrics**: Fulfillment and quality scores

## 🧪 Testing Features

### Interactive Testing Dashboard
- **Storefront Tab**: Browse products, events, and store info
- **Analytics Tab**: View KPIs, best sellers, and AI insights
- **API Tab**: Test mock API endpoints and error scenarios

### Search & Filter Testing
- Product search by name, description, or tags
- Category filtering (Bread, Pastry, Sweet Bread)
- Availability filtering (In Stock, Limited, Back Soon, Out of Stock)

### API Simulation
- Realistic API response delays (300-800ms)
- Success and error response testing
- Network error simulation
- Rate limiting simulation

### Error Testing
- Network errors
- Server errors (500)
- Not found errors (404)
- Unauthorized errors (401)
- Rate limit errors (429)

## 🔧 Utility Functions

### Mock Data Utils
```typescript
import { mockDataUtils } from '../mock';

// Generate random variations
const variation = mockDataUtils.generateRandomVariation(100, 0.1);

// Simulate data updates
const updatedData = await mockDataUtils.simulateDataUpdate(data, updateFn);

// Generate test scenarios
const scenario = mockDataUtils.generateTestScenario('loading');

// Search functionality
const results = await mockDataUtils.mockSearch('sourdough', products);

// Filter functionality
const filtered = await mockDataUtils.mockFilter({ category: 'Bread' }, products);

// Sort functionality
const sorted = await mockDataUtils.mockSort(products, 'price', 'desc');
```

## 📱 Data Structure Examples

### Product Object
```typescript
{
  id: '1',
  name: 'Classic Sourdough',
  price: 8.99,
  category: 'Bread',
  availability: 'In Stock',
  rating: 4.9,
  reviewCount: 124,
  ingredients: ['Organic flour', 'Water', 'Salt', 'Sourdough starter'],
  allergens: ['Gluten'],
  nutritionInfo: {
    calories: 120,
    protein: 4,
    carbs: 25,
    fat: 1
  }
}
```

### KPI Object
```typescript
{
  label: "Today's Revenue",
  value: "$1,247.89",
  delta: 18.5,
  trend: 'up',
  status: 'excellent',
  icon: "💰",
  description: "Strong daily performance with 18.5% growth"
}
```

### Event Object
```typescript
{
  id: '1',
  name: 'Saturday Farmers Market',
  date: '2024-01-20',
  time: '8:00 AM - 2:00 PM',
  location: 'Grant Park Farmers Market',
  spotsLeft: 15,
  totalSpots: 20,
  category: 'Market',
  price: 0
}
```

## 🎯 Use Cases

### Development
- Test UI components without backend
- Develop features with realistic data
- Test responsive design with various content lengths

### Testing
- Unit test components with consistent data
- Integration test user flows
- Performance test with large datasets

### Demo & Presentation
- Showcase features to stakeholders
- Demo application capabilities
- Present at conferences or meetings

### QA Testing
- Test edge cases (empty states, errors)
- Validate error handling
- Test loading states and transitions

## 🔄 Updating Mock Data

### Add New Products
1. Edit `storefrontData.ts`
2. Add product to `mockProducts` array
3. Update types if needed

### Add New Analytics
1. Edit `enhancedAnalyticsData.ts`
2. Add data to appropriate arrays
3. Update interfaces if needed

### Modify API Responses
1. Edit `mockDataLoader.ts`
2. Update response structure
3. Test with `/test-data` page

## 🚨 Best Practices

1. **Keep Data Realistic**: Use realistic prices, ratings, and descriptions
2. **Maintain Consistency**: Ensure data relationships make sense
3. **Test Edge Cases**: Include empty states, errors, and loading states
4. **Document Changes**: Update this README when adding new data
5. **Version Control**: Commit mock data changes with feature updates

## 🆘 Troubleshooting

### Data Not Loading
- Check import paths in components
- Verify mock data exports in `index.ts`
- Check browser console for errors

### API Calls Failing
- Ensure mock API functions are properly imported
- Check function signatures match expected usage
- Verify async/await usage in components

### Type Errors
- Check TypeScript interfaces match data structure
- Update types when modifying mock data
- Ensure proper type imports

## 📞 Support

For questions about mock data or testing utilities:
1. Check this README first
2. Review the `/test-data` page
3. Check component usage examples
4. Review TypeScript interfaces

---

**Happy Testing! 🎉**
