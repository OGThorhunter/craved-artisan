import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  Shield,
  Search,
  Bell,
  Settings,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Home,
  Globe,
  Lock,
  ShoppingCart,
  HelpCircle,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import SEOHead from '../components/SEOHead';
import SLODashboard from '../components/SLODashboard';
import SystemMessagesDrawer from '../components/SystemMessagesDrawer';
import RevenueDashboard from '../components/RevenueDashboard';
import OperationsDashboard from '../components/OperationsDashboard';
import MarketplaceDashboard from '../components/MarketplaceDashboard';
import TrustSafetyDashboard from '../components/TrustSafetyDashboard';
import GrowthSocialDashboard from '../components/GrowthSocialDashboard';
import SecurityComplianceDashboard from '../components/SecurityComplianceDashboard';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal';
import { useAccessibilityAnnouncement, useFocusManagement, useReducedMotion } from '../services/accessibility';

const colors = {
  bg: 'bg-[#F7F2EC]',
  card: 'bg-white/70',
  border: 'border-[#7F232E]/15',
  primary: 'bg-[#7F232E] text-white hover:bg-[#6b1e27]',
  secondary: 'border-[#7F232E]/30 text-[#7F232E] bg-white/80 hover:bg-white',
  accent: 'text-[#5B6E02]',
  ink: 'text-[#2b2b2b]',
  sub: 'text-[#4b4b4b]',
};

type TabType = 'overview' | 'revenue' | 'ops' | 'marketplace' | 'crm' | 'trust' | 'search' | 'growth' | 'security' | 'incidents' | 'settings';

interface AdminOverview {
  health: {
    overall: 'OK' | 'WARN' | 'CRIT';
    checks: Array<{
      kind: string;
      name: string;
      status: 'OK' | 'WARN' | 'CRIT' | 'MUTED';
      value?: number;
      unit?: string;
      details?: any;
    }>;
    summary: {
      total: number;
      ok: number;
      warn: number;
      crit: number;
    };
  };
  metrics: {
    vendors: { total: number; active: number; pending: number };
    orders: { total: number; pending: number; completed: number };
    revenue: { total: number; today: number; currency: string };
    messages: { total: number; unread: number };
  };
  recentActivity: {
    orders: Array<any>;
    vendors: Array<any>;
  };
  topPerformers: {
    vendors: Array<any>;
  };
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showSystemMessages, setShowSystemMessages] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const queryClient = useQueryClient();
  
  // Accessibility hooks
  const { announce } = useAccessibilityAnnouncement();
  
  // Keyboard shortcuts - moved to avoid circular dependency
  // useKeyboardShortcuts(adminShortcuts);

  // Fetch admin overview data
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async () => {
      const response = await fetch('/api/admin/overview');
      if (!response.ok) throw new Error('Failed to fetch admin overview');
      const result = await response.json();
      return result.data as AdminOverview;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Refresh health checks
  const refreshHealthMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/health/refresh', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to refresh health checks');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
    },
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    announce(`Switched to ${tab} tab`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'success';
      case 'WARN': return 'warning';
      case 'CRIT': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return <CheckCircle className="h-4 w-4" />;
      case 'WARN': return <AlertTriangle className="h-4 w-4" />;
      case 'CRIT': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* SLO Dashboard */}
      <SLODashboard />

      {/* Health Status */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#2b2b2b]">System Health</h2>
          <Button
            variant="secondary"
            onClick={() => refreshHealthMutation.mutate()}
            disabled={refreshHealthMutation.isPending}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshHealthMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {overview?.health && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  overview.health.overall === 'OK' ? 'bg-green-100' :
                  overview.health.overall === 'WARN' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {getStatusIcon(overview.health.overall)}
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2b2b2b]">{overview.health.overall}</p>
                  <p className="text-sm text-[#4b4b4b]">Overall Status</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{overview.health.summary.ok}</p>
                <p className="text-sm text-[#4b4b4b]">Healthy</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{overview.health.summary.warn}</p>
                <p className="text-sm text-[#4b4b4b]">Warnings</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{overview.health.summary.crit}</p>
                <p className="text-sm text-[#4b4b4b]">Critical</p>
              </div>
            </Card>
          </div>
        )}

        {/* Health Checks Detail */}
        {overview?.health.checks && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview.health.checks.map((check, index) => (
              <motion.div
                key={`${check.kind}-${check.name}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-[#2b2b2b]">{check.name}</h3>
                    <Badge variant={getStatusColor(check.status) as any}>
                      {check.status}
                    </Badge>
                  </div>
                  {check.value && (
                    <p className="text-sm text-[#4b4b4b]">
                      {check.value} {check.unit}
                    </p>
                  )}
                  {check.details && (
                    <p className="text-xs text-[#4b4b4b] mt-1">
                      {JSON.stringify(check.details).slice(0, 100)}...
                    </p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      {overview?.metrics && (
        <div>
          <h2 className="text-2xl font-bold text-[#2b2b2b] mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2b2b2b]">{overview.metrics.vendors.total}</p>
                  <p className="text-sm text-[#4b4b4b]">Total Vendors</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2b2b2b]">{overview.metrics.orders.total}</p>
                  <p className="text-sm text-[#4b4b4b]">Total Orders</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2b2b2b]">
                    {formatCurrency(overview.metrics.revenue.total)}
                  </p>
                  <p className="text-sm text-[#4b4b4b]">Total Revenue</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2b2b2b]">{overview.metrics.messages.unread}</p>
                  <p className="text-sm text-[#4b4b4b]">Unread Messages</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {overview?.recentActivity && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {overview.recentActivity.orders.map((order: any) => (
                <Card key={order.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#2b2b2b]">Order #{order.id.slice(-8)}</p>
                      <p className="text-sm text-[#4b4b4b]">{order.vendor?.storeName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#2b2b2b]">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-sm text-[#4b4b4b]">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Recent Vendors</h3>
            <div className="space-y-3">
              {overview.recentActivity.vendors.map((vendor: any) => (
                <Card key={vendor.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#2b2b2b]">{vendor.storeName}</p>
                      <p className="text-sm text-[#4b4b4b]">{vendor.city}, {vendor.state}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#4b4b4b]">{formatDate(vendor.createdAt)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRevenueTab = () => (
    <div className="space-y-6">
      <RevenueDashboard />
    </div>
  );

  const renderOpsTab = () => (
    <div className="space-y-6">
      <OperationsDashboard />
    </div>
  );

  const renderMarketplaceTab = () => (
    <div className="space-y-6">
      <MarketplaceDashboard />
    </div>
  );

  const renderCrmTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#2b2b2b]">User Management & CRM</h2>
        <Button
          variant="primary"
          onClick={() => setLocation('/control/users')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Manage All Users
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation('/control/users?role=CUSTOMER')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {overview?.metrics.vendors.total || 0}
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700">Customers</div>
          <div className="text-xs text-gray-500 mt-1">View & manage</div>
        </Card>
        
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation('/control/users?role=VENDOR')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {overview?.metrics.vendors.active || 0}
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700">Vendors</div>
          <div className="text-xs text-gray-500 mt-1">View & manage</div>
        </Card>
        
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation('/control/users?role=EVENT_COORDINATOR')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">0</div>
          </div>
          <div className="text-sm font-medium text-gray-700">Coordinators</div>
          <div className="text-xs text-gray-500 mt-1">View & manage</div>
        </Card>
        
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation('/control/users?onboardingStage=NEEDS_ATTENTION')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">0</div>
          </div>
          <div className="text-sm font-medium text-gray-700">Needs Attention</div>
          <div className="text-xs text-gray-500 mt-1">Pending actions</div>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => setLocation('/control/users?riskScoreMin=60')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-medium text-gray-900">At-Risk Users</div>
            <div className="text-sm text-gray-600">High risk scores</div>
          </button>
          <button
            onClick={() => setLocation('/control/users?stripeStatus=INCOMPLETE')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-medium text-gray-900">Stripe Incomplete</div>
            <div className="text-sm text-gray-600">Pending verification</div>
          </button>
          <button
            onClick={() => setLocation('/control/users?emailVerified=false')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-medium text-gray-900">Unverified Emails</div>
            <div className="text-sm text-gray-600">Pending verification</div>
          </button>
          <button
            onClick={() => setLocation('/control/users?vacationMode=true')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-medium text-gray-900">On Vacation</div>
            <div className="text-sm text-gray-600">Vendors on break</div>
          </button>
        </div>
      </Card>
    </div>
  );

  const renderTrustTab = () => (
    <div className="space-y-6">
      <TrustSafetyDashboard />
    </div>
  );

  const renderSearchTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#2b2b2b]">Search & AI</h2>
      <Card className="p-8 text-center">
        <Search className="h-12 w-12 text-[#4b4b4b] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">Search & AI Health</h3>
        <p className="text-[#4b4b4b]">
          Semantic search, embeddings, and AI insights monitoring coming soon.
        </p>
      </Card>
    </div>
  );

  const renderGrowthTab = () => (
    <div className="space-y-6">
      <GrowthSocialDashboard />
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <SecurityComplianceDashboard />
    </div>
  );

  const renderIncidentsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#2b2b2b]">Incidents & Runbooks</h2>
      <Card className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-[#4b4b4b] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">Incident Management</h3>
        <p className="text-[#4b4b4b]">
          Incident tracking, runbooks, and postmortems coming soon.
        </p>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#2b2b2b]">Settings</h2>
      <Card className="p-8 text-center">
        <Settings className="h-12 w-12 text-[#4b4b4b] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">Admin Settings</h3>
        <p className="text-[#4b4b4b]">
          System configuration and admin preferences coming soon.
        </p>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverviewTab();
      case 'revenue': return renderRevenueTab();
      case 'ops': return renderOpsTab();
      case 'marketplace': return renderMarketplaceTab();
      case 'crm': return renderCrmTab();
      case 'trust': return renderTrustTab();
      case 'search': return renderSearchTab();
      case 'growth': return renderGrowthTab();
      case 'security': return renderSecurityTab();
      case 'incidents': return renderIncidentsTab();
      case 'settings': return renderSettingsTab();
      default: return renderOverviewTab();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'ops', label: 'Ops', icon: Activity },
    { id: 'marketplace', label: 'Marketplace', icon: Globe },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'trust', label: 'Trust & Safety', icon: Shield },
    { id: 'search', label: 'Search & AI', icon: Search },
    { id: 'growth', label: 'Growth', icon: TrendingUp },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <SEOHead
        title="Admin Dashboard - Craved Artisan"
        description="Admin operations center for Craved Artisan platform management"
        url="/admin"
        type="website"
      />
      <div className={`${colors.bg} min-h-screen`}>
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-[#7F232E]/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-[#2b2b2b]">Admin Dashboard</h1>
                <Badge variant="secondary" className="bg-[#7F232E]/10 text-[#7F232E]">
                  Craved Artisan
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Global Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4b4b4b]" />
                  <input
                    type="text"
                    placeholder="Search everything... (Cmd+K)"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    data-action="search"
                    className="pl-10 pr-4 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30 w-64"
                    aria-label="Global search"
                  />
                </div>
                
                {/* System Messages */}
                <Button
                  variant="secondary"
                  onClick={() => setShowSystemMessages(!showSystemMessages)}
                  data-action="messages"
                  className="relative"
                  aria-label="Toggle system messages"
                >
                  <Bell className="h-4 w-4" />
                  {overview?.metrics.messages.unread && overview.metrics.messages.unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {overview.metrics.messages.unread}
                    </span>
                  )}
                </Button>

                {/* Keyboard Shortcuts Help */}
                <Button
                  variant="secondary"
                  onClick={() => setIsShortcutsOpen(true)}
                  data-action="help"
                  aria-label="Show keyboard shortcuts"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => setLocation('/')}
                >
                  Back to Site
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <nav className="space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id as TabType)}
                      data-tab={tab.id}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#7F232E] text-white'
                          : 'text-[#4b4b4b] hover:bg-white/50'
                      }`}
                      aria-label={`Switch to ${tab.label} tab`}
                      aria-selected={activeTab === tab.id}
                      role="tab"
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {overviewLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTabContent()}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Messages Drawer */}
      <SystemMessagesDrawer
        isOpen={showSystemMessages}
        onClose={() => setShowSystemMessages(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
}
