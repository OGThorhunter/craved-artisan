import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { CreditCard, AlertTriangle, Clock, CheckCircle, Loader2 } from 'lucide-react';

interface SubscriptionStatus {
  hasAccess: boolean;
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | null;
  isInTrial: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
}

export const SubscriptionWidget: React.FC = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/vendor-subscription/status', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
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
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!status) return null;

  const trialDaysRemaining = status.trialEndsAt ? getDaysRemaining(status.trialEndsAt) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {status.isInTrial && (
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
        )}
        {status.status === 'ACTIVE' && !status.isInTrial && (
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
        )}
        {(status.status === 'PAST_DUE' || status.status === 'CANCELED') && (
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">
            {status.isInTrial && 'Trial Active'}
            {status.status === 'ACTIVE' && !status.isInTrial && 'Subscription Active'}
            {status.status === 'PAST_DUE' && 'Payment Required'}
            {status.status === 'CANCELED' && 'Subscription Canceled'}
          </h3>
          
          <p className="text-xs text-gray-600 mt-1">
            {status.isInTrial && trialDaysRemaining > 0 && (
              <>{trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining</>
            )}
            {status.isInTrial && trialDaysRemaining === 0 && <>Trial ends today</>}
            {status.status === 'ACTIVE' && !status.isInTrial && <>$25/month</>}
            {status.status === 'PAST_DUE' && <>Update payment method</>}
            {status.status === 'CANCELED' && <>Reactivate to accept orders</>}
          </p>

          <Link href="/vendor/subscription">
            <a className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 inline-flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              Manage subscription
            </a>
          </Link>
        </div>
      </div>

      {/* Warning for expiring trial */}
      {status.isInTrial && trialDaysRemaining <= 3 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1.5">
            <span className="font-semibold">Action needed:</span> Add payment method before trial ends
          </p>
        </div>
      )}
    </div>
  );
};

