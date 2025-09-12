import React, { useState } from 'react';
import {
  Share2,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Music,
  Image,
  Globe,
  Video,
  Link,
  Calendar,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share,
  BarChart3,
  TrendingUp,
  DollarSign,
  Target,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  SquareStop,
  Settings,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Send,
  Zap
} from 'lucide-react';

interface SocialPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'linkedin' | 'tiktok' | 'pinterest';
  content: {
    text: string;
    media?: {
      type: 'image' | 'video' | 'carousel';
      url: string;
      alt?: string;
    };
    hashtags: string[];
    mentions: string[];
    link?: string;
  };
  schedule: {
    publishAt: string;
    timezone: string;
  };
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  metrics: {
    reach: number;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    saves: number;
    engagement: number;
    engagementRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface SocialCampaign {
  id: string;
  name: string;
  description: string;
  promotionId: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  platforms: string[];
  posts: SocialPost[];
  budget: {
    total: number;
    spent: number;
    dailyLimit: number;
    platformAllocation: { [platform: string]: number };
  };
  schedule: {
    startDate: string;
    endDate: string;
    timezone: string;
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  };
  targeting: {
    demographics: {
      ageRange: { min: number; max: number };
      gender: string[];
      location: string[];
      interests: string[];
    };
    behavior: {
      engagement: string[];
      purchaseHistory: string[];
      deviceType: string[];
    };
  };
  metrics: {
    totalReach: number;
    totalImpressions: number;
    totalEngagement: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    avgEngagementRate: number;
    costPerClick: number;
    costPerConversion: number;
    roas: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const SocialMediaCampaign: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<SocialCampaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  // Mock data
  const socialCampaigns: SocialCampaign[] = [
    {
      id: '1',
      name: 'Holiday Sale Social Blast',
      description: 'Multi-platform holiday promotion campaign',
      promotionId: '1',
      status: 'running',
      platforms: ['facebook', 'instagram', 'twitter'],
      posts: [
        {
          id: 'post-1',
          platform: 'facebook',
          content: {
            text: '🎄 HOLIDAY SALE ALERT! 🎄\n\nGet 25% off everything with code HOLIDAY25! Don\'t miss out on our biggest sale of the year. Valid until December 31st.\n\n#HolidaySale #CravedArtisan #BakedGoods #Christmas',
            media: {
              type: 'image',
              url: '/images/holiday-sale-facebook.jpg',
              alt: 'Holiday Sale Facebook Post'
            },
            hashtags: ['#HolidaySale', '#CravedArtisan', '#BakedGoods', '#Christmas'],
            mentions: [],
            link: 'https://cravedartisan.com/holiday-sale'
          },
          schedule: {
            publishAt: '2025-01-20T10:00:00Z',
            timezone: 'America/New_York'
          },
          status: 'published',
          metrics: {
            reach: 5000,
            impressions: 7500,
            likes: 450,
            comments: 89,
            shares: 156,
            clicks: 234,
            saves: 67,
            engagement: 695,
            engagementRate: 9.3
          },
          createdAt: '2025-01-19T00:00:00Z',
          updatedAt: '2025-01-20T00:00:00Z'
        },
        {
          id: 'post-2',
          platform: 'instagram',
          content: {
            text: '✨ HOLIDAY MAGIC ✨\n\n25% off everything! Swipe up to shop our holiday collection. Code: HOLIDAY25\n\n#HolidaySale #CravedArtisan #BakedGoods #Christmas #Foodie',
            media: {
              type: 'carousel',
              url: '/images/holiday-sale-instagram.jpg',
              alt: 'Holiday Sale Instagram Post'
            },
            hashtags: ['#HolidaySale', '#CravedArtisan', '#BakedGoods', '#Christmas', '#Foodie'],
            mentions: [],
            link: 'https://cravedartisan.com/holiday-sale'
          },
          schedule: {
            publishAt: '2025-01-20T11:00:00Z',
            timezone: 'America/New_York'
          },
          status: 'published',
          metrics: {
            reach: 3200,
            impressions: 4800,
            likes: 380,
            comments: 45,
            shares: 89,
            clicks: 156,
            saves: 123,
            engagement: 514,
            engagementRate: 10.7
          },
          createdAt: '2025-01-19T00:00:00Z',
          updatedAt: '2025-01-20T00:00:00Z'
        }
      ],
      budget: {
        total: 2000,
        spent: 850,
        dailyLimit: 100,
        platformAllocation: {
          facebook: 1000,
          instagram: 800,
          twitter: 200
        }
      },
      schedule: {
        startDate: '2025-01-20T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
        timezone: 'America/New_York',
        frequency: 'daily'
      },
      targeting: {
        demographics: {
          ageRange: { min: 25, max: 55 },
          gender: ['female', 'male'],
          location: ['United States', 'Canada'],
          interests: ['baking', 'cooking', 'food', 'desserts']
        },
        behavior: {
          engagement: ['high', 'medium'],
          purchaseHistory: ['frequent', 'occasional'],
          deviceType: ['mobile', 'desktop']
        }
      },
      metrics: {
        totalReach: 8200,
        totalImpressions: 12300,
        totalEngagement: 1209,
        totalClicks: 390,
        totalConversions: 23,
        totalRevenue: 1150,
        avgEngagementRate: 9.8,
        costPerClick: 2.18,
        costPerConversion: 37.0,
        roas: 1.35
      },
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      createdBy: 'current-user'
    },
    {
      id: '2',
      name: 'New Product Launch',
      description: 'Launch campaign for new seasonal dessert collection',
      promotionId: '2',
      status: 'scheduled',
      platforms: ['instagram', 'tiktok', 'youtube'],
      posts: [
        {
          id: 'post-3',
          platform: 'instagram',
          content: {
            text: '🍰 NEW SEASONAL COLLECTION 🍰\n\nIntroducing our limited edition winter desserts! Available now.\n\n#NewProduct #SeasonalDesserts #CravedArtisan #Winter',
            media: {
              type: 'video',
              url: '/videos/new-product-instagram.mp4',
              alt: 'New Product Instagram Video'
            },
            hashtags: ['#NewProduct', '#SeasonalDesserts', '#CravedArtisan', '#Winter'],
            mentions: [],
            link: 'https://cravedartisan.com/new-products'
          },
          schedule: {
            publishAt: '2025-01-25T14:00:00Z',
            timezone: 'America/New_York'
          },
          status: 'scheduled',
          metrics: {
            reach: 0,
            impressions: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            clicks: 0,
            saves: 0,
            engagement: 0,
            engagementRate: 0
          },
          createdAt: '2025-01-22T00:00:00Z',
          updatedAt: '2025-01-22T00:00:00Z'
        }
      ],
      budget: {
        total: 1500,
        spent: 0,
        dailyLimit: 75,
        platformAllocation: {
          instagram: 800,
          tiktok: 500,
          youtube: 200
        }
      },
      schedule: {
        startDate: '2025-01-25T00:00:00Z',
        endDate: '2025-02-15T23:59:59Z',
        timezone: 'America/New_York',
        frequency: 'weekly'
      },
      targeting: {
        demographics: {
          ageRange: { min: 18, max: 45 },
          gender: ['female', 'male'],
          location: ['United States'],
          interests: ['desserts', 'baking', 'food', 'lifestyle']
        },
        behavior: {
          engagement: ['high'],
          purchaseHistory: ['new', 'occasional'],
          deviceType: ['mobile']
        }
      },
      metrics: {
        totalReach: 0,
        totalImpressions: 0,
        totalEngagement: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
        avgEngagementRate: 0,
        costPerClick: 0,
        costPerConversion: 0,
        roas: 0
      },
      createdAt: '2025-01-22T00:00:00Z',
      updatedAt: '2025-01-22T00:00:00Z',
      createdBy: 'current-user'
    }
  ];

  const filteredCampaigns = socialCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesPlatform = selectedPlatform === 'all' || campaign.platforms.includes(selectedPlatform);
    return matchesSearch && matchesStatus && matchesPlatform;
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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'twitter': return <Twitter className="h-4 w-4 text-blue-400" />;
      case 'youtube': return <Youtube className="h-4 w-4 text-red-600" />;
      case 'linkedin': return <Linkedin className="h-4 w-4 text-blue-700" />;
      case 'tiktok': return <Music className="h-4 w-4 text-black" />;
      case 'pinterest': return <Image className="h-4 w-4 text-red-500" />;
      default: return <Share2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'bg-blue-100 text-blue-800';
      case 'instagram': return 'bg-pink-100 text-pink-800';
      case 'twitter': return 'bg-blue-100 text-blue-800';
      case 'youtube': return 'bg-red-100 text-red-800';
      case 'linkedin': return 'bg-blue-100 text-blue-800';
      case 'tiktok': return 'bg-gray-100 text-gray-800';
      case 'pinterest': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h2 className="text-2xl font-bold text-gray-900">Social Media Campaigns</h2>
          <p className="text-gray-600 mt-1">Create and manage social media marketing campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Create new social campaign"
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
              <Share2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{socialCampaigns.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reach</p>
              <p className="text-2xl font-bold text-gray-900">
                {socialCampaigns.reduce((sum, c) => sum + c.metrics.totalReach, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(socialCampaigns.reduce((sum, c) => sum + c.metrics.avgEngagementRate, 0) / socialCampaigns.length)}
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
                {formatCurrency(socialCampaigns.reduce((sum, c) => sum + c.metrics.totalRevenue, 0))}
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

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filter by platform"
            >
              <option value="all">All Platforms</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
              <option value="youtube">YouTube</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
              <option value="pinterest">Pinterest</option>
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
                      <span className="ml-1 font-medium">{campaign.metrics.totalReach.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Impressions:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.totalImpressions.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Engagement:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.totalEngagement.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Clicks:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.totalClicks.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Conversions:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.totalConversions}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Revenue:</span>
                      <span className="ml-1 font-medium">{formatCurrency(campaign.metrics.totalRevenue)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Eng. Rate:</span>
                      <span className="ml-1 font-medium">{formatPercentage(campaign.metrics.avgEngagementRate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ROAS:</span>
                      <span className="ml-1 font-medium">{campaign.metrics.roas.toFixed(2)}x</span>
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
                    onClick={() => setShowPostModal(true)}
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

            {/* Platforms and Posts */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Platforms & Posts</h4>
                <button
                  onClick={() => setShowPostModal(true)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  title="Add new post"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Post</span>
                </button>
              </div>

              {/* Platform Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {campaign.platforms.map((platform) => (
                  <span
                    key={platform}
                    className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(platform)}`}
                  >
                    {getPlatformIcon(platform)}
                    <span className="capitalize">{platform}</span>
                  </span>
                ))}
              </div>

              {/* Posts */}
              <div className="space-y-4">
                {campaign.posts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(post.platform)}
                        <span className="font-medium text-gray-900 capitalize">{post.platform}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          post.status === 'published' ? 'bg-green-100 text-green-800' :
                          post.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(post.schedule.publishAt)}
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 mb-3">
                      <p className="whitespace-pre-line">{post.content.text}</p>
                      {post.content.media && (
                        <div className="mt-2">
                          <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            {post.content.media.type === 'image' ? (
                              <Image className="h-6 w-6 text-gray-400" />
                            ) : (
                              <Video className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Reach:</span>
                        <span className="ml-1 font-medium">{post.metrics.reach.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Impressions:</span>
                        <span className="ml-1 font-medium">{post.metrics.impressions.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Likes:</span>
                        <span className="ml-1 font-medium">{post.metrics.likes.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Comments:</span>
                        <span className="ml-1 font-medium">{post.metrics.comments.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Shares:</span>
                        <span className="ml-1 font-medium">{post.metrics.shares.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Clicks:</span>
                        <span className="ml-1 font-medium">{post.metrics.clicks.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Saves:</span>
                        <span className="ml-1 font-medium">{post.metrics.saves.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Eng. Rate:</span>
                        <span className="ml-1 font-medium">{formatPercentage(post.metrics.engagementRate)}</span>
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
          <Share2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No social campaigns found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || selectedPlatform !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first social media campaign.'}
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

export default SocialMediaCampaign;
