import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Target,
  Mail,
  Calendar,
  BarChart3,
  Star,
  Settings
} from 'lucide-react';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';

// Import consolidated promotion components
import CampaignsTab from '../components/promotions/CampaignsTab';
import EmailSocialTab from '../components/promotions/EmailSocialTab';
import SchedulerAutomationTab from '../components/promotions/SchedulerAutomationTab';
import AnalyticsTab from '../components/promotions/AnalyticsTab';
import LoyaltyReferralsTab from '../components/promotions/LoyaltyReferralsTab';

// Types
interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'bogo' | 'free_shipping' | 'loyalty_points';
  value: number;
  status: 'draft' | 'active' | 'paused' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  performance: {
    totalUses: number;
    totalDiscount: number;
    conversionRate: number;
    revenue: number;
    roi: number;
  };
}

const VendorPromotionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'email-social' | 'scheduler-automation' | 'analytics' | 'loyalty-referrals'>('campaigns');

// Mock data
  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => Promise.resolve([]),
  });

  // New consolidated tabs
  const tabs = [
    { 
      id: 'campaigns', 
      label: 'Campaigns', 
      icon: Target,
      description: 'Create and manage promotional campaigns, discounts, and templates'
    },
    { 
      id: 'email-social', 
      label: 'Email & Social', 
      icon: Mail,
      description: 'Email campaigns and social media promotion tools'
    },
    { 
      id: 'scheduler-automation', 
      label: 'Scheduler & Automation', 
      icon: Calendar,
      description: 'Schedule campaigns and set up automated promotion rules'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      description: 'Track performance, A/B testing, and AI-powered insights'
    },
    { 
      id: 'loyalty-referrals', 
      label: 'Loyalty & Referrals', 
      icon: Star,
      description: 'Loyalty programs, referral systems, and customer rewards'
    },
  ];

  return (
    <VendorDashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
              <p className="text-gray-600 mt-2">Create and manage promotional campaigns, discounts, and customer incentives</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                title="Browse templates"
              >
                <Settings className="h-4 w-4" />
                <span>Templates</span>
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Create new promotion"
              >
                <Plus className="h-4 w-4" />
                <span>New Promotion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
              <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                      title={tab.description}
              >
                <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                </div>
              </button>
                  );
                })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'campaigns' && (
              <CampaignsTab
                promotions={promotions}
                onPromotionCreate={() => console.log('Create promotion')}
                onPromotionUpdate={(promotion) => console.log('Update promotion:', promotion)}
                onPromotionDelete={(id) => console.log('Delete promotion:', id)}
                onPromotionAction={(action, id) => console.log('Promotion action:', action, id)}
                onTemplateSelect={(template) => console.log('Select template:', template)}
                onBulkAction={(action) => console.log('Bulk action:', action)}
                selectedPromotions={[]}
                onSelectPromotion={(id) => console.log('Select promotion:', id)}
                onSelectAll={() => console.log('Select all')}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'email-social' && (
              <EmailSocialTab
                campaigns={[]}
                templates={[]}
                onCampaignCreate={(campaign) => console.log('Create campaign:', campaign)}
                onCampaignUpdate={(campaign) => console.log('Update campaign:', campaign)}
                onCampaignDelete={(id) => console.log('Delete campaign:', id)}
                onCampaignSend={(id) => console.log('Send campaign:', id)}
                onTemplateCreate={(template) => console.log('Create template:', template)}
                onSocialShare={(content) => console.log('Share content:', content)}
                isLoading={false}
              />
            )}

            {activeTab === 'scheduler-automation' && (
              <SchedulerAutomationTab
                schedules={[]}
                automations={[]}
                onScheduleCreate={(schedule) => console.log('Create schedule:', schedule)}
                onScheduleUpdate={(schedule) => console.log('Update schedule:', schedule)}
                onScheduleDelete={(id) => console.log('Delete schedule:', id)}
                onAutomationCreate={(automation) => console.log('Create automation:', automation)}
                onAutomationUpdate={(automation) => console.log('Update automation:', automation)}
                onAutomationToggle={(id, status) => console.log('Toggle automation:', id, status)}
                onConflictResolve={(conflict) => console.log('Resolve conflict:', conflict)}
                isLoading={false}
              />
            )}

        {activeTab === 'analytics' && (
              <AnalyticsTab
                analytics={{}}
                abTests={[]}
                onReportGenerate={(type) => console.log('Generate report:', type)}
                onABTestCreate={(test) => console.log('Create A/B test:', test)}
                onABTestUpdate={(test) => console.log('Update A/B test:', test)}
                onABTestRun={(id) => console.log('Run A/B test:', id)}
                onInsightAction={(id, action) => console.log('Insight action:', id, action)}
                onExportData={(format) => console.log('Export data:', format)}
                timeRange="30d"
                onTimeRangeChange={(range) => console.log('Time range changed:', range)}
                isLoading={false}
              />
            )}

            {activeTab === 'loyalty-referrals' && (
              <LoyaltyReferralsTab
                loyaltyPrograms={[]}
                referrals={[]}
                onLoyaltyCreate={(program) => console.log('Create loyalty program:', program)}
                onLoyaltyUpdate={(program) => console.log('Update loyalty program:', program)}
                onLoyaltyDelete={(id) => console.log('Delete loyalty program:', id)}
                onReferralCreate={(referral) => console.log('Create referral:', referral)}
                onReferralUpdate={(referral) => console.log('Update referral:', referral)}
                onReferralDelete={(id) => console.log('Delete referral:', id)}
                onRewardIssue={(customerId, reward) => console.log('Issue reward:', customerId, reward)}
                onReferralCodeGenerate={(customerId) => console.log('Generate referral code:', customerId)}
                onAIAction={(action) => console.log('AI action:', action)}
                isLoading={false}
              />
            )}
          </div>
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorPromotionsPage;
