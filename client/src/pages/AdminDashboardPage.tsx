'use client';

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Shield, Users, DollarSign, Settings, BarChart3, Activity, 
  Plus, Edit, Copy, Trash2, Eye, Download, Upload, Filter,
  Search, Grid, List, ChevronDown, ChevronUp, X, Bell, Zap,
  Award, Target, Gift, Tag, Globe, Camera, Video, FileText,
  PieChart, Activity as ActivityIcon, ArrowUpRight, ArrowDownRight, Sparkles,
  Brain, Lightbulb, Shield as ShieldIcon, Info, CheckCircle, AlertCircle,
  Clock, Star, Heart, Share2, ExternalLink, Download as DownloadIcon,
  Upload as UploadIcon, Settings as SettingsIcon, BarChart3 as BarChart3Icon,
  Headphones, Box, Palette, CreditCard, Users as UsersIcon,
  ShoppingCart, Package as PackageIcon, Calendar as CalendarIcon,
  MessageSquare, Bell as BellIcon, BarChart3 as BarChart3Icon2,
  Headphones as HeadphonesIcon, Box as BoxIcon, Palette as PaletteIcon,
  CreditCard as CreditCardIcon, Map, Layers, MousePointer,
  Move, RotateCcw, Save, Play, Pause, Volume2, Wifi, Power,
  Droplets, Car, Coffee, Utensils, Music, Camera as CameraIcon,
  Video as VideoIcon, FileText as FileTextIcon, PieChart as PieChartIcon,
  Activity as ActivityIcon2, ArrowUpRight as ArrowUpRightIcon,
  ArrowDownRight as ArrowDownRightIcon, Sparkles as SparklesIcon,
  Brain as BrainIcon, Lightbulb as LightbulbIcon, Shield as ShieldIcon2,
  Info as InfoIcon, CheckCircle as CheckCircleIcon, AlertCircle as AlertCircleIcon,
  Clock as ClockIcon, Star as StarIcon, Heart as HeartIcon,
  Share2 as Share2Icon, ExternalLink as ExternalLinkIcon, Truck,
  Package, QrCode, Smartphone, Mail, Thermometer, Snowflake,
  AlertTriangle, CheckCircle2, Clock as ClockIcon2, MapPin as MapPinIcon,
  Database, Server, Cpu, HardDrive, Network, Lock, Unlock,
  UserCheck, UserX, UserPlus, UserMinus, Key, KeyRound,
  Flag, FlagOff, AlertOctagon, TrendingUp, TrendingDown,
  Zap as ZapIcon, Target as TargetIcon, Globe as GlobeIcon,
  Palette as PaletteIcon2, Brush, Type, Layout, Layers as LayersIcon,
  Code, Bug, GitBranch, GitCommit, GitPullRequest, GitMerge,
  Database as DatabaseIcon, HardDrive as HardDriveIcon,
  Network as NetworkIcon, Wifi as WifiIcon, Signal, SignalHigh,
  SignalMedium, SignalLow, SignalZero, Activity as ActivityIcon3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlatformStats {
  activeUsers: {
    customers: number;
    vendors: number;
    suppliers: number;
    coordinators: number;
    dropoffManagers: number;
    admins: number;
  };
  liveCarts: number;
  conversionRate: number;
  grossSales: number;
  systemHealth: {
    serverStatus: 'healthy' | 'warning' | 'critical';
    queueDelays: number;
    apiLoad: number;
    uptime: number;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'VENDOR' | 'SUPPLIER' | 'EVENT_COORDINATOR' | 'DROPOFF_MANAGER' | 'ADMIN';
  status: 'active' | 'suspended' | 'restricted' | 'inactive';
  lastLogin: string;
  createdAt: string;
  suspiciousActivity: boolean;
  loginAttempts: number;
  ipAddress: string;
  location: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'dispute' | 'feature-request' | 'general';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  customerId: string;
  customerName: string;
  aiSummary?: string;
}

interface AIAlert {
  id: string;
  type: 'anomaly' | 'forecast' | 'security' | 'performance';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  action?: string;
  timestamp: string;
  resolved: boolean;
}

interface FinancialData {
  profitLoss: {
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
  };
  roleBasedRevenues: {
    vendors: number;
    events: number;
    subscriptions: number;
    fees: number;
  };
  platformFees: {
    transactionFees: number;
    subscriptionFees: number;
    eventFees: number;
    total: number;
  };
  cashFlow: {
    inflows: number;
    outflows: number;
    netFlow: number;
  };
}

interface APIMetrics {
  usage: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
  endpoints: Array<{
    path: string;
    method: string;
    requests: number;
    errors: number;
    avgResponseTime: number;
  }>;
  errors: Array<{
    id: string;
    timestamp: string;
    endpoint: string;
    error: string;
    userId?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  rateLimiting: {
    activeLimits: number;
    blockedRequests: number;
    topBlockedIPs: Array<{
      ip: string;
      requests: number;
      reason: string;
    }>;
  };
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'support' | 'developer' | 'analyst';
  permissions: string[];
  lastActivity: string;
  active: boolean;
  restrictedTabs: string[];
}

interface ContentModeration {
  flaggedItems: Array<{
    id: string;
    type: 'product' | 'storefront' | 'message' | 'review';
    reason: string;
    reporterId: string;
    reporterName: string;
    itemId: string;
    itemTitle: string;
    status: 'pending' | 'reviewed' | 'approved' | 'rejected';
    aiScreening: {
      passed: boolean;
      confidence: number;
      flags: string[];
    };
    timestamp: string;
  }>;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  targetUsers: string[];
  targetZips: string[];
  rolloutPercentage: number;
  createdAt: string;
  createdBy: string;
}

interface MarketplaceCuration {
  featuredVendors: Array<{
    id: string;
    name: string;
    category: string;
    featuredUntil: string;
    performance: number;
  }>;
  emergingZips: Array<{
    zipCode: string;
    growthRate: number;
    vendorCount: number;
    revenueGrowth: number;
  }>;
  homepageBanners: Array<{
    id: string;
    title: string;
    image: string;
    link: string;
    active: boolean;
    startDate: string;
    endDate: string;
  }>;
}

export default function AdminDashboardPage() {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [aiAlerts, setAiAlerts] = useState<AIAlert[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [apiMetrics, setApiMetrics] = useState<APIMetrics | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [contentModeration, setContentModeration] = useState<ContentModeration | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [marketplaceCuration, setMarketplaceCuration] = useState<MarketplaceCuration | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'fees' | 'audit' | 'support' | 'ai' | 'financial' | 'api' | 'staff' | 'moderation' | 'features' | 'curation' | 'theme' | 'security' | 'growth'>('overview');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockPlatformStats: PlatformStats = {
      activeUsers: {
        customers: 1247,
        vendors: 156,
        suppliers: 23,
        coordinators: 8,
        dropoffManagers: 12,
        admins: 3
      },
      liveCarts: 89,
      conversionRate: 12.4,
      grossSales: 45678.90,
      systemHealth: {
        serverStatus: 'healthy',
        queueDelays: 0.2,
        apiLoad: 67,
        uptime: 99.9
      }
    };

    const mockUsers: User[] = [
      {
        id: 'u1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'VENDOR',
        status: 'active',
        lastLogin: '2024-02-15T10:30:00Z',
        createdAt: '2024-01-15T08:00:00Z',
        suspiciousActivity: false,
        loginAttempts: 1,
        ipAddress: '192.168.1.100',
        location: 'Atlanta, GA'
      },
      {
        id: 'u2',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        role: 'CUSTOMER',
        status: 'active',
        lastLogin: '2024-02-15T09:15:00Z',
        createdAt: '2024-01-20T14:30:00Z',
        suspiciousActivity: true,
        loginAttempts: 5,
        ipAddress: '203.45.67.89',
        location: 'Miami, FL'
      }
    ];

    const mockAuditLogs: AuditLog[] = [
      {
        id: 'al1',
        timestamp: '2024-02-15T11:00:00Z',
        userId: 'u1',
        userName: 'John Doe',
        userRole: 'VENDOR',
        action: 'UPDATE_PRODUCT',
        resource: 'Product',
        resourceId: 'p123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        details: 'Updated product price from $10.00 to $12.00',
        severity: 'low'
      },
      {
        id: 'al2',
        timestamp: '2024-02-15T10:45:00Z',
        userId: 'admin1',
        userName: 'Admin User',
        userRole: 'ADMIN',
        action: 'SUSPEND_USER',
        resource: 'User',
        resourceId: 'u3',
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0...',
        details: 'Suspended user for suspicious activity',
        severity: 'high'
      }
    ];

    const mockSupportTickets: SupportTicket[] = [
      {
        id: 'st1',
        title: 'Payment processing error',
        description: 'Customers are unable to complete payments with credit cards',
        type: 'bug',
        status: 'in-progress',
        priority: 'high',
        assignedTo: 'admin1',
        assignedToName: 'Admin User',
        createdAt: '2024-02-15T08:00:00Z',
        updatedAt: '2024-02-15T10:30:00Z',
        slaDeadline: '2024-02-16T08:00:00Z',
        customerId: 'c1',
        customerName: 'Sarah Johnson',
        aiSummary: 'Payment gateway integration issue affecting 15% of transactions'
      }
    ];

    const mockAIAlerts: AIAlert[] = [
      {
        id: 'aa1',
        type: 'anomaly',
        title: 'Unusual Login Pattern',
        description: 'Multiple failed login attempts detected from new IP addresses',
        severity: 'high',
        confidence: 0.92,
        action: 'Review Security Logs',
        timestamp: '2024-02-15T11:30:00Z',
        resolved: false
      },
      {
        id: 'aa2',
        type: 'forecast',
        title: 'Churn Risk Alert',
        description: '15 vendors showing signs of potential churn in next 30 days',
        severity: 'medium',
        confidence: 0.78,
        action: 'Review Vendor Engagement',
        timestamp: '2024-02-15T10:00:00Z',
        resolved: false
      }
    ];

    const mockFinancialData: FinancialData = {
      profitLoss: {
        revenue: 125000.00,
        expenses: 45000.00,
        profit: 80000.00,
        margin: 64.0
      },
      roleBasedRevenues: {
        vendors: 85000.00,
        events: 25000.00,
        subscriptions: 10000.00,
        fees: 5000.00
      },
      platformFees: {
        transactionFees: 3500.00,
        subscriptionFees: 10000.00,
        eventFees: 2500.00,
        total: 16000.00
      },
      cashFlow: {
        inflows: 135000.00,
        outflows: 55000.00,
        netFlow: 80000.00
      }
    };

    const mockAPIMetrics: APIMetrics = {
      usage: {
        totalRequests: 15420,
        successfulRequests: 15100,
        failedRequests: 320,
        averageResponseTime: 245
      },
      endpoints: [
        {
          path: '/api/vendor/products',
          method: 'GET',
          requests: 3200,
          errors: 15,
          avgResponseTime: 180
        },
        {
          path: '/api/orders',
          method: 'POST',
          requests: 2100,
          errors: 45,
          avgResponseTime: 320
        }
      ],
      errors: [
        {
          id: 'e1',
          timestamp: '2024-02-15T11:00:00Z',
          endpoint: '/api/payments',
          error: 'Stripe API timeout',
          userId: 'u1',
          severity: 'high'
        }
      ],
      rateLimiting: {
        activeLimits: 5,
        blockedRequests: 89,
        topBlockedIPs: [
          { ip: '203.45.67.89', requests: 45, reason: 'Rate limit exceeded' }
        ]
      }
    };

    const mockStaffMembers: StaffMember[] = [
      {
        id: 's1',
        name: 'Admin User',
        email: 'admin@cravedartisan.com',
        role: 'admin',
        permissions: ['all'],
        lastActivity: '2024-02-15T11:30:00Z',
        active: true,
        restrictedTabs: []
      },
      {
        id: 's2',
        name: 'Support Agent',
        email: 'support@cravedartisan.com',
        role: 'support',
        permissions: ['view_tickets', 'edit_tickets'],
        lastActivity: '2024-02-15T10:15:00Z',
        active: true,
        restrictedTabs: ['financial', 'api']
      }
    ];

    const mockContentModeration: ContentModeration = {
      flaggedItems: [
        {
          id: 'cm1',
          type: 'product',
          reason: 'Inappropriate content',
          reporterId: 'r1',
          reporterName: 'Customer Report',
          itemId: 'p123',
          itemTitle: 'Artisan Soap',
          status: 'pending',
          aiScreening: {
            passed: true,
            confidence: 0.85,
            flags: []
          },
          timestamp: '2024-02-15T09:00:00Z'
        }
      ]
    };

    const mockFeatureFlags: FeatureFlag[] = [
      {
        id: 'ff1',
        name: 'AI Recommendations',
        description: 'Enable AI-powered product recommendations',
        enabled: true,
        targetUsers: ['all'],
        targetZips: ['30248', '30301'],
        rolloutPercentage: 50,
        createdAt: '2024-02-01T00:00:00Z',
        createdBy: 'admin1'
      }
    ];

    const mockMarketplaceCuration: MarketplaceCuration = {
      featuredVendors: [
        {
          id: 'v1',
          name: 'Rose Creek Bakery',
          category: 'Food & Beverage',
          featuredUntil: '2024-03-15T00:00:00Z',
          performance: 4.8
        }
      ],
      emergingZips: [
        {
          zipCode: '30248',
          growthRate: 25.5,
          vendorCount: 12,
          revenueGrowth: 18.3
        }
      ],
      homepageBanners: [
        {
          id: 'b1',
          title: 'Spring Artisan Market',
          image: '/images/banners/spring-market.jpg',
          link: '/events/spring-market',
          active: true,
          startDate: '2024-02-01T00:00:00Z',
          endDate: '2024-04-30T00:00:00Z'
        }
      ]
    };

    setPlatformStats(mockPlatformStats);
    setUsers(mockUsers);
    setAuditLogs(mockAuditLogs);
    setSupportTickets(mockSupportTickets);
    setAiAlerts(mockAIAlerts);
    setFinancialData(mockFinancialData);
    setApiMetrics(mockAPIMetrics);
    setStaffMembers(mockStaffMembers);
    setContentModeration(mockContentModeration);
    setFeatureFlags(mockFeatureFlags);
    setMarketplaceCuration(mockMarketplaceCuration);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'restricted': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />;
      case 'forecast': return <TrendingUp className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'performance': return <Activity className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!platformStats || !financialData || !apiMetrics) return <div>Platform data not found.</div>;

  return (
    <div className="page-container bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
                <p className="text-gray-600">Platform administration and oversight</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(platformStats.systemHealth.serverStatus)}`}>
                System: {platformStats.systemHealth.serverStatus}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-green">{Object.values(platformStats.activeUsers).reduce((a, b) => a + b, 0)}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-maroon">${platformStats.grossSales.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Gross Sales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{platformStats.systemHealth.uptime}%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'users', label: 'Users', icon: UsersIcon },
              { id: 'fees', label: 'Fees & Revenue', icon: DollarSign },
              { id: 'audit', label: 'Audit Logs', icon: FileText },
              { id: 'support', label: 'Support', icon: MessageSquare },
              { id: 'ai', label: 'AI Alerts', icon: Brain },
              { id: 'financial', label: 'Financial', icon: BarChart3Icon },
              { id: 'api', label: 'API Monitor', icon: Database },
              { id: 'staff', label: 'Staff', icon: Users },
              { id: 'moderation', label: 'Moderation', icon: Flag },
              { id: 'features', label: 'Features', icon: Zap },
              { id: 'curation', label: 'Curation', icon: Star },
              { id: 'theme', label: 'Theme', icon: Palette },
              { id: 'security', label: 'Security', icon: Lock },
              { id: 'growth', label: 'Growth', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-red-600 text-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Banner */}
              <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Platform Overview</h2>
                    <p className="text-red-100">Real-time platform statistics and system health monitoring</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        <span className="text-sm">API Load: {platformStats.systemHealth.apiLoad}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Queue Delay: {platformStats.systemHealth.queueDelays}s</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{platformStats.liveCarts}</div>
                    <div className="text-sm text-red-100">Live Carts</div>
                    <div className="text-sm text-red-100">{platformStats.conversionRate}% Conversion</div>
                  </div>
                </div>
              </div>

              {/* Platform Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {platformStats.activeUsers.customers}
                  </div>
                  <div className="text-sm text-gray-600">Active Customers</div>
                </div>

                <div className="bg-white rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <UsersIcon className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {platformStats.activeUsers.vendors}
                  </div>
                  <div className="text-sm text-gray-600">Active Vendors</div>
                </div>

                <div className="bg-white rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${financialData.profitLoss.revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>

                <div className="bg-white rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Activity className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {apiMetrics.usage.totalRequests.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">API Requests</div>
                </div>
              </div>

              {/* AI Alerts */}
              <div className="bg-white rounded-lg p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">AI Alerts</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Brain className="w-4 h-4" />
                    Powered by AI
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiAlerts.slice(0, 6).map((alert) => (
                    <div key={alert.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          alert.type === 'anomaly' ? 'bg-red-100 text-red-600' :
                          alert.type === 'forecast' ? 'bg-blue-100 text-blue-600' :
                          alert.type === 'security' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            {alert.action && (
                              <button className="text-xs text-red-600 hover:text-red-800">
                                {alert.action} →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Health */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4">System Health</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Server Status</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(platformStats.systemHealth.serverStatus)}`}>
                        {platformStats.systemHealth.serverStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Load</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              platformStats.systemHealth.apiLoad > 80 ? 'bg-red-500' :
                              platformStats.systemHealth.apiLoad > 60 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${platformStats.systemHealth.apiLoad}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{platformStats.systemHealth.apiLoad}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Queue Delays</span>
                      <span className="font-semibold">{platformStats.systemHealth.queueDelays}s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <span className="font-semibold text-green-600">{platformStats.systemHealth.uptime}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="font-semibold">${financialData.profitLoss.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expenses</span>
                      <span className="font-semibold">${financialData.profitLoss.expenses.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Profit</span>
                      <span className="font-semibold text-green-600">${financialData.profitLoss.profit.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Margin</span>
                      <span className="font-semibold text-green-600">{financialData.profitLoss.margin}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className={`p-2 rounded-lg ${
                        log.severity === 'critical' ? 'bg-red-100 text-red-600' :
                        log.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                        log.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{log.action}</h4>
                        <p className="text-xs text-gray-600">
                          {log.userName} • {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                      </div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Placeholder for other tabs */}
          {activeTab !== 'overview' && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="text-4xl font-bold text-gray-300 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
              </div>
              <p className="text-gray-500">This module is coming soon...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 
