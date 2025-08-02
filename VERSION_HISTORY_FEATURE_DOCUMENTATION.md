# Recipe Version History Feature Documentation

## 🎯 Overview

The Recipe Version History feature provides vendors with a comprehensive view of their recipe evolution over time, including cost tracking, ingredient changes, and the ability to rollback to previous versions.

## ✨ Key Features

### 1. Version List View
- **Sidebar Navigation:** Displays all recipe versions in chronological order
- **Version Information:** Shows version number, creation date, yield, and total cost
- **Latest Indicator:** Highlights the most recent version
- **Interactive Selection:** Click to view detailed version information

### 2. Detailed Version View
- **Recipe Metadata:** Name, description, instructions, yield, timing, difficulty
- **Cost Summary:** Total recipe cost prominently displayed
- **Ingredient Table:** Complete ingredient breakdown with quantities and costs
- **Price Change Indicators:** Visual indicators for ingredient price changes

### 3. Price Change Tracking
- **Comparison Logic:** Compares current version with previous version
- **Visual Indicators:** 
  - 🔴 Red arrow up for price increases
  - 🟢 Green arrow down for price decreases
- **Change Details:** Shows absolute and percentage price changes
- **Historical Context:** Maintains price history across versions

### 4. Rollback Functionality
- **One-Click Rollback:** Load any previous version into the editor
- **Safe Operation:** Creates a new version rather than overwriting
- **User Feedback:** Toast notifications for successful rollback
- **Navigation:** Automatically redirects to recipe editor

## 🏗️ Technical Implementation

### Frontend Components

#### RecipeVersionHistoryPage
**Location:** `client/src/pages/RecipeVersionHistoryPage.tsx`

**Key Features:**
- React Query for data fetching and caching
- Responsive grid layout (1/3 sidebar, 2/3 details)
- Real-time price comparison calculations
- Interactive version selection
- Error handling and loading states

**State Management:**
```typescript
const [selectedVersion, setSelectedVersion] = useState<RecipeVersion | null>(null);
const [comparisonData, setComparisonData] = useState<VersionComparison[]>([]);
```

#### ViewVersionHistoryButton
**Location:** `client/src/components/ViewVersionHistoryButton.tsx`

**Features:**
- Reusable navigation component
- Multiple styling variants (primary, secondary, outline)
- Different sizes (sm, md, lg)
- Consistent iconography

### Backend API Endpoints

#### GET /api/vendor/recipes/:id/versions
**Purpose:** Retrieve all versions of a recipe

**Response:**
```json
{
  "message": "Found 3 versions for recipe",
  "versions": [
    {
      "id": "uuid",
      "version": 3,
      "name": "Chocolate Chip Cookies",
      "totalCost": 15.75,
      "createdAt": "2025-08-02T05:30:00.000Z",
      "ingredients": [...]
    }
  ]
}
```

#### GET /api/vendor/recipes/:id/versions/:version
**Purpose:** Retrieve a specific version

**Response:**
```json
{
  "recipeVersion": {
    "id": "uuid",
    "version": 2,
    "name": "Chocolate Chip Cookies",
    "description": "Classic recipe",
    "instructions": "1. Mix ingredients...",
    "yield": 24,
    "yieldUnit": "cookies",
    "totalCost": 14.50,
    "ingredients": [
      {
        "id": "uuid",
        "quantity": 2.5,
        "unit": "cups",
        "pricePerUnit": 3.50,
        "totalCost": 8.75,
        "ingredient": {
          "id": "1",
          "name": "Organic Flour",
          "unit": "kilograms",
          "costPerUnit": 3.50
        }
      }
    ]
  }
}
```

## 🎨 User Interface Design

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: Back Button + Title + Description              │
├─────────────────────────────────────────────────────────┤
│ Sidebar (1/3)        │ Version Details (2/3)          │
│ ┌─────────────────┐  │ ┌─────────────────────────────┐ │
│ │ Version List    │  │ │ Version Header              │ │
│ │ • Version 3     │  │ │ • Name & Version            │ │
│ │ • Version 2     │  │ │ • Total Cost + Rollback     │ │
│ │ • Version 1     │  │ ├─────────────────────────────┤ │
│ └─────────────────┘  │ │ Recipe Info Cards           │ │
│                      │ │ • Yield • Prep • Cook       │ │
│                      │ ├─────────────────────────────┤ │
│                      │ │ Ingredients Table           │ │
│                      │ │ • Name • Qty • Price • Cost │ │
│                      │ │ • Price Change Indicators   │ │
│                      │ ├─────────────────────────────┤ │
│                      │ │ Instructions (if available) │ │
│                      │ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Visual Design Elements

#### Color Scheme
- **Primary Blue:** `#2563eb` (buttons, links)
- **Success Green:** `#16a34a` (price decreases)
- **Warning Red:** `#dc2626` (price increases)
- **Neutral Gray:** `#6b7280` (secondary text)

#### Typography
- **Headers:** Inter, semibold, large sizes
- **Body:** Inter, regular, readable sizes
- **Data:** Inter, medium, tabular numbers

#### Interactive Elements
- **Hover States:** Subtle background changes
- **Focus States:** Blue ring indicators
- **Loading States:** Skeleton animations
- **Error States:** Red borders and messages

## 📊 Data Flow

### 1. Page Load
```
User navigates to /dashboard/vendor/recipes/:id/versions
↓
React Query fetches versions data
↓
Component renders with loading state
↓
Data received, versions listed in sidebar
↓
First version selected by default
↓
Version details displayed in main area
```

### 2. Version Selection
```
User clicks on version in sidebar
↓
selectedVersion state updated
↓
useEffect triggers price comparison calculation
↓
comparisonData state updated
↓
Component re-renders with new version details
↓
Price change indicators updated
```

### 3. Rollback Process
```
User clicks "Rollback" button
↓
Mutation fetches specific version data
↓
Success callback executed
↓
Toast notification shown
↓
Navigation to recipe editor with version data
↓
Recipe editor pre-populated with version data
```

## 🔧 Configuration

### Environment Variables
No additional environment variables required.

### Dependencies
```json
{
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.6.0",
  "react-hot-toast": "^2.4.1",
  "lucide-react": "^0.294.0",
  "wouter": "^2.12.0"
}
```

### Route Configuration
```typescript
// App.tsx
<Route path="/dashboard/vendor/recipes/:recipeId/versions">
  <ProtectedRoute role="VENDOR">
    <RecipeVersionHistoryPage />
  </ProtectedRoute>
</Route>
```

## 🧪 Testing

### Automated Testing
**Test Script:** `test-version-history.ps1`

**Test Coverage:**
1. **Frontend Connectivity:** Verify React app is running
2. **Backend Connectivity:** Verify API server is running
3. **Data Creation:** Create test recipe with multiple versions
4. **API Testing:** Test version history endpoints
5. **Frontend Testing:** Test page accessibility

### Manual Testing Checklist
- [ ] Navigate to version history page
- [ ] Verify versions listed in sidebar
- [ ] Click different versions to view details
- [ ] Check price change indicators
- [ ] Test rollback functionality
- [ ] Verify responsive design
- [ ] Test error states
- [ ] Verify loading states

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🚀 Performance Considerations

### Optimization Strategies
1. **React Query Caching:** Reduces API calls
2. **Lazy Loading:** Load version details on demand
3. **Memoization:** Prevent unnecessary re-renders
4. **Virtual Scrolling:** For large version lists (future)

### Bundle Size Impact
- **Component Size:** ~15KB (minified)
- **Dependencies:** ~5KB additional
- **Total Impact:** ~20KB

## 🔒 Security

### Authentication
- **Route Protection:** VENDOR role required
- **API Protection:** Session-based authentication
- **Data Isolation:** Vendor-specific data only

### Data Validation
- **Input Validation:** Zod schemas on API
- **Output Sanitization:** XSS prevention
- **Type Safety:** TypeScript throughout

## 📈 Analytics & Monitoring

### Key Metrics
- **Page Views:** Version history page visits
- **Version Interactions:** Version selection frequency
- **Rollback Usage:** Rollback button clicks
- **Error Rates:** API failure rates

### Error Tracking
- **API Errors:** Network failures, 4xx/5xx responses
- **Client Errors:** JavaScript exceptions
- **User Feedback:** Toast error messages

## 🔄 Future Enhancements

### Planned Features
1. **Version Comparison:** Side-by-side version comparison
2. **Bulk Operations:** Rollback multiple recipes
3. **Export Functionality:** Export version history to PDF/CSV
4. **Advanced Filtering:** Filter by date, cost range, ingredients
5. **Version Comments:** Add notes to versions
6. **Automated Versioning:** Trigger versions on recipe updates

### Technical Improvements
1. **Real-time Updates:** WebSocket for live version updates
2. **Offline Support:** Service worker for offline viewing
3. **Advanced Caching:** Redis for better performance
4. **Search Functionality:** Full-text search across versions

## 📚 Usage Examples

### Basic Usage
```typescript
// Navigate to version history
setLocation(`/dashboard/vendor/recipes/${recipeId}/versions`);

// Use ViewVersionHistoryButton component
<ViewVersionHistoryButton 
  recipeId={recipeId} 
  variant="primary" 
  size="md" 
/>
```

### Custom Styling
```typescript
// Custom button styling
<ViewVersionHistoryButton 
  recipeId={recipeId}
  className="my-custom-class"
  variant="outline"
/>
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Versions Not Loading
**Symptoms:** Empty version list, loading spinner
**Causes:** API connection issues, authentication problems
**Solutions:** Check network connectivity, verify authentication

#### 2. Price Changes Not Showing
**Symptoms:** No price change indicators
**Causes:** Single version, comparison logic error
**Solutions:** Create multiple versions, check comparison data

#### 3. Rollback Not Working
**Symptoms:** Rollback button does nothing
**Causes:** API error, navigation issue
**Solutions:** Check API response, verify route configuration

### Debug Information
```typescript
// Enable debug logging
console.log('Versions data:', versionsData);
console.log('Selected version:', selectedVersion);
console.log('Comparison data:', comparisonData);
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
- **Network:** API request/response details

---

*Documentation Version: 1.0*  
*Last Updated: August 2, 2025*  
*Maintained by: Development Team* 