import React, { useState } from 'react';
import {
  Calendar,
  Mail,
  Share2,
  Smartphone,
  Globe,
  Clock,
  Play,
  Pause,
  SquareStop,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Users,
  Target,
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Image,
  Video,
  Link,
  Send,
  Zap
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description: string;
  promotionId: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  channels: CampaignChannel[];
  schedule: {
    startDate: string;
    endDate: string;
    timezone: string;
    recurring?: {
      type: 'daily' | 'weekly' | 'monthly';
      days?: number[];
      interval?: number;
    };
  };
  budget: {
    total: number;
    spent: number;
    dailyLimit?: number;
    channelAllocation: { [channel: string]: number };
  };
  metrics: {
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    conversionRate: number;
    roas: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface CampaignChannel {
  id: string;
  type: 'email' | 'social' | 'sms' | 'web' | 'push' | 'display';
  name: string;
  status: 'active' | 'paused' | 'completed';
  content: {
    subject?: string;
    headline: string;
    body: string;
    cta: string;
    media?: {
      type: 'image' | 'video' | 'gif';
      url: string;
      alt?: string;
    };
  };
  targeting: {
    segments: string[];
    demographics?: any;
    behavior?: any;
  };
  schedule: {
    sendAt: string;
    timezone: string;
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  };
}

const CampaignManager: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Holiday Sale 2025',
      description: 'Multi-channel holiday promotion campaign',
      promotionId: '1',
      status: 'running',
      channels: [
        {
          id: 'email-1',
          type: 'email',
          name: 'Holiday Email Blast',
          status: 'active',
          content: {
            subject: '🎄 25% Off Everything - Holiday Sale!',
            headline: 'Don\'t Miss Our Biggest Sale of the Year',
            body: 'Get 25% off all items with code HOLIDAY25. Valid until December 31st.',
            cta: 'Shop Now',
            media: {
              type: 'image',
              url: '/images/holiday-sale.jpg',
              alt: 'Holiday Sale Banner'
            }
          },
          targeting: {
            segments: ['all-customers', 'vip-customers']
          },
          schedule: {
            sendAt: '2025-01-20T10:00:00Z',
            timezone: 'America/New_York'
          },
          metrics: {
            sent: 2500,
            delivered: 2480,
            opened: 1240,
            clicked: 186,
            converted: 47,
            revenue: 2350
          }
        },
        {
          id: 'social-1',
          type: 'social',
          name: 'Facebook & Instagram Ads',
          status: 'active',
          content: {
            headline: 'Holiday Sale - 25% Off Everything!',
            body: 'Limited time offer! Use code HOLIDAY25 at checkout.',
            cta: 'Shop Now',
            media: {
              type: 'video',
              url: '/videos/holiday-ad.mp4',
              alt: 'Holiday Sale Video'
            }
          },
          targeting: {
            segments: ['new-customers', 'dessert-lovers']
          },
          schedule: {
            sendAt: '2025-01-20T09:00:00Z',
            timezone: 'America/New_York'
          },
          metrics: {
            sent: 0,
            delivered: 15000,
            opened: 15000,
            clicked: 450,
            converted: 23,
            revenue: 1150
          }
        }
      ],
      schedule: {
        startDate: '2025-01-20T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
        timezone: 'America/New_York'
      },
      budget: {
        total: 5000,
        spent: 2150,
        dailyLimit: 250,
        channelAllocation: {
          email: 1000,
          social: 3000,
          sms: 500,
          display: 500
        }
      },
      metrics: {
        reach: 17500,
        impressions: 17500,
        clicks: 636,
        conversions: 70,
        revenue: 3500,
        ctr: 3.63,
        conversionRate: 11.0,
        roas: 1.63
      },
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      createdBy: 'current-user'
    },
    {
      id: '2',
      name: 'New Customer Welcome',
      description: 'Automated welcome series for new customers',
      promotionId: '2',
      status: 'running',
      channels: [
        {
          id: 'email-2',
          type: 'email',
          name: 'Welcome Email Series',
          status: 'active',
          content: {
            subject: 'Welcome to Craved Artisan! 🎉',
            headline: 'Thanks for joining us!',
            body: 'Get 15% off your first order with code WELCOME15.',
            cta: 'Start Shopping',
            media: {
              type: 'image',
              url: '/images/welcome.jpg',
              alt: 'Welcome Banner'
            }
          },
          targeting: {
            segments: ['new-customers']
          },
          schedule: {
            sendAt: '2025-01-20T08:00:00Z',
            timezone: 'America/New_York'
          },
          metrics: {
            sent: 89,
            delivered: 87,
            opened: 52,
            clicked: 18,
            converted: 8,
            revenue: 240
          }
        }
      ],
      schedule: {
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-12-31T23:59:59Z',
        timezone: 'America/New_York',
        recurring: {
          type: 'daily',
          interval: 1
        }
      },
      budget: {
        total: 1000,
        spent: 45,
        dailyLimit: 10,
        channelAllocation: {
          email: 1000
        }
      },
      metrics: {
        reach: 89,
        impressions: 89,
        clicks: 18,
        conversions: 8,
        revenue: 240,
        ctr: 20.2,
        conversionRate: 44.4,
        roas: 5.33
      },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      createdBy: 'current-user'
    }
  ];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4 text-green-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-purple-500" />;
      case 'draft': return <Edit className="h-4 w-4 text-gray-500" />;
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
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'social': return <Share2 className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'web': return <Globe className="h-4 w-4" />;
      case 'push': return <Zap className="h-4 w-4" />;
      case 'display': return <Image className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
          <p className="text-gray-600 mt-1">Create and manage multi-channel marketing campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Create new campaign"
        >
          <Plus className="h-4 w-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.filter(c => c.status === 'running').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(campaigns.reduce((sum, c) => sum + c.metrics.revenue, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. ROAS</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(campaigns.reduce((sum, c) => sum + c.metrics.roas, 0) / campaigns.length)}
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
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Campaign Header */}
            <div className="p-6 border-b border-gray-200">
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
                  </div>
                  <p className="text-gray-600 mb-4">{campaign.description}</p>
                  
                  {/* Campaign Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Reach:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.reach.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Clicks:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.clicks}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Conversions:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.conversions}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Revenue:</span>
                      <span className="ml-1 font-medium">{formatCurrency(campaign.metrics.revenue)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">CTR:</span>
                      <span className="ml-1 font-medium">{formatPercentage(campaign.metrics.ctr)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Conv. Rate:</span>
                      <span className="ml-1 font-medium">{formatPercentage(campaign.metrics.conversionRate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ROAS:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.roas.toFixed(2)}x</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Budget:</span>
                      <span className="ml-1 font-medium">
                        {formatCurrency(campaign.budget.spent)} / {formatCurrency(campaign.budget.total)}
                      </span>
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

            {/* Channels */}
            <div className="p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Channels</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaign.channels.map((channel) => (
                  <div key={channel.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getChannelIcon(channel.type)}
                        <span className="font-medium text-gray-900">{channel.name}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        channel.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {channel.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <p className="font-medium">{channel.content.headline}</p>
                      <p className="text-xs mt-1">{channel.content.body}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Sent:</span>
                        <span className="ml-1 font-medium">{channel.metrics.sent.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Delivered:</span>
                        <span className="ml-1 font-medium">{channel.metrics.delivered.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Opened:</span>
                        <span className="ml-1 font-medium">{channel.metrics.opened.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Clicked:</span>
                        <span className="ml-1 font-medium">{channel.metrics.clicked.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Converted:</span>
                        <span className="ml-1 font-medium">{channel.metrics.converted}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Revenue:</span>
                        <span className="ml-1 font-medium">{formatCurrency(channel.metrics.revenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first campaign.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;
