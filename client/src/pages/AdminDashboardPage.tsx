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
  SignalMedium, SignalLow, SignalZero, Activity as ActivityIcon3,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RevenueOverview from './admin/RevenueOverview';
import UserListTable from '../components/admin/users/UserListTable';
import UserFilters from '../components/admin/users/UserFilters';

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

interface AuditEvent {
  id: string;
  occurredAt: string;
  scope: string;
  action: string;
  actorId: string | null;
  actorType: string;
  actorIp: string | null;
  targetType: string | null;
  targetId: string | null;
  severity: string;
  reason: string | null;
  requestId: string | null;
  actor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

interface AuditFilters {
  from?: string;
  to?: string;
  scope?: string;
  action?: string;
  severity?: string;
  search?: string;
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
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
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
  
  // Audit logs state
  const [auditFilters, setAuditFilters] = useState<AuditFilters>({});
  const [showAuditFilters, setShowAuditFilters] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditLoading, setAuditLoading] = useState(false);
  
  // Maintenance mode state
  const [maintenanceSettings, setMaintenanceSettings] = useState<{
    environmentMode: boolean;
    databaseMode: boolean;
    betaTestersCount: number;
    notes?: string;
  } | null>(null);
  const [betaTesters, setBetaTesters] = useState<Array<{
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  }>>([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [newBetaTesterEmail, setNewBetaTesterEmail] = useState('');

  // Users tab state
  const [userFilters, setUserFilters] = useState<any>({});
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Load maintenance settings
  const loadMaintenanceSettings = async () => {
    try {
      const response = await fetch('/api/maintenance/admin/settings', {
        credentials: 'include'
      });
      if (response.ok) {
        const settings = await response.json();
        setMaintenanceSettings(settings);
      }
    } catch (error) {
      console.error('Failed to load maintenance settings:', error);
    }
  };

  // Load beta testers
  const loadBetaTesters = async () => {
    try {
      const response = await fetch('/api/maintenance/admin/beta-testers', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBetaTesters(data.betaTesters);
      }
    } catch (error) {
      console.error('Failed to load beta testers:', error);
    }
  };

  // Toggle maintenance mode
  const toggleMaintenanceMode = async (enabled: boolean, notes?: string) => {
    setMaintenanceLoading(true);
    try {
      const response = await fetch('/api/maintenance/admin/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ enabled, notes }),
      });
      if (response.ok) {
        await loadMaintenanceSettings();
      }
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  // Add beta tester
  const addBetaTester = async (email: string) => {
    try {
      const response = await fetch('/api/maintenance/admin/beta-testers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setNewBetaTesterEmail('');
        await loadBetaTesters();
        await loadMaintenanceSettings();
      }
    } catch (error) {
      console.error('Failed to add beta tester:', error);
    }
  };

  // Remove beta tester
  const removeBetaTester = async (userId: string) => {
    try {
      const response = await fetch(`/api/maintenance/admin/beta-testers/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        await loadBetaTesters();
        await loadMaintenanceSettings();
      }
    } catch (error) {
      console.error('Failed to remove beta tester:', error);
    }
  };

  // Handle user selection in Users tab
  const handleUserSelect = (userId: string) => {
    window.location.href = `/control/users/${userId}`;
  };

  // Handle user actions in Users tab
  const handleUserAction = (userId: string, action: string) => {
    console.log(`User action: ${action} for user: ${userId}`);
    // Actions will be handled by the UserListTable component's modals
  };

  // Load maintenance data when features tab is active
  useEffect(() => {
    if (activeTab === 'features') {
      loadMaintenanceSettings();
      loadBetaTesters();
    }
  }, [activeTab]);

  // Fetch audit events when audit tab is active
  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, auditPage, auditFilters]);

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

    // Audit logs are now fetched from API when audit tab is active
    // setAuditLogs will be called by fetchAuditEvents()

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
    // setAuditLogs is now handled by fetchAuditEvents() when audit tab is active
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

  // Audit logs helper functions
  const fetchAuditEvents = async () => {
    try {
      setAuditLoading(true);
      const queryParams = new URLSearchParams({
        page: auditPage.toString(),
        ...auditFilters
      } as Record<string, string>);

      const response = await fetch(`/api/admin/audit?${queryParams}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.data?.events || []);
        setAuditTotalPages(data.data?.pagination?.pages || 1);
      } else {
        setAuditLogs([]);
        setAuditTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching audit events:', error);
      setAuditLogs([]);
      setAuditTotalPages(1);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleAuditExport = async () => {
    try {
      const response = await fetch('/api/admin/audit/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...auditFilters, format: 'csv' })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting audit events:', error);
    }
  };

  const handleVerifyChain = async () => {
    try {
      const response = await fetch('/api/admin/audit/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(auditFilters)
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.data.message);
      }
    } catch (error) {
      console.error('Error verifying audit chain:', error);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const classes = {
      INFO: 'bg-blue-100 text-blue-800',
      NOTICE: 'bg-green-100 text-green-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      CRITICAL: 'bg-red-100 text-red-800'
    };
    return classes[severity as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  };

  const getScopeBadge = (scope: string) => {
    const classes = {
      AUTH: 'bg-purple-100 text-purple-800',
      USER: 'bg-blue-100 text-blue-800',
      REVENUE: 'bg-green-100 text-green-800',
      ORDER: 'bg-orange-100 text-orange-800',
      INVENTORY: 'bg-yellow-100 text-yellow-800',
      MESSAGE: 'bg-pink-100 text-pink-800',
      EVENT: 'bg-indigo-100 text-indigo-800',
      CONFIG: 'bg-red-100 text-red-800',
      PRIVACY: 'bg-gray-100 text-gray-800'
    };
    return classes[scope as keyof typeof classes] || 'bg-gray-100 text-gray-800';
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
                  {!auditLogs || auditLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm">No recent activity</p>
                      <p className="text-xs text-gray-400">Audit events will appear here</p>
                    </div>
                  ) : (
                    auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <div className={`p-2 rounded-lg ${
                          log.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                          log.severity === 'WARNING' ? 'bg-orange-100 text-orange-600' :
                          log.severity === 'NOTICE' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{log.action}</h4>
                          <p className="text-xs text-gray-600">
                            {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'SYSTEM'} • {new Date(log.occurredAt).toLocaleTimeString()}
                          </p>
                          {log.targetType && (
                            <p className="text-xs text-gray-500 mt-1">Target: {log.targetType}</p>
                          )}
                        </div>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getSeverityBadge(log.severity)}`}>
                          {log.severity}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Features Tab - Maintenance Mode Controls */}
          {activeTab === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Maintenance Mode Control */}
              <div className="bg-white rounded-lg p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Control site access during development and testing
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {maintenanceSettings && (
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                          maintenanceSettings.environmentMode || maintenanceSettings.databaseMode
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {maintenanceSettings.environmentMode || maintenanceSettings.databaseMode ? 'Active' : 'Inactive'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {maintenanceSettings.environmentMode ? 'Environment Override' : 'Database Control'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {maintenanceSettings && (
                  <div className="space-y-6">
                    {/* Environment Override Warning */}
                    {maintenanceSettings.environmentMode && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
                          <div>
                            <h4 className="font-medium text-amber-800">Environment Override Active</h4>
                            <p className="text-sm text-amber-700 mt-1">
                              Maintenance mode is controlled by the MAINTENANCE_MODE environment variable.
                              Database toggle is disabled while environment override is active.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Database Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Database Toggle</h4>
                        <p className="text-sm text-gray-600">Enable/disable maintenance mode via dashboard</p>
                      </div>
                      <button
                        onClick={() => toggleMaintenanceMode(!maintenanceSettings.databaseMode)}
                        disabled={maintenanceLoading || maintenanceSettings.environmentMode}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                          maintenanceSettings.databaseMode ? 'bg-amber-600' : 'bg-gray-200'
                        } ${maintenanceSettings.environmentMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            maintenanceSettings.databaseMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Notes */}
                    {maintenanceSettings.notes && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">Notes</h4>
                        <p className="text-sm text-blue-700 mt-1">{maintenanceSettings.notes}</p>
                      </div>
                    )}

                    {/* Beta Access Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Shield className="w-8 h-8 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Beta Testers</p>
                            <p className="text-2xl font-bold text-blue-600">{maintenanceSettings.betaTestersCount}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <UserCheck className="w-8 h-8 text-green-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-green-900">Access Method</p>
                            <p className="text-sm font-semibold text-green-600">
                              {maintenanceSettings.environmentMode ? 'ENV + Beta Key' : 'Database + Beta Users'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Key className="w-8 h-8 text-purple-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-purple-900">Beta Key</p>
                            <p className="text-sm font-semibold text-purple-600">Environment Variable</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Beta Testers Management */}
              <div className="bg-white rounded-lg p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Beta Testers</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage users who can access the site during maintenance mode
                    </p>
                  </div>
                </div>

                {/* Add Beta Tester */}
                <div className="mb-6">
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={newBetaTesterEmail}
                      onChange={(e) => setNewBetaTesterEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => addBetaTester(newBetaTesterEmail)}
                      disabled={!newBetaTesterEmail || maintenanceLoading}
                      className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Beta Tester
                    </button>
                  </div>
                </div>

                {/* Beta Testers List */}
                <div className="space-y-3">
                  {betaTesters.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No beta testers added yet</p>
                    </div>
                  ) : (
                    betaTesters.map((tester) => (
                      <div key={tester.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-amber-700">
                              {tester.name ? tester.name.charAt(0).toUpperCase() : tester.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {tester.name || `${tester.firstName || ''} ${tester.lastName || ''}`.trim() || 'Unnamed User'}
                            </p>
                            <p className="text-sm text-gray-600">{tester.email}</p>
                            <p className="text-xs text-gray-500">
                              Added {new Date(tester.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeBetaTester(tester.id)}
                          disabled={maintenanceLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Coming Soon Preview */}
              <div className="bg-white rounded-lg p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Coming Soon Page Preview</h3>
                  <a
                    href="/?beta=preview"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Page
                  </a>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  This is how the site will appear to users when maintenance mode is active.
                  Beta testers and users with the beta key will bypass this page.
                </p>
                <div className="bg-gradient-to-br from-amber-50 via-white to-blue-50 rounded-lg p-8 border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-3 rounded-xl">
                        <Activity className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="ml-3 text-2xl font-bold text-gray-900">Craved</h4>
                    </div>
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h5>
                    <p className="text-gray-600 text-sm">Where Artisans Meet Community</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Fees & Revenue Tab */}
          {activeTab === 'fees' && (
            <motion.div
              key="fees"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RevenueOverview />
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UsersIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Total Users</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {platformStats ? Object.values(platformStats.activeUsers).reduce((a, b) => a + b, 0) : 0}
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Vendors</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {platformStats?.activeUsers.vendors || 0}
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Coordinators</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {platformStats?.activeUsers.coordinators || 0}
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-600">At Risk</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {users.filter(u => u.suspiciousActivity).length}
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserX className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-gray-600">Suspended</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.status === 'suspended').length}
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <UserFilters
                  filters={userFilters}
                  onFilterChange={setUserFilters}
                  searchQuery={userSearchQuery}
                  onSearchChange={setUserSearchQuery}
                />
              </div>

              {/* User Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <UserListTable
                  filters={userFilters}
                  searchQuery={userSearchQuery}
                  onUserSelect={handleUserSelect}
                  onAction={handleUserAction}
                />
              </div>
            </motion.div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Actions Bar */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowAuditFilters(!showAuditFilters)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        showAuditFilters 
                          ? 'bg-blue-50 text-blue-700 border-blue-300' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                    </button>
                    
                    <div className="relative">
                      <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by action, entity..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onChange={(e) => setAuditFilters({ ...auditFilters, search: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAuditExport}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>

                    <button
                      onClick={handleVerifyChain}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Verify Chain
                    </button>
                  </div>
                </div>

                {/* Filters Panel */}
                {showAuditFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                      <input
                        type="datetime-local"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onChange={(e) => setAuditFilters({ ...auditFilters, from: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                      <input
                        type="datetime-local"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onChange={(e) => setAuditFilters({ ...auditFilters, to: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onChange={(e) => setAuditFilters({ ...auditFilters, scope: e.target.value })}
                      >
                        <option value="">All Scopes</option>
                        <option value="AUTH">Auth</option>
                        <option value="USER">User</option>
                        <option value="REVENUE">Revenue</option>
                        <option value="ORDER">Order</option>
                        <option value="INVENTORY">Inventory</option>
                        <option value="MESSAGE">Message</option>
                        <option value="EVENT">Event</option>
                        <option value="CONFIG">Config</option>
                        <option value="PRIVACY">Privacy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onChange={(e) => setAuditFilters({ ...auditFilters, severity: e.target.value })}
                      >
                        <option value="">All Severities</option>
                        <option value="INFO">Info</option>
                        <option value="NOTICE">Notice</option>
                        <option value="WARNING">Warning</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Events Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Scope
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Target
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {auditLoading ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex items-center justify-center gap-2">
                              <Activity className="w-5 h-5 animate-spin" />
                              Loading audit events...
                            </div>
                          </td>
                        </tr>
                      ) : !auditLogs || auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="w-12 h-12 text-gray-300" />
                              <p>No audit events found</p>
                              <p className="text-sm text-gray-400">Try adjusting your filters</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((event) => (
                          <tr 
                            key={event.id} 
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(event.occurredAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScopeBadge(event.scope)}`}>
                                {event.scope}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {event.action}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {event.actor ? (
                                <div>
                                  <div className="font-medium">{event.actor.firstName} {event.actor.lastName}</div>
                                  <div className="text-xs text-gray-500">{event.actor.email}</div>
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">SYSTEM</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {event.targetType && (
                                <div>
                                  <div className="font-medium">{event.targetType}</div>
                                  <div className="text-xs text-gray-500 truncate max-w-xs">{event.targetId}</div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadge(event.severity)}`}>
                                {event.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {event.actorIp || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {auditTotalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                        disabled={auditPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setAuditPage(p => Math.min(auditTotalPages, p + 1))}
                        disabled={auditPage === auditTotalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Page <span className="font-medium">{auditPage}</span> of{' '}
                          <span className="font-medium">{auditTotalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                            disabled={auditPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setAuditPage(p => Math.min(auditTotalPages, p + 1))}
                            disabled={auditPage === auditTotalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Placeholder for other tabs */}
          {activeTab !== 'overview' && activeTab !== 'features' && activeTab !== 'fees' && activeTab !== 'users' && activeTab !== 'audit' && (
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
