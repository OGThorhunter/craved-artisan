import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import {
  Users,
  TrendingUp, 
  Calendar, 
  Mail,
  Phone,
  Target, 
  BarChart3, 
  Plus,
  Search,
  Filter,
  Download,
  Settings,
  Eye,
  Edit,
  Trash2,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  UserPlus,
  Activity,
  PieChart,
  LineChart,
  UserCheck,
  Filter as FilterIcon,
  Target as TargetIcon,
  MessageSquare,
  Zap,
  FileText,
  Bot,
  Shield,
  Database,
  Workflow,
  Brain,
  Sparkles
} from 'lucide-react';

// Import consolidated CRM components
import Customer360 from '../components/crm/Customer360';
import Pipeline from '../components/crm/Pipeline';
import AutomationTasks from '../components/crm/AutomationTasks';
import AnalyticsReports from '../components/crm/AnalyticsReports';
import SettingsIntegrations from '../components/crm/SettingsIntegrations';

// Types
interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  status: 'lead' | 'prospect' | 'customer' | 'vip' | 'inactive';
  source: string;
  tags: string[];
  totalOrders: number;
  totalSpent: number;
  lifetimeValue: number;
  lastContactAt?: string;
  createdAt: string;
  assignedTo?: string;
  leadScore: number;
  isVip: boolean;
}

interface Opportunity {
  id: string;
  customerId: string;
  title: string;
  stage: 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  probability: number;
  expectedCloseDate: string;
  assignedTo?: string;
  status: 'active' | 'on_hold' | 'cancelled';
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'demo' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  customerId?: string;
  assignedTo?: string;
  createdAt: string;
}

// Mock data functions
const fetchDashboard = async () => {
  return {
    customers: { total: 1247, growth: 12.5 },
    sales: { 
      pipelineValue: 245000, 
      conversionRate: 23.5,
      totalRevenue: 1250000,
      averageOrderValue: 1250
    },
    performance: {
      customerSatisfaction: 4.8,
      responseTime: 2.5
    },
    recentActivities: [
      { id: 1, type: 'customer', message: 'New customer John Doe signed up', timestamp: '2 hours ago' },
      { id: 2, type: 'opportunity', message: 'Deal "Enterprise Contract" moved to negotiation', timestamp: '4 hours ago' },
      { id: 3, type: 'task', message: 'Follow-up call with Sarah completed', timestamp: '6 hours ago' },
    ]
  };
};

const fetchCustomers = async (filters: any) => {
  return {
    customers: [
      {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Acme Corp',
        status: 'customer',
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
    ]
  };
};

const fetchOpportunities = async (filters: any, localOpportunities: any[]) => {
  return {
    opportunities: [
      {
        id: '1',
        customerId: '1',
        title: 'Enterprise Contract',
        stage: 'negotiation',
        value: 50000,
        probability: 75,
        expectedCloseDate: '2024-02-15',
        assignedTo: 'sales@company.com',
        status: 'active',
        createdAt: '2024-01-01'
      }
    ]
  };
};

const fetchTasks = async (filters: any) => {
  return {
    tasks: [
      {
        id: '1',
        title: 'Follow up with John Doe',
        type: 'call',
        priority: 'high',
        status: 'pending',
        dueDate: '2024-01-20',
        customerId: '1',
        assignedTo: 'sales@company.com',
        createdAt: '2024-01-15'
      }
    ]
  };
};

const fetchAnalytics = async (timeRange: string) => {
  return {
    customers: { total: 1247, growth: 12.5 },
    sales: { 
      pipelineValue: 245000, 
      conversionRate: 23.5,
      totalRevenue: 1250000,
      averageOrderValue: 1250
    },
    performance: {
      customerSatisfaction: 4.8,
      responseTime: 2.5
    }
  };
};

// StatCard Component
const StatCard = ({ title, value, change, icon: Icon, color }: {
  title: string;
  value: string | number;
  change?: number;
  icon: any;
  color: string;
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    orange: 'text-orange-600 bg-orange-100',
    purple: 'text-purple-600 bg-purple-100',
    red: 'text-red-600 bg-red-100',
  };

  return (
    <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// Main Component
const VendorCRMPage = () => {
  const [activeTab, setActiveTab] = useState<'customer-360' | 'pipeline' | 'automation-tasks' | 'analytics-reports' | 'settings-integrations'>('customer-360');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    assignedTo: '',
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('90d');

  // Data fetching
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['crm-dashboard'],
    queryFn: fetchDashboard,
  });

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['crm-customers', filters, searchTerm],
    queryFn: () => fetchCustomers({ ...filters, search: searchTerm }),
  });

  const { data: opportunitiesData, isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['crm-opportunities', filters],
    queryFn: () => fetchOpportunities(filters, []),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['crm-tasks', filters],
    queryFn: () => fetchTasks(filters),
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['crm-analytics', '30d'],
    queryFn: () => fetchAnalytics('30d'),
  });

  // New consolidated tabs
  const tabs = [
    { 
      id: 'customer-360', 
      label: 'Customer 360', 
      icon: Users,
      description: 'Unified customer view with communications and segmentation'
    },
    { 
      id: 'pipeline', 
      label: 'Pipeline', 
      icon: Target,
      description: 'Sales pipeline and opportunity management'
    },
    { 
      id: 'automation-tasks', 
      label: 'Automation & Tasks', 
      icon: Zap,
      description: 'Workflows, tasks, and email campaigns'
    },
    { 
      id: 'analytics-reports', 
      label: 'Analytics & Reports', 
      icon: BarChart3,
      description: 'Analytics dashboard, reports, and data export'
    },
    { 
      id: 'settings-integrations', 
      label: 'Settings & Integrations', 
      icon: Settings,
      description: 'Integrations, security, and AI insights'
    },
  ];

  return (
    <VendorDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader 
          title="Customer Relations"
          description="Manage customer relationships, opportunities, and sales pipeline"
        />

        {/* Navigation Tabs */}
        <div className="border border-gray-200 rounded-lg shadow-lg" style={{ backgroundColor: '#F7F2EC' }}>
          <nav className="flex space-x-8 overflow-x-auto px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={tab.description}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {activeTab === 'customer-360' && (
            <Customer360
              customers={customersData?.customers || []}
              onCustomerSelect={setSelectedCustomer}
              onCustomerUpdate={(customer) => console.log('Update customer:', customer)}
              onCustomerDelete={(id) => console.log('Delete customer:', id)}
              onTagUpdate={(customerId, tags) => console.log('Update tags:', customerId, tags)}
              onNoteAdd={(customerId, note) => console.log('Add note:', customerId, note)}
              onMessageSend={(customerId, message) => console.log('Send message:', customerId, message)}
              onTaskCreate={(customerId, task) => console.log('Create task:', customerId, task)}
              isLoading={customersLoading}
            />
          )}

          {activeTab === 'pipeline' && (
            <Pipeline
              opportunities={opportunitiesData?.opportunities || []}
              onOpportunityCreate={(opportunity) => console.log('Create opportunity:', opportunity)}
              onOpportunityUpdate={(opportunity) => console.log('Update opportunity:', opportunity)}
              onOpportunityDelete={(id) => console.log('Delete opportunity:', id)}
              onStageChange={(id, stage) => console.log('Change stage:', id, stage)}
              onForecastUpdate={() => console.log('Update forecast')}
              isLoading={opportunitiesLoading}
            />
          )}

          {activeTab === 'automation-tasks' && (
            <AutomationTasks
              tasks={tasksData?.tasks || []}
              workflows={[]}
              emailCampaigns={[]}
              onTaskCreate={(task) => console.log('Create task:', task)}
              onTaskUpdate={(task) => console.log('Update task:', task)}
              onTaskComplete={(id) => console.log('Complete task:', id)}
              onWorkflowCreate={(workflow) => console.log('Create workflow:', workflow)}
              onWorkflowUpdate={(workflow) => console.log('Update workflow:', workflow)}
              onWorkflowToggle={(id, status) => console.log('Toggle workflow:', id, status)}
              onCampaignCreate={(campaign) => console.log('Create campaign:', campaign)}
              onCampaignUpdate={(campaign) => console.log('Update campaign:', campaign)}
              isLoading={tasksLoading}
            />
          )}

          {activeTab === 'analytics-reports' && (
            <AnalyticsReports
              analytics={analyticsData}
              reports={[]}
              onReportCreate={(report) => console.log('Create report:', report)}
              onReportUpdate={(report) => console.log('Update report:', report)}
              onReportDelete={(id) => console.log('Delete report:', id)}
              onReportRun={(id) => console.log('Run report:', id)}
              onExportCreate={(exportJob) => console.log('Create export:', exportJob)}
              onExportRun={(id) => console.log('Run export:', id)}
              onTimeRangeChange={setTimeRange}
              timeRange={timeRange}
              isLoading={analyticsLoading}
            />
          )}

          {activeTab === 'settings-integrations' && (
            <SettingsIntegrations
              integrations={[]}
              users={[]}
              roles={[]}
              permissions={[]}
              aiInsights={[]}
              onIntegrationConnect={(id) => console.log('Connect integration:', id)}
              onIntegrationDisconnect={(id) => console.log('Disconnect integration:', id)}
              onIntegrationSync={(id) => console.log('Sync integration:', id)}
              onUserCreate={(user) => console.log('Create user:', user)}
              onUserUpdate={(user) => console.log('Update user:', user)}
              onUserDelete={(id) => console.log('Delete user:', id)}
              onRoleCreate={(role) => console.log('Create role:', role)}
              onRoleUpdate={(role) => console.log('Update role:', role)}
              onRoleDelete={(id) => console.log('Delete role:', id)}
              onPermissionUpdate={(userId, permissions) => console.log('Update permissions:', userId, permissions)}
              onInsightDismiss={(id) => console.log('Dismiss insight:', id)}
              onInsightAction={(id, action) => console.log('Insight action:', id, action)}
              onAIChatMessage={async (message) => {
                console.log('AI chat message:', message);
                return {
                  id: Date.now().toString(),
                  type: 'ai' as const,
                  content: 'This is a mock AI response.',
                  timestamp: new Date().toISOString()
                };
              }}
              onGenerateReport={(type) => console.log('Generate report:', type)}
              onGenerateInsights={() => console.log('Generate insights')}
            />
          )}
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorCRMPage;