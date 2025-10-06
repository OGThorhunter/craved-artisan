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
  Sparkles,
  Crown
} from 'lucide-react';

// Import existing components
import { BusinessSnapshot } from '@/components/analytics/BusinessSnapshot';
import StripeTaxDashboard from '@/components/stripe/StripeTaxDashboard';
import Customer360 from '@/components/crm/Customer360';
import CustomerHealthOverview from '@/components/crm/CustomerHealthOverview';

// Import CRM components
import Pipeline from '@/components/crm/Pipeline';
import TaskManagement from '@/components/crm/TaskManagement';

// Import UI components
import { AIInsightTooltip } from '@/components/ui/AIInsightTooltip';
import VIPProgramManager from '@/components/vip/VIPProgramManager';

type AnalyticsTabType = 'business-snapshot' | 'taxes' | 'customer-360' | 'pipeline' | 'tasks' | 'customer-health' | 'vip-program';

interface VendorAnalyticsCRMPageProps {
  vendorId?: string;
}

const VendorAnalyticsCRMPage: React.FC<VendorAnalyticsCRMPageProps> = ({ 
  vendorId = 'dev-user-id' 
}) => {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<AnalyticsTabType>('business-snapshot');

  // Helper functions for AI insights
  const getShortAIInsight = (tab: AnalyticsTabType): string => {
    switch (tab) {
      case 'business-snapshot':
      case 'taxes':
        return "Your business metrics show strong growth. Consider focusing on high-margin products to increase profitability.";
      case 'customer-360':
      case 'customer-health':
        return "Customer engagement is up 15% this month. Your VIP customers are showing increased loyalty and spending patterns.";
      case 'pipeline':
        return "Sales pipeline shows 3 high-value opportunities closing this quarter. Focus on proposal follow-ups.";
      case 'tasks':
        return "Task completion rate improved 20% this week. Consider automating routine follow-up tasks.";
      case 'vip-program':
        return "VIP program members generate 3x higher revenue. Expand exclusive offerings to increase retention.";
      default:
        return "AI analysis shows positive trends across all business metrics.";
    }
  };

  const getAIInsightContent = (tab: AnalyticsTabType): string => {
    console.log('getAIInsightContent called with tab:', tab);
    switch (tab) {
      case 'business-snapshot':
        return `Your business metrics show strong growth with a 23% increase in net sales this month. Revenue is trending upward, but there's room for optimization. 

Key findings:
• Gross margin is healthy at 68.5%, above industry average
• Average order value increased by $4.20 this month
• Cart abandonment rate is 25% - consider implementing exit-intent offers
• Top 3 products account for 45% of total revenue

Recommendations:
• Focus on high-margin products to increase profitability
• Implement bundle deals to increase AOV
• Optimize checkout flow to reduce abandonment
• Consider dynamic pricing for seasonal items

The data suggests your business is in a strong growth phase with opportunities for margin optimization.`;

      case 'taxes':
        return `Tax compliance analysis shows excellent record-keeping and timely submissions. Your tax strategy is well-optimized for your business model.

Current status:
• All quarterly taxes submitted on time
• Tax collected: $856.20 (last 30 days)
• Effective tax rate: 5.6% (within optimal range)
• No outstanding tax issues or penalties

Optimization opportunities:
• Consider tax-loss harvesting for end-of-year
• Review deductible business expenses
• Evaluate quarterly vs annual tax payment strategy
• Monitor sales tax nexus requirements as you expand

Your tax management is exemplary and positions you well for continued growth.`;

      case 'customer-360':
        return `Customer engagement analysis reveals strong loyalty patterns and growth opportunities. Your customer base is becoming more valuable over time.

Engagement metrics:
• Customer engagement up 15% this month
• VIP customers showing 3x higher retention rates
• New customer acquisition cost decreased by 12%
• Customer lifetime value increased to $350 average

Customer insights:
• 68% of customers are returning buyers
• Top 20% of customers generate 60% of revenue
• Average time to second purchase: 14 days
• Customer satisfaction score: 4.7/5.0

Growth opportunities:
• Implement referral program for existing customers
• Create tiered loyalty rewards
• Develop personalized product recommendations
• Expand customer communication channels

Your customer relationships are a key competitive advantage.`;

      case 'customer-health':
        return `Customer health scoring shows excellent overall metrics with strategic opportunities for improvement. Your customer base is stable and growing.

Health metrics:
• Customer health score: 8.2/10 (excellent)
• Churn rate: 12.5% (below industry average)
• Net promoter score: 67 (very good)
• Customer satisfaction: 4.7/5.0

Risk factors:
• 12% of customers at risk of churn
• High-value customers showing increased engagement
• Support ticket volume decreased 18%
• Product return rate: 2.1% (low risk)

Strategic recommendations:
• Implement proactive outreach to at-risk customers
• Create exclusive offers for high-value segments
• Develop customer success check-ins
• Monitor customer feedback trends closely

Your customer health is strong with room for strategic improvements.`;

      case 'pipeline':
        return `Sales pipeline analysis shows strong momentum with several high-value opportunities closing this quarter. Your sales process is well-structured.

Pipeline overview:
• 3 high-value opportunities ($50K+ each)
• Average deal size: $27,500
• Pipeline velocity: 45 days average
• Win rate: 67% (above industry average)

Current opportunities:
• Enterprise Software License: $50K, 75% probability
• SMB Package Deal: $5K, 60% probability
• Custom Integration: $35K, 80% probability

Sales insights:
• Proposal stage has highest conversion rate
• Follow-up timing is critical for success
• Technical demos increase close rate by 40%
• Reference customers accelerate deals

Action items:
• Schedule technical demos for all qualified prospects
• Prepare case studies for enterprise opportunities
• Implement automated follow-up sequences
• Create urgency around quarter-end deadlines

Your pipeline is well-positioned for a strong quarter finish.`;

      case 'tasks':
        return `Task management analysis shows improved productivity and team coordination. Your workflow optimization is paying dividends.

Productivity metrics:
• Task completion rate: 87% (up 20% this week)
• Average task completion time: 2.3 days
• Team collaboration score: 8.5/10
• Automation rate: 35% of routine tasks

Task insights:
• Follow-up tasks have highest completion rate
• Administrative tasks taking longer than expected
• Team workload is well-balanced
• Customer-facing tasks prioritized effectively

Optimization opportunities:
• Automate routine follow-up communications
• Implement task templates for common workflows
• Create escalation rules for overdue tasks
• Develop task batching strategies

Recommendations:
• Focus on automating repetitive tasks
• Implement deadline alerts for critical tasks
• Create task dependencies for complex projects
• Regular team check-ins for task prioritization

Your task management system is working well with room for automation improvements.`;

      case 'vip-program':
        return `VIP program analysis reveals exceptional member value and growth potential. Your premium customer strategy is highly effective.

VIP metrics:
• VIP members generate 3x higher revenue
• Member retention rate: 94% (excellent)
• Average VIP order value: $127 (vs $44 general)
• Member satisfaction: 4.9/5.0

Program insights:
• 78 VIP members (growing 15% monthly)
• Exclusive products drive 40% of VIP revenue
• Early access features highly valued
• Referral rate: 2.3 referrals per member

Growth opportunities:
• Expand exclusive product offerings
• Create tiered VIP levels
• Implement member referral rewards
• Develop VIP-only experiences

Strategic recommendations:
• Increase VIP member acquisition budget
• Create seasonal VIP exclusives
• Implement member feedback loop
• Develop VIP community features

Your VIP program is a significant competitive advantage and growth driver.`;

      default:
        return `Comprehensive AI analysis across all business metrics reveals strong performance with strategic optimization opportunities. Your business is well-positioned for continued growth with several key areas for enhancement.

Overall performance:
• Revenue growth: 23% month-over-month
• Customer satisfaction: 4.7/5.0
• Operational efficiency: 87% task completion
• Market position: Strong competitive advantage

Key strengths:
• Excellent customer relationships
• Strong financial metrics
• Effective task management
• Successful VIP program

Optimization areas:
• Cart abandonment reduction
• Process automation
• Customer acquisition
• Revenue diversification

Strategic focus:
• Leverage AI insights for data-driven decisions
• Maintain customer experience excellence
• Optimize operational efficiency
• Scale successful programs

Your business shows excellent fundamentals with clear paths for continued growth and optimization.`;
    }
  };
  const [opportunities, setOpportunities] = useState<Array<{
    id: string;
    customerId: string;
    title: string;
    description?: string;
    stage: 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
    value: number;
    probability: number;
    expectedCloseDate: string;
    source?: string;
    assignedTo?: string;
    tags: string[];
    customFields: Record<string, unknown>;
    status: 'active' | 'on_hold' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    lastActivityAt: string;
    customer?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      company?: string;
    };
  }>>([]);

  // Handle URL query parameters for tab selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab') as AnalyticsTabType;
    const validTabs = ['business-snapshot', 'taxes', 'customer-360', 'pipeline', 'tasks', 'customer-health', 'vip-program'];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // Initialize opportunities with mock data
  useEffect(() => {
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
        value: 15000,
        probability: 40,
        expectedCloseDate: '2024-03-01',
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
      },
      {
        id: '3',
        customerId: '3',
        title: 'Enterprise Custom Solution',
        description: 'Custom enterprise solution for 1000+ users',
        stage: 'negotiation' as const,
        value: 100000,
        probability: 60,
        expectedCloseDate: '2024-02-28',
        source: 'Trade Show',
        assignedTo: 'manager@company.com',
        tags: ['enterprise', 'custom', 'high-value'],
        customFields: {},
        status: 'active' as const,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-25',
        lastActivityAt: '2024-01-25',
        customer: {
          id: '3',
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@example.com',
          company: 'BigCorp Ltd'
        }
      }
    ];
    setOpportunities(mockOpportunities);
  }, []);

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
    },
    { 
      id: 'vip-program' as const, 
      label: 'VIP Program', 
      icon: Crown,
      description: 'Loyalty program management and VIP customer benefits'
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
            opportunities={opportunities}
            onOpportunityCreate={(opportunity) => {
              console.log('Creating opportunity:', opportunity);
              const newOpportunity = {
                ...opportunity,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
                customer: {
                  id: opportunity.customerId || '1',
                  firstName: 'New',
                  lastName: 'Customer',
                  email: 'new@example.com',
                  company: 'New Company'
                }
              } as typeof opportunities[0];
              setOpportunities(prev => [...prev, newOpportunity]);
              alert(`Created opportunity: ${opportunity.title}`);
            }}
            onOpportunityUpdate={(opportunity) => {
              console.log('Updating opportunity:', opportunity);
              setOpportunities(prev => 
                prev.map(opp => 
                  opp.id === opportunity.id 
                    ? { ...opp, ...opportunity, updatedAt: new Date().toISOString(), lastActivityAt: new Date().toISOString() }
                    : opp
                )
              );
              alert(`Updated opportunity: ${opportunity.title}`);
            }}
            onOpportunityDelete={(id) => {
              console.log('Deleting opportunity:', id);
              if (confirm('Are you sure you want to delete this opportunity?')) {
                setOpportunities(prev => prev.filter(opp => opp.id !== id));
                alert(`Deleted opportunity with ID: ${id}`);
              }
            }}
            onStageChange={(id, stage) => {
              console.log('Changing stage:', id, 'to', stage);
              setOpportunities(prev => 
                prev.map(opp => 
                  opp.id === id 
                    ? { ...opp, stage: stage as 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost', updatedAt: new Date().toISOString(), lastActivityAt: new Date().toISOString() }
                    : opp
                )
              );
              alert(`Moved opportunity ${id} to ${stage} stage`);
            }}
            onForecastUpdate={() => {
              console.log('Updating forecast');
              // In a real app, this would refresh forecast data
              alert('Forecast updated');
            }}
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
            opportunities={opportunities}
            tasks={mockTasks}
            isLoading={false}
          />
        );
      case 'vip-program':
        return <VIPProgramManager />;
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
        <AIInsightTooltip
          content={getAIInsightContent(activeTab)}
          position="top"
          maxWidth="max-w-lg"
        >
          <div className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#5B6E02]/10 rounded-lg">
                <Brain className="w-5 h-5 text-[#5B6E02]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI Insight</h3>
              <div className="flex items-center gap-1 text-xs text-[#5B6E02] ml-auto bg-[#5B6E02]/10 px-2 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                <span>Hover for details</span>
              </div>
            </div>
            <p className="text-gray-800 font-medium mb-3">
              {getShortAIInsight(activeTab)}
            </p>
            <div className="flex items-center gap-2 text-sm text-[#5B6E02]">
              <Sparkles className="w-4 h-4" />
              <span>Updated 2 hours ago</span>
            </div>
          </div>
        </AIInsightTooltip>

        {/* Content Area */}
        <div className="space-y-6">
          {renderContent()}
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorAnalyticsCRMPage;
