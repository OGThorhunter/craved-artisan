import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  UserCheck,
  UserX,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  phone?: string;
  website?: string;
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
  isBlocked?: boolean;
  blockedReason?: string;
  blockedAt?: string;
}

interface Opportunity {
  id: string;
  customerId: string;
  title: string;
  stage: 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignedTo?: string;
  createdAt: string;
}

interface CustomerHealthOverviewProps {
  customers: Customer[];
  opportunities: Opportunity[];
  tasks: Task[];
  isLoading?: boolean;
}

const CustomerHealthOverview: React.FC<CustomerHealthOverviewProps> = ({
  customers,
  opportunities,
  tasks,
  isLoading = false
}) => {
  // Calculate comprehensive CRM metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Customer Metrics
    const totalCustomers = customers.length;
    const newCustomers30d = customers.filter(c => new Date(c.createdAt) > thirtyDaysAgo).length;
    const activeCustomers = customers.filter(c => c.status === 'customer' || c.status === 'vip').length;
    const vipCustomers = customers.filter(c => c.isVip).length;
    const blockedCustomers = customers.filter(c => c.isBlocked).length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.lifetimeValue, 0);
    const avgOrderValue = customers.reduce((sum, c) => sum + c.totalSpent, 0) / Math.max(customers.reduce((sum, c) => sum + c.totalOrders, 0), 1);

    // Engagement Metrics
    const engagedCustomers = customers.filter(c => 
      c.lastContactAt && new Date(c.lastContactAt) > thirtyDaysAgo
    ).length;
    const churnRisk = customers.filter(c => 
      c.status === 'customer' && c.lastContactAt && new Date(c.lastContactAt) < ninetyDaysAgo
    ).length;
    const highValueCustomers = customers.filter(c => c.lifetimeValue > 10000).length;

    // Lead Metrics
    const totalLeads = customers.filter(c => c.status === 'lead').length;
    const qualifiedLeads = customers.filter(c => c.status === 'prospect').length;
    const avgLeadScore = customers.filter(c => c.status === 'lead').reduce((sum, c) => sum + c.leadScore, 0) / Math.max(totalLeads, 1);

    // Pipeline Metrics
    const totalPipelineValue = opportunities
      .filter(op => op.stage !== 'closed_won' && op.stage !== 'closed_lost')
      .reduce((sum, op) => sum + (op.value * op.probability / 100), 0);
    const wonDeals = opportunities.filter(op => op.stage === 'closed_won');
    const lostDeals = opportunities.filter(op => op.stage === 'closed_lost');
    const winRate = wonDeals.length + lostDeals.length > 0 ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 : 0;
    const avgDealSize = wonDeals.length > 0 ? wonDeals.reduce((sum, op) => sum + op.value, 0) / wonDeals.length : 0;

    // Task Metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed' && t.status !== 'cancelled'
    ).length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Communication Metrics
    const customersWithPhone = customers.filter(c => c.phone).length;
    const customersWithEmail = customers.filter(c => c.email).length;
    const contactCoverage = totalCustomers > 0 ? ((customersWithPhone + customersWithEmail) / (totalCustomers * 2)) * 100 : 0;

    return {
      customers: {
        total: totalCustomers,
        new30d: newCustomers30d,
        active: activeCustomers,
        vip: vipCustomers,
        blocked: blockedCustomers,
        highValue: highValueCustomers,
        engaged: engagedCustomers,
        churnRisk,
        totalRevenue,
        avgOrderValue
      },
      leads: {
        total: totalLeads,
        qualified: qualifiedLeads,
        avgScore: avgLeadScore
      },
      pipeline: {
        value: totalPipelineValue,
        winRate,
        avgDealSize,
        wonDeals: wonDeals.length,
        lostDeals: lostDeals.length
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        overdue: overdueTasks,
        completionRate: taskCompletionRate
      },
      communication: {
        phoneCoverage: customersWithPhone,
        emailCoverage: customersWithEmail,
        contactCoverage
      }
    };
  }, [customers, opportunities, tasks]);

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (current < previous) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getHealthScore = () => {
    let score = 100;
    
    // Deduct for blocked customers
    if (metrics.customers.blocked > 0) score -= (metrics.customers.blocked / metrics.customers.total) * 20;
    
    // Deduct for churn risk
    if (metrics.customers.churnRisk > 0) score -= (metrics.customers.churnRisk / metrics.customers.total) * 15;
    
    // Deduct for overdue tasks
    if (metrics.tasks.overdue > 0) score -= (metrics.tasks.overdue / metrics.tasks.total) * 10;
    
    // Deduct for low win rate
    if (metrics.pipeline.winRate < 25) score -= 15;
    
    // Deduct for low engagement
    if (metrics.customers.engaged / metrics.customers.total < 0.5) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  };

  const healthScore = getHealthScore();

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Health Overview</h2>
          <p className="text-gray-600">Comprehensive CRM metrics and customer trend analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Overall Health Score</div>
            <div className={`text-3xl font-bold px-3 py-1 rounded-full ${getHealthColor(healthScore)}`}>
              {healthScore.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Customer Metrics */}
        <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Customer Base</h3>
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Customers</span>
              <span className="font-semibold">{metrics.customers.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">New (30d)</span>
              <span className="font-semibold text-green-600">{metrics.customers.new30d}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <span className="font-semibold">{metrics.customers.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">VIP</span>
              <span className="font-semibold text-purple-600">{metrics.customers.vip}</span>
            </div>
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Revenue</h3>
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="font-semibold">${metrics.customers.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Order Value</span>
              <span className="font-semibold">${metrics.customers.avgOrderValue.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm text-gray-600">High Value (&gt;$10k)</span>
              <span className="font-semibold text-green-600">{metrics.customers.highValue}</span>
            </div>
          </div>
        </div>

        {/* Pipeline Metrics */}
        <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Sales Pipeline</h3>
            </div>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pipeline Value</span>
              <span className="font-semibold">${metrics.pipeline.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Win Rate</span>
              <span className={`font-semibold ${metrics.pipeline.winRate >= 25 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.pipeline.winRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Deal Size</span>
              <span className="font-semibold">${metrics.pipeline.avgDealSize.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Task Metrics */}
        <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Task Performance</h3>
            </div>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Tasks</span>
              <span className="font-semibold">{metrics.tasks.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{metrics.tasks.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className={`font-semibold ${metrics.tasks.completionRate >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                {metrics.tasks.completionRate.toFixed(1)}%
              </span>
            </div>
            {metrics.tasks.overdue > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Overdue</span>
                <span className="font-semibold text-red-600">{metrics.tasks.overdue}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Engagement Health */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Customer Engagement</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recently Engaged (30d)</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{metrics.customers.engaged}</span>
                <span className="text-xs text-gray-500">({((metrics.customers.engaged / metrics.customers.total) * 100).toFixed(1)}%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Churn Risk</span>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${metrics.customers.churnRisk > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {metrics.customers.churnRisk}
                </span>
                {metrics.customers.churnRisk > 0 && <AlertTriangle className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Contact Coverage</span>
              <span className={`font-semibold ${metrics.communication.contactCoverage >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                {metrics.communication.contactCoverage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Lead Quality */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7F2EC' }}>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">Lead Quality</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Leads</span>
              <span className="font-semibold">{metrics.leads.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Qualified Prospects</span>
              <span className="font-semibold text-blue-600">{metrics.leads.qualified}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Lead Score</span>
              <span className={`font-semibold ${metrics.leads.avgScore >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                {metrics.leads.avgScore.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Blocked Customers</span>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${metrics.customers.blocked > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {metrics.customers.blocked}
                </span>
                {metrics.customers.blocked > 0 && <UserX className="h-4 w-4 text-red-500" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7F2EC' }}>
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Recommended Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.customers.churnRisk > 0 && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <div className="font-medium text-red-900">Address Churn Risk</div>
                <div className="text-sm text-red-700">{metrics.customers.churnRisk} customers need attention</div>
              </div>
            </div>
          )}
          {metrics.tasks.overdue > 0 && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="font-medium text-yellow-900">Complete Overdue Tasks</div>
                <div className="text-sm text-yellow-700">{metrics.tasks.overdue} tasks past due</div>
              </div>
            </div>
          )}
          {metrics.customers.blocked > 0 && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200">
              <UserX className="h-5 w-5 text-orange-500" />
              <div>
                <div className="font-medium text-orange-900">Review Blocked Customers</div>
                <div className="text-sm text-orange-700">{metrics.customers.blocked} customers blocked</div>
              </div>
            </div>
          )}
          {metrics.pipeline.winRate < 25 && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium text-blue-900">Improve Win Rate</div>
                <div className="text-sm text-blue-700">Current rate: {metrics.pipeline.winRate.toFixed(1)}%</div>
              </div>
            </div>
          )}
          {metrics.customers.highValue > 0 && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
              <Star className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium text-green-900">Focus on VIPs</div>
                <div className="text-sm text-green-700">{metrics.customers.highValue} high-value customers</div>
              </div>
            </div>
          )}
          {metrics.leads.total > 0 && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <div className="font-medium text-purple-900">Qualify Leads</div>
                <div className="text-sm text-purple-700">{metrics.leads.total} leads to process</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHealthOverview;
