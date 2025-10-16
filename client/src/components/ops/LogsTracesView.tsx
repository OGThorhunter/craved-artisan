import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Clock, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';

export default function LogsTracesView() {
  const [timeframe, setTimeframe] = useState('24h');

  const { data: errors } = useQuery({
    queryKey: ['admin', 'ops', 'logs', 'errors', timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/admin/ops/logs/errors?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch errors');
      const result = await response.json();
      return result.data;
    }
  });

  const { data: slowEndpoints } = useQuery({
    queryKey: ['admin', 'ops', 'logs', 'slow-endpoints'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ops/logs/slow-endpoints');
      if (!response.ok) throw new Error('Failed to fetch slow endpoints');
      const result = await response.json();
      return result.data;
    }
  });

  return (
    <div className="space-y-6">
      {/* Timeframe Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#4b4b4b]">Timeframe:</span>
        <div className="flex gap-1">
          {['1h', '6h', '24h', '7d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm ${
                timeframe === tf
                  ? 'bg-[#7F232E] text-white'
                  : 'bg-gray-100 text-[#4b4b4b] hover:bg-gray-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Errors */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Recent Errors (Grouped)</h3>
        <div className="space-y-3">
          {errors?.map((error: any, index: number) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-[#2b2b2b]">{error.exception}</h4>
                    <p className="text-sm text-[#4b4b4b] mt-1">{error.route}</p>
                  </div>
                </div>
                <Badge variant="destructive">{error.count} occurrences</Badge>
              </div>

              <p className="text-sm text-[#4b4b4b] mb-3">{error.sampleMessage}</p>

              <div className="flex items-center gap-4 text-xs text-[#4b4b4b]">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  First: {new Date(error.firstSeen).toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last: {new Date(error.lastSeen).toLocaleString()}
                </div>
              </div>
            </Card>
          ))}

          {(!errors || errors.length === 0) && (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <p className="text-[#2b2b2b] font-medium">No errors in this timeframe</p>
              <p className="text-sm text-[#4b4b4b] mt-1">System running smoothly</p>
            </Card>
          )}
        </div>
      </div>

      {/* Slow Endpoints */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Slow Endpoints</h3>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4b4b4b] uppercase">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4b4b4b] uppercase">Method</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#4b4b4b] uppercase">p50</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#4b4b4b] uppercase">p95</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#4b4b4b] uppercase">p99</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#4b4b4b] uppercase">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {slowEndpoints?.map((endpoint: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-[#2b2b2b]">{endpoint.route}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">{endpoint.method}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[#2b2b2b]">{endpoint.p50}ms</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${
                        endpoint.p95 > 1000 ? 'text-red-600' : endpoint.p95 > 500 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {endpoint.p95}ms
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${
                        endpoint.p99 > 2000 ? 'text-red-600' : endpoint.p99 > 1000 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {endpoint.p99}ms
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[#4b4b4b]">
                      {endpoint.requestCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!slowEndpoints || slowEndpoints.length === 0) && (
            <div className="p-8 text-center">
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <p className="text-[#4b4b4b]">No slow endpoints detected</p>
            </div>
          )}
        </Card>
      </div>

      {/* Trace Sampler */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Trace Sampler</h3>
        <Card className="p-6 text-center">
          <p className="text-[#4b4b4b]">
            Tracing not yet configured. Consider integrating with Jaeger, Datadog, or New Relic for distributed tracing.
          </p>
        </Card>
      </div>
    </div>
  );
}

