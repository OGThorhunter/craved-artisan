# Analytics Hooks Documentation

This directory contains React Query hooks for fetching analytics data from the backend API.

## Available Hooks

### `useTrendData(vendorId, range)`

Fetches analytics trend data for a specific vendor and time range.

**Parameters:**
- `vendorId` (string): The vendor ID
- `range` ('daily' | 'weekly' | 'monthly'): Time range for the data

**Returns:**
- `data`: Analytics trends response
- `isLoading`: Loading state
- `error`: Error state
- `refetch`: Function to refetch data

**Example:**
```tsx
import { useTrendData } from '../hooks/useTrendData';

function MyComponent() {
  const { data, isLoading, error } = useTrendData('vendor_001', 'daily');
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.data.map(trend => (
        <div key={trend.date}>
          {trend.date}: ${trend.revenue} ({trend.orders} orders)
        </div>
      ))}
    </div>
  );
}
```

### `useAnalyticsSummary(vendorId)`

Fetches analytics summary data for a specific vendor.

**Parameters:**
- `vendorId` (string): The vendor ID

**Returns:**
- `data`: Analytics summary response
- `isLoading`: Loading state
- `error`: Error state
- `refetch`: Function to refetch data

**Example:**
```tsx
import { useAnalyticsSummary } from '../hooks/useTrendData';

function SummaryComponent() {
  const { data, isLoading, error } = useAnalyticsSummary('vendor_001');
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  const summary = data?.data;
  return (
    <div>
      <h2>Total Revenue: ${summary?.totalRevenue.toLocaleString()}</h2>
      <h3>Total Orders: {summary?.totalOrders.toLocaleString()}</h3>
      <h3>Average Order Value: ${summary?.avgOrderValue.toFixed(2)}</h3>
    </div>
  );
}
```

### `useTrendDataWithFallback(vendorId, range)`

Fetches analytics trend data with automatic fallback to mock data if the API fails.

**Parameters:**
- `vendorId` (string): The vendor ID
- `range` ('daily' | 'weekly' | 'monthly'): Time range for the data

**Returns:**
- Same as `useTrendData` but with fallback functionality

**Example:**
```tsx
import { useTrendDataWithFallback } from '../hooks/useTrendData';

function ChartComponent() {
  const { data, isLoading, error } = useTrendDataWithFallback('vendor_001', 'daily');
  
  // This will always return data (either real or mock)
  const trends = data?.data || [];
  
  return (
    <Chart data={trends} />
  );
}
```

## Prefetching Functions

### `prefetchTrendData(queryClient, vendorId, range)`

Prefetches trend data for better user experience.

**Example:**
```tsx
import { prefetchTrendData } from '../hooks/useTrendData';

// In a component or route handler
useEffect(() => {
  prefetchTrendData(queryClient, 'vendor_001', 'daily');
}, []);
```

### `prefetchAnalyticsSummary(queryClient, vendorId)`

Prefetches analytics summary data.

**Example:**
```tsx
import { prefetchAnalyticsSummary } from '../hooks/useTrendData';

// In a component or route handler
useEffect(() => {
  prefetchAnalyticsSummary(queryClient, 'vendor_001');
}, []);
```

## Configuration

The hooks are configured with the following defaults:

- **Stale Time**: 5-10 minutes (data considered fresh)
- **Cache Time**: 10-15 minutes (data kept in cache)
- **Retry**: 2 attempts with exponential backoff
- **Enabled**: Only runs when vendorId is provided

## Error Handling

All hooks include comprehensive error handling:

- Automatic retries with exponential backoff
- Fallback to mock data (for `useTrendDataWithFallback`)
- Proper error states and messages
- Loading states for better UX

## Performance Features

- **Automatic Caching**: React Query handles caching automatically
- **Background Refetching**: Data is refreshed in the background
- **Optimistic Updates**: UI updates immediately when possible
- **Deduplication**: Multiple components using the same data share the same request

## TypeScript Support

All hooks are fully typed with TypeScript:

```tsx
import { AnalyticsTrendsResponse, AnalyticsSummaryResponse } from '../hooks/useTrendData';

// Types are automatically inferred
const { data } = useTrendData('vendor_001', 'daily');
// data is typed as AnalyticsTrendsResponse | undefined
```

## Best Practices

1. **Always check loading and error states**
2. **Use the fallback hook for critical UI components**
3. **Prefetch data for better user experience**
4. **Handle empty data gracefully**
5. **Use proper error boundaries**

## Example Usage in Components

See `AnalyticsDashboard.tsx` for a complete example of how to use multiple hooks together in a dashboard component. 