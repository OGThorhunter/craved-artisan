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
import type { Customer } from '@/types/customer';

// Import CRM components
import Pipeline from '@/components/crm/Pipeline';
import TaskManagement from '@/components/crm/TaskManagement';

// Import UI components
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

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      company: 'Acme Corp',
      phone: '555-0123',
      status: 'customer',
      source: 'website',
      assignedTo: 'sales-1',
      tags: ['high-value', 'tech'],
      totalOrders: 15,
      totalSpent: 5420,
      lifetimeValue: 8500,
      lastContactAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      isVip: true
    }
  ]);

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

  const [tasks, setTasks] = useState<Array<{
    id: string;
    title: string;
    type: 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'demo' | 'research' | 'documentation' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
    dueDate?: string;
    customerId?: string;
    assignedTo?: string;
    assignedBy?: string;
    createdAt: string;
    updatedAt?: string;
    description?: string;
    tags?: string[];
    estimatedHours?: number;
    actualHours?: number;
    customer?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    assignedUser?: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    subtasks?: Array<{
      id: string;
      title: string;
      type: 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'demo' | 'research' | 'documentation' | 'other';
      priority: 'low' | 'medium' | 'high' | 'urgent';
      status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
      dueDate?: string;
      customerId?: string;
      assignedTo?: string;
      assignedBy?: string;
      createdAt: string;
      updatedAt?: string;
      description?: string;
      tags?: string[];
      estimatedHours?: number;
      actualHours?: number;
    }>;
    dependencies?: string[];
    attachments?: string[];
  }>>([]);

  const [teamMembers, setTeamMembers] = useState<Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'admin' | 'manager' | 'sales_rep' | 'support' | 'marketing' | 'other';
    avatar?: string;
    isActive: boolean;
    tasksAssigned: number;
    tasksCompleted: number;
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

    // Initialize tasks with mock data
    const mockTasks = [
      {
        id: '1',
        title: 'Follow up with Acme Corp',
        type: 'follow_up' as const,
        priority: 'high' as const,
        status: 'pending' as const,
        dueDate: '2024-02-01',
        customerId: '1',
        assignedTo: '1',
        assignedBy: '1',
        createdAt: '2024-01-15',
        description: 'Follow up on the proposal sent last week',
        estimatedHours: 1,
        assignedUser: {
          id: '1',
          name: 'John Sales',
          email: 'john.sales@company.com'
        }
      },
      {
        id: '2',
        title: 'Prepare demo for SmallBiz Inc',
        type: 'demo' as const,
        priority: 'medium' as const,
        status: 'in_progress' as const,
        dueDate: '2024-02-05',
        customerId: '2',
        assignedTo: '2',
        assignedBy: '1',
        createdAt: '2024-01-20',
        description: 'Prepare product demo for the SmallBiz Inc meeting',
        estimatedHours: 2,
        assignedUser: {
          id: '2',
          name: 'Jane Manager',
          email: 'jane.manager@company.com'
        }
      }
    ];
    setTasks(mockTasks);

    // Initialize team members with mock data
    const mockTeamMembers = [
      {
        id: '1',
        name: 'John Sales',
        email: 'john.sales@company.com',
        phone: '+1-555-0123',
        role: 'sales_rep' as const,
        isActive: true,
        tasksAssigned: 5,
        tasksCompleted: 3
      },
      {
        id: '2',
        name: 'Jane Manager',
        email: 'jane.manager@company.com',
        phone: '+1-555-0124',
        role: 'manager' as const,
        isActive: true,
        tasksAssigned: 3,
        tasksCompleted: 2
      }
    ];
    setTeamMembers(mockTeamMembers);
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
            customers={customers}
            onCustomerSelect={(customer) => {
              console.log('Customer selected:', customer);
            }}
            onCustomerUpdate={(customer) => {
              console.log('Updating customer:', customer);
              
              // Check if customer already exists (update) or is new (add)
              const existingCustomer = customers.find(c => c.id === customer.id);
              
              if (existingCustomer) {
                // Update existing customer
                setCustomers(prev => 
                  prev.map(c => 
                    c.id === customer.id 
                      ? { ...c, ...customer }
                      : c
                  )
                );
                alert(`Customer updated: ${customer.firstName} ${customer.lastName}`);
              } else {
                // Add new customer
                setCustomers(prev => [...prev, customer]);
                alert(`Customer added: ${customer.firstName} ${customer.lastName}`);
              }
            }}
            onCustomerDelete={(id) => {
              console.log('Deleting customer:', id);
              if (confirm('Are you sure you want to delete this customer?')) {
                setCustomers(prev => prev.filter(c => c.id !== id));
                alert('Customer deleted');
              }
            }}
            onTagUpdate={(customerId, tags) => {
              console.log('Updating tags for customer:', customerId, tags);
              setCustomers(prev => 
                prev.map(c => 
                  c.id === customerId 
                    ? { ...c, tags }
                    : c
                )
              );
            }}
            onNoteAdd={(customerId, note) => {
              console.log('Adding note for customer:', customerId, note);
              alert(`Note added for customer ${customerId}: ${note}`);
            }}
            onMessageSend={(customerId, message) => {
              console.log('Sending message to customer:', customerId, message);
              alert(`Message sent to customer ${customerId}: ${message}`);
            }}
            onTaskCreate={(customerId, task) => {
              console.log('Creating task for customer:', customerId, task);
              const newTask = {
                ...task,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              setTasks(prev => [...prev, newTask]);
              alert(`Task created for customer ${customerId}: ${task.title}`);
            }}
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
            tasks={tasks}
            teamMembers={teamMembers}
            onTaskCreate={(task) => {
              console.log('Creating task:', task);
              const newTask = {
                ...task,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                assignedUser: teamMembers.find(member => member.id === task.assignedTo) ? {
                  id: task.assignedTo || '',
                  name: teamMembers.find(member => member.id === task.assignedTo)?.name || '',
                  email: teamMembers.find(member => member.id === task.assignedTo)?.email || ''
                } : undefined
              } as typeof tasks[0];
              setTasks(prev => [...prev, newTask]);
              alert(`Created task: ${task.title}`);
            }}
            onTaskUpdate={(task) => {
              console.log('Updating task:', task);
              setTasks(prev => 
                prev.map(t => 
                  t.id === task.id 
                    ? { ...t, ...task, updatedAt: new Date().toISOString() }
                    : t
                )
              );
              alert(`Updated task: ${task.title}`);
            }}
            onTaskComplete={(id) => {
              console.log('Completing task:', id);
              setTasks(prev => 
                prev.map(t => 
                  t.id === id 
                    ? { ...t, status: 'completed' as const, updatedAt: new Date().toISOString() }
                    : t
                )
              );
              alert(`Completed task with ID: ${id}`);
            }}
            onTaskDelete={(id) => {
              console.log('Deleting task:', id);
              if (confirm('Are you sure you want to delete this task?')) {
                setTasks(prev => prev.filter(t => t.id !== id));
                alert(`Deleted task with ID: ${id}`);
              }
            }}
            onTeamMemberCreate={(member) => {
              console.log('Creating team member:', member);
              const newMember = {
                ...member,
                id: Date.now().toString(),
                tasksAssigned: 0,
                tasksCompleted: 0
              } as typeof teamMembers[0];
              setTeamMembers(prev => [...prev, newMember]);
              alert(`Created team member: ${member.name}`);
            }}
            onTeamMemberUpdate={(member) => {
              console.log('Updating team member:', member);
              setTeamMembers(prev => 
                prev.map(m => 
                  m.id === member.id ? member : m
                )
              );
              alert(`Updated team member: ${member.name}`);
            }}
            isLoading={false}
          />
        );
      case 'customer-health':
        return (
          <CustomerHealthOverview
            customers={customers}
            opportunities={opportunities}
            tasks={tasks}
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
        <div className="relative">
          <div 
            className="bg-[#F7F2EC] rounded-lg p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#5B6E02]/10 rounded-lg">
                <Brain className="w-5 h-5 text-[#5B6E02]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI Insight</h3>
            </div>
            <p className="text-gray-800 font-medium mb-3">
              {getShortAIInsight(activeTab)}
            </p>
            <div className="flex items-center gap-2 text-sm text-[#5B6E02]">
              <Sparkles className="w-4 h-4" />
              <span>Updated 2 hours ago</span>
            </div>
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