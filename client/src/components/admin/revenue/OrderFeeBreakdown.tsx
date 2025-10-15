import React from 'react';
import { DollarSign, CreditCard, Receipt, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface OrderFeeBreakdownProps {
  orderId: string;
  breakdown: {
    gmvCents: number;
    platformFeeCents: number;
    processingFeeCents: number;
    taxCents: number;
    netToVendorCents: number;
    netToPlatformCents: number;
    promoDiscountCents?: number;
    feeSchedule?: {
      id: string;
      name: string;
      version: number;
      takeRateBps: number;
    };
  };
}

export const OrderFeeBreakdown: React.FC<OrderFeeBreakdownProps> = ({
  orderId,
  breakdown,
}) => {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatPercent = (bps: number) => {
    return `${(bps / 100).toFixed(2)}%`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Fee Breakdown</h3>
        <p className="text-sm text-gray-600 mt-1">Order: {orderId}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* GMV */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Gross Merchandise Value</div>
              <div className="text-xs text-gray-500">Order subtotal (before fees)</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(breakdown.gmvCents)}
            </div>
          </div>
        </div>

        {/* Platform Fee */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium text-gray-900">Platform Fee</div>
              {breakdown.feeSchedule && (
                <div className="text-xs text-gray-500">
                  {breakdown.feeSchedule.name} (v{breakdown.feeSchedule.version}) - {formatPercent(breakdown.feeSchedule.takeRateBps)}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(breakdown.platformFeeCents)}
            </div>
            {breakdown.promoDiscountCents && breakdown.promoDiscountCents > 0 && (
              <div className="text-xs text-gray-500">
                Promo: -{formatCurrency(breakdown.promoDiscountCents)}
              </div>
            )}
          </div>
        </div>

        {/* Processing Fee */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-600" />
            <div>
              <div className="font-medium text-gray-900">Stripe Processing Fee</div>
              <div className="text-xs text-gray-500">2.9% + $0.30</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-orange-600">
              {formatCurrency(breakdown.processingFeeCents)}
            </div>
          </div>
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900">Tax Collected</div>
              <div className="text-xs text-gray-500">Sales tax for vendor remittance</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-purple-600">
              {formatCurrency(breakdown.taxCents)}
            </div>
          </div>
        </div>

        {/* Net to Vendor */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">Net to Vendor</div>
                <div className="text-xs text-blue-700">
                  GMV - Platform Fee - Processing Fee - Tax
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(breakdown.netToVendorCents)}
              </div>
            </div>
          </div>
        </div>

        {/* Net to Platform */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-semibold text-green-900">Net to Platform</div>
                <div className="text-xs text-green-700">
                  Platform revenue after costs
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(breakdown.netToPlatformCents)}
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Formula */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Calculation Formula</h4>
          <div className="space-y-2 text-xs font-mono text-gray-600">
            <div>GMV = {formatCurrency(breakdown.gmvCents)}</div>
            <div>Platform Fee = GMV × {breakdown.feeSchedule ? formatPercent(breakdown.feeSchedule.takeRateBps) : 'N/A'} = {formatCurrency(breakdown.platformFeeCents)}</div>
            <div>Processing Fee = {formatCurrency(breakdown.processingFeeCents)}</div>
            <div>Tax = {formatCurrency(breakdown.taxCents)}</div>
            <div className="pt-2 border-t">
              Net to Vendor = {formatCurrency(breakdown.gmvCents)} - {formatCurrency(breakdown.platformFeeCents)} - {formatCurrency(breakdown.processingFeeCents)} - {formatCurrency(breakdown.taxCents)} = {formatCurrency(breakdown.netToVendorCents)}
            </div>
            <div>
              Net to Platform = {formatCurrency(breakdown.platformFeeCents)} - {formatCurrency(breakdown.processingFeeCents)} = {formatCurrency(breakdown.netToPlatformCents)}
            </div>
          </div>
        </div>

        {/* Policy Flags */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Active Policies</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Processing fees borne by: <strong>Vendor</strong></li>
                <li>Refund policy: <strong>Proportional</strong></li>
                <li>Dispute split: <strong>50/50 Platform/Vendor</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

