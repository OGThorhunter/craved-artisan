import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Shield,
  DollarSign,
  UserCheck,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OnboardingStatus {
  hasAccount: boolean;
  accountId?: string;
  status: 'not_created' | 'pending' | 'active';
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  requirements?: any;
  onboardingUrl?: string;
  message?: string;
}

interface CommissionInfo {
  commissionRate: number;
  description: string;
  calculation: string;
  vendorPayout: string;
}

const VendorStripeOnboardingController: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [commissionInfo, setCommissionInfo] = useState<CommissionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [vendorProfileId, setVendorProfileId] = useState<string | null>(null);

  // Get vendor profile ID for the current user
  useEffect(() => {
    const getVendorProfile = async () => {
      try {
        const response = await axios.get(`/api/vendor/profile`, {
          withCredentials: true
        });
        if (response.data?.id) {
          setVendorProfileId(response.data.id);
        }
      } catch (error) {
        console.error('Error fetching vendor profile:', error);
        toast.error('Unable to fetch vendor profile');
      }
    };

    if (user?.role === 'VENDOR') {
      getVendorProfile();
    }
  }, [user]);

  // Check onboarding status
  const checkStatus = async () => {
    if (!vendorProfileId) return;

    try {
      setIsLoading(true);
      const response = await axios.get(`/api/stripe-controller/onboarding/status/${vendorProfileId}`, {
        withCredentials: true
      });
      setStatus(response.data);
    } catch (error) {
      console.error('Error checking status:', error);
      toast.error('Unable to check onboarding status');
    } finally {
      setIsLoading(false);
    }
  };

  // Get commission information
  const getCommissionInfo = async () => {
    try {
      const response = await axios.get('/api/stripe-controller/commission/info', {
        withCredentials: true
      });
      setCommissionInfo(response.data);
    } catch (error) {
      console.error('Error fetching commission info:', error);
    }
  };

  useEffect(() => {
    if (vendorProfileId) {
      checkStatus();
      getCommissionInfo();
    }
  }, [vendorProfileId]);

  // Create Stripe Connect account
  const createConnectAccount = async () => {
    if (!vendorProfileId || !user?.email) return;

    try {
      setIsCreating(true);
      const response = await axios.post('/api/stripe-controller/onboarding/create', {
        vendorProfileId,
        email: user.email,
        businessName: user.businessName || 'My Business'
      }, {
        withCredentials: true
      });

      setStatus({
        hasAccount: true,
        accountId: response.data.accountId,
        status: response.data.status,
        onboardingUrl: response.data.url
      });

      toast.success('Stripe Connect account created successfully!');
    } catch (error: any) {
      console.error('Error creating Connect account:', error);
      const message = error.response?.data?.message || 'Failed to create Stripe Connect account';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  // Refresh onboarding link
  const refreshOnboardingLink = async () => {
    if (!vendorProfileId) return;

    try {
      setIsRefreshing(true);
      const response = await axios.post(`/api/stripe-controller/onboarding/refresh/${vendorProfileId}`, {}, {
        withCredentials: true
      });

      setStatus(prev => prev ? {
        ...prev,
        onboardingUrl: response.data.url
      } : null);

      toast.success('Onboarding link refreshed!');
    } catch (error: any) {
      console.error('Error refreshing onboarding link:', error);
      const message = error.response?.data?.message || 'Failed to refresh onboarding link';
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    if (!vendorProfileId) return;

    try {
      const response = await axios.post(`/api/stripe-controller/onboarding/complete/${vendorProfileId}`, {}, {
        withCredentials: true
      });

      setStatus(prev => prev ? {
        ...prev,
        status: response.data.status,
        chargesEnabled: response.data.chargesEnabled,
        payoutsEnabled: response.data.payoutsEnabled,
        requirements: response.data.requirements
      } : null);

      toast.success(response.data.message);
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      const message = error.response?.data?.message || 'Failed to complete onboarding';
      toast.error(message);
    }
  };

  if (!user || user.role !== 'VENDOR') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">Access denied. Vendor account required.</span>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading onboarding status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stripe Connect Onboarding</h1>
        <p className="text-gray-600">
          Complete your Stripe Connect setup to start accepting payments and receiving payouts.
        </p>
      </div>

      {/* Commission Information */}
      {commissionInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-blue-900">Commission Structure</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700 mb-1">{commissionInfo.description}</p>
              <p className="text-sm text-blue-600">{commissionInfo.calculation}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">{commissionInfo.vendorPayout}</p>
              <p className="text-sm font-medium text-blue-900">
                Commission Rate: {(commissionInfo.commissionRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Onboarding Status</h2>
          <button
            onClick={checkStatus}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {!status?.hasAccount ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Stripe Connect Account</h3>
            <p className="text-gray-600 mb-6">
              Create your Stripe Connect account to start accepting payments and receiving payouts.
            </p>
            <button
              onClick={createConnectAccount}
              disabled={isCreating}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              {isCreating ? 'Creating Account...' : 'Create Stripe Connect Account'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Account Status */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                status.status === 'active' ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {status.status === 'active' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Status: {status.status === 'active' ? 'Active' : 'Pending'}
                </p>
                <p className="text-sm text-gray-600">
                  Account ID: {status.accountId}
                </p>
              </div>
            </div>

            {/* Capabilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${status.chargesEnabled ? 'bg-green-100' : 'bg-red-100'}`}>
                  {status.chargesEnabled ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <span className="text-sm">
                  Payments: {status.chargesEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${status.payoutsEnabled ? 'bg-green-100' : 'bg-red-100'}`}>
                  {status.payoutsEnabled ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <span className="text-sm">
                  Payouts: {status.payoutsEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Onboarding Actions */}
            {status.status === 'pending' && (
              <div className="border-t pt-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  {status.onboardingUrl && (
                    <a
                      href={status.onboardingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Complete Onboarding
                    </a>
                  )}
                  <button
                    onClick={refreshOnboardingLink}
                    disabled={isRefreshing}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {isRefreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {isRefreshing ? 'Refreshing...' : 'Refresh Link'}
                  </button>
                  <button
                    onClick={completeOnboarding}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <UserCheck className="h-4 w-4" />
                    Check Completion
                  </button>
                </div>
              </div>
            )}

            {/* Requirements (if any) */}
            {status.requirements && Object.keys(status.requirements).length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                <div className="text-sm text-gray-600">
                  <pre className="bg-gray-50 p-3 rounded overflow-auto">
                    {JSON.stringify(status.requirements, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Need Help?</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Complete all required information in the Stripe onboarding form</p>
          <p>• Ensure your business information is accurate and up-to-date</p>
          <p>• Contact support if you encounter any issues during onboarding</p>
          <p>• Once approved, you'll be able to accept payments and receive payouts</p>
        </div>
      </div>
    </div>
  );
};

export default VendorStripeOnboardingController; 