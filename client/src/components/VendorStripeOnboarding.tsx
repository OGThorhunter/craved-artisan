import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Loader2,
  DollarSign,
  Shield,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface VendorStripeOnboardingProps {
  vendorProfileId: string;
  vendorEmail: string;
  businessName: string;
}

interface AccountStatus {
  status: 'not_connected' | 'pending' | 'active' | 'restricted' | 'disabled';
  accountId?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
}

const VendorStripeOnboarding: React.FC<VendorStripeOnboardingProps> = ({
  vendorProfileId,
  vendorEmail,
  businessName,
}) => {
  const [, setLocation] = useLocation();
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check account status on component mount
  useEffect(() => {
    checkAccountStatus();
  }, [vendorProfileId]);

  const checkAccountStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/stripe/account-status/${vendorProfileId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const status = await response.json();
        setAccountStatus(status);
        
        // If account exists but is pending, get onboarding URL
        if (status.status === 'pending') {
          await getOnboardingUrl();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to check account status');
      }
    } catch (err) {
      setError('Failed to check account status');
    } finally {
      setIsLoading(false);
    }
  };

  const createConnectAccount = async () => {
    try {
      setIsCreatingAccount(true);
      setError(null);

      const response = await fetch('/api/stripe/create-connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          vendorProfileId,
          email: vendorEmail,
          businessName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccountStatus({
          status: data.status,
          accountId: data.accountId,
        });
        
        // Get onboarding URL after account creation
        await getOnboardingUrl();
        toast.success('Stripe Connect account created successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create Connect account');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const getOnboardingUrl = async () => {
    try {
      const response = await fetch(`/api/stripe/onboarding-url/${vendorProfileId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setOnboardingUrl(data.onboardingUrl);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to get onboarding URL');
      }
    } catch (err) {
      setError('Failed to get onboarding URL');
    }
  };

  const handleOnboardingComplete = () => {
    // Refresh account status after onboarding
    setTimeout(() => {
      checkAccountStatus();
    }, 2000);
  };

  const openOnboarding = () => {
    if (onboardingUrl) {
      window.open(onboardingUrl, '_blank');
      handleOnboardingComplete();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking Stripe account status...</p>
        </div>
      </div>
    );
  }

  if (error && !accountStatus) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-800 mb-4">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Setup Error</span>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={checkAccountStatus}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <CreditCard className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Stripe Connect Setup
        </h1>
        <p className="text-gray-600">
          Connect your Stripe account to receive payments from customers
        </p>
      </div>

      {/* Account Status Display */}
      {accountStatus && (
        <div className="mb-6">
          <div className={`p-4 rounded-lg border ${
            accountStatus.status === 'active' 
              ? 'bg-green-50 border-green-200' 
              : accountStatus.status === 'pending'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {accountStatus.status === 'active' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : accountStatus.status === 'pending' ? (
                <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
              ) : (
                <AlertCircle className="h-5 w-5 text-gray-600" />
              )}
              <span className="font-medium">
                Status: {accountStatus.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            {accountStatus.status === 'active' && (
              <p className="text-green-700 text-sm">
                Your Stripe account is fully connected and ready to receive payments!
              </p>
            )}
            
            {accountStatus.status === 'pending' && (
              <p className="text-yellow-700 text-sm">
                Your account is set up but needs additional verification. Complete the onboarding process below.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Commission Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Commission Structure</span>
        </div>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>2% commission</strong> automatically deducted from each transaction</p>
          <p>• <strong>98% payout</strong> directly to your Stripe account</p>
          <p>• <strong>No manual handling</strong> - funds transfer automatically</p>
        </div>
      </div>

      {/* Setup Steps */}
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Setup Steps</h2>
        
        {/* Step 1: Create Account */}
        <div className="flex items-start gap-4 p-4 border rounded-lg">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            accountStatus?.status !== 'not_connected' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            1
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">Create Stripe Connect Account</h3>
            <p className="text-sm text-gray-600 mb-3">
              Set up your Stripe Connect account to receive payments
            </p>
            
            {accountStatus?.status === 'not_connected' && (
              <button
                onClick={createConnectAccount}
                disabled={isCreatingAccount}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreatingAccount ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Create Account
                  </>
                )}
              </button>
            )}
            
            {accountStatus?.status !== 'not_connected' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Account Created</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Complete Onboarding */}
        <div className="flex items-start gap-4 p-4 border rounded-lg">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            accountStatus?.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : accountStatus?.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            2
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">Complete Onboarding</h3>
            <p className="text-sm text-gray-600 mb-3">
              Provide business information and verify your identity with Stripe
            </p>
            
            {accountStatus?.status === 'pending' && onboardingUrl && (
              <button
                onClick={openOnboarding}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Complete Onboarding
              </button>
            )}
            
            {accountStatus?.status === 'active' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Onboarding Complete</span>
              </div>
            )}
            
            {accountStatus?.status === 'not_connected' && (
              <p className="text-sm text-gray-500">Complete step 1 first</p>
            )}
          </div>
        </div>

        {/* Step 3: Ready to Receive Payments */}
        <div className="flex items-start gap-4 p-4 border rounded-lg">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            accountStatus?.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            3
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">Ready to Receive Payments</h3>
            <p className="text-sm text-gray-600 mb-3">
              Start selling and receive automatic payouts to your Stripe account
            </p>
            
            {accountStatus?.status === 'active' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">All Set!</span>
              </div>
            )}
            
            {accountStatus?.status !== 'active' && (
              <p className="text-sm text-gray-500">Complete previous steps first</p>
            )}
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-gray-900">Security & Compliance</span>
        </div>
        <p className="text-sm text-gray-600">
          Stripe Connect is PCI DSS compliant and handles all sensitive payment data securely. 
          Your business information is protected and only used for payment processing.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {accountStatus?.status === 'active' ? (
          <button
            onClick={() => setLocation('/vendor/dashboard')}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Go to Dashboard
          </button>
        ) : (
          <button
            onClick={() => setLocation('/vendor/dashboard')}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Continue Later
          </button>
        )}
        
        <button
          onClick={checkAccountStatus}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default VendorStripeOnboarding; 