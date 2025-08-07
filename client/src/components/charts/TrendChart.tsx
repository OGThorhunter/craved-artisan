import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';
import { useTrendData } from '../../hooks/useTrendData';
import { useAuth } from '../../contexts/AuthContext';

const TrendChart = () => {
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const { user } = useAuth();
  const vendorId = user?.id;

  const { data, isLoading, error } = useTrendData(vendorId || '', range);

  // Extract the trends array from the response, defaulting to empty array
  const trends = data?.data || [];

  return (
    <div className="p-4 bg-white shadow rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Revenue & Orders</h2>
        <div className="space-x-2">
          {['daily', 'weekly', 'monthly'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className={`px-3 py-1 rounded border text-sm transition-colors ${
                range === r 
                  ? 'bg-[#7F232E] text-white border-transparent' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F232E] mx-auto mb-2"></div>
            Loading analytics data...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center text-red-500">
            <div className="font-medium mb-2">Error loading data</div>
            <div className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</div>
          </div>
        </div>
      ) : trends.length === 0 ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center text-gray-400">No data available</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" label={{ value: 'Revenue', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Orders', angle: -90, position: 'insideRight' }} />
            <Tooltip 
              formatter={(value: any, name: string) => [
                name === 'revenue' ? `$${value.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : 'Orders'
              ]}
            />
            <Legend />
            <Bar yAxisId="right" dataKey="orders" fill="#5B6E02" />
            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#7F232E" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TrendChart; 