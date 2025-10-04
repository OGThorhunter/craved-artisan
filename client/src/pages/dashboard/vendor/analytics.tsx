// pages/dashboard/vendor/analytics.tsx
import { useEffect } from "react";
import { useLocation } from 'wouter';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import { useUrlTab } from '@/hooks/useUrlTab';
import StripeTaxDashboard from "@/components/stripe/StripeTaxDashboard";
import MotivationalQuote from "@/components/dashboard/MotivationalQuote";
import { getQuoteByCategory } from "@/data/motivationalQuotes";
import { flags } from "@/lib/flags";

import { BusinessSnapshot } from "@/components/analytics/BusinessSnapshot";

type TabType = 'financial-statements' | 'taxes';

export default function VendorAnalyticsPage() {
  const [location] = useLocation();
  
  // Use real vendor ID from context or mock for development
  const vendorId = 'dev-user-id'; // This should come from auth context in production
  
  // Define allowed tabs with feature flag support
  const TABS: TabType[] = ['financial-statements', 'taxes'];
  const { tab: activeTab, setTab, allowed: allowedTabs } = useUrlTab(
    TABS,
    'financial-statements',
    { 
      'financial-statements': flags.LIVE_ANALYTICS && flags.FINANCIALS
    }
  );
  
  // Debug tab changes
  useEffect(() => {
    console.log('=== TAB CHANGE DEBUG ===');
    console.log('Active tab changed to:', activeTab);
    console.log('Current URL:', window.location.href);
  }, [activeTab]);
  
  // Business Snapshot handles its own data fetching

  // Debug information for development
  useEffect(() => {
    console.log('=== ANALYTICS PAGE DEBUG ===');
    console.log('Location changed to:', location);
    console.log('Active tab:', activeTab);
    console.log('Feature flag LIVE_ANALYTICS:', flags.LIVE_ANALYTICS);
    console.log('Feature flag FINANCIALS:', flags.FINANCIALS);
    console.log('Allowed tabs:', allowedTabs);
    console.log('Current URL:', window.location.href);
  }, [location, activeTab, allowedTabs]);

  // Removed unused icons array
  

  const renderTabContent = () => {
    console.log('=== RENDER TAB CONTENT DEBUG ===');
    console.log('Active tab:', activeTab);
    console.log('Rendering content for tab:', activeTab);
    
    switch (activeTab) {
      
      case 'financial-statements':
        console.log('Rendering business snapshot tab content');
        return <BusinessSnapshot vendorId={vendorId} />;
      
      case 'taxes':
        return (
          <div className="space-y-8">
            {/* Stripe Tax Dashboard */}
            <StripeTaxDashboard />
          </div>
        );
      
      case 'pricing':
        return (
          <div className="space-y-8">
            {/* Pricing & Inventory Insights Moved Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Pricing & Inventory Insights Moved
                  </h3>
                  <p className="text-blue-700 mb-4">
                    AI-powered pricing and inventory insights are now available directly in your workflow:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2">📦 Products</h4>
                      <p className="text-sm text-gray-600 mb-3">Pricing insights and competitor analysis</p>
                      <button 
                        onClick={() => window.location.href = '/dashboard/vendor/products'}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Products →
                      </button>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2">📋 Orders</h4>
                      <p className="text-sm text-gray-600 mb-3">Price sensitivity and cart abandonment insights</p>
                      <button 
                        onClick={() => window.location.href = '/dashboard/vendor/orders'}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Orders →
                      </button>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2">📦 Inventory</h4>
                      <p className="text-sm text-gray-600 mb-3">Stockout alerts and supplier optimization</p>
                      <button 
                        onClick={() => window.location.href = '/dashboard/vendor/inventory'}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Inventory →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      
      default:
        return null;
    }
  };

  const getTabDisplayName = (tab: TabType) => {
    switch (tab) {
      case 'financial-statements': return 'Business Snapshot';
      case 'taxes': return 'Taxes';
      default: return 'Business Snapshot';
    }
  };

  return (
    <VendorDashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Currently viewing: <span className="font-semibold text-[#5B6E02]">{getTabDisplayName(activeTab as TabType)}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#5B6E02] text-white">
                  {getTabDisplayName(activeTab as TabType)}
                </div>
              </div>
            </div>
            <MotivationalQuote
              quote={getQuoteByCategory('motivation').quote}
              author={getQuoteByCategory('motivation').author}
              icon={getQuoteByCategory('motivation').icon}
              variant={getQuoteByCategory('motivation').variant}
            />
            
            {/* Financial Data Disclaimer */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Financial Data Disclaimer</p>
                  <p className="mt-1">All financial data displayed is for informational purposes only. Users are responsible for verifying the accuracy and security of their financial information. This dashboard does not constitute financial advice.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-[#F7F2EC] rounded-lg shadow-xl border border-gray-200 mb-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'financial-statements' as const, label: 'Business Snapshot', icon: '📊', tooltip: 'Operational metrics, sales funnel, and payout information' },
                  { id: 'taxes', label: 'Taxes', icon: '📋', tooltip: 'Tax calculations, deductions, and reporting for compliance' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTab(tab.id as TabType)}
                    disabled={!allowedTabs.includes(tab.id as TabType)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#5B6E02] text-[#5B6E02]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } ${
                      !allowedTabs.includes(tab.id as TabType) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          

          
          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </VendorDashboardLayout>
  );
} 