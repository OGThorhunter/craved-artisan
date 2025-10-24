import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Shield, 
  DollarSign,
  ArrowRight,
  Clock
} from 'lucide-react';

interface StripeOnboardingStepProps {
  role: 'VENDOR' | 'EVENT_COORDINATOR';
  onStatusChange: (completed: boolean) => void;
  onSkip?: () => void;
  disabled?: boolean;
  className?: string;
}

interface OnboardingStatus {
  hasAccount: boolean;
  accountId?: string;
  status: 'not_started' | 'pending' | 'active';
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  onboardingUrl?: string;
}

const StripeOnboardingStep: React.FC<StripeOnboardingStepProps> = ({
  role,
  onStatusChange,
  onSkip,
  disabled = false,
  className = ''
}) => {
  const [status, setStatus] = useState<OnboardingStatus>({
    hasAccount: false,
    status: 'not_started'
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [checking, setChecking] = useState(false);


  // Check Stripe onboarding status
  const checkOnboardingStatus = async () => {
    try {
      setChecking(true);
      
      // For now, we'll use a simplified approach since the signup flow
      // happens before we have vendor/coordinator profiles created
      // In a real implementation, this would check actual Stripe status
      const mockStatus: OnboardingStatus = {
        hasAccount: false,
        status: 'not_started'
      };
      
      setStatus(mockStatus);
      onStatusChange(mockStatus.status === 'active');
      
    } catch (error) {
      console.error('Error checking Stripe status:', error);
      toast.error('Failed to check Stripe Connect status');
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  // Start Stripe onboarding
  const startOnboarding = async () => {
    try {
      setCreating(true);
      
      // For now, we'll redirect to a placeholder
      // In the real implementation, this would create the Stripe Connect account
      // and redirect to Stripe's onboarding flow
      
      toast.success('Stripe onboarding initiated! You can complete this later from your dashboard.');
      
      // Update status to show as pending
      const newStatus = {
        hasAccount: true,
        status: 'pending' as const,
        onboardingUrl: '#'
      };
      
      setStatus(newStatus);
      onStatusChange(false); // Still not complete
      
      // Create subscription for vendors ONLY (not for event coordinators)
      if (role === 'VENDOR') {
        await createVendorSubscription();
      } else {
        // For Event Coordinators, just acknowledge the setup
        toast.success('Payment setup initiated! You can complete this later from your dashboard.', {
          duration: 3000,
        });
      }
      
    } catch (error) {
      console.error('Error starting Stripe onboarding:', error);
      toast.error('Failed to start Stripe Connect onboarding');
    } finally {
      setCreating(false);
    }
  };

  // Create vendor subscription with trial
  const createVendorSubscription = async () => {
    try {
      const response = await fetch('/api/vendor-subscription/create', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.subscription?.trialEnd) {
          toast.success('14-day free trial activated! 🎉', {
            duration: 4000,
          });
        }
      } else {
        // Don't show error to user as subscription can be created later
        console.warn('Subscription creation deferred - can be created later');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      // Silent fail - subscription can be created later
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B6E02]"></div>
          <span className="ml-3 text-gray-600">Checking Stripe Connect status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Setup (Optional)</h3>
        <p className="text-sm text-gray-600">
          {role === 'VENDOR' 
            ? 'You can set up payments now or complete your account and set up payments later from your dashboard. This is required before you can start selling products.'
            : 'You can set up payments now or complete your account and set up payments later from your dashboard. This is required before you can sell booth spaces at events.'}
        </p>
      </div>

      {/* Vendor Trial Information */}
      {role === 'VENDOR' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-medium text-green-900 mb-2">14-Day Free Trial</h4>
              <p className="text-sm text-green-800 mb-3">
                Start selling immediately with your free trial! No payment method required to begin.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Full access to all vendor features
                </div>
                <div className="flex items-center text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  After trial: $25/month + 2% commission
                </div>
                <div className="flex items-center text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Cancel anytime during your trial
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Connect Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <h4 className="text-lg font-medium text-blue-900 mb-3">Stripe Connect</h4>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-blue-800">
                <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                Bank-level security for all transactions
              </div>
              <div className="flex items-center text-sm text-blue-800">
                <DollarSign className="h-4 w-4 text-blue-600 mr-2" />
                Automatic payouts to your bank account
              </div>
              <div className="flex items-center text-sm text-blue-800">
                <CreditCard className="h-4 w-4 text-blue-600 mr-2" />
                Accept all major credit and debit cards
              </div>
              <div className="flex items-center text-sm text-blue-800">
                <Shield className="h-4 w-4 text-blue-600 mr-2" />
                PCI DSS compliant payment processing
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h5 className="font-medium text-gray-900 mb-2">
          {role === 'VENDOR' ? 'Pricing' : 'Commission Structure'}
        </h5>
        {role === 'VENDOR' ? (
          <>
            <div className="text-sm text-gray-600 mb-2">
              <strong>$25/month</strong> subscription + <strong>2%</strong> commission on all sales
            </div>
            <p className="text-sm text-gray-600 mb-2">Your subscription includes:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Unlimited product listings</li>
              <li>• Secure payment processing via Stripe</li>
              <li>• Sales analytics and customer insights</li>
              <li>• Marketing and promotion of your products</li>
              <li>• Customer support and order management</li>
            </ul>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-2">
              <strong>Free to join</strong> - Only <strong>2%</strong> commission on booth sales
            </div>
            <p className="text-sm text-gray-600 mb-2">No monthly fees! Platform commission covers:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Secure payment processing via Stripe</li>
              <li>• Event listing and promotion</li>
              <li>• Vendor management tools</li>
              <li>• Customer support and payments</li>
            </ul>
          </>
        )}
      </div>

      {/* Status Display */}
      <div className="space-y-4">
        {status.status === 'not_started' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">
                  Stripe Connect Setup Required
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You'll need to connect your bank account to receive payments. This process is secure and handled entirely by Stripe.
                </p>
              </div>
            </div>
          </div>
        )}

        {status.status === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  Onboarding In Progress
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your Stripe Connect setup is in progress. Complete your onboarding to start receiving payments.
                </p>
              </div>
            </div>
          </div>
        )}

        {status.status === 'active' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">
                  Stripe Connect Active
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  Your payment setup is complete. You can now receive payments for your {role === 'VENDOR' ? 'products' : 'events'}.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {status.status === 'not_started' && (
          <>
            <button
              onClick={startOnboarding}
              disabled={disabled || creating}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5B6E02] hover:bg-[#4A5D01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting up...
                </div>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Connect with Stripe
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
            {onSkip && (
              <button
                onClick={onSkip}
                disabled={disabled || creating}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip for now
              </button>
            )}
          </>
        )}

        {status.status === 'pending' && status.onboardingUrl && (
          <>
            <button
              onClick={() => window.open(status.onboardingUrl, '_blank')}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5B6E02] hover:bg-[#4A5D01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02]"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Continue Stripe Onboarding
            </button>
            <button
              onClick={checkOnboardingStatus}
              disabled={checking}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B6E02]"
            >
              {checking ? 'Checking...' : 'Check Status'}
            </button>
          </>
        )}
      </div>

      {/* Skip Info */}
      {onSkip && status.status !== 'active' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                Payment Setup Available
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                You can set up payments now or complete your account and set up payments later from your dashboard. 
                You'll need Stripe Connect setup before you can {role === 'VENDOR' ? 'sell products' : 'receive payments for events'} 
                on the platform.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StripeOnboardingStep;

