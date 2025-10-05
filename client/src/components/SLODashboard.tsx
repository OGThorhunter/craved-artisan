import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { Badge } from './ui/Badge';

// Removed unused colors object

interface SLO {
  name: string;
  description: string;
  sli: string;
  target: number;
  window: '7d' | '30d';
  errorBudget: number;
  burnRate: number;
  status: 'OK' | 'WARN' | 'CRIT';
}

interface SLOData {
  window: '7d' | '30d';
  status: 'OK' | 'WARN' | 'CRIT';
  slos: SLO[];
  summary: {
    total: number;
    ok: number;
    warn: number;
    crit: number;
  };
  burnRates: {
    availability: Array<{ timestamp: Date; burnRate: number; errorBudget: number }>;
    latency: Array<{ timestamp: Date; burnRate: number; errorBudget: number }>;
    error_rate: Array<{ timestamp: Date; burnRate: number; errorBudget: number }>;
    queue_age: Array<{ timestamp: Date; burnRate: number; errorBudget: number }>;
  };
}

export default function SLODashboard() {
  const [window, setWindow] = useState<'7d' | '30d'>('7d');

  const { data: sloData, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'slo', window],
    queryFn: async () => {
      const response = await fetch(`/api/admin/slo?window=${window}`);
      if (!response.ok) throw new Error('Failed to fetch SLO data');
      const result = await response.json();
      return result.data as SLOData;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'success';
      case 'WARN': return 'warning';
      case 'CRIT': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return <CheckCircle className="h-4 w-4" />;
      case 'WARN': return <AlertTriangle className="h-4 w-4" />;
      case 'CRIT': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatValue = (slo: SLO) => {
    switch (slo.sli) {
      case 'availability':
        return `${(100 - slo.errorBudget).toFixed(3)}%`;
      case 'latency':
        return `${(slo.target - slo.errorBudget).toFixed(0)}ms`;
      case 'error_rate':
        return `${slo.errorBudget.toFixed(3)}%`;
      case 'queue_age':
        return `${(slo.target - slo.errorBudget).toFixed(0)}s`;
      default:
        return slo.errorBudget.toFixed(2);
    }
  };

  const getBurnRateColor = (burnRate: number) => {
    if (burnRate > 0.1) return 'text-red-600';
    if (burnRate > 0.05) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBurnRateIcon = (burnRate: number) => {
    if (burnRate > 0.1) return <TrendingUp className="h-4 w-4" />;
    if (burnRate > 0.05) return <TrendingUp className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#2b2b2b]">SLO Dashboard</h2>
          <div className="flex items-center gap-2">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!sloData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#2b2b2b]">SLO Dashboard</h2>
          <Button
            variant="secondary"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-[#4b4b4b] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">Failed to load SLO data</h3>
          <p className="text-[#4b4b4b]">Please try refreshing the page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2b2b2b]">SLO Dashboard</h2>
          <p className="text-[#4b4b4b] mt-1">Service Level Objectives and Error Budget Tracking</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1">
            <button
              onClick={() => setWindow('7d')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                window === '7d'
                  ? 'bg-[#7F232E] text-white'
                  : 'text-[#4b4b4b] hover:text-[#7F232E]'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setWindow('30d')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                window === '30d'
                  ? 'bg-[#7F232E] text-white'
                  : 'text-[#4b4b4b] hover:text-[#7F232E]'
              }`}
            >
              30 Days
            </button>
          </div>
          
          <Button
            variant="secondary"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              sloData.status === 'OK' ? 'bg-green-100' :
              sloData.status === 'WARN' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              {getStatusIcon(sloData.status)}
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2b2b2b]">{sloData.status}</p>
              <p className="text-sm text-[#4b4b4b]">Overall Status</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{sloData.summary.ok}</p>
            <p className="text-sm text-[#4b4b4b]">Healthy SLOs</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{sloData.summary.warn}</p>
            <p className="text-sm text-[#4b4b4b]">Warning SLOs</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{sloData.summary.crit}</p>
            <p className="text-sm text-[#4b4b4b]">Critical SLOs</p>
          </div>
        </Card>
      </div>

      {/* SLO Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sloData.slos.map((slo, index) => (
          <motion.div
            key={slo.sli}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#2b2b2b]">{slo.name}</h3>
                  <p className="text-sm text-[#4b4b4b] mt-1">{slo.description}</p>
                </div>
                <Badge variant={getStatusColor(slo.status) as 'success' | 'warning' | 'destructive' | 'secondary'}>
                  {slo.status}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Current Value */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4b4b4b]">Current Value</span>
                  <span className="text-lg font-semibold text-[#2b2b2b]">
                    {formatValue(slo)}
                  </span>
                </div>

                {/* Target */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4b4b4b]">Target</span>
                  <span className="text-sm text-[#4b4b4b]">
                    {slo.sli === 'availability' ? `${slo.target}%` :
                     slo.sli === 'latency' ? `${slo.target}ms` :
                     slo.sli === 'error_rate' ? `${slo.target}%` :
                     slo.sli === 'queue_age' ? `${slo.target}s` : slo.target}
                  </span>
                </div>

                {/* Error Budget */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4b4b4b]">Error Budget</span>
                  <span className={`text-sm font-medium ${
                    slo.errorBudget > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {slo.errorBudget > 0 ? '+' : ''}{slo.errorBudget.toFixed(3)}
                  </span>
                </div>

                {/* Burn Rate */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4b4b4b]">Burn Rate</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-medium ${getBurnRateColor(slo.burnRate)}`}>
                      {slo.burnRate.toFixed(4)}/hr
                    </span>
                    {getBurnRateIcon(slo.burnRate)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      slo.status === 'OK' ? 'bg-green-500' :
                      slo.status === 'WARN' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(0, (slo.errorBudget / slo.target) * 100))}%`
                    } as React.CSSProperties}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Burn Rate Charts */}
      <div>
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Error Budget Burn Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(sloData.burnRates).map(([sli, data]) => {
            const slo = sloData.slos.find(s => s.sli === sli);
            if (!slo) return null;

            return (
              <motion.div
                key={sli}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-[#2b2b2b]">{slo.name}</h4>
                    <Badge variant={getStatusColor(slo.status) as 'success' | 'warning' | 'destructive' | 'secondary'}>
                      {slo.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {data.slice(-7).map((point, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-[#4b4b4b]">
                          {new Date(point.timestamp).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={getBurnRateColor(point.burnRate)}>
                            {point.burnRate.toFixed(4)}/hr
                          </span>
                          <span className="text-[#4b4b4b]">
                            {point.errorBudget.toFixed(3)} budget
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
