# Supplier Marketplace Feature Documentation

## Overview
The Supplier Marketplace feature provides intelligent supplier management for low stock scenarios. It automatically checks supplier availability, offers replacement options when preferred items are out-of-stock, and tracks price-per-unit across multiple suppliers to help vendors make informed purchasing decisions.

## Core Functionality

### 🎯 **Low Stock Detection & Supplier Matching**
- **Automatic Detection**: Monitors inventory levels and triggers alerts when stock falls below threshold
- **Supplier Search**: Searches across multiple suppliers for matching ingredients
- **Replacement Suggestions**: Offers alternatives when preferred suppliers are out-of-stock
- **Price Comparison**: Tracks and compares prices across suppliers

### 🏪 **Supplier Marketplace Features**
- **Multi-Supplier Search**: Search across 6+ suppliers with different specialties
- **Filtering Options**: Filter by organic, preferred suppliers, price range
- **Price Tracking**: Historical price data with trend analysis
- **Supplier Ratings**: Quality and reliability ratings for each supplier
- **Delivery Information**: Delivery times and minimum order requirements

## Technical Implementation

### Data Models

#### Supplier Model
```typescript
interface Supplier {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  minimumOrder: number;
  isActive: boolean;
  specialties: string[];
  createdAt: string;
  updatedAt: string;
}
```

#### Supplier Inventory Model
```typescript
interface SupplierInventory {
  id: string;
  supplierId: string;
  ingredientName: string;
  brand: string;
  unit: string;
  pricePerUnit: number;
  availableQuantity: number;
  minimumOrderQuantity: number;
  isOrganic: boolean;
  isPreferred: boolean;
  lastUpdated: string;
}
```

#### Price History Model
```typescript
interface PriceHistory {
  id: string;
  supplierInventoryId: string;
  ingredientName: string;
  supplierName: string;
  pricePerUnit: number;
  recordedAt: string;
}
```

### Core Functions

#### `searchSupplierIngredients(ingredientName, preferredOnly, organicOnly, maxPrice)`
**Purpose**: Search for ingredients across supplier marketplace with filtering options

**Parameters**:
- `ingredientName` (string): Name of ingredient to search for
- `preferredOnly` (boolean): Only return preferred suppliers
- `organicOnly` (boolean): Only return organic options
- `maxPrice` (number): Maximum price per unit

**Returns**: Array of supplier options sorted by price, preference, and rating

**Example**:
```typescript
const options = searchSupplierIngredients("Organic Flour", false, true, 4.00);
// Returns organic flour options under $4.00, sorted by price
```

#### `getPriceHistory(ingredientName, days)`
**Purpose**: Get historical price data for ingredient across suppliers

**Parameters**:
- `ingredientName` (string): Name of ingredient
- `days` (number): Number of days to look back (default: 30)

**Returns**: Array of price records with trend analysis

**Example**:
```typescript
const history = getPriceHistory("Organic Flour", 30);
// Returns 30 days of price history with trend analysis
```

#### `trackPriceChange(supplierInventoryId, pricePerUnit)`
**Purpose**: Track price changes for supplier inventory items

**Parameters**:
- `supplierInventoryId` (string): ID of supplier inventory item
- `pricePerUnit` (number): New price per unit

**Returns**: Updated price record with timestamp

#### `getLowStockRecommendations(lowStockIngredients)`
**Purpose**: Generate comprehensive recommendations for low stock items

**Parameters**:
- `lowStockIngredients` (array): Array of ingredients that are low in stock

**Returns**: Recommendations with supplier options, price trends, and order quantities

## API Endpoints

### POST `/api/supplier/search`
**Purpose**: Search for ingredients across supplier marketplace

**Request Body**:
```json
{
  "ingredientName": "Organic Flour",
  "preferredOnly": false,
  "organicOnly": true,
  "maxPrice": 4.00
}
```

**Response**:
```json
{
  "message": "Found 2 supplier options for \"Organic Flour\"",
  "ingredientName": "Organic Flour",
  "filters": {
    "preferredOnly": false,
    "organicOnly": true,
    "maxPrice": 4.00
  },
  "results": [
    {
      "id": "si-1",
      "supplierId": "supplier-1",
      "ingredientName": "Organic Flour",
      "brand": "Local Market Organic",
      "unit": "kilograms",
      "pricePerUnit": 3.50,
      "availableQuantity": 100.0,
      "minimumOrderQuantity": 5.0,
      "isOrganic": true,
      "isPreferred": true,
      "supplier": {
        "id": "supplier-1",
        "name": "Local Market",
        "rating": 4.8,
        "deliveryTime": "1-2 days",
        "minimumOrder": 50.00,
        "specialties": ["organic", "local"]
      }
    }
  ]
}
```

### GET `/api/supplier/price-history/:ingredientName`
**Purpose**: Get price history for ingredient across suppliers

**Parameters**:
- `ingredientName` (path): Name of ingredient
- `days` (query): Number of days to look back (default: 30)

**Response**:
```json
{
  "message": "Price history for \"Organic Flour\"",
  "ingredientName": "Organic Flour",
  "days": 30,
  "history": [
    {
      "id": "ph-1",
      "supplierInventoryId": "si-1",
      "ingredientName": "Organic Flour",
      "supplierName": "Local Market",
      "pricePerUnit": 3.50,
      "recordedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "summary": {
    "totalRecords": 2,
    "averagePrice": 3.375,
    "priceRange": {
      "min": 3.25,
      "max": 3.50
    }
  }
}
```

### POST `/api/supplier/track-price`
**Purpose**: Track price change for supplier inventory

**Request Body**:
```json
{
  "supplierInventoryId": "si-1",
  "pricePerUnit": 3.75
}
```

**Response**:
```json
{
  "message": "Price tracked successfully",
  "priceRecord": {
    "id": "ph-1234567890",
    "supplierInventoryId": "si-1",
    "ingredientName": "Organic Flour",
    "supplierName": "Local Market",
    "pricePerUnit": 3.75,
    "recordedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST `/api/supplier/low-stock-recommendations`
**Purpose**: Get comprehensive recommendations for low stock items

**Request Body**:
```json
{
  "lowStockIngredients": [
    {
      "ingredientId": "1",
      "ingredientName": "Vanilla Extract",
      "currentStock": 3,
      "lowStockThreshold": 5,
      "unit": "bottles"
    }
  ]
}
```

**Response**:
```json
{
  "message": "Generated 1 recommendations for low stock items",
  "recommendations": [
    {
      "ingredientId": "1",
      "ingredientName": "Vanilla Extract",
      "currentStock": 3,
      "lowStockThreshold": 5,
      "unit": "bottles",
      "supplierOptions": [
        {
          "supplierId": "supplier-3",
          "supplierName": "Spice World",
          "brand": "Spice World Pure",
          "pricePerUnit": 12.00,
          "availableQuantity": 50,
          "minimumOrderQuantity": 5,
          "isOrganic": true,
          "isPreferred": true,
          "deliveryTime": "3-5 days",
          "rating": 4.9
        }
      ],
      "priceTrend": 0.5,
      "priceTrendDirection": "increasing",
      "recommendedOrderQuantity": 10
    }
  ],
  "summary": {
    "totalLowStockItems": 1,
    "itemsWithRecommendations": 1,
    "totalSupplierOptions": 2,
    "averagePriceTrend": 0.5
  }
}
```

### GET `/api/supplier/suppliers`
**Purpose**: Get all suppliers with optional filtering

**Query Parameters**:
- `active` (boolean): Only return active suppliers

**Response**:
```json
{
  "message": "Found 6 suppliers",
  "suppliers": [
    {
      "id": "supplier-1",
      "name": "Local Market",
      "rating": 4.8,
      "deliveryTime": "1-2 days",
      "minimumOrder": 50.00,
      "isActive": true,
      "specialties": ["organic", "local"]
    }
  ]
}
```

### GET `/api/supplier/inventory`
**Purpose**: Get supplier inventory with filtering options

**Query Parameters**:
- `ingredientName` (string): Filter by ingredient name
- `supplierId` (string): Filter by supplier ID
- `organic` (boolean): Only return organic items
- `preferred` (boolean): Only return preferred items

**Response**:
```json
{
  "message": "Found 10 inventory items",
  "inventory": [
    {
      "id": "si-1",
      "supplierId": "supplier-1",
      "ingredientName": "Organic Flour",
      "brand": "Local Market Organic",
      "unit": "kilograms",
      "pricePerUnit": 3.50,
      "availableQuantity": 100.0,
      "minimumOrderQuantity": 5.0,
      "isOrganic": true,
      "isPreferred": true,
      "supplier": {
        "id": "supplier-1",
        "name": "Local Market",
        "rating": 4.8,
        "deliveryTime": "1-2 days"
      }
    }
  ]
}
```

## Enhanced Inventory Deduction Integration

### Low Stock Alerts with Supplier Recommendations
When inventory deduction triggers low stock alerts, the system now includes:

```json
{
  "lowStockAlerts": [
    {
      "ingredientId": "3",
      "ingredientName": "Vanilla Extract",
      "currentStock": 3,
      "lowStockThreshold": 5,
      "unit": "bottles",
      "supplier": "Spice World",
      "supplierRecommendations": [
        {
          "supplierId": "supplier-3",
          "supplierName": "Spice World",
          "brand": "Spice World Pure",
          "pricePerUnit": 12.00,
          "availableQuantity": 50,
          "minimumOrderQuantity": 5,
          "isOrganic": true,
          "isPreferred": true,
          "deliveryTime": "3-5 days",
          "rating": 4.9
        },
        {
          "supplierId": "supplier-6",
          "supplierName": "Bulk Barn",
          "brand": "Bulk Barn Standard",
          "pricePerUnit": 9.50,
          "availableQuantity": 100,
          "minimumOrderQuantity": 10,
          "isOrganic": false,
          "isPreferred": false,
          "deliveryTime": "3-5 days",
          "rating": 4.4
        }
      ]
    }
  ]
}
```

## Supplier Marketplace Data

### Available Suppliers
1. **Local Market** (Rating: 4.8)
   - Specialties: Organic, Local
   - Delivery: 1-2 days
   - Minimum Order: $50.00

2. **Farm Fresh Co.** (Rating: 4.6)
   - Specialties: Farm-direct, Fresh
   - Delivery: 2-3 days
   - Minimum Order: $25.00

3. **Spice World** (Rating: 4.9)
   - Specialties: Spices, Imported
   - Delivery: 3-5 days
   - Minimum Order: $100.00

4. **Dairy Delights** (Rating: 4.7)
   - Specialties: Dairy, Fresh
   - Delivery: 1 day
   - Minimum Order: $30.00

5. **Sweet Supplies** (Rating: 4.5)
   - Specialties: Sweeteners, Bulk
   - Delivery: 2-4 days
   - Minimum Order: $75.00

6. **Bulk Barn** (Rating: 4.4)
   - Specialties: Bulk, Wholesale
   - Delivery: 3-5 days
   - Minimum Order: $150.00

### Sample Inventory Items
- **Organic Flour**: 2 suppliers (Local Market, Bulk Barn)
- **Fresh Eggs**: 2 suppliers (Farm Fresh Co., Dairy Delights)
- **Vanilla Extract**: 2 suppliers (Spice World, Bulk Barn)
- **Butter**: 2 suppliers (Dairy Delights, Local Market)
- **Sugar**: 2 suppliers (Sweet Supplies, Bulk Barn)

## Business Logic

### Supplier Selection Algorithm
1. **Price Priority**: Sort by lowest price first
2. **Preference Weight**: Preferred suppliers get priority
3. **Rating Consideration**: Higher-rated suppliers preferred
4. **Availability Check**: Only show items with available stock
5. **Minimum Order**: Consider minimum order requirements

### Price Trend Analysis
- **Increasing**: Prices trending up (consider buying now)
- **Decreasing**: Prices trending down (consider waiting)
- **Stable**: Prices consistent (no urgency)

### Replacement Logic
1. **Preferred Supplier Out**: Check alternative suppliers
2. **Organic Preference**: Offer organic alternatives first
3. **Price Comparison**: Show price differences
4. **Quality Rating**: Consider supplier ratings
5. **Delivery Time**: Factor in delivery urgency

## Testing

### Test Scenarios

#### 1. Supplier Search
- **Input**: Search for "Organic Flour" with organic filter
- **Expected**: Return organic flour options from multiple suppliers
- **Validation**: Check filtering, sorting, and supplier information

#### 2. Price History
- **Input**: Get 30-day price history for "Organic Flour"
- **Expected**: Return price records with trend analysis
- **Validation**: Verify price range, average, and trend direction

#### 3. Price Tracking
- **Input**: Update price for supplier inventory item
- **Expected**: Price updated and added to history
- **Validation**: Check price record creation and history update

#### 4. Low Stock Recommendations
- **Input**: Submit low stock ingredients list
- **Expected**: Return recommendations with supplier options
- **Validation**: Verify supplier options, price trends, order quantities

#### 5. Replacement Options
- **Input**: Search for ingredient with preferred supplier out
- **Expected**: Return alternative suppliers with price comparison
- **Validation**: Check alternative options and price differences

### Test Script
**File**: `test-supplier-marketplace.ps1`

**Coverage**:
1. Get all suppliers
2. Search for ingredients with filters
3. Get price history and analysis
4. Track price changes
5. Get low stock recommendations
6. Test replacement options
7. Verify supplier inventory
8. Test enhanced inventory deduction

## Integration Points

### Inventory Management
- **Low Stock Detection**: Automatic triggering of supplier searches
- **Enhanced Alerts**: Include supplier recommendations in alerts
- **Price Tracking**: Monitor price changes for cost optimization

### Recipe Management
- **Ingredient Matching**: Match recipe ingredients to supplier inventory
- **Quality Preferences**: Consider organic/preferred supplier preferences
- **Cost Analysis**: Track ingredient costs across suppliers

### Product Management
- **Stock Availability**: Ensure sufficient supplier stock for production
- **Cost Optimization**: Choose suppliers based on price and quality
- **Supply Chain**: Manage relationships with multiple suppliers

## Performance Considerations

### Optimization Strategies
- **Caching**: Cache supplier data and price history
- **Indexing**: Index on ingredient names and supplier IDs
- **Pagination**: Handle large supplier inventories efficiently
- **Real-time Updates**: Update prices and availability in real-time

### Scalability
- **Multiple Suppliers**: Support for unlimited suppliers
- **Price Tracking**: Efficient storage of historical price data
- **Search Performance**: Fast ingredient search across suppliers
- **Recommendation Engine**: Scalable recommendation generation

## Security Considerations

### Data Protection
- **Supplier Information**: Protect supplier contact and pricing data
- **Price History**: Secure historical pricing information
- **Access Control**: Restrict access to supplier marketplace data
- **Audit Logging**: Log all supplier interactions and price changes

### Validation
- **Input Validation**: Validate all search parameters and filters
- **Price Validation**: Ensure price changes are reasonable
- **Supplier Verification**: Verify supplier authenticity and ratings
- **Data Integrity**: Maintain consistency across supplier data

## Future Enhancements

### Planned Features
- **Automated Ordering**: Automatic reorder when stock is low
- **Supplier Integration**: Direct API integration with suppliers
- **Price Alerts**: Notifications when prices change significantly
- **Quality Tracking**: Track ingredient quality across suppliers
- **Delivery Optimization**: Optimize delivery schedules and costs
- **Supplier Analytics**: Advanced analytics for supplier performance

### Technical Improvements
- **Machine Learning**: ML-based supplier recommendations
- **Real-time Inventory**: Real-time supplier inventory updates
- **Blockchain Integration**: Secure price and transaction tracking
- **Mobile App**: Mobile supplier marketplace access
- **API Versioning**: Proper API versioning for production
- **Webhook Support**: Real-time notifications for price changes

## Troubleshooting

### Common Issues

#### 1. No Supplier Results
- **Problem**: Search returns no supplier options
- **Solution**: Check ingredient name spelling and filters
- **Debug**: Verify supplier inventory data and availability

#### 2. Price Tracking Errors
- **Problem**: Price changes not being tracked
- **Solution**: Verify supplier inventory ID and price format
- **Debug**: Check price history database and validation

#### 3. Low Stock Recommendations
- **Problem**: No recommendations generated
- **Solution**: Ensure low stock ingredients have supplier options
- **Debug**: Check supplier inventory and search functionality

#### 4. Integration Issues
- **Problem**: Inventory deduction not showing supplier recommendations
- **Solution**: Verify supplier marketplace integration
- **Debug**: Check function imports and API connectivity

### Debug Steps
1. Check supplier inventory via `/api/supplier/inventory`
2. Verify supplier search functionality
3. Test price tracking with known supplier IDs
4. Review low stock recommendation generation
5. Check inventory deduction integration
6. Verify supplier data consistency

## Conclusion

The Supplier Marketplace feature provides a comprehensive solution for managing supplier relationships and optimizing ingredient procurement. It includes intelligent supplier matching, price tracking, and replacement suggestions to ensure vendors can maintain optimal inventory levels while minimizing costs.

The implementation follows best practices for API design, data management, and business logic, providing a solid foundation for production deployment and future enhancements. 