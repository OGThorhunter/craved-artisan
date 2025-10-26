import React, { useState } from 'react';
import { CreditCard, QrCode, AlertCircle, CheckCircle, X } from 'lucide-react';
import type { PricingBreakdown } from '@/lib/api/sales';
// Stall type not exported from @/lib/api/sales, using local type
type Stall = any;
import { formatCurrency, calculatePricing } from '@/lib/api/sales';

interface CheckoutFormProps {
  selectedStalls: Stall[];
  onCheckout: (orderData: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function CheckoutForm({
  selectedStalls,
  onCheckout,
  onCancel,
  loading = false
}: CheckoutFormProps) {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<any>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate pricing
  const calculateTotals = (): PricingBreakdown => {
    const subtotal = selectedStalls.reduce((sum, stall) => {
      // Use default pricing since we removed sales windows
      const basePrice = stall.basePrice || 100; // Default price if not set
      return sum + basePrice;
    }, 0);

    const discountAmount = discountApplied?.discountAmount || 0;
    const finalSubtotal = subtotal - discountAmount;
    const tax = finalSubtotal * 0.08; // 8% tax
    const fees = finalSubtotal * 0.03; // 3% processing fee
    const total = finalSubtotal + tax + fees;

    return {
      basePrice: subtotal,
      surcharges: 0,
      discounts: discountAmount,
      tax,
      fees,
      total,
    };
  };

  const totals = calculateTotals();

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    setDiscountLoading(true);
    try {
      // TODO: Implement discount validation API call
      const response = await fetch('/api/sales/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode,
          orderAmount: totals.basePrice,
        }),
      });

      const result = await response.json();
      if (result.success && result.data.valid) {
        setDiscountApplied(result.data);
        setErrors({});
      } else {
        setErrors({ discount: 'Invalid or expired discount code' });
      }
    } catch (error) {
      setErrors({ discount: 'Failed to validate discount code' });
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountApplied(null);
    setDiscountCode('');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!customerInfo.name.trim()) newErrors.name = 'Name is required';
    if (!customerInfo.email.trim()) newErrors.email = 'Email is required';
    if (!customerInfo.email.includes('@')) newErrors.email = 'Valid email is required';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Create order
    const orderData = {
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      stallIds: selectedStalls.map(stall => stall.id),
      discountCode: discountCode || undefined,
    };

    onCheckout(orderData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close checkout"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p className="text-gray-600 mt-2">Complete your stall purchase</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Selected Stalls */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected Stalls</h3>
          <div className="space-y-2">
            {selectedStalls.map((stall) => {
              // Use default pricing since we removed sales windows
              const basePrice = stall.basePrice || 100;
              const pricing = {
                subtotal: basePrice,
                tax: basePrice * 0.08,
                fees: basePrice * 0.03,
                total: basePrice * 1.11
              };
              return (
                <div key={stall.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {stall.zone && (
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: stall.zone.color }}
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">Stall {stall.number}</div>
                      <div className="text-sm text-gray-600">
                        {stall.zone?.name} • {stall.stallType.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatCurrency(pricing.total)}</div>
                    {pricing.earlyBirdDiscount > 0 && (
                      <div className="text-xs text-green-600">Early bird discount applied</div>
                    )}
                    {pricing.lastMinuteSurcharge > 0 && (
                      <div className="text-xs text-red-600">Last minute pricing</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Discount Code */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Discount Code</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Enter discount code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
            />
            <button
              type="button"
              onClick={handleApplyDiscount}
              disabled={discountLoading || !discountCode.trim()}
              className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {discountLoading ? 'Applying...' : 'Apply'}
            </button>
          </div>
          
          {errors.discount && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.discount}
            </div>
          )}
          
          {discountApplied && (
            <div className="flex items-center justify-between mt-3 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">{discountApplied.discount.name}</div>
                  <div className="text-sm text-green-700">
                    {discountApplied.discount.type === 'PERCENTAGE' 
                      ? `${discountApplied.discount.value}% off`
                      : `${formatCurrency(discountApplied.discount.value)} off`
                    }
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-green-900">
                  -{formatCurrency(discountApplied.discountAmount)}
                </div>
                <button
                  type="button"
                  onClick={handleRemoveDiscount}
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <div className="text-red-600 text-sm mt-1">{errors.name}</div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <div className="text-red-600 text-sm mt-1">{errors.email}</div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Method</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-brand-green border-gray-300 focus:ring-brand-green"
              />
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Credit or Debit Card</span>
            </label>
            
            <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="wallet"
                checked={paymentMethod === 'wallet'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-brand-green border-gray-300 focus:ring-brand-green"
              />
              <QrCode className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Digital Wallet (Apple Pay, Google Pay)</span>
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(totals.basePrice)}</span>
            </div>
            
            {totals.discounts > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(totals.discounts)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">{formatCurrency(totals.tax)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee</span>
              <span className="text-gray-900">{formatCurrency(totals.fees)}</span>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Pay ${formatCurrency(totals.total)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
