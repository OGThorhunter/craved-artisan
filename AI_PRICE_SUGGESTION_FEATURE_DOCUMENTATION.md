# AI Price Suggestion Feature Documentation

## Overview

The AI Price Suggestion feature provides intelligent pricing recommendations for products based on cost analysis, market volatility detection, and historical trends. This feature helps vendors optimize their pricing strategy while maintaining profitability.

## Key Components

### 1. `suggestAiPrice` Function

**Location**: `server/src/routes/vendor-products.ts`

**Purpose**: Core algorithm that calculates suggested prices and detects market volatility.

**Parameters**:
- `unitCost: number` - The calculated unit cost from recipe ingredients
- `history: PriceHistory[]` - Historical price and cost data
- `targetMargin: number` - Target profit margin percentage

**Returns**: `AiSuggestionResult` object containing:
- `suggestedPrice: number` - AI-recommended price
- `note: string` - Explanation of the suggestion
- `volatilityDetected: boolean` - Whether market volatility was detected
- `confidence: number` - Confidence level (0.0 to 1.0)

### 2. API Endpoint

**Endpoint**: `GET /api/vendor/products/:id/ai-suggestion`

**Authentication**: Requires vendor authentication

**Response Format**:
```json
{
  "product": {
    "id": "string",
    "name": "string",
    "currentPrice": number,
    "targetMargin": number
  },
  "costAnalysis": {
    "unitCost": number,
    "hasRecipe": boolean
  },
  "aiSuggestion": {
    "suggestedPrice": number,
    "note": "string",
    "volatilityDetected": boolean,
    "confidence": number,
    "priceDifference": number,
    "percentageChange": number
  }
}
```

## Algorithm Details

### 1. Volatility Detection

The algorithm calculates two types of volatility:

**Price Volatility**:
- Calculates coefficient of variation (CV) for historical prices
- CV > 0.15 indicates high volatility
- Uses standard deviation and mean price

**Cost Volatility**:
- Calculates CV for historical unit costs
- CV > 0.10 indicates high cost volatility
- Helps adjust for ingredient price fluctuations

### 2. Trend Analysis

Uses simple linear regression to detect price trends:
- **Increasing trend**: Suggests 2% price increase
- **Decreasing trend**: Suggests 2% price decrease
- **Stable trend**: No adjustment

### 3. Pricing Strategy

The algorithm uses different strategies based on market conditions:

**High Volatility (CV > 0.15)**:
- Conservative pricing with volatility adjustment
- Adjustment factor: `1 + (CV * 0.1)`
- Confidence: 0.7

**High Cost Volatility (CV > 0.10)**:
- Cost uncertainty adjustment
- Adjustment factor: `1 + (CV * 0.05)`
- Confidence: 0.8

**Stable Conditions**:
- Trend-adjusted pricing
- Uses detected trend direction
- Confidence: 0.9

### 4. Margin Protection

- Ensures minimum margin of 80% of target margin
- Prevents selling at unsustainable prices
- Adjusts suggested price if below minimum threshold

## Database Integration

### Product Model Updates

The Product model includes new fields for AI suggestions:

```prisma
model Product {
  // ... existing fields ...
  onWatchlist Boolean @default(false)
  lastAiSuggestion Float?
  aiSuggestionNote String?
  // ... relations ...
}
```

### Automatic Updates

When the AI suggestion endpoint is called:
1. Calculates unit cost from linked recipe
2. Generates AI suggestion using `suggestAiPrice`
3. Updates product with:
   - `lastAiSuggestion`: The suggested price
   - `aiSuggestionNote`: The explanation note

## Usage Examples

### Basic Usage

```typescript
// Call the AI suggestion endpoint
const response = await fetch('/api/vendor/products/product-id/ai-suggestion');
const result = await response.json();

console.log('Suggested Price:', result.aiSuggestion.suggestedPrice);
console.log('Note:', result.aiSuggestion.note);
console.log('Volatility:', result.aiSuggestion.volatilityDetected);
```

### Integration with Product Management

```typescript
// Get AI suggestion and apply it
const aiResponse = await fetch(`/api/vendor/products/${productId}/ai-suggestion`);
const aiResult = await aiResponse.json();

if (aiResult.aiSuggestion.confidence > 0.8) {
  // Apply the suggestion
  await updateProductPrice(productId, aiResult.aiSuggestion.suggestedPrice);
}
```

## Testing

### Test Script

Use `test-ai-suggestion.ps1` to test the feature:

```powershell
.\test-ai-suggestion.ps1
```

### Manual Testing

1. Ensure server is running: `cd server && npm run dev:mock`
2. Create a product with a linked recipe
3. Set target margin on the product
4. Call the AI suggestion endpoint
5. Verify the response contains valid suggestions

## Future Enhancements

### 1. Price History Table

Currently uses mock history. Future implementation could include:
- `PriceHistory` table to store historical data
- Automatic price tracking
- More sophisticated trend analysis

### 2. Machine Learning Integration

Potential enhancements:
- Neural network models for price prediction
- Market data integration
- Competitor price analysis
- Seasonal adjustment factors

### 3. Advanced Analytics

Additional features:
- Price elasticity analysis
- Demand forecasting
- Optimal pricing windows
- A/B testing framework

## Error Handling

### Common Error Scenarios

1. **No Recipe Data**: Returns 400 error if product has no linked recipe
2. **Zero Unit Cost**: Returns 400 error if recipe has no ingredients
3. **Invalid Product ID**: Returns 404 error for non-existent products
4. **Unauthorized Access**: Returns 401 error for non-vendor users

### Error Response Format

```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

## Performance Considerations

- Algorithm complexity: O(n) where n is history length
- Database queries optimized with includes
- Caching could be implemented for frequently accessed products
- Batch processing for multiple products

## Security

- Requires vendor authentication
- Validates product ownership
- Sanitizes all inputs
- Rate limiting recommended for production

## Monitoring and Logging

- All AI suggestions are logged
- Confidence levels tracked
- Volatility detection events logged
- Performance metrics collected

This feature provides vendors with intelligent pricing recommendations while maintaining data security and system performance. 