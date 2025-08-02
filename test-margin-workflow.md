# Margin Management Workflow Test Guide

## Overview
This guide walks through testing the complete margin management workflow:
1. Link a product to a recipe
2. Set recipe ingredients + costs
3. Set product price + target margin
4. Fetch margin analysis and verify results
5. Test UI display

## Prerequisites
- Server running on localhost:3001
- Client running on localhost:5173
- Database with test data

## Step 1: Login as Vendor
1. Open http://localhost:5173 in browser
2. Login with test credentials:
   - Email: `vendor@cravedartisan.com`
   - Password: `vendor123`

## Step 2: Create Ingredients with Costs
Navigate to Ingredients page and create:
- **Flour**: $2.50/kg
- **Sugar**: $3.00/kg  
- **Eggs**: $0.50/each
- **Butter**: $4.00/kg
- **Vanilla Extract**: $15.00/bottle

## Step 3: Create a Recipe
Navigate to Recipes page and create:
- **Name**: "Classic Chocolate Chip Cookies"
- **Description**: "Delicious homemade chocolate chip cookies"
- **Yield**: 24 cookies
- **Instructions**: "1. Mix dry ingredients\n2. Cream butter and sugar\n3. Add eggs and vanilla\n4. Combine and bake"

## Step 4: Add Ingredients to Recipe
Add the following ingredients to the recipe:
- Flour: 2.5kg
- Sugar: 1.0kg
- Eggs: 4 each
- Butter: 0.5kg
- Vanilla: 1 bottle

**Total Recipe Cost**: (2.5 × $2.50) + (1.0 × $3.00) + (4 × $0.50) + (0.5 × $4.00) + (1 × $15.00) = $6.25 + $3.00 + $2.00 + $2.00 + $15.00 = $28.25

**Unit Cost**: $28.25 ÷ 24 cookies = $1.18 per cookie

## Step 5: Create Product Linked to Recipe
Navigate to Products page and create:
- **Name**: "Artisan Chocolate Chip Cookies"
- **Description**: "Handcrafted chocolate chip cookies made with premium ingredients"
- **Price**: $12.99 (for a dozen)
- **Target Margin**: 40%
- **Recipe ID**: [Select the recipe created in Step 3]

## Step 6: Test Margin Calculation
1. Edit the product
2. Click "Calculate Margin" button
3. Verify the results:

**Expected Results**:
- **Unit Cost**: $1.18
- **Current Price**: $12.99 (for 12 cookies = $1.08 per cookie)
- **Current Margin**: (($1.08 - $1.18) / $1.08) × 100 = -9.26% (selling at a loss!)
- **Status**: "danger" (red)
- **Suggested Price**: $1.18 ÷ (1 - 0.40) = $1.97 per cookie = $23.64 per dozen

## Step 7: Update Product Price
Update the product price to $23.64 per dozen to achieve the 40% target margin.

## Step 8: Verify Updated Margin
1. Click "Calculate Margin" again
2. Verify new results:
- **Current Price**: $23.64 (for 12 cookies = $1.97 per cookie)
- **Current Margin**: (($1.97 - $1.18) / $1.97) × 100 = 40.1%
- **Status**: "safe" (green)

## Step 9: Test Dashboard Features
1. Go to Vendor Dashboard
2. Check for margin alerts
3. Verify low-margin product detection
4. Test batch pricing management

## Step 10: Test API Endpoints
Test the following API endpoints:

### Get Low Margin Products
```bash
GET /api/vendor/products/low-margin
```

### Get Ingredient Price Alerts
```bash
GET /api/vendor/products/ingredient-price-alerts
```

### Calculate Product Margin
```bash
GET /api/vendor/products/{productId}/margin
```

### Batch Update Pricing
```bash
POST /api/vendor/products/batch-update-pricing
{
  "targetMargin": 40,
  "productIds": ["product-id-1", "product-id-2"]
}
```

## Expected API Response for Margin Calculation
```json
{
  "product": {
    "id": "product-id",
    "name": "Artisan Chocolate Chip Cookies",
    "currentPrice": 23.64,
    "targetMargin": 40
  },
  "costAnalysis": {
    "unitCost": 1.18,
    "recipeYield": 24,
    "hasRecipe": true
  },
  "marginAnalysis": {
    "currentMargin": 40.1,
    "status": "safe",
    "suggestedPrice": 1.97
  }
}
```

## UI Verification Checklist
- [ ] Product edit form shows Target Margin field
- [ ] Product edit form shows Recipe ID field
- [ ] Margin Analysis section appears when editing
- [ ] "Calculate Margin" button works
- [ ] Current margin shows with color coding (red/yellow/green)
- [ ] Suggested price displays when target margin is set
- [ ] Dashboard shows low-margin alerts
- [ ] Dashboard shows ingredient price alerts
- [ ] Batch pricing management page accessible
- [ ] Product list shows margin status indicators

## Troubleshooting
1. **Route not found errors**: Check if server is using mock vs real routes
2. **Authentication errors**: Verify session is maintained
3. **Database errors**: Check if migrations are applied
4. **Calculation errors**: Verify ingredient costs and quantities
5. **UI not updating**: Check React Query cache invalidation

## Success Criteria
- [ ] Product successfully linked to recipe
- [ ] Margin calculations are accurate
- [ ] UI displays margin information correctly
- [ ] Dashboard alerts work properly
- [ ] Batch pricing updates function correctly
- [ ] All API endpoints return expected data 