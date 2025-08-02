# Inventory Deduction Feature Documentation

## Overview
The Inventory Deduction feature automatically manages ingredient stock levels when products are sold. It looks up the linked recipe for a product, calculates the required ingredients, deducts them from inventory, and provides low stock alerts when ingredients fall below their threshold levels.

## Core Functionality

### `deductInventory(productId, quantitySold)`
**Location**: `server/src/routes/inventory-deduction.ts`

**Purpose**: Automatically deducts ingredient quantities from inventory when products are sold.

**Parameters**:
- `productId` (string): The ID of the product being sold
- `quantitySold` (number): The quantity of the product being sold

**Returns**: Object containing:
- `success` (boolean): Whether the deduction was successful
- `message` (string): Success or error message
- `recipeName` (string): Name of the linked recipe
- `deductedIngredients` (array): List of ingredients that were deducted
- `lowStockAlerts` (array): List of ingredients that are now below threshold

## Technical Implementation

### Algorithm Flow

#### 1. Recipe Lookup
```typescript
const linkedRecipe = recipes.find(recipe => recipe.productId === productId);
```
- Searches for a recipe linked to the specified product ID
- Returns error if no recipe is found

#### 2. Ingredient Retrieval
```typescript
const recipeIngredientList = recipeIngredients.filter(ri => ri.recipeId === linkedRecipe.id);
```
- Gets all ingredients required for the linked recipe
- Returns error if no ingredients are found

#### 3. Batch Processing
```typescript
for (let batch = 0; batch < quantitySold; batch++) {
  for (const recipeIngredient of recipeIngredientList) {
    // Process each ingredient for each batch
  }
}
```
- Processes each unit sold as a separate batch
- Deducts ingredient quantities for each batch

#### 4. Unit Conversion
```typescript
if (recipeIngredient.unit !== ingredient.unit) {
  if (recipeIngredient.unit === 'cups' && ingredient.unit === 'kilograms') {
    quantityToDeduct = recipeIngredient.quantity * 0.125; // Approximate conversion
  } else if (recipeIngredient.unit === 'cup' && ingredient.unit === 'pounds') {
    quantityToDeduct = recipeIngredient.quantity * 0.5; // Approximate conversion
  }
}
```
- Handles unit conversions between recipe requirements and inventory units
- Supports basic conversions (cups to kilograms, cups to pounds)
- Extensible for additional unit conversions

#### 5. Stock Validation
```typescript
if (ingredient.stockQty < quantityToDeduct) {
  return {
    success: false,
    error: `Insufficient stock for ${ingredient.name}. Required: ${quantityToDeduct} ${ingredient.unit}, Available: ${ingredient.stockQty} ${ingredient.unit}`,
    deductedIngredients: [],
    lowStockAlerts: []
  };
}
```
- Checks if sufficient stock is available before deduction
- Returns detailed error message if stock is insufficient

#### 6. Inventory Deduction
```typescript
ingredient.stockQty -= quantityToDeduct;
ingredient.updatedAt = new Date().toISOString();
```
- Deducts the calculated quantity from inventory
- Updates the ingredient's timestamp

#### 7. Low Stock Detection
```typescript
if (ingredient.stockQty <= ingredient.lowStockThreshold) {
  const existingAlert = lowStockAlerts.find(alert => alert.ingredientId === ingredient.id);
  if (!existingAlert) {
    lowStockAlerts.push({
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      currentStock: ingredient.stockQty,
      lowStockThreshold: ingredient.lowStockThreshold,
      unit: ingredient.unit,
      supplier: ingredient.supplier
    });
  }
}
```
- Checks if stock falls below the low stock threshold
- Adds to low stock alerts list (prevents duplicates)

## API Endpoints

### POST `/api/inventory/deduct`
**Purpose**: Deduct inventory for sold products

**Request Body**:
```json
{
  "productId": "product-1",
  "quantitySold": 2
}
```

**Response (Success)**:
```json
{
  "message": "Successfully deducted inventory for 2 units of product",
  "recipeName": "Chocolate Chip Cookies",
  "deductedIngredients": [
    {
      "ingredientId": "1",
      "ingredientName": "Organic Flour",
      "quantityDeducted": 0.625,
      "unit": "kilograms",
      "remainingStock": 24.375
    },
    {
      "ingredientId": "2",
      "ingredientName": "Fresh Eggs",
      "quantityDeducted": 4,
      "unit": "pieces",
      "remainingStock": 44
    }
  ],
  "lowStockAlerts": [
    {
      "ingredientId": "3",
      "ingredientName": "Vanilla Extract",
      "currentStock": 3,
      "lowStockThreshold": 5,
      "unit": "bottles",
      "supplier": "Spice World"
    }
  ]
}
```

**Response (Error)**:
```json
{
  "message": "Insufficient stock for Organic Flour. Required: 0.625 kilograms, Available: 0.5 kilograms",
  "deductedIngredients": [],
  "lowStockAlerts": []
}
```

### GET `/api/inventory/status`
**Purpose**: Get current inventory status and low stock alerts

**Response**:
```json
{
  "message": "Inventory status retrieved successfully",
  "totalIngredients": 5,
  "lowStockCount": 2,
  "inventoryStatus": [
    {
      "id": "1",
      "name": "Organic Flour",
      "currentStock": 24.375,
      "lowStockThreshold": 5.0,
      "unit": "kilograms",
      "isLowStock": false,
      "supplier": "Local Market"
    }
  ],
  "lowStockItems": [
    {
      "id": "3",
      "name": "Vanilla Extract",
      "currentStock": 3,
      "lowStockThreshold": 5,
      "unit": "bottles",
      "isLowStock": true,
      "supplier": "Spice World"
    }
  ]
}
```

### GET `/api/inventory/recipes`
**Purpose**: Get all recipes with their linked products and current inventory levels

**Response**:
```json
{
  "message": "Recipes with inventory information retrieved successfully",
  "recipes": [
    {
      "id": "1",
      "name": "Chocolate Chip Cookies",
      "productId": "product-1",
      "yield": 24,
      "yieldUnit": "cookies",
      "ingredients": [
        {
          "ingredientId": "1",
          "ingredientName": "Organic Flour",
          "quantity": 2.5,
          "unit": "cups",
          "currentStock": 24.375,
          "lowStockThreshold": 5.0
        }
      ]
    }
  ]
}
```

## Data Models

### Ingredient Model (Enhanced)
```typescript
interface Ingredient {
  id: string;
  name: string;
  description?: string;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  stockQty: number;           // Current stock quantity
  lowStockThreshold: number;  // Threshold for low stock alerts
  isAvailable: boolean;
  vendorProfileId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Recipe Model
```typescript
interface Recipe {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  yield: number;
  yieldUnit: string;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  isActive: boolean;
  vendorProfileId: string;
  productId?: string;         // Links recipe to product
  createdAt: string;
  updatedAt: string;
}
```

### Recipe Ingredient Model
```typescript
interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Validation

### Request Validation
```typescript
const deductInventorySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantitySold: z.number().min(1, 'Quantity sold must be at least 1')
});
```

### Business Logic Validation
- **Product Existence**: Validates that the product ID exists
- **Recipe Link**: Ensures the product has a linked recipe
- **Ingredient Availability**: Checks that all required ingredients exist
- **Stock Sufficiency**: Validates sufficient stock before deduction
- **Positive Quantities**: Ensures all quantities are positive

## Error Handling

### Common Error Scenarios

#### 1. No Recipe Found
```json
{
  "message": "No recipe found for this product",
  "deductedIngredients": [],
  "lowStockAlerts": []
}
```

#### 2. No Ingredients Found
```json
{
  "message": "No ingredients found for this recipe",
  "deductedIngredients": [],
  "lowStockAlerts": []
}
```

#### 3. Insufficient Stock
```json
{
  "message": "Insufficient stock for Organic Flour. Required: 0.625 kilograms, Available: 0.5 kilograms",
  "deductedIngredients": [],
  "lowStockAlerts": []
}
```

#### 4. Validation Errors
```json
{
  "message": "Validation error",
  "errors": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "number",
      "inclusive": true,
      "exact": false,
      "message": "Quantity sold must be at least 1",
      "path": ["quantitySold"]
    }
  ]
}
```

## Unit Conversion System

### Current Conversions
- **Cups to Kilograms**: 1 cup ≈ 0.125 kg (flour)
- **Cups to Pounds**: 1 cup ≈ 0.5 lbs (butter)

### Extending Conversions
To add new unit conversions, extend the conversion logic:

```typescript
if (recipeIngredient.unit !== ingredient.unit) {
  // Add new conversions here
  if (recipeIngredient.unit === 'tablespoons' && ingredient.unit === 'milliliters') {
    quantityToDeduct = recipeIngredient.quantity * 14.79; // 1 tbsp = 14.79 ml
  } else if (recipeIngredient.unit === 'teaspoons' && ingredient.unit === 'milliliters') {
    quantityToDeduct = recipeIngredient.quantity * 4.93; // 1 tsp = 4.93 ml
  }
  // ... existing conversions
}
```

## Testing

### Test Scenarios

#### 1. Successful Deduction
- **Input**: `productId: "product-1", quantitySold: 1`
- **Expected**: Successful deduction with updated stock levels
- **Validation**: Check deducted ingredients and remaining stock

#### 2. Multiple Quantity Deduction
- **Input**: `productId: "product-1", quantitySold: 3`
- **Expected**: Deducts ingredients for 3 batches
- **Validation**: Verify proportional deduction

#### 3. Low Stock Alert
- **Input**: Deduct inventory that brings stock below threshold
- **Expected**: Low stock alert in response
- **Validation**: Check alert details and threshold comparison

#### 4. Insufficient Stock
- **Input**: `quantitySold: 50` (exceeds available stock)
- **Expected**: Error with insufficient stock message
- **Validation**: Verify error message and no deduction

#### 5. Invalid Product ID
- **Input**: `productId: "invalid-id"`
- **Expected**: Error indicating no recipe found
- **Validation**: Check error message

#### 6. Validation Errors
- **Input**: `quantitySold: 0` or `productId: ""`
- **Expected**: Validation error with field details
- **Validation**: Check validation error structure

### Test Script
**File**: `test-inventory-deduction.ps1`

**Coverage**:
1. Get current inventory status
2. Get recipes with inventory information
3. Test successful inventory deduction
4. Test multiple quantity deduction
5. Test different recipe types
6. Test invalid product ID
7. Test validation errors
8. Verify inventory status updates
9. Test insufficient stock scenarios

## Integration Points

### Product Management
- **Product-Recipe Linking**: Products must be linked to recipes for inventory deduction
- **Product Sales**: Inventory deduction is triggered when products are sold

### Recipe Management
- **Ingredient Requirements**: Recipes define the ingredient quantities needed
- **Yield Information**: Recipe yield determines batch size

### Inventory Management
- **Stock Tracking**: Real-time stock level updates
- **Low Stock Alerts**: Automatic alerts when stock falls below threshold
- **Supplier Information**: Supplier details for reordering

## Performance Considerations

### Optimization Strategies
- **Batch Processing**: Process multiple units efficiently
- **Minimal Database Queries**: Reduce database calls in production
- **Caching**: Cache frequently accessed recipe and ingredient data
- **Transaction Management**: Ensure data consistency in production

### Scalability
- **Database Indexing**: Index on `productId`, `recipeId`, `ingredientId`
- **Connection Pooling**: Efficient database connection management
- **Async Processing**: Consider async processing for high-volume scenarios

## Security Considerations

### Input Validation
- **Zod Schemas**: Comprehensive input validation
- **Business Logic Validation**: Additional validation for business rules
- **SQL Injection Prevention**: Parameterized queries in production

### Authorization
- **Vendor Isolation**: Ensure vendors can only access their own inventory
- **Role-Based Access**: Restrict access to appropriate user roles
- **Audit Logging**: Log all inventory deductions for audit purposes

## Future Enhancements

### Planned Features
- **Advanced Unit Conversions**: More sophisticated unit conversion system
- **Batch Optimization**: Optimize ingredient usage across multiple recipes
- **Supplier Integration**: Automatic reorder notifications
- **Inventory Forecasting**: Predict inventory needs based on sales patterns
- **Waste Tracking**: Track ingredient waste and spoilage
- **Cost Analysis**: Calculate cost impact of inventory deductions

### Technical Improvements
- **Database Integration**: Replace mock data with real database
- **Real-time Updates**: WebSocket integration for real-time inventory updates
- **Bulk Operations**: Support for bulk inventory deductions
- **API Versioning**: Proper API versioning for production
- **Rate Limiting**: API rate limiting for high-volume scenarios
- **Caching**: Redis caching for performance optimization

## Troubleshooting

### Common Issues

#### 1. Unit Conversion Errors
- **Problem**: Incorrect unit conversions leading to wrong deductions
- **Solution**: Verify conversion factors and add missing conversions
- **Debug**: Check recipe ingredient units vs. inventory units

#### 2. Insufficient Stock Errors
- **Problem**: Products can't be sold due to insufficient ingredients
- **Solution**: Check current stock levels and reorder if necessary
- **Debug**: Verify ingredient quantities and thresholds

#### 3. Missing Recipe Links
- **Problem**: Products without linked recipes can't be sold
- **Solution**: Ensure all products have associated recipes
- **Debug**: Check product-recipe relationships

#### 4. Low Stock Alert Issues
- **Problem**: Low stock alerts not triggering correctly
- **Solution**: Verify threshold values and comparison logic
- **Debug**: Check ingredient threshold settings

### Debug Steps
1. Check current inventory status via `/api/inventory/status`
2. Verify recipe-product links via `/api/inventory/recipes`
3. Test deduction with small quantities first
4. Review error messages for specific issues
5. Check unit conversion factors
6. Verify stock threshold settings

## Conclusion

The Inventory Deduction feature provides a robust, automated system for managing ingredient stock levels when products are sold. It includes comprehensive validation, error handling, and low stock alerts to ensure smooth operations.

The implementation follows best practices for API design, data validation, and error handling, providing a solid foundation for production deployment and future enhancements. 