import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Shield,
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { Badge } from './ui/Badge';

interface RevenueData {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  currency: string;
  period: {
    start: Date;
    end: Date;
  };
}

interface PayoutData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrival_date: Date;
  created: Date;
  description?: string;
}

interface DisputeData {
  id: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  created: Date;
  evidence_due_by?: Date;
  charge: {
    id: string;
    amount: number;
    description?: string;
  };
}

interface RadarReviewData {
  id: string;
  charge_id: string;
  amount: number;
  currency: string;
  status: 'open' | 'closed';
  created: Date;
  reviewed: boolean;
  reason: string;
  risk_score?: number;
  risk_level?: 'normal' | 'elevated' | 'highest';
}

interface PaymentMethodData {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

interface RiskAnalytics {
  total_charges: number;
  blocked_charges: number;
  reviewed_charges: number;
  blocked_rate: number;
  review_rate: number;
  avg_risk_score: number;
}

interface RevenueDashboardData {
  revenue: RevenueData;
  payouts: PayoutData[];
  riskAnalytics: RiskAnalytics;
  period: string;
}

export default function RevenueDashboard() {
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | '90d'>('30d');
  const queryClient = useQueryClient();

  // Fetch revenue summary
  const { data: revenueData, isLoading: revenueLoading, refetch: refetchRevenue } = useQuery({
    queryKey: ['admin', 'stripe', 'summary', period],
    queryFn: async () => {
      const response = await fetch(`/api/admin/stripe/summary?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch revenue summary');
      const result = await response.json();
      return result.data as RevenueDashboardData;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch payment methods analytics
  const { data: paymentMethodsData } = useQuery({
    queryKey: ['admin', 'stripe', 'payment-methods', period],
    queryFn: async () => {
      const response = await fetch(`/api/admin/stripe/analytics/payment-methods?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const result = await response.json();
      return result.data.paymentMethods as PaymentMethodData[];
    },
  });

  // Fetch disputes
  const { data: disputesData, refetch: refetchDisputes } = useQuery({
    queryKey: ['admin', 'stripe', 'disputes'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stripe/disputes');
      if (!response.ok) throw new Error('Failed to fetch disputes');
      const result = await response.json();
      return result.data.disputes as DisputeData[];
    },
  });

  // Fetch Radar reviews
  const { data: radarData, refetch: refetchRadar } = useQuery({
    queryKey: ['admin', 'stripe', 'radar', 'reviews'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stripe/radar/reviews');
      if (!response.ok) throw new Error('Failed to fetch Radar reviews');
      const result = await response.json();
      return result.data.reviews as RadarReviewData[];
    },
  });

  // Approve Radar review mutation
  const approveRadarMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/admin/stripe/radar/reviews/${reviewId}/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stripe', 'radar'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stripe', 'summary'] });
    },
  });

  // Approve charge mutation
  const approveChargeMutation = useMutation({
    mutationFn: async (chargeId: string) => {
      const response = await fetch(`/api/admin/stripe/charges/${chargeId}/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve charge');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stripe', 'radar'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stripe', 'summary'] });
    },
  });

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'succeeded':
      case 'closed':
        return 'success';
      case 'pending':
      case 'open':
        return 'warning';
      case 'failed':
      case 'lost':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getRiskLevelColor = (level?: string) => {
    switch (level) {
      case 'normal':
        return 'success';
      case 'elevated':
        return 'warning';
      case 'highest':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (revenueLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Revenue & Risk</h2>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Revenue & Risk</h2>
          <p className="text-[#4b4b4b] mt-1">Stripe payments, disputes, and fraud management</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1">
            {(['today', '7d', '30d', '90d'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-[#7F232E] text-white'
                    : 'text-[#4b4b4b] hover:text-[#7F232E]'
                }`}
              >
                {p === 'today' ? 'Today' : p}
              </button>
            ))}
          </div>
          
          <Button
            variant="secondary"
            onClick={() => {
              refetchRevenue();
              refetchDisputes();
              refetchRadar();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Revenue Overview */}
      {revenueData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2b2b2b]">
                  {formatCurrency(revenueData.revenue.totalRevenue)}
                </p>
                <p className="text-sm text-[#4b4b4b]">Total Revenue</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2b2b2b]">
                  {formatCurrency(revenueData.revenue.todayRevenue)}
                </p>
                <p className="text-sm text-[#4b4b4b]">Today</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2b2b2b]">
                  {revenueData.riskAnalytics.blocked_rate.toFixed(2)}%
                </p>
                <p className="text-sm text-[#4b4b4b]">Blocked Rate</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2b2b2b]">
                  {disputesData?.length || 0}
                </p>
                <p className="text-sm text-[#4b4b4b]">Open Disputes</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Methods */}
      {paymentMethodsData && (
        <div>
          <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Payment Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethodsData.map((method, index) => (
              <motion.div
                key={method.method}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-[#2b2b2b] capitalize">{method.method}</h4>
                    <Badge variant="secondary">{method.count} transactions</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#4b4b4b]">Amount</span>
                      <span className="font-medium text-[#2b2b2b]">
                        {formatCurrency(method.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#4b4b4b]">Share</span>
                      <span className="font-medium text-[#2b2b2b]">
                        {method.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#7F232E] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${method.percentage}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Radar Reviews */}
      {radarData && radarData.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2b2b2b]">Radar Reviews</h3>
                        <Badge variant="secondary">{radarData.filter(r => r.status === 'open').length} Open</Badge>
          </div>
          
          <div className="space-y-3">
            {radarData.slice(0, 10).map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-[#2b2b2b]">
                          Charge: {review.charge_id.slice(-8)}
                        </p>
                        <p className="text-sm text-[#4b4b4b]">
                          {formatCurrency(review.amount, review.currency)} • {formatDate(review.created)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getRiskLevelColor(review.risk_level) as 'success' | 'warning' | 'destructive' | 'secondary'}>
                          {review.risk_level || 'Unknown'}
                        </Badge>
                        {review.risk_score && (
                          <Badge variant="secondary">
                            Score: {review.risk_score}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {review.status === 'open' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => approveChargeMutation.mutate(review.charge_id)}
                          disabled={approveChargeMutation.isPending}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => approveRadarMutation.mutate(review.id)}
                          disabled={approveRadarMutation.isPending}
                          className="flex items-center gap-1"
                        >
                          <Shield className="h-3 w-3" />
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Disputes */}
      {disputesData && disputesData.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2b2b2b]">Recent Disputes</h3>
            <Badge variant="destructive">{disputesData.length} Total</Badge>
          </div>
          
          <div className="space-y-3">
            {disputesData.slice(0, 5).map((dispute) => (
              <motion.div
                key={dispute.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#2b2b2b]">
                        Dispute: {dispute.id.slice(-8)}
                      </p>
                      <p className="text-sm text-[#4b4b4b]">
                        {formatCurrency(dispute.amount, dispute.currency)} • {dispute.reason} • {formatDate(dispute.created)}
                      </p>
                      {dispute.evidence_due_by && (
                        <p className="text-xs text-red-600 mt-1">
                          Evidence due: {formatDate(dispute.evidence_due_by)}
                        </p>
                      )}
                    </div>
                    
                    <Badge variant={getStatusColor(dispute.status) as 'success' | 'warning' | 'destructive' | 'secondary'}>
                      {dispute.status}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Analytics */}
      {revenueData?.riskAnalytics && (
        <div>
          <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Risk Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#2b2b2b]">
                  {revenueData.riskAnalytics.total_charges.toLocaleString()}
                </p>
                <p className="text-sm text-[#4b4b4b]">Total Charges</p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#2b2b2b]">
                  {revenueData.riskAnalytics.blocked_charges}
                </p>
                <p className="text-sm text-[#4b4b4b]">Blocked Charges</p>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#2b2b2b]">
                  {revenueData.riskAnalytics.avg_risk_score.toFixed(1)}
                </p>
                <p className="text-sm text-[#4b4b4b]">Avg Risk Score</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
