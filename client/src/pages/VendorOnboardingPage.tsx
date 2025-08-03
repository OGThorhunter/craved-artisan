import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import VendorStripeOnboarding from '../components/VendorStripeOnboarding';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

const VendorOnboardingPage = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access vendor onboarding</p>
          <button
            onClick={() => setLocation('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // In a real app, you would fetch the vendor profile from the API
  // For now, we'll use mock data
  const vendorProfileId = 'mock-vendor-profile-id'; // This should come from user's vendor profile
  const vendorEmail = user.email;
  const businessName = 'Mock Business Name'; // This should come from vendor profile

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setLocation('/vendor/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Onboarding</h1>
          <p className="text-gray-600 mt-2">Complete your Stripe Connect setup to start receiving payments</p>
        </div>

        {/* Onboarding Component */}
        <VendorStripeOnboarding
          vendorProfileId={vendorProfileId}
          vendorEmail={vendorEmail}
          businessName={businessName}
        />
      </div>
    </div>
  );
};

export default VendorOnboardingPage; 