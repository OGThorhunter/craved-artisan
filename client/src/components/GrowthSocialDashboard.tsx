import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Search,
  Link,
  Share2,
  BarChart3,
  RefreshCw,
  Plus,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Eye,
  MousePointer,
  DollarSign,
  Target,
  Zap,
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { Badge } from './ui/Badge';

interface UTMCampaign {
  id: string;
  name: string;
  source: string;
  medium: string;
  campaign: string;
  clicks: number;
  impressions: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  status: 'active' | 'paused' | 'completed' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

interface SEOKeyword {
  keyword: string;
  position: number;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  url: string;
  lastUpdated: Date;
}

interface SEOPage {
  url: string;
  title: string;
  indexed: boolean;
  statusCode: number;
  pageSpeed: number;
  backlinks: number;
  organicTraffic: number;
  conversions: number;
  lastUpdated: Date;
}

interface SocialConnector {
  id: string;
  platform: 'instagram' | 'facebook' | 'tiktok' | 'twitter' | 'youtube' | 'linkedin';
  accountName: string;
  accountUrl: string;
  status: 'connected' | 'disconnected' | 'error' | 'expired';
  followers: number;
  engagement: number;
  posts: number;
  lastSync?: Date;
}

interface ReferralCode {
  id: string;
  code: string;
  name: string;
  type: 'vendor' | 'customer' | 'affiliate';
  discount?: number;
  commission?: number;
  usageCount: number;
  revenue: number;
  status: 'active' | 'inactive' | 'expired';
  expiresAt?: Date;
}

interface GrowthMetrics {
  utm: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalSpent: number;
    totalRevenue: number;
    averageROAS: number;
  };
  seo: {
    totalKeywords: number;
    averagePosition: number;
    organicTraffic: number;
    indexedPages: number;
    backlinks: number;
  };
  social: {
    totalConnectors: number;
    activeConnectors: number;
    totalFollowers: number;
    totalEngagement: number;
  };
  referrals: {
    totalCodes: number;
    activeCodes: number;
    totalUsage: number;
    totalRevenue: number;
  };
}

export default function GrowthSocialDashboard() {
  const [activeTab, setActiveTab] = useState<'utm' | 'seo' | 'social' | 'referrals'>('utm');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch growth metrics
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['admin', 'growth-social', 'metrics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/growth-social/metrics');
      if (!response.ok) throw new Error('Failed to fetch growth metrics');
      const result = await response.json();
      return result.data as GrowthMetrics;
    },
    refetchInterval: 300000,
  });

  // Fetch UTM campaigns
  const { data: utmData, refetch: refetchUTM } = useQuery({
    queryKey: ['admin', 'growth-social', 'utm-campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/admin/growth-social/utm-campaigns');
      if (!response.ok) throw new Error('Failed to fetch UTM campaigns');
      const result = await response.json();
      return result.data;
    },
  });

  // Fetch SEO keywords
  const { data: seoKeywordsData, refetch: refetchSEO } = useQuery({
    queryKey: ['admin', 'growth-social', 'seo-keywords'],
    queryFn: async () => {
      const response = await fetch('/api/admin/growth-social/seo-keywords');
      if (!response.ok) throw new Error('Failed to fetch SEO keywords');
      const result = await response.json();
      return result.data;
    },
  });

  // Fetch social connectors
  const { data: socialData, refetch: refetchSocial } = useQuery({
    queryKey: ['admin', 'growth-social', 'social-connectors'],
    queryFn: async () => {
      const response = await fetch('/api/admin/growth-social/social-connectors');
      if (!response.ok) throw new Error('Failed to fetch social connectors');
      const result = await response.json();
      return result.data;
    },
  });

  // Fetch referral codes
  const { data: referralData, refetch: refetchReferrals } = useQuery({
    queryKey: ['admin', 'growth-social', 'referral-codes'],
    queryFn: async () => {
      const response = await fetch('/api/admin/growth-social/referral-codes');
      if (!response.ok) throw new Error('Failed to fetch referral codes');
      const result = await response.json();
      return result.data;
    },
  });

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'connected': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'secondary';
      case 'disconnected': return 'destructive';
      case 'error': return 'destructive';
      case 'expired': return 'destructive';
      default: return 'secondary';
    }
  };

  const renderUTMTab = () => (
    <div className="space-y-6">
      {utmData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {utmData.campaigns.map((campaign: UTMCampaign, index: number) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[#2b2b2b]">{campaign.name}</h3>
                      <p className="text-sm text-[#4b4b4b]">
                        {campaign.source} • {campaign.medium} • {campaign.campaign}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(campaign.status) as any}>
                      {campaign.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[#4b4b4b]">Clicks</p>
                      <p className="font-semibold">{campaign.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#4b4b4b]">Conversions</p>
                      <p className="font-semibold">{campaign.conversions}</p>
                    </div>
                    <div>
                      <p className="text-[#4b4b4b]">Revenue</p>
                      <p className="font-semibold">${campaign.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#4b4b4b]">ROAS</p>
                      <p className="font-semibold">{campaign.roas.toFixed(1)}x</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Campaign Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Total Campaigns</span>
                  <span className="font-medium">{metrics?.utm.totalCampaigns}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Active Campaigns</span>
                  <span className="font-medium text-green-600">{metrics?.utm.activeCampaigns}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Total Spent</span>
                  <span className="font-medium">${metrics?.utm.totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Total Revenue</span>
                  <span className="font-medium text-green-600">${metrics?.utm.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Average ROAS</span>
                  <span className="font-medium">{metrics?.utm.averageROAS.toFixed(1)}x</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  const renderSEOTab = () => (
    <div className="space-y-6">
      {seoKeywordsData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {seoKeywordsData.keywords.map((keyword: SEOKeyword, index: number) => (
              <motion.div
                key={keyword.keyword}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[#2b2b2b]">{keyword.keyword}</h3>
                      <p className="text-sm text-[#4b4b4b]">{keyword.url}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#2b2b2b]">#{keyword.position}</p>
                      <p className="text-sm text-[#4b4b4b]">Position</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[#4b4b4b]">Search Volume</p>
                      <p className="font-semibold">{keyword.searchVolume.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#4b4b4b]">Difficulty</p>
                      <p className="font-semibold">{keyword.difficulty}%</p>
                    </div>
                    <div>
                      <p className="text-[#4b4b4b]">CPC</p>
                      <p className="font-semibold">${keyword.cpc}</p>
                    </div>
                    <div>
                      <p className="text-[#4b4b4b]">Last Updated</p>
                      <p className="font-semibold">{formatDate(keyword.lastUpdated)}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">SEO Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Total Keywords</span>
                  <span className="font-medium">{metrics?.seo.totalKeywords}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Average Position</span>
                  <span className="font-medium">#{metrics?.seo.averagePosition}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Organic Traffic</span>
                  <span className="font-medium">{metrics?.seo.organicTraffic.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Indexed Pages</span>
                  <span className="font-medium">{metrics?.seo.indexedPages}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Backlinks</span>
                  <span className="font-medium">{metrics?.seo.backlinks.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  const renderSocialTab = () => (
    <div className="space-y-6">
      {socialData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {socialData.connectors.map((connector: SocialConnector, index: number) => (
              <motion.div
                key={connector.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E8CBAE] flex items-center justify-center text-[#7F232E] font-semibold capitalize">
                        {connector.platform.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2b2b2b] capitalize">{connector.platform}</h3>
                        <p className="text-sm text-[#4b4b4b]">{connector.accountName}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(connector.status) as any}>
                      {connector.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[#4b4b4b]">Followers</p>
                      <p className="font-semibold">{connector.followers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#4b4b4b]">Engagement</p>
                      <p className="font-semibold">{connector.engagement}%</p>
                    </div>
                    <div>
                      <p className="text-[#4b4b4b]">Posts</p>
                      <p className="font-semibold">{connector.posts}</p>
                    </div>
                    <div>
                      <p className="text-[#4b4b4b]">Last Sync</p>
                      <p className="font-semibold">
                        {connector.lastSync ? formatDate(connector.lastSync) : 'Never'}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Social Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Total Connectors</span>
                  <span className="font-medium">{metrics?.social.totalConnectors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Active Connectors</span>
                  <span className="font-medium text-green-600">{metrics?.social.activeConnectors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Total Followers</span>
                  <span className="font-medium">{metrics?.social.totalFollowers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Avg Engagement</span>
                  <span className="font-medium">{metrics?.social.totalEngagement}%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  const renderReferralsTab = () => (
    <div className="space-y-6">
      {referralData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {referralData.codes.map((code: ReferralCode, index: number) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[#2b2b2b]">{code.name}</h3>
                      <p className="text-sm text-[#4b4b4b]">Code: {code.code}</p>
                    </div>
                    <Badge variant={getStatusColor(code.status) as any}>
                      {code.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[#4b4b4b]">Type</p>
                      <p className="font-semibold capitalize">{code.type}</p>
                    </div>
                    <div>
                      <p className="text-[#4b4b4b]">Usage</p>
                      <p className="font-semibold">{code.usageCount}</p>
                    </div>
                    <div>
                      <p className="text-[#4b4b4b]">Revenue</p>
                      <p className="font-semibold">${code.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#4b4b4b]">Expires</p>
                      <p className="font-semibold">
                        {code.expiresAt ? formatDate(code.expiresAt) : 'Never'}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#2b2b2b] mb-4">Referral Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Total Codes</span>
                  <span className="font-medium">{metrics?.referrals.totalCodes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Active Codes</span>
                  <span className="font-medium text-green-600">{metrics?.referrals.activeCodes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Total Usage</span>
                  <span className="font-medium">{metrics?.referrals.totalUsage}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4b4b4b]">Total Revenue</span>
                  <span className="font-medium text-green-600">${metrics?.referrals.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  if (metricsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Growth & Social</h2>
          <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Growth & Social</h2>
          <p className="text-[#4b4b4b] mt-1">UTM campaigns, SEO performance, social connectors, and referral tracking</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1">
            {(['utm', 'seo', 'social', 'referrals'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-[#7F232E] text-white'
                    : 'text-[#4b4b4b] hover:text-[#7F232E]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <Button
            variant="secondary"
            onClick={() => {
              refetchMetrics();
              refetchUTM();
              refetchSEO();
              refetchSocial();
              refetchReferrals();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-[#4b4b4b]">UTM Campaigns</p>
                <p className="text-xl font-bold text-[#2b2b2b]">{metrics.utm.totalCampaigns}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Search className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[#4b4b4b]">SEO Keywords</p>
                <p className="text-xl font-bold text-[#2b2b2b]">{metrics.seo.totalKeywords}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Share2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-[#4b4b4b]">Social Followers</p>
                <p className="text-xl font-bold text-[#2b2b2b]">{metrics.social.totalFollowers.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Link className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-[#4b4b4b]">Referral Revenue</p>
                <p className="text-xl font-bold text-[#2b2b2b]">${metrics.referrals.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'utm' && renderUTMTab()}
      {activeTab === 'seo' && renderSEOTab()}
      {activeTab === 'social' && renderSocialTab()}
      {activeTab === 'referrals' && renderReferralsTab()}
    </div>
  );
}


























