# AI Forecast Widget - Frontend Component

## Overview
The AI Forecast Widget is a React component that displays intelligent financial predictions for vendors, including revenue, profit, and order forecasts with trend analysis and business insights.

## Component Features

### 🎯 Core Features
- **Multi-Metric Forecasting**: Revenue, profit, and order predictions
- **Trend Analysis**: Visual indicators for increasing, decreasing, or stable trends
- **Confidence Assessment**: High, medium, or low confidence indicators
- **AI Insights**: Actionable business recommendations
- **Period Selection**: Configurable analysis periods (3, 6, 12 months)
- **Real-time Updates**: Refresh functionality for latest data

### 🎨 Visual Design
- **Modern UI**: Clean, professional design with gradient backgrounds
- **Color-coded Metrics**: Green for revenue, blue for profit, purple for orders
- **Trend Icons**: Visual indicators for trend direction
- **Responsive Layout**: Adapts to different screen sizes
- **Loading States**: Smooth loading animations and error handling

## Component Structure

### Props Interface
```typescript
interface AIForecastWidgetProps {
  vendorId: string;        // Required: Vendor ID for data fetching
  months?: number;         // Optional: Analysis period (default: 12)
  className?: string;      // Optional: Custom CSS classes
}
```

### Data Interface
```typescript
interface ForecastData {
  nextMonthRevenue: number;
  nextMonthProfit: number;
  nextMonthOrders: number;
  avgRevenueGrowthRate: number;
  avgProfitGrowthRate: number;
  avgOrderGrowthRate: number;
  confidence: 'high' | 'medium' | 'low';
  trends: {
    revenue: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
    profit: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
    orders: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  };
  insights: string[];
}
```

## Usage Examples

### Basic Implementation
```tsx
import AIForecastWidget from './components/AIForecastWidget';

function VendorDashboard() {
  return (
    <div className="p-6">
      <AIForecastWidget vendorId="vendor-123" />
    </div>
  );
}
```

### Custom Period
```tsx
<AIForecastWidget 
  vendorId="vendor-123" 
  months={6} 
/>
```

### With Custom Styling
```tsx
<AIForecastWidget 
  vendorId="vendor-123" 
  months={12}
  className="my-custom-class shadow-lg" 
/>
```

### Dashboard Integration
```tsx
function VendorDashboard() {
  const vendorId = "vendor-123";
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Main Forecast */}
      <AIForecastWidget 
        vendorId={vendorId} 
        months={12}
        className="h-full"
      />
      
      {/* Quick Forecast */}
      <AIForecastWidget 
        vendorId={vendorId} 
        months={3}
        className="h-full"
      />
    </div>
  );
}
```

## Component Sections

### 1. Header Section
- **AI Forecast Title**: With gradient icon and description
- **Period Selector**: Dropdown for 3, 6, or 12 months
- **Refresh Button**: Manual refresh functionality

### 2. Confidence Indicator
- **Visual Badge**: Color-coded confidence level
- **Icon Indicators**: Check mark for high, warning for medium/low
- **Status Text**: "High", "Medium", or "Low" confidence

### 3. Forecast Metrics
- **Revenue Card**: Green gradient with dollar sign icon
- **Profit Card**: Blue gradient with target icon
- **Orders Card**: Purple gradient with shopping cart icon
- **Trend Indicators**: Up/down arrows with percentage growth

### 4. AI Insights
- **Bullet Points**: Actionable business recommendations
- **Contextual Analysis**: Cross-metric insights
- **Growth Patterns**: Revenue vs. profit correlation

### 5. Historical Data Summary
- **Data Source**: Number of months analyzed
- **Transparency**: Clear indication of data basis

## Visual States

### Loading State
```tsx
<div className="flex items-center justify-center space-x-2">
  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
  <span className="text-gray-600">Loading AI forecast...</span>
</div>
```

### Error State
```tsx
<div className="text-center text-red-600">
  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
  <p className="font-medium">Forecast Error</p>
  <p className="text-sm text-gray-500 mt-1">{error}</p>
  <button onClick={retryFunction}>Retry</button>
</div>
```

### No Data State
```tsx
<div className="text-center text-gray-500">
  <BarChart3 className="w-8 h-8 mx-auto mb-2" />
  <p>No forecast data available</p>
</div>
```

## Styling and Theming

### Color Scheme
- **Revenue**: Green gradient (`from-green-50 to-green-100`)
- **Profit**: Blue gradient (`from-blue-50 to-blue-100`)
- **Orders**: Purple gradient (`from-purple-50 to-purple-100`)
- **Confidence**: Green (high), Yellow (medium), Red (low)

### Responsive Design
- **Mobile**: Single column layout
- **Tablet**: Responsive grid adjustments
- **Desktop**: Multi-column layout with proper spacing

### Customization
```tsx
// Custom styling example
<AIForecastWidget 
  vendorId="vendor-123"
  className="
    border-2 border-blue-300 
    shadow-xl 
    rounded-xl 
    bg-gradient-to-br from-blue-50 to-indigo-50
  "
/>
```

## API Integration

### Data Fetching
```typescript
const fetchForecast = async (period: number) => {
  const response = await axios.get(
    `/api/vendors/${vendorId}/financials/forecast?months=${period}`,
    { withCredentials: true }
  );
  return response.data;
};
```

### Error Handling
- **Network Errors**: Display retry button
- **Authentication Errors**: Redirect to login
- **Data Errors**: Show user-friendly error messages
- **Toast Notifications**: Success/error feedback

## Performance Considerations

### Optimization
- **Memoization**: Prevent unnecessary re-renders
- **Debounced Updates**: Limit API calls on period changes
- **Loading States**: Smooth user experience
- **Error Boundaries**: Graceful error handling

### Caching
- **React Query**: Optional integration for data caching
- **Local State**: Component-level state management
- **Session Storage**: Persist user preferences

## Accessibility Features

### ARIA Labels
```tsx
<select
  aria-label="Select forecast period"
  value={selectedPeriod}
  onChange={handlePeriodChange}
>
```

### Keyboard Navigation
- **Tab Navigation**: All interactive elements accessible
- **Enter/Space**: Button activation
- **Arrow Keys**: Dropdown navigation

### Screen Reader Support
- **Semantic HTML**: Proper heading structure
- **Alt Text**: Icon descriptions
- **Status Announcements**: Loading and error states

## Integration Examples

### Vendor Dashboard
```tsx
function VendorDashboardPage() {
  const { user } = useAuth();
  const vendorId = user?.vendorProfile?.id;
  
  if (!vendorId) return <div>Loading...</div>;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AIForecastWidget vendorId={vendorId} />
        {/* Other dashboard widgets */}
      </div>
    </div>
  );
}
```

### Financial Overview Page
```tsx
function FinancialOverviewPage() {
  const vendorId = useVendorId();
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Financial Overview</h1>
        <p className="text-gray-600">AI-powered insights and predictions</p>
      </div>
      
      <AIForecastWidget 
        vendorId={vendorId} 
        months={12}
        className="mb-8"
      />
      
      {/* Additional financial components */}
    </div>
  );
}
```

### Compact Sidebar Widget
```tsx
function SidebarWidget() {
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4">Quick Forecast</h3>
      <AIForecastWidget 
        vendorId={vendorId} 
        months={3}
        className="text-sm"
      />
    </div>
  );
}
```

## Testing

### Unit Tests
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import AIForecastWidget from './AIForecastWidget';

test('renders forecast widget', () => {
  render(<AIForecastWidget vendorId="test-vendor" />);
  expect(screen.getByText('AI Forecast')).toBeInTheDocument();
});

test('handles period selection', () => {
  render(<AIForecastWidget vendorId="test-vendor" />);
  const select = screen.getByLabelText('Select forecast period');
  fireEvent.change(select, { target: { value: '6' } });
  expect(select.value).toBe('6');
});
```

### Integration Tests
```tsx
test('fetches forecast data on mount', async () => {
  const mockAxios = jest.spyOn(axios, 'get');
  render(<AIForecastWidget vendorId="test-vendor" />);
  
  expect(mockAxios).toHaveBeenCalledWith(
    '/api/vendors/test-vendor/financials/forecast?months=12',
    expect.any(Object)
  );
});
```

## Troubleshooting

### Common Issues

#### Data Not Loading
- Check vendor ID validity
- Verify API endpoint accessibility
- Check authentication status
- Review network connectivity

#### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check for CSS conflicts
- Verify responsive breakpoints
- Test in different browsers

#### Performance Problems
- Monitor API response times
- Check for unnecessary re-renders
- Verify data caching implementation
- Review bundle size impact

### Debug Steps
1. Check browser console for errors
2. Verify API responses in Network tab
3. Test with different vendor IDs
4. Check authentication state
5. Validate component props

## Future Enhancements

### Planned Features
- **Chart Integration**: Add trend visualization charts
- **Export Functionality**: PDF/CSV export of forecasts
- **Customizable Metrics**: Allow vendor-specific metrics
- **Real-time Updates**: WebSocket integration for live data
- **Mobile App**: React Native version

### Potential Improvements
- **Advanced Analytics**: More sophisticated AI algorithms
- **Seasonal Patterns**: Holiday and seasonal trend detection
- **Competitor Analysis**: Market comparison features
- **Goal Setting**: Target-based forecasting
- **Notification System**: Alert system for significant changes

## Conclusion

The AI Forecast Widget provides vendors with a comprehensive, user-friendly interface for viewing AI-powered financial predictions. The component is designed to be flexible, accessible, and easy to integrate into existing applications while providing valuable business insights through an intuitive visual interface. 