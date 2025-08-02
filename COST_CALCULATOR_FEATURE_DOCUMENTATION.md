# Recipe Cost Calculator Feature Documentation

## 🎯 Overview

The Recipe Cost Calculator provides vendors with real-time cost analysis and margin calculations for their recipes. It automatically calculates per-batch and per-unit costs, compares them against linked product prices, and provides visual feedback on profitability through color-coded margin indicators.

## ✨ Key Features

### 1. Real-Time Cost Calculation
- **Total Ingredient Cost:** Sum of all ingredient costs based on quantities
- **Per-Batch Cost:** Total cost for one complete recipe batch
- **Per-Unit Cost:** Cost per individual unit (cookie, serving, etc.)
- **Automatic Updates:** Calculations update instantly when ingredients or yield change

### 2. Margin Analysis
- **Product Linking:** Connect recipes to products for price comparison
- **Margin Calculation:** Revenue minus cost per unit
- **Margin Percentage:** Profit margin as percentage of selling price
- **Visual Indicators:** Color-coded margin status

### 3. Color-Coded Margin System
- **🔴 Red (< 20%):** Low margin - consider price increases or cost reduction
- **🟡 Yellow (20-35%):** Moderate margin - acceptable but could be improved
- **🟢 Green (35%+):** Good margin - excellent profitability

### 4. Ingredient Breakdown
- **Individual Costs:** Cost per ingredient with quantity and unit price
- **Percentage of Total:** Each ingredient's contribution to total cost
- **Notes Support:** Optional notes for ingredient-specific details

## 🏗️ Technical Implementation

### Frontend Components

#### RecipeCostCalculator
**Location:** `client/src/components/RecipeCostCalculator.tsx`

**Key Features:**
- React useMemo for efficient calculations
- Real-time cost updates
- Responsive design
- TypeScript interfaces for type safety

**Props Interface:**
```typescript
interface RecipeCostCalculatorProps {
  ingredients: Ingredient[];
  yield: number;
  yieldUnit: string;
  linkedProduct?: Product | null;
  className?: string;
}
```

#### VendorRecipeEditPage
**Location:** `client/src/pages/VendorRecipeEditPage.tsx`

**Integration:**
- Embeds cost calculator in recipe edit interface
- Real-time form watching for calculations
- Product linking functionality
- Ingredient management with cost tracking

### Calculation Logic

#### Cost Calculations
```typescript
// Total ingredient cost
const totalIngredientCost = ingredients.reduce((total, ingredient) => {
  return total + (ingredient.quantity * ingredient.costPerUnit);
}, 0);

// Per-batch cost (same as total ingredient cost)
const perBatchCost = totalIngredientCost;

// Per-unit cost
const perUnitCost = yield > 0 ? perBatchCost / yield : 0;
```

#### Margin Calculations
```typescript
// Margin calculation
const revenue = linkedProduct.price;
const margin = revenue - perUnitCost;
const marginPercentage = revenue > 0 ? (margin / revenue) * 100 : 0;

// Color coding
if (marginPercentage < 20) {
  marginColor = 'red';
  marginLabel = 'Low Margin';
} else if (marginPercentage < 35) {
  marginColor = 'yellow';
  marginLabel = 'Moderate Margin';
} else {
  marginColor = 'green';
  marginLabel = 'Good Margin';
}
```

## 🎨 User Interface Design

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Cost Calculator Header                                  │
├─────────────────────────────────────────────────────────┤
│ Cost Breakdown Cards                                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ Total Cost  │ │ Per Batch   │ │ Per Unit    │        │
│ │ $29.25      │ │ $29.25      │ │ $1.22       │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
├─────────────────────────────────────────────────────────┤
│ Margin Analysis                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Linked Product: Chocolate Chip Cookies - $12.99    │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Cost │ Margin │ Margin % (Color-coded)             │ │
│ │ $1.22│ $11.77 │ 90.6% 🟢 Good Margin               │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Ingredient Breakdown                                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Flour: 2.5kg @ $3.50 = $8.75 (29.9%)              │ │
│ │ Sugar: 1.0kg @ $2.25 = $2.25 (7.7%)               │ │
│ │ Butter: 0.5kg @ $8.75 = $4.38 (15.0%)             │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Visual Design Elements

#### Color Scheme
- **Primary Blue:** `#2563eb` (cost breakdown cards)
- **Success Green:** `#16a34a` (good margins)
- **Warning Yellow:** `#ca8a04` (moderate margins)
- **Danger Red:** `#dc2626` (low margins)
- **Purple:** `#9333ea` (per-unit cost)

#### Typography
- **Headers:** Inter, semibold, large sizes
- **Cost Values:** Inter, bold, prominent display
- **Labels:** Inter, medium, secondary text
- **Percentages:** Inter, medium, tabular numbers

#### Interactive Elements
- **Hover States:** Subtle background changes
- **Focus States:** Blue ring indicators
- **Loading States:** Skeleton animations
- **Error States:** Red borders and messages

## 📊 Data Flow

### 1. Component Initialization
```
RecipeCostCalculator mounts
↓
Props received (ingredients, yield, linkedProduct)
↓
useMemo calculates costs and margins
↓
Component renders with calculations
```

### 2. Real-Time Updates
```
User changes ingredient quantity
↓
Parent component updates ingredients prop
↓
useMemo recalculates automatically
↓
Component re-renders with new values
```

### 3. Product Linking
```
User selects linked product
↓
linkedProduct prop updates
↓
Margin calculations triggered
↓
Color coding updated
```

## 🔧 Configuration

### Environment Variables
No additional environment variables required.

### Dependencies
```json
{
  "@tanstack/react-query": "^5.0.0",
  "react-hook-form": "^7.48.0",
  "lucide-react": "^0.294.0"
}
```

### Route Configuration
```typescript
// App.tsx
<Route path="/dashboard/vendor/recipes/:recipeId/edit">
  <ProtectedRoute role="VENDOR">
    <VendorRecipeEditPage />
  </ProtectedRoute>
</Route>
```

## 🧪 Testing

### Automated Testing
**Test Script:** `test-cost-calculator.ps1`

**Test Coverage:**
1. **Server Connectivity:** Verify API server is running
2. **Data Creation:** Create test ingredients and products
3. **Recipe Creation:** Create test recipe with ingredients
4. **Cost Calculations:** Verify mathematical accuracy
5. **Margin Analysis:** Test margin calculations and color coding
6. **API Integration:** Test data retrieval and updates

### Manual Testing Checklist
- [ ] Navigate to recipe edit page
- [ ] Verify cost calculator displays correctly
- [ ] Test ingredient quantity changes
- [ ] Verify cost updates in real-time
- [ ] Test product linking functionality
- [ ] Check margin color coding
- [ ] Verify responsive design
- [ ] Test error states

### Example Test Scenario
```
Test Recipe: Chocolate Chip Cookies
Yield: 24 cookies
Ingredients:
- Flour: 2.5kg @ $3.50/kg = $8.75
- Sugar: 1.0kg @ $2.25/kg = $2.25
- Butter: 0.5kg @ $8.75/kg = $4.38
- Eggs: 2 dozen @ $4.50/dozen = $9.00
- Vanilla: 30ml @ $0.15/ml = $4.50

Total Cost: $28.88
Per Unit Cost: $1.20
Linked Product Price: $12.99
Margin: $11.79
Margin %: 90.8% (Green - Good Margin)
```

## 🚀 Performance Considerations

### Optimization Strategies
1. **useMemo Hook:** Prevents unnecessary recalculations
2. **Efficient Rendering:** Only re-renders when props change
3. **Lazy Loading:** Loads component only when needed
4. **Debounced Updates:** Prevents excessive calculations during rapid changes

### Bundle Size Impact
- **Component Size:** ~8KB (minified)
- **Dependencies:** ~2KB additional
- **Total Impact:** ~10KB

## 🔒 Security

### Data Validation
- **Input Validation:** TypeScript interfaces ensure data integrity
- **Calculation Safety:** Division by zero protection
- **Price Validation:** Ensures positive values
- **Type Safety:** Full TypeScript implementation

### Access Control
- **Route Protection:** VENDOR role required
- **Data Isolation:** Vendor-specific data only
- **API Protection:** Session-based authentication

## 📈 Business Intelligence

### Key Metrics
- **Cost Tracking:** Monitor ingredient cost changes
- **Margin Analysis:** Track profitability trends
- **Product Performance:** Compare recipe costs to selling prices
- **Ingredient Impact:** Identify high-cost ingredients

### Decision Support
- **Pricing Strategy:** Make informed pricing decisions
- **Cost Optimization:** Identify cost reduction opportunities
- **Product Development:** Evaluate recipe profitability
- **Supplier Management:** Track ingredient cost changes

## 🔄 Future Enhancements

### Planned Features
1. **Historical Cost Tracking:** Track cost changes over time
2. **Bulk Cost Analysis:** Compare multiple recipes
3. **Cost Forecasting:** Predict future costs based on trends
4. **Supplier Integration:** Real-time ingredient pricing
5. **Profit Optimization:** Suggest optimal pricing strategies
6. **Export Functionality:** Export cost reports to PDF/CSV

### Technical Improvements
1. **Advanced Caching:** Redis for better performance
2. **Real-time Updates:** WebSocket for live cost updates
3. **Offline Support:** Service worker for offline calculations
4. **Advanced Analytics:** Machine learning for cost prediction

## 📚 Usage Examples

### Basic Integration
```typescript
import RecipeCostCalculator from '../components/RecipeCostCalculator';

<RecipeCostCalculator
  ingredients={recipeIngredients}
  yield={24}
  yieldUnit="cookies"
  linkedProduct={selectedProduct}
/>
```

### Custom Styling
```typescript
<RecipeCostCalculator
  ingredients={ingredients}
  yield={yield}
  yieldUnit={yieldUnit}
  linkedProduct={product}
  className="my-custom-class"
/>
```

### Dynamic Updates
```typescript
const [ingredients, setIngredients] = useState([]);
const [yield, setYield] = useState(24);

// Updates automatically when ingredients or yield change
<RecipeCostCalculator
  ingredients={ingredients}
  yield={yield}
  yieldUnit="cookies"
  linkedProduct={product}
/>
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Calculations Not Updating
**Symptoms:** Cost values remain static
**Causes:** Props not updating, useMemo dependencies missing
**Solutions:** Check prop updates, verify useMemo dependencies

#### 2. Margin Color Not Showing
**Symptoms:** No color coding on margins
**Causes:** No linked product, calculation errors
**Solutions:** Link a product, check calculation logic

#### 3. Division by Zero Errors
**Symptoms:** NaN values in calculations
**Causes:** Yield value of 0
**Solutions:** Ensure yield is always positive

### Debug Information
```typescript
// Enable debug logging
console.log('Ingredients:', ingredients);
console.log('Yield:', yield);
console.log('Linked Product:', linkedProduct);
console.log('Calculations:', calculations);
```

## 📞 Support

### Getting Help
1. **Documentation:** Check this documentation first
2. **Code Comments:** Review inline code comments
3. **Test Scripts:** Run automated tests
4. **Browser Console:** Check for JavaScript errors
5. **Network Tab:** Verify API requests/responses

### Reporting Issues
When reporting issues, please include:
- **Browser:** Version and type
- **Steps:** Detailed reproduction steps
- **Expected:** What should happen
- **Actual:** What actually happens
- **Console:** Any error messages
- **Data:** Sample ingredient and product data

---

*Documentation Version: 1.0*  
*Last Updated: August 2, 2025*  
*Maintained by: Development Team* 