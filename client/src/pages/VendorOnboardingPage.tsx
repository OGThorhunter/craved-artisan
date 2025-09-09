import { useAuth } from '../contexts/AuthContext';
import VendorStripeOnboarding from '../components/VendorStripeOnboarding';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import MotivationalQuote from '@/components/dashboard/MotivationalQuote';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { getQuoteByCategory } from '@/data/motivationalQuotes';
import { useLocation } from 'wouter';
import { CreditCard, CheckCircle } from 'lucide-react';

const VendorOnboardingPage = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return (
      <VendorDashboardLayout>
        <div className="py-8 bg-white min-h-screen">
          <div className="container-responsive">
            <div className="text-center">
              <h2 className="responsive-subheading text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-6">Please log in to access vendor onboarding</p>
              <button
                onClick={() => setLocation('/login')}
                className="responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  // In a real app, you would fetch the vendor profile from the API
  // For now, we'll use mock data
  const vendorProfileId = 'mock-vendor-profile-id'; // This should come from user's vendor profile
  const vendorEmail = user.email;
  const businessName = 'Mock Business Name'; // This should come from vendor profile

  return (
    <VendorDashboardLayout>
      <div className="py-8 bg-white min-h-screen">
        <div className="container-responsive">
          {/* Header */}
          <DashboardHeader
            title="Vendor Onboarding"
            description="Complete your Stripe Connect setup to start receiving payments"
            currentView="Onboarding"
            icon={CreditCard}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />

          {/* Motivational Quote */}
          <MotivationalQuote
            quote={getQuoteByCategory('growth').quote}
            author={getQuoteByCategory('growth').author}
            icon={getQuoteByCategory('growth').icon}
            variant={getQuoteByCategory('growth').variant}
          />

          {/* Onboarding Component */}
          <VendorStripeOnboarding
            vendorProfileId={vendorProfileId}
            vendorEmail={vendorEmail}
            businessName={businessName}
          />
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorOnboardingPage; 
