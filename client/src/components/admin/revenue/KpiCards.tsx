import React from 'react';
import { DollarSign, TrendingUp, Percent, CreditCard, RefreshCw, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface KpiCardsProps {
  kpis: {
    gmvCents: number;
    platformRevenueCents: number;
    marketplaceFeeCents: number;
    eventFeeCents: number;
    subscriptionFeeCents: number;
    takeRateBps: number;
    netRevenueCents: number;
    processingCostCents: number;
    refundsCents: number;
    disputesCents: number;
    payoutsPendingCents: number;
    payoutsInTransitCents: number;
    payoutsCompletedCents: number;
    taxCollectedCents: number;
  };
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPercent = (bps: number) => {
    return `${(bps / 100).toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* GMV Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">GMV</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.gmvCents)}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Gross Merchandise Volume</p>
      </div>

      {/* Platform Revenue Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.platformRevenueCents)}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-2 text-xs text-gray-500">
          <span>Marketplace: {formatCurrency(kpis.marketplaceFeeCents)}</span>
          <span>Events: {formatCurrency(kpis.eventFeeCents)}</span>
        </div>
      </div>

      {/* Take Rate Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Percent className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Take Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercent(kpis.takeRateBps)}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Platform Revenue ÷ GMV</p>
      </div>

      {/* Net Revenue Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Net Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.netRevenueCents)}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">After processing & refunds</p>
      </div>

      {/* Processing Costs Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Processing Costs</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.processingCostCents)}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Stripe fees</p>
      </div>

      {/* Refunds/Disputes Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <RefreshCw className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Refunds</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.refundsCents)}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Disputes: {formatCurrency(kpis.disputesCents)}</p>
      </div>

      {/* Payouts Pending Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Payouts Pending</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.payoutsPendingCents)}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">In Transit: {formatCurrency(kpis.payoutsInTransitCents)}</p>
      </div>

      {/* Payouts Completed Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Payouts Completed</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.payoutsCompletedCents)}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Successfully paid out</p>
      </div>
    </div>
  );
};

export default KpiCards;
