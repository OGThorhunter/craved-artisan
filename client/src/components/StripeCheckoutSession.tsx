import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  DollarSign,
  ShoppingCart,
  ExternalLink,
  Receipt,
  Users,
  Calculator
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckoutSessionData {
  orderId: string;
  customerEmail: string;
  lineItems: any[];
  totalAmount: number;
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
}

interface CommissionBreakdown {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  commissionAmount: number;
  vendorPayoutAmount: number;
  commissionRate: number;
  vendorBreakdown: any[];
  summary: {
    totalItems: number;
    uniqueVendors: number;
    averageCommission: number;
  };
}

const StripeCheckoutSession: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { user } = useAuth();
  const { state: { items }, getSubtotal, getTax, getShipping, getTotal } = useCart();
  const [isCreating, setIsCreating] = useState(false);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [commissionBreakdown, setCommissionBreakdown] = useState<CommissionBreakdown | null>(null);
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);

  // Get commission breakdown for the order
  const getCommissionBreakdown = async () => {
    try {
      setIsLoadingBreakdown(true);
      const response = await axios.get(`/api/checkout/commission/${orderId}`, {
        withCredentials: true
      });
      setCommissionBreakdown(response.data);
    } catch (error) {
      console.error('Error fetching commission breakdown:', error);
      toast.error('Unable to load commission breakdown');
    } finally {
      setIsLoadingBreakdown(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      getCommissionBreakdown();
    }
  }, [orderId]);

  // Create checkout session
  const createCheckoutSession = async () => {
    if (!user?.email) {
      toast.error('Please log in to continue');
      return;
    }

    try {
      setIsCreating(true);

      // Prepare line items for Stripe
      const lineItems = items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.name,
            description: item.product.description,
            images: item.product.images ? [item.product.images[0]] : [],
          },
          unit_amount: Math.round(item.product.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      const checkoutData: CheckoutSessionData = {
        orderId,
        customerEmail: user.email,
        lineItems,
        totalAmount: Math.round(getTotal() * 100), // Convert to cents
        currency: 'usd',
        successUrl: `${window.location.origin}/orders/${orderId}/success`,
        cancelUrl: `${window.location.origin}/orders/${orderId}/cancel`,
      };

      const response = await axios.post('/api/checkout/create-session', checkoutData, {
        withCredentials: true
      });

      setSessionUrl(response.data.sessionUrl);
      
      // Redirect to Stripe Checkout
      if (response.data.sessionUrl) {
        window.location.href = response.data.sessionUrl;
      }

      toast.success('Checkout session created successfully!');
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      const message = error.response?.data?.message || 'Failed to create checkout session';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">Please log in to continue with checkout</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Commission Breakdown */}
      {commissionBreakdown && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Commission Breakdown</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-blue-700">Total Amount</p>
              <p className="text-lg font-bold text-blue-900">
                ${(commissionBreakdown.totalAmount / 100).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-700">Platform Fee (2%)</p>
              <p className="text-lg font-bold text-red-600">
                ${(commissionBreakdown.commissionAmount / 100).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-700">Vendor Payout</p>
              <p className="text-lg font-bold text-green-600">
                ${(commissionBreakdown.vendorPayoutAmount / 100).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Vendor Breakdown */}
          {commissionBreakdown.vendorBreakdown.length > 1 && (
            <div className="border-t border-blue-200 pt-4">
              <h4 className="font-medium text-blue-900 mb-3">Vendor Breakdown</h4>
              <div className="space-y-2">
                {commissionBreakdown.vendorBreakdown.map((vendor, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-blue-700">{vendor.vendorName}</span>
                    <div className="flex gap-4">
                      <span className="text-blue-600">
                        Subtotal: ${(vendor.subtotal / 100).toFixed(2)}
                      </span>
                      <span className="text-red-600">
                        Fee: ${(vendor.commissionAmount / 100).toFixed(2)}
                      </span>
                      <span className="text-green-600 font-medium">
                        Payout: ${(vendor.vendorPayoutAmount / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${getSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">${getTax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">${getShipping().toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-bold text-blue-600">${getTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Platform Fee Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              A 2% platform fee will be applied to your order
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={createCheckoutSession}
          disabled={isCreating || items.length === 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Checkout Session...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Proceed to Checkout
            </>
          )}
        </button>

        {/* Session URL (if created) */}
        {sessionUrl && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Checkout session created successfully!
              </span>
            </div>
            <a
              href={sessionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800"
            >
              <ExternalLink className="h-4 w-4" />
              Open Stripe Checkout
            </a>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoadingBreakdown && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading commission breakdown...</span>
        </div>
      )}
    </div>
  );
};

export default StripeCheckoutSession; 