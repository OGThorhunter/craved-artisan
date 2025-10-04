import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MotivationalQuote from '@/components/dashboard/MotivationalQuote';
import { getQuoteByCategory } from '@/data/motivationalQuotes';
import { 
  TrendingUp, 
  Users, 
  BarChart3,
  FileText,
  Target,
  Brain,
  Sparkles
} from 'lucide-react';

// Import existing components
import { BusinessSnapshot } from '@/components/analytics/BusinessSnapshot';
import StripeTaxDashboard from '@/components/stripe/StripeTaxDashboard';
import Customer360 from '@/components/crm/Customer360';
import CustomerHealthOverview from '@/components/crm/CustomerHealthOverview';

// Import CRM components
import Pipeline from '@/components/crm/Pipeline';
import TaskManagement from '@/components/crm/TaskManagement';

type AnalyticsTabType = 'business-snapshot' | 'taxes' | 'customer-360' | 'pipeline' | 'tasks' | 'customer-health';

interface VendorAnalyticsCRMPageProps {
  vendorId?: string;
}

const VendorAnalyticsCRMPage: React.FC<VendorAnalyticsCRMPageProps> = ({ 
  vendorId = 'dev-user-id' 
}) => {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<AnalyticsTabType>('business-snapshot');

  // Handle URL query parameters for tab selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab') as AnalyticsTabType;
    const validTabs = ['business-snapshot', 'taxes', 'customer-360', 'pipeline', 'tasks', 'customer-health'];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  const tabs = [
    { 
      id: 'business-snapshot' as const, 
      label: 'Business Snapshot', 
      icon: BarChart3,
      description: 'Operational metrics, sales funnel, and payout information'
    },
    { 
      id: 'taxes' as const, 
      label: 'Taxes', 
      icon: FileText,
      description: 'Tax calculations, deductions, and reporting for compliance'
    },
    { 
      id: 'customer-360' as const, 
      label: 'Customer 360', 
      icon: Users,
      description: 'Unified customer view with communications and segmentation'
    },
    { 
      id: 'pipeline' as const, 
      label: 'Pipeline', 
      icon: Target,
      description: 'Sales pipeline and opportunity management'
    },
    { 
      id: 'tasks' as const, 
      label: 'Tasks', 
      icon: FileText,
      description: 'Task management and team collaboration'
    },
    { 
      id: 'customer-health' as const, 
      label: 'Customer Health', 
      icon: BarChart3,
      description: 'CRM metrics, trends, and customer health analysis'
    }
  ];

  const renderContent = () => {
    // Mock data for CRM components
    const mockCustomers = [
      {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Acme Corp',
        status: 'customer' as const,
        source: 'Website',
        tags: ['VIP', 'Enterprise'],
        totalOrders: 15,
        totalSpent: 25000,
        lifetimeValue: 35000,
        lastContactAt: '2024-01-15',
        createdAt: '2023-06-15',
        assignedTo: 'sales@company.com',
        leadScore: 85,
        isVip: true
      }
    ];

    const mockOpportunities = [
      {
        id: '1',
        customerId: '1',
        title: 'Enterprise Software License',
        description: 'Large enterprise looking to license our platform for 500+ users',
        stage: 'proposal' as const,
        value: 50000,
        probability: 75,
        expectedCloseDate: '2024-02-15',
        source: 'Website',
        assignedTo: 'sales@company.com',
        tags: ['enterprise', 'high-value'],
        customFields: {},
        status: 'active' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
        lastActivityAt: '2024-01-15',
        customer: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          company: 'Acme Corp'
        }
      },
      {
        id: '2',
        customerId: '2',
        title: 'SMB Package Deal',
        description: 'Small business interested in our starter package',
        stage: 'qualification' as const,
        value: 5000,
        probability: 60,
        expectedCloseDate: '2024-02-28',
        source: 'Referral',
        assignedTo: 'sales@company.com',
        tags: ['smb', 'starter'],
        customFields: {},
        status: 'active' as const,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-20',
        lastActivityAt: '2024-01-20',
        customer: {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          company: 'SmallBiz Inc'
        }
      }
    ];
    const mockTasks = [];

    switch (activeTab) {
      case 'business-snapshot':
        return <BusinessSnapshot vendorId={vendorId} />;
      case 'taxes':
        return (
          <div className="space-y-8">
            <StripeTaxDashboard />
          </div>
        );
      case 'customer-360':
        return (
          <Customer360
            customers={mockCustomers}
            onCustomerSelect={() => {}}
            onCustomerUpdate={() => {}}
            onCustomerDelete={() => {}}
            onTagUpdate={() => {}}
            onNoteAdd={() => {}}
            onMessageSend={() => {}}
            onTaskCreate={() => {}}
            isLoading={false}
          />
        );
      case 'pipeline':
        return (
          <Pipeline
            opportunities={mockOpportunities}
            onOpportunityCreate={() => {}}
            onOpportunityUpdate={() => {}}
            onOpportunityDelete={() => {}}
            onStageChange={() => {}}
            onForecastUpdate={() => {}}
            isLoading={false}
          />
        );
      case 'tasks':
        return (
          <TaskManagement
            tasks={mockTasks}
            teamMembers={[]}
            onTaskCreate={() => {}}
            onTaskUpdate={() => {}}
            onTaskComplete={() => {}}
            onTaskDelete={() => {}}
            onTaskAssign={() => {}}
            onTaskReassign={() => {}}
            onSubtaskCreate={() => {}}
            onTeamMemberCreate={() => {}}
            onTeamMemberUpdate={() => {}}
            onTeamMemberDelete={() => {}}
            isLoading={false}
          />
        );
      case 'customer-health':
        return (
          <CustomerHealthOverview
            customers={mockCustomers}
            opportunities={mockOpportunities}
            tasks={mockTasks}
            isLoading={false}
          />
        );
      default:
        return <BusinessSnapshot vendorId={vendorId} />;
    }
  };


  return (
    <VendorDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader 
          title="Analytics & CRM"
          description="Comprehensive business analytics and customer relationship management"
          currentView="Analytics & CRM"
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />

        {/* Motivational Quote */}
        <MotivationalQuote
          quote={getQuoteByCategory('success').quote}
          author={getQuoteByCategory('success').author}
          icon={getQuoteByCategory('success').icon}
          variant={getQuoteByCategory('success').variant}
        />

        {/* Tab Navigation */}
        <div className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200">
          <div className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#5B6E02] text-[#5B6E02]'
                      : 'border-transparent text-gray-600 hover:text-[#5B6E02] hover:border-[#5B6E02]/30'
                  }`}
                  title={tab.description}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#5B6E02]/10 rounded-lg">
              <Brain className="w-5 h-5 text-[#5B6E02]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Insight</h3>
          </div>
          <p className="text-gray-800 font-medium mb-3">
            {activeTab === 'business-snapshot' || activeTab === 'taxes'
              ? "Your business metrics show strong growth. Consider focusing on high-margin products to increase profitability."
              : "Customer engagement is up 15% this month. Your VIP customers are showing increased loyalty and spending patterns."
            }
          </p>
          <div className="flex items-center gap-2 text-sm text-[#5B6E02]">
            <Sparkles className="w-4 h-4" />
            <span>Updated 2 hours ago</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {renderContent()}
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorAnalyticsCRMPage;
