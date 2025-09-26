import React, { useState } from 'react';
import {
  Share2,
  Users,
  Gift,
  DollarSign,
  TrendingUp,
  BarChart3,
  Target,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  RefreshCw,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Star,
  Award,
  Percent,
  Calendar,
  Settings,
  Link,
  QrCode,
  Mail,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Zap
} from 'lucide-react';

interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  rules: {
    referrerReward: number;
    refereeReward: number;
    rewardType: 'points' | 'discount' | 'cashback';
    minPurchaseAmount: number;
    maxRewardsPerUser?: number;
    expirationDays?: number;
  };
  channels: string[];
  metrics: {
    totalReferrals: number;
    successfulReferrals: number;
    totalRewardsGiven: number;
    conversionRate: number;
    totalRevenue: number;
    avgOrderValue: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerEmail: string;
  refereeId: string;
  refereeName: string;
  refereeEmail: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  rewardAmount: number;
  rewardType: 'points' | 'discount' | 'cashback';
  createdAt: string;
  completedAt?: string;
  orderValue?: number;
  channel: string;
}

const ReferralSystem: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<ReferralProgram | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'programs' | 'referrals' | 'analytics'>('programs');

  // Mock data
  const referralPrograms: ReferralProgram[] = [
    {
      id: '1',
      name: 'Friend Referral Program',
      description: 'Earn rewards for referring friends to Craved Artisan',
      status: 'active',
      rules: {
        referrerReward: 500,
        refereeReward: 200,
        rewardType: 'points',
        minPurchaseAmount: 50,
        maxRewardsPerUser: 10,
        expirationDays: 30
      },
      channels: ['email', 'social', 'link', 'qr'],
      metrics: {
        totalReferrals: 1250,
        successfulReferrals: 890,
        totalRewardsGiven: 445000,
        conversionRate: 71.2,
        totalRevenue: 44500,
        avgOrderValue: 125
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z'
    },
    {
      id: '2',
      name: 'VIP Referral Program',
      description: 'Exclusive referral program for VIP customers',
      status: 'active',
      rules: {
        referrerReward: 1000,
        refereeReward: 500,
        rewardType: 'points',
        minPurchaseAmount: 100,
        maxRewardsPerUser: 5,
        expirationDays: 60
      },
      channels: ['email', 'social', 'link'],
      metrics: {
        totalReferrals: 320,
        successfulReferrals: 280,
        totalRewardsGiven: 280000,
        conversionRate: 87.5,
        totalRevenue: 28000,
        avgOrderValue: 200
      },
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    }
  ];

  const referrals: Referral[] = [
    {
      id: '1',
      referrerId: 'user1',
      referrerName: 'Sarah Johnson',
      referrerEmail: 'sarah@example.com',
      refereeId: 'user2',
      refereeName: 'Mike Smith',
      refereeEmail: 'mike@example.com',
      status: 'completed',
      rewardAmount: 500,
      rewardType: 'points',
      createdAt: '2025-01-15T10:00:00Z',
      completedAt: '2025-01-18T14:30:00Z',
      orderValue: 125,
      channel: 'email'
    },
    {
      id: '2',
      referrerId: 'user3',
      referrerName: 'Emily Davis',
      referrerEmail: 'emily@example.com',
      refereeId: 'user4',
      refereeName: 'John Wilson',
      refereeEmail: 'john@example.com',
      status: 'pending',
      rewardAmount: 500,
      rewardType: 'points',
      createdAt: '2025-01-19T09:15:00Z',
      channel: 'social'
    },
    {
      id: '3',
      referrerId: 'user5',
      referrerName: 'David Brown',
      referrerEmail: 'david@example.com',
      refereeId: 'user6',
      refereeName: 'Lisa Anderson',
      refereeEmail: 'lisa@example.com',
      status: 'completed',
      rewardAmount: 1000,
      rewardType: 'points',
      createdAt: '2025-01-10T16:45:00Z',
      completedAt: '2025-01-12T11:20:00Z',
      orderValue: 200,
      channel: 'link'
    }
  ];

  const filteredPrograms = referralPrograms.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || program.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (num: number) => num.toLocaleString();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'draft': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReferralStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getReferralStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'social': return <Share2 className="h-4 w-4 text-purple-500" />;
      case 'link': return <Link className="h-4 w-4 text-green-500" />;
      case 'qr': return <QrCode className="h-4 w-4 text-orange-500" />;
      default: return <Share2 className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Referral System</h2>
          <p className="text-gray-600 mt-1">Manage customer referral programs and track performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => console.log('Export referral data')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Export referral data"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Create new referral program"
          >
            <Plus className="h-4 w-4" />
            <span>New Program</span>
          </button>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">View:</label>
          <div className="flex items-center space-x-2">
            {[
              { value: 'programs', label: 'Programs', icon: Settings },
              { value: 'referrals', label: 'Referrals', icon: Users },
              { value: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setViewMode(value as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  viewMode === value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title={label}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(referralPrograms.reduce((sum, p) => sum + p.metrics.totalReferrals, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(referralPrograms.reduce((sum, p) => sum + p.metrics.successfulReferrals, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Gift className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rewards Given</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(referralPrograms.reduce((sum, p) => sum + p.metrics.totalRewardsGiven, 0))}
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
                {formatCurrency(referralPrograms.reduce((sum, p) => sum + p.metrics.totalRevenue, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'programs' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search programs..."
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
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Programs List */}
          <div className="space-y-6">
            {filteredPrograms.map((program) => (
              <div key={program.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(program.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(program.status)}`}>
                            {program.status}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{program.description}</p>

                      {/* Program Rules */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Referrer Reward:</span>
                          <span className="ml-1 text-sm text-gray-900">
                            {program.rules.rewardType === 'points' ? `${program.rules.referrerReward} points` : 
                             program.rules.rewardType === 'discount' ? `${program.rules.referrerReward}% discount` :
                             `$${program.rules.referrerReward} cashback`}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Referee Reward:</span>
                          <span className="ml-1 text-sm text-gray-900">
                            {program.rules.rewardType === 'points' ? `${program.rules.refereeReward} points` : 
                             program.rules.rewardType === 'discount' ? `${program.rules.refereeReward}% discount` :
                             `$${program.rules.refereeReward} cashback`}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Min Purchase:</span>
                          <span className="ml-1 text-sm text-gray-900">${program.rules.minPurchaseAmount}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Max Rewards:</span>
                          <span className="ml-1 text-sm text-gray-900">
                            {program.rules.maxRewardsPerUser ? `${program.rules.maxRewardsPerUser} per user` : 'Unlimited'}
                          </span>
                        </div>
                      </div>

                      {/* Program Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Total Referrals:</span>
                          <span className="ml-1 text-sm font-semibold text-gray-900">{formatNumber(program.metrics.totalReferrals)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Successful:</span>
                          <span className="ml-1 text-sm font-semibold text-gray-900">{formatNumber(program.metrics.successfulReferrals)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Conversion Rate:</span>
                          <span className="ml-1 text-sm font-semibold text-gray-900">{formatPercentage(program.metrics.conversionRate)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Total Revenue:</span>
                          <span className="ml-1 text-sm font-semibold text-gray-900">{formatCurrency(program.metrics.totalRevenue)}</span>
                        </div>
                      </div>

                      {/* Channels */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">Channels:</span>
                        {program.channels.map((channel) => (
                          <div key={channel} className="flex items-center space-x-1">
                            {getChannelIcon(channel)}
                            <span className="text-xs text-gray-600 capitalize">{channel}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedProgram(program)}
                        className="text-gray-600 hover:text-blue-600"
                        title="View program details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => console.log('Edit program', program.id)}
                        className="text-gray-600 hover:text-green-600"
                        title="Edit program"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => console.log('Copy referral link', program.id)}
                        className="text-gray-600 hover:text-purple-600"
                        title="Copy referral link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => console.log('Delete program', program.id)}
                        className="text-gray-600 hover:text-red-600"
                        title="Delete program"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'referrals' && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Referrals</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getReferralStatusIcon(referral.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReferralStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {referral.referrerName} → {referral.refereeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {referral.referrerEmail} → {referral.refereeEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {referral.rewardType === 'points' ? `${referral.rewardAmount} points` : 
                         referral.rewardType === 'discount' ? `${referral.rewardAmount}% discount` :
                         `$${referral.rewardAmount} cashback`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {referral.orderValue ? `Order: ${formatCurrency(referral.orderValue)}` : 'Pending order'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getChannelIcon(referral.channel)}
                      <span className="text-xs text-gray-500 capitalize">{referral.channel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referral Sources */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Referral Sources</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {['email', 'social', 'link', 'qr'].map((source) => {
                  const count = referrals.filter(r => r.channel === source).length;
                  const percentage = referrals.length > 0 ? (count / referrals.length) * 100 : 0;
                  return (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getChannelIcon(source)}
                        <span className="text-sm font-medium text-gray-900 capitalize">{source}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{count}</p>
                        <p className="text-xs text-gray-500">{formatPercentage(percentage)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Total Referrals</span>
                  <span className="text-sm font-semibold text-gray-900">{referrals.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Successful Referrals</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {referrals.filter(r => r.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPercentage((referrals.filter(r => r.status === 'completed').length / referrals.length) * 100)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(referrals.filter(r => r.orderValue).reduce((sum, r) => sum + (r.orderValue || 0), 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {viewMode === 'programs' && filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <Share2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No referral programs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first referral program.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Program
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralSystem;












