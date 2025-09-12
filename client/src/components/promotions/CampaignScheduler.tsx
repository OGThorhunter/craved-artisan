import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Repeat,
  Play,
  Pause,
  SquareStop,
  Edit,
  Trash2,
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  XCircle,
  BarChart3,
  Users,
  Target,
  DollarSign,
  TrendingUp,
  Zap,
  Send,
  Eye,
  Copy,
  Share2,
  Mail,
  Smartphone,
  Globe,
  Image,
  Video,
  Link
} from 'lucide-react';

interface ScheduledCampaign {
  id: string;
  name: string;
  description: string;
  promotionId: string;
  type: 'email' | 'social' | 'sms' | 'push' | 'multi-channel';
  status: 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  schedule: {
    startDate: string;
    endDate: string;
    timezone: string;
    frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
    customSchedule?: {
      days: number[];
      times: string[];
      interval: number;
    };
    nextRun: string;
    lastRun?: string;
  };
  channels: {
    email?: {
      subject: string;
      template: string;
      recipients: number;
    };
    social?: {
      platforms: string[];
      posts: number;
    };
    sms?: {
      message: string;
      recipients: number;
    };
    push?: {
      title: string;
      message: string;
      recipients: number;
    };
  };
  targeting: {
    segments: string[];
    demographics?: any;
    behavior?: any;
  };
  budget: {
    total: number;
    spent: number;
    dailyLimit: number;
  };
  metrics: {
    totalSent: number;
    totalReach: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    avgOpenRate: number;
    avgClickRate: number;
    avgConversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const CampaignScheduler: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<ScheduledCampaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Mock data
  const scheduledCampaigns: ScheduledCampaign[] = [
    {
      id: '1',
      name: 'Daily Newsletter',
      description: 'Daily promotional newsletter to all subscribers',
      promotionId: '1',
      type: 'email',
      status: 'running',
      schedule: {
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-12-31T23:59:59Z',
        timezone: 'America/New_York',
        frequency: 'daily',
        nextRun: '2025-01-21T09:00:00Z',
        lastRun: '2025-01-20T09:00:00Z'
      },
      channels: {
        email: {
          subject: 'Daily Deals & Fresh Bakes',
          template: 'daily-newsletter',
          recipients: 2500
        }
      },
      targeting: {
        segments: ['all-subscribers']
      },
      budget: {
        total: 5000,
        spent: 1250,
        dailyLimit: 50
      },
      metrics: {
        totalSent: 50000,
        totalReach: 50000,
        totalClicks: 3750,
        totalConversions: 750,
        totalRevenue: 18750,
        avgOpenRate: 45.2,
        avgClickRate: 7.5,
        avgConversionRate: 2.0
      },
      createdAt: '2024-12-15T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      createdBy: 'current-user'
    },
    {
      id: '2',
      name: 'Weekly Social Blast',
      description: 'Weekly social media promotion across all platforms',
      promotionId: '2',
      type: 'social',
      status: 'scheduled',
      schedule: {
        startDate: '2025-01-22T00:00:00Z',
        endDate: '2025-03-22T23:59:59Z',
        timezone: 'America/New_York',
        frequency: 'weekly',
        nextRun: '2025-01-22T14:00:00Z',
        lastRun: '2025-01-15T14:00:00Z'
      },
      channels: {
        social: {
          platforms: ['facebook', 'instagram', 'twitter'],
          posts: 3
        }
      },
      targeting: {
        segments: ['engaged-customers', 'social-followers']
      },
      budget: {
        total: 2000,
        spent: 0,
        dailyLimit: 100
      },
      metrics: {
        totalSent: 0,
        totalReach: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
        avgOpenRate: 0,
        avgClickRate: 0,
        avgConversionRate: 0
      },
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      createdBy: 'current-user'
    },
    {
      id: '3',
      name: 'Abandoned Cart Recovery',
      description: 'Automated abandoned cart recovery sequence',
      promotionId: '3',
      type: 'multi-channel',
      status: 'running',
      schedule: {
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-12-31T23:59:59Z',
        timezone: 'America/New_York',
        frequency: 'custom',
        customSchedule: {
          days: [1, 3, 7], // 1 day, 3 days, 7 days after abandonment
          times: ['10:00', '14:00', '18:00'],
          interval: 1
        },
        nextRun: '2025-01-21T10:00:00Z',
        lastRun: '2025-01-20T18:00:00Z'
      },
      channels: {
        email: {
          subject: 'You forgot something! 🛒',
          template: 'abandoned-cart',
          recipients: 150
        },
        sms: {
          message: 'Complete your order and get free shipping!',
          recipients: 50
        },
        push: {
          title: 'Cart Reminder',
          message: 'Your items are waiting for you',
          recipients: 200
        }
      },
      targeting: {
        segments: ['abandoned-cart-users']
      },
      budget: {
        total: 1000,
        spent: 250,
        dailyLimit: 25
      },
      metrics: {
        totalSent: 5000,
        totalReach: 5000,
        totalClicks: 750,
        totalConversions: 150,
        totalRevenue: 3750,
        avgOpenRate: 35.0,
        avgClickRate: 15.0,
        avgConversionRate: 3.0
      },
      createdAt: '2024-12-01T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      createdBy: 'current-user'
    },
    {
      id: '4',
      name: 'Holiday Sale Reminder',
      description: 'One-time holiday sale reminder campaign',
      promotionId: '4',
      type: 'email',
      status: 'scheduled',
      schedule: {
        startDate: '2025-01-25T00:00:00Z',
        endDate: '2025-01-25T23:59:59Z',
        timezone: 'America/New_York',
        frequency: 'once',
        nextRun: '2025-01-25T10:00:00Z'
      },
      channels: {
        email: {
          subject: 'Last Chance! 25% Off Ends Tonight',
          template: 'holiday-reminder',
          recipients: 3000
        }
      },
      targeting: {
        segments: ['all-customers', 'vip-customers']
      },
      budget: {
        total: 500,
        spent: 0,
        dailyLimit: 500
      },
      metrics: {
        totalSent: 0,
        totalReach: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
        avgOpenRate: 0,
        avgClickRate: 0,
        avgConversionRate: 0
      },
      createdAt: '2025-01-20T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      createdBy: 'current-user'
    }
  ];

  const filteredCampaigns = scheduledCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesType = filterType === 'all' || campaign.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4 text-green-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-purple-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-blue-600" />;
      case 'social': return <Share2 className="h-4 w-4 text-pink-600" />;
      case 'sms': return <Smartphone className="h-4 w-4 text-green-600" />;
      case 'push': return <Zap className="h-4 w-4 text-orange-600" />;
      case 'multi-channel': return <Globe className="h-4 w-4 text-purple-600" />;
      default: return <Send className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      case 'sms': return 'bg-green-100 text-green-800';
      case 'push': return 'bg-orange-100 text-orange-800';
      case 'multi-channel': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyText = (frequency: string, customSchedule?: any) => {
    switch (frequency) {
      case 'once': return 'One-time';
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'custom': return `Custom (${customSchedule?.days?.length || 0} days)`;
      default: return frequency;
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Scheduler</h2>
          <p className="text-gray-600 mt-1">Schedule and manage automated marketing campaigns</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="List view"
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                viewMode === 'calendar' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Calendar view"
            >
              Calendar
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Schedule new campaign"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Campaign</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">
                {scheduledCampaigns.filter(c => c.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl font-bold text-gray-900">
                {scheduledCampaigns.filter(c => c.status === 'running').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {scheduledCampaigns.reduce((sum, c) => sum + c.metrics.totalSent, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(scheduledCampaigns.reduce((sum, c) => sum + c.metrics.totalRevenue, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="social">Social</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
              <option value="multi-channel">Multi-Channel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(campaign.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(campaign.type)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(campaign.type)}`}>
                        {campaign.type}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{campaign.description}</p>

                  {/* Schedule Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Frequency:</span>
                      <span className="ml-1 text-sm text-gray-900">
                        {getFrequencyText(campaign.schedule.frequency, campaign.schedule.customSchedule)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Next Run:</span>
                      <span className="ml-1 text-sm text-gray-900">
                        {formatDateTime(campaign.schedule.nextRun)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Last Run:</span>
                      <span className="ml-1 text-sm text-gray-900">
                        {campaign.schedule.lastRun ? formatDateTime(campaign.schedule.lastRun) : 'Never'}
                      </span>
                    </div>
                  </div>

                  {/* Campaign Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Sent:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.totalSent.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reach:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.totalReach.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Clicks:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.totalClicks.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Conversions:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.totalConversions.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Revenue:</span>
                      <span className="ml-1 font-medium">{formatCurrency(campaign.metrics.totalRevenue)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Open Rate:</span>
                      <span className="ml-1 font-medium">{formatPercentage(campaign.metrics.avgOpenRate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Click Rate:</span>
                      <span className="ml-1 font-medium">{formatPercentage(campaign.metrics.avgClickRate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Conv. Rate:</span>
                      <span className="ml-1 font-medium">{formatPercentage(campaign.metrics.avgConversionRate)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    className="text-gray-600 hover:text-blue-600"
                    title="View campaign details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-gray-600 hover:text-green-600"
                    title="Edit campaign"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => console.log('Copy campaign', campaign.id)}
                    className="text-gray-600 hover:text-purple-600"
                    title="Copy campaign"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {campaign.status === 'running' && (
                    <button
                      onClick={() => console.log('Pause campaign', campaign.id)}
                      className="text-gray-600 hover:text-yellow-600"
                      title="Pause campaign"
                    >
                      <Pause className="h-4 w-4" />
                    </button>
                  )}
                  {campaign.status === 'paused' && (
                    <button
                      onClick={() => console.log('Resume campaign', campaign.id)}
                      className="text-gray-600 hover:text-green-600"
                      title="Resume campaign"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => console.log('Delete campaign', campaign.id)}
                    className="text-gray-600 hover:text-red-600"
                    title="Delete campaign"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled campaigns found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by scheduling your first campaign.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Campaign
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignScheduler;
