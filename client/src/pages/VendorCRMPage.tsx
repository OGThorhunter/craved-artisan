import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
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
  FileText
} from 'lucide-react';

// Import new CRM components
import CustomerProfile from '../components/crm/CustomerProfile';
import CustomerSegmentation from '../components/crm/CustomerSegmentation';
import LeadScoring from '../components/crm/LeadScoring';
import SalesPipeline from '../components/crm/SalesPipeline';
import OpportunityManager from '../components/crm/OpportunityManager';
import SalesAnalytics from '../components/crm/SalesAnalytics';
import EmailCampaigns from '../components/crm/EmailCampaigns';
import CommunicationCenter from '../components/crm/CommunicationCenter';
import MarketingAutomation from '../components/crm/MarketingAutomation';
import AnalyticsDashboard from '../components/crm/AnalyticsDashboard';
import ReportsBuilder from '../components/crm/ReportsBuilder';
import DataExport from '../components/crm/DataExport';
import WorkflowAutomation from '../components/crm/WorkflowAutomation';
import IntegrationsHub from '../components/crm/IntegrationsHub';
import AIAssistant from '../components/crm/AIAssistant';
import SecurityPermissions from '../components/crm/SecurityPermissions';

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

interface CRMAnalytics {
  customers: {
    total: number;
    new: number;
    active: number;
    churned: number;
    growth: number;
  };
  sales: {
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    pipelineValue: number;
    closedWon: number;
    closedLost: number;
  };
  activities: {
    totalContacts: number;
    emailsSent: number;
    callsMade: number;
    meetingsScheduled: number;
    tasksCompleted: number;
  };
  performance: {
    responseTime: number;
    followUpRate: number;
    customerSatisfaction: number;
    leadConversionRate: number;
  };
}

// API Functions
const fetchCustomers = async (params: any = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`/api/crm/customers?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch customers');
  return response.json();
};

const fetchOpportunities = async (params: any = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`/api/crm/opportunities?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch opportunities');
  return response.json();
};

const fetchTasks = async (params: any = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`/api/crm/tasks?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

const fetchAnalytics = async (period: string = '30d') => {
  const response = await fetch(`/api/crm/analytics?period=${period}`);
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
};

const fetchDashboard = async () => {
  const response = await fetch('/api/crm/dashboard');
  if (!response.ok) throw new Error('Failed to fetch dashboard');
  return response.json();
};

// Components
const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  color?: string;
}) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change !== undefined && (
          <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% from last month
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full bg-${color}-100`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
          </div>
        </div>
);

const CustomerCard = ({ customer }: { customer: Customer }) => (
  <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold">
            {customer.firstName[0]}{customer.lastName[0]}
          </span>
        </div>
      <div>
          <h3 className="font-semibold text-gray-900">
            {customer.firstName} {customer.lastName}
          </h3>
          <p className="text-sm text-gray-600">{customer.email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-xs rounded-full ${
          customer.status === 'vip' ? 'bg-purple-100 text-purple-800' :
          customer.status === 'customer' ? 'bg-green-100 text-green-800' :
          customer.status === 'prospect' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {customer.status}
        </span>
        {customer.isVip && <Star className="h-4 w-4 text-yellow-500" />}
      </div>
        </div>

    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-gray-600">Total Spent</p>
        <p className="font-semibold">${customer.lifetimeValue.toLocaleString()}</p>
              </div>
              <div>
        <p className="text-gray-600">Orders</p>
        <p className="font-semibold">{customer.totalOrders}</p>
      </div>
    </div>
    
    <div className="mt-3 flex items-center justify-between">
      <div className="flex space-x-1">
        {customer.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex space-x-2">
        <button className="p-1 text-gray-400 hover:text-gray-600">
          <Eye className="h-4 w-4" />
        </button>
        <button className="p-1 text-gray-400 hover:text-gray-600">
          <Edit className="h-4 w-4" />
        </button>
              </div>
            </div>
          </div>
);

const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => (
  <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-gray-900">{opportunity.title}</h3>
      <span className={`px-2 py-1 text-xs rounded-full ${
        opportunity.stage === 'closed_won' ? 'bg-green-100 text-green-800' :
        opportunity.stage === 'closed_lost' ? 'bg-red-100 text-red-800' :
        opportunity.stage === 'negotiation' ? 'bg-yellow-100 text-yellow-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {opportunity.stage.replace('_', ' ')}
      </span>
    </div>
    
    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
      <div>
        <p className="text-gray-600">Value</p>
        <p className="font-semibold">${opportunity.value.toLocaleString()}</p>
              </div>
              <div>
        <p className="text-gray-600">Probability</p>
        <p className="font-semibold">{opportunity.probability}%</p>
      </div>
    </div>
    
    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
      <div 
        className="bg-blue-600 h-2 rounded-full" 
        style={{ width: `${opportunity.probability}%` }}
      ></div>
    </div>
    
    <div className="flex items-center justify-between text-sm text-gray-600">
      <span>Expected: {new Date(opportunity.expectedCloseDate).toLocaleDateString()}</span>
      <div className="flex space-x-2">
        <button className="p-1 text-gray-400 hover:text-gray-600">
          <Edit className="h-4 w-4" />
        </button>
        <button className="p-1 text-gray-400 hover:text-gray-600">
          <Trash2 className="h-4 w-4" />
        </button>
              </div>
            </div>
          </div>
);

const TaskCard = ({ task }: { task: Task }) => (
  <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-gray-900">{task.title}</h3>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-xs rounded-full ${
          task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 text-xs rounded-full ${
          task.status === 'completed' ? 'bg-green-100 text-green-800' :
          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {task.status}
        </span>
      </div>
    </div>
    
    <div className="flex items-center space-x-4 text-sm text-gray-600">
      <div className="flex items-center space-x-1">
        <Clock className="h-4 w-4" />
        <span>{task.type}</span>
      </div>
      {task.dueDate && (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      )}
    </div>
              </div>
);

// Main Component
const VendorCRMPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'opportunities' | 'tasks' | 'analytics' | 'segmentation' | 'lead-scoring' | 'pipeline' | 'sales-analytics' | 'campaigns' | 'communications' | 'automation' | 'analytics-dashboard' | 'reports' | 'data-export' | 'workflows' | 'integrations' | 'ai-assistant' | 'security'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    assignedTo: '',
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
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
    queryFn: () => fetchOpportunities(filters),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['crm-tasks', filters],
    queryFn: () => fetchTasks(filters),
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['crm-analytics', '30d'],
    queryFn: () => fetchAnalytics('30d'),
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'opportunities', label: 'Opportunities', icon: Target },
    { id: 'pipeline', label: 'Sales Pipeline', icon: TargetIcon },
    { id: 'sales-analytics', label: 'Sales Analytics', icon: LineChart },
    { id: 'campaigns', label: 'Email Campaigns', icon: Mail },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'analytics-dashboard', label: 'Analytics Dashboard', icon: BarChart3 },
    { id: 'reports', label: 'Reports Builder', icon: FileText },
    { id: 'data-export', label: 'Data Export', icon: Download },
    { id: 'workflows', label: 'Workflows', icon: Zap },
    { id: 'integrations', label: 'Integrations', icon: Settings },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Activity },
    { id: 'security', label: 'Security', icon: Settings },
    { id: 'tasks', label: 'Tasks', icon: Calendar },
    { id: 'segmentation', label: 'Segmentation', icon: FilterIcon },
    { id: 'lead-scoring', label: 'Lead Scoring', icon: TargetIcon },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
  ];

  return (
    <VendorDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Relationship Management</h1>
              <p className="text-gray-600 mt-1">Manage your customers, opportunities, and sales pipeline</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                <span>Add Customer</span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg">
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Customers"
                value={analyticsData?.customers.total || 0}
                change={analyticsData?.customers.growth}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Pipeline Value"
                value={`$${(analyticsData?.sales.pipelineValue || 0).toLocaleString()}`}
                icon={TrendingUp}
                color="green"
              />
              <StatCard
                title="Active Tasks"
                value={tasksData?.tasks?.filter((t: Task) => t.status === 'pending').length || 0}
                icon={Calendar}
                color="orange"
              />
              <StatCard
                title="Conversion Rate"
                value={`${analyticsData?.sales.conversionRate?.toFixed(1) || 0}%`}
                icon={Target}
                color="purple"
              />
          </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              </div>
              <div className="p-6">
                {dashboardData?.recentActivities?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 capitalize">{activity.type}</span>
              </div>
                )) || (
                  <p className="text-gray-500 text-center py-8">No recent activities</p>
                )}
            </div>
          </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
              </div>
              <div className="p-6">
                {dashboardData?.upcomingTasks?.map((task: Task) => (
                  <TaskCard key={task.id} task={task} />
                )) || (
                  <p className="text-gray-500 text-center py-8">No upcoming tasks</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                      placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
                <div className="flex space-x-4">
              <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="lead">Lead</option>
                    <option value="prospect">Prospect</option>
                    <option value="customer">Customer</option>
                <option value="vip">VIP</option>
                <option value="inactive">Inactive</option>
              </select>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="h-4 w-4" />
                    <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customersData?.customers?.map((customer: Customer) => (
                <div key={customer.id} onClick={() => setSelectedCustomer(customer)}>
                  <CustomerCard customer={customer} />
                </div>
              )) || (
                <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No customers found</p>
                </div>
              )}
            </div>
                          </div>
                        )}

        {activeTab === 'opportunities' && (
          <OpportunityManager
            opportunities={opportunitiesData?.opportunities || []}
            onOpportunityCreate={(opportunity) => {
              // Create new opportunity
              console.log('Creating opportunity:', opportunity);
            }}
            onOpportunityUpdate={(opportunity) => {
              // Update opportunity
              console.log('Updating opportunity:', opportunity);
            }}
            onOpportunityDelete={(opportunityId) => {
              // Delete opportunity
              console.log('Deleting opportunity:', opportunityId);
            }}
          />
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Task Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{tasksData?.tasks?.filter((t: Task) => t.status === 'pending').length || 0}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{tasksData?.tasks?.filter((t: Task) => t.status === 'in_progress').length || 0}</p>
                <p className="text-sm text-gray-600">In Progress</p>
        </div>
              <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{tasksData?.tasks?.filter((t: Task) => t.status === 'completed').length || 0}</p>
                <p className="text-sm text-gray-600">Completed</p>
      </div>
              <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{tasksData?.tasks?.filter((t: Task) => t.priority === 'urgent').length || 0}</p>
                <p className="text-sm text-gray-600">Urgent</p>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {tasksData?.tasks?.map((task: Task) => (
                <TaskCard key={task.id} task={task} />
              )) || (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tasks found</p>
                      </div>
                    )}
                        </div>
                      </div>
                    )}

        {activeTab === 'segmentation' && (
          <CustomerSegmentation 
            customers={customersData?.customers || []} 
            onSegmentSelect={setSelectedSegment}
          />
        )}

              {activeTab === 'lead-scoring' && (
                <LeadScoring
                  customers={customersData?.customers || []}
                  onScoreUpdate={(customerId, newScore) => {
                    // Update customer score in local state
                    console.log(`Updated customer ${customerId} score to ${newScore}`);
                  }}
                />
              )}

              {activeTab === 'pipeline' && (
                <SalesPipeline
                  opportunities={opportunitiesData?.opportunities || []}
                  onOpportunityUpdate={(opportunity) => {
                    // Update opportunity in local state
                    console.log('Updated opportunity:', opportunity);
                  }}
                  onOpportunityDelete={(opportunityId) => {
                    // Delete opportunity from local state
                    console.log('Deleted opportunity:', opportunityId);
                  }}
                />
              )}

              {activeTab === 'sales-analytics' && (
                <SalesAnalytics
                  opportunities={opportunitiesData?.opportunities || []}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                />
              )}

              {activeTab === 'campaigns' && (
                <EmailCampaigns
                  campaigns={[]}
                  templates={[]}
                  onCampaignCreate={(campaign) => console.log('Create campaign:', campaign)}
                  onCampaignUpdate={(campaign) => console.log('Update campaign:', campaign)}
                  onCampaignDelete={(id) => console.log('Delete campaign:', id)}
                  onCampaignSend={(id) => console.log('Send campaign:', id)}
                />
              )}

              {activeTab === 'communications' && (
                <CommunicationCenter
                  communications={[]}
                  onCommunicationCreate={(communication) => console.log('Create communication:', communication)}
                  onCommunicationUpdate={(communication) => console.log('Update communication:', communication)}
                  onCommunicationDelete={(id) => console.log('Delete communication:', id)}
                  onCommunicationReply={(id, reply) => console.log('Reply to communication:', id, reply)}
                />
              )}

              {activeTab === 'automation' && (
                <MarketingAutomation
                  rules={[]}
                  templates={[]}
                  onRuleCreate={(rule) => console.log('Create rule:', rule)}
                  onRuleUpdate={(rule) => console.log('Update rule:', rule)}
                  onRuleDelete={(id) => console.log('Delete rule:', id)}
                  onRuleToggle={(id, status) => console.log('Toggle rule:', id, status)}
                />
              )}

              {activeTab === 'analytics-dashboard' && (
                <AnalyticsDashboard
                  data={{
                    overview: {
                      totalCustomers: 1250,
                      totalRevenue: 1250000,
                      totalOpportunities: 450,
                      conversionRate: 23.5,
                      averageDealSize: 12500,
                      customerLifetimeValue: 45000,
                      churnRate: 5.2,
                      growthRate: 15.8,
                    },
                    sales: {
                      revenue: {
                        current: 1250000,
                        previous: 1100000,
                        change: 150000,
                        changePercent: 13.6,
                      },
                      deals: {
                        won: 105,
                        lost: 45,
                        inProgress: 300,
                        total: 450,
                      },
                      pipeline: {
                        totalValue: 3750000,
                        averageDealSize: 12500,
                        averageSalesCycle: 45,
                      },
                    },
                    customers: {
                      new: 125,
                      returning: 1125,
                      churned: 65,
                      total: 1250,
                      segments: [
                        { name: 'VIP', count: 150, percentage: 12 },
                        { name: 'Regular', count: 800, percentage: 64 },
                        { name: 'New', count: 300, percentage: 24 },
                      ],
                    },
                    marketing: {
                      campaigns: {
                        total: 25,
                        active: 8,
                        completed: 15,
                        scheduled: 2,
                      },
                      communications: {
                        emails: 1250,
                        calls: 450,
                        meetings: 125,
                        total: 1825,
                      },
                      automation: {
                        rules: 12,
                        triggered: 2500,
                        completed: 2100,
                        conversionRate: 84,
                      },
                    },
                    performance: {
                      topPerforming: {
                        customers: [
                          { id: '1', name: 'Acme Corp', revenue: 125000, growth: 25.5 },
                          { id: '2', name: 'Tech Solutions', revenue: 98000, growth: 18.2 },
                          { id: '3', name: 'Global Industries', revenue: 87000, growth: 12.8 },
                        ],
                        campaigns: [
                          { id: '1', name: 'Q4 Newsletter', openRate: 28.5, clickRate: 5.2, conversionRate: 12.8 },
                          { id: '2', name: 'Product Launch', openRate: 32.1, clickRate: 7.8, conversionRate: 18.5 },
                          { id: '3', name: 'Holiday Special', openRate: 25.3, clickRate: 4.9, conversionRate: 10.2 },
                        ],
                        opportunities: [
                          { id: '1', name: 'Enterprise Deal', value: 250000, probability: 75, stage: 'Proposal' },
                          { id: '2', name: 'SMB Contract', value: 125000, probability: 90, stage: 'Negotiation' },
                          { id: '3', name: 'Partnership', value: 75000, probability: 60, stage: 'Qualification' },
                        ],
                      },
                      trends: {
                        revenue: [
                          { date: '2024-01', value: 1100000 },
                          { date: '2024-02', value: 1150000 },
                          { date: '2024-03', value: 1200000 },
                          { date: '2024-04', value: 1250000 },
                        ],
                        customers: [
                          { date: '2024-01', value: 1200 },
                          { date: '2024-02', value: 1225 },
                          { date: '2024-03', value: 1240 },
                          { date: '2024-04', value: 1250 },
                        ],
                        conversions: [
                          { date: '2024-01', value: 20.5 },
                          { date: '2024-02', value: 22.1 },
                          { date: '2024-03', value: 23.2 },
                          { date: '2024-04', value: 23.5 },
                        ],
                      },
                    },
                    kpis: {
                      salesVelocity: 25000,
                      leadResponseTime: 15,
                      customerSatisfaction: 8.5,
                      netPromoterScore: 72,
                      customerAcquisitionCost: 2500,
                      customerLifetimeValue: 45000,
                      revenuePerEmployee: 125000,
                      dealCloseRate: 23.5,
                    },
                  }}
                  timeRange="30d"
                  onTimeRangeChange={(range) => console.log('Time range changed:', range)}
                  onRefresh={() => console.log('Refresh analytics')}
                  isLoading={false}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsBuilder
                  reports={[]}
                  templates={[]}
                  onReportCreate={(report) => console.log('Create report:', report)}
                  onReportUpdate={(report) => console.log('Update report:', report)}
                  onReportDelete={(id) => console.log('Delete report:', id)}
                  onReportRun={(id) => console.log('Run report:', id)}
                  onReportSchedule={(id, schedule) => console.log('Schedule report:', id, schedule)}
                />
              )}

        {activeTab === 'data-export' && (
          <DataExport
            exportJobs={[]}
            integrations={[]}
            onExportCreate={(exportJob) => console.log('Create export:', exportJob)}
            onExportUpdate={(exportJob) => console.log('Update export:', exportJob)}
            onExportDelete={(id) => console.log('Delete export:', id)}
            onExportRun={(id) => console.log('Run export:', id)}
            onExportCancel={(id) => console.log('Cancel export:', id)}
            onIntegrationCreate={(integration) => console.log('Create integration:', integration)}
            onIntegrationUpdate={(integration) => console.log('Update integration:', integration)}
            onIntegrationDelete={(id) => console.log('Delete integration:', id)}
            onIntegrationSync={(id) => console.log('Sync integration:', id)}
          />
        )}

        {activeTab === 'workflows' && (
          <WorkflowAutomation
            workflows={[]}
            onWorkflowCreate={(workflow) => console.log('Create workflow:', workflow)}
            onWorkflowUpdate={(workflow) => console.log('Update workflow:', workflow)}
            onWorkflowDelete={(id) => console.log('Delete workflow:', id)}
            onWorkflowToggle={(id, status) => console.log('Toggle workflow:', id, status)}
            onWorkflowRun={(id) => console.log('Run workflow:', id)}
          />
        )}

        {activeTab === 'integrations' && (
          <IntegrationsHub
            integrations={[]}
            onIntegrationConnect={(id) => console.log('Connect integration:', id)}
            onIntegrationDisconnect={(id) => console.log('Disconnect integration:', id)}
            onIntegrationSync={(id) => console.log('Sync integration:', id)}
            onIntegrationConfigure={(id) => console.log('Configure integration:', id)}
          />
        )}

        {activeTab === 'ai-assistant' && (
          <AIAssistant
            insights={[]}
            onInsightDismiss={(id) => console.log('Dismiss insight:', id)}
            onInsightAction={(id, action) => console.log('Insight action:', id, action)}
            onChatMessage={async (message) => {
              console.log('Chat message:', message);
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

        {activeTab === 'security' && (
          <SecurityPermissions
            users={[]}
            roles={[]}
            permissions={[]}
            securityEvents={[]}
            onUserCreate={(user) => console.log('Create user:', user)}
            onUserUpdate={(user) => console.log('Update user:', user)}
            onUserDelete={(id) => console.log('Delete user:', id)}
            onRoleCreate={(role) => console.log('Create role:', role)}
            onRoleUpdate={(role) => console.log('Update role:', role)}
            onRoleDelete={(id) => console.log('Delete role:', id)}
            onPermissionUpdate={(userId, permissions) => console.log('Update permissions:', userId, permissions)}
            onUserSuspend={(id, suspended) => console.log('Suspend user:', id, suspended)}
            onTwoFactorToggle={(id, enabled) => console.log('Toggle 2FA:', id, enabled)}
          />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={`$${(analyticsData?.sales.totalRevenue || 0).toLocaleString()}`}
                icon={DollarSign}
                color="green"
              />
              <StatCard
                title="Avg Order Value"
                value={`$${(analyticsData?.sales.averageOrderValue || 0).toLocaleString()}`}
                icon={TrendingUp}
                color="blue"
              />
              <StatCard
                title="Customer Satisfaction"
                value={`${analyticsData?.performance.customerSatisfaction || 0}/5`}
                icon={Star}
                color="yellow"
              />
              <StatCard
                title="Response Time"
                value={`${analyticsData?.performance.responseTime || 0}h`}
                icon={Clock}
                color="purple"
              />
                </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <LineChart className="h-12 w-12" />
                  <span className="ml-2">Chart will be implemented</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Distribution</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <PieChart className="h-12 w-12" />
                  <span className="ml-2">Chart will be implemented</span>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <CustomerProfile
          customerId={selectedCustomer.id}
          onClose={() => setSelectedCustomer(null)}
        />
        )}
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorCRMPage;