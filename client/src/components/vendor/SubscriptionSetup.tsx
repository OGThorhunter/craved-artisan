import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, AlertTriangle, Clock, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SubscriptionStatus {
  hasAccess: boolean;
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | null;
  isInTrial: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  subscriptionId: string | null;
}

export const SubscriptionSetup: React.FC = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vendor-subscription/status', { credentials: 'include' });
      
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        toast.error('Failed to load subscription status');
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      toast.error('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const openBillingPortal = async () => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/vendor-subscription/billing-portal', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      } else {
        toast.error('Failed to open billing portal');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setActionLoading(false);
    }
  };

  const getDaysRemaining = (dateStr: string | null) => {
    if (!dateStr) return 0;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">No Subscription Found</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Unable to load your subscription information. Please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const trialDaysRemaining = status.trialEndsAt ? getDaysRemaining(status.trialEndsAt) : 0;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {status.isInTrial && (
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            )}
            {status.status === 'ACTIVE' && (
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            )}
            {status.status === 'PAST_DUE' && (
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            )}
            {status.status === 'CANCELED' && (
              <div className="p-3 bg-gray-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-gray-600" />
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {status.isInTrial && 'Free Trial Active'}
                {status.status === 'ACTIVE' && !status.isInTrial && 'Subscription Active'}
                {status.status === 'PAST_DUE' && 'Payment Past Due'}
                {status.status === 'CANCELED' && 'Subscription Canceled'}
                {status.status === 'INCOMPLETE' && 'Subscription Incomplete'}
              </h3>
              
              {status.isInTrial && (
                <p className="text-sm text-gray-600 mt-1">
                  {trialDaysRemaining > 0 
                    ? `${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''} remaining in your trial`
                    : 'Trial ending today'}
                </p>
              )}
              
              {status.status === 'ACTIVE' && !status.isInTrial && (
                <p className="text-sm text-gray-600 mt-1">
                  Your subscription is active. $25/month
                </p>
              )}
              
              {status.status === 'PAST_DUE' && (
                <p className="text-sm text-red-600 mt-1">
                  Please update your payment method to continue using the platform
                </p>
              )}
              
              {status.status === 'CANCELED' && (
                <p className="text-sm text-gray-600 mt-1">
                  Your subscription has been canceled
                </p>
              )}
            </div>
          </div>

          <button
            onClick={openBillingPortal}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Manage Billing
                <ExternalLink className="w-3 h-3" />
              </>
            )}
          </button>
        </div>

        {/* Trial Warning */}
        {status.isInTrial && trialDaysRemaining <= 3 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900">Trial Ending Soon</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Add a payment method before your trial ends to continue accepting orders.
                </p>
                <button
                  onClick={openBillingPortal}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Add Payment Method
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Next Billing Date */}
        {status.currentPeriodEnd && status.status === 'ACTIVE' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Next billing date:</span>
              <span className="font-medium text-gray-900">
                {new Date(status.currentPeriodEnd).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Info */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">What's Included</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Unlimited product listings</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Access to marketplace customers</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Order management tools</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Analytics and reporting</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>2% transaction fee applies</span>
          </li>
        </ul>
        <div className="mt-6 pt-4 border-t border-blue-200">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">$25</span>
            <span className="text-gray-600">/month</span>
          </div>
        </div>
      </div>
    </div>
  );
};

