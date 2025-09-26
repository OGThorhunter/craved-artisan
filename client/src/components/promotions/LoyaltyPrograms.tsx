import React, { useState } from 'react';
import {
  Star,
  Gift,
  Award,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Crown,
  Trophy,
  Medal,
  Badge,
  Percent,
  ShoppingCart,
  Heart,
  Share2,
  Download,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

interface LoyaltyTier {
  id: string;
  name: string;
  description: string;
  minPoints: number;
  maxPoints?: number;
  benefits: string[];
  color: string;
  icon: string;
  memberCount: number;
  avgOrderValue: number;
  retentionRate: number;
}

interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  type: 'points' | 'tiers' | 'cashback' | 'stamps';
  rules: {
    earnRate: number;
    earnRule: string;
    redeemRate: number;
    redeemRule: string;
    expirationDays?: number;
    minRedeemPoints?: number;
  };
  tiers: LoyaltyTier[];
  metrics: {
    totalMembers: number;
    activeMembers: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    totalRewardsGiven: number;
    avgPointsPerMember: number;
    redemptionRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

const LoyaltyPrograms: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<LoyaltyProgram | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock loyalty programs data
  const loyaltyPrograms: LoyaltyProgram[] = [
    {
      id: '1',
      name: 'Craved Rewards',
      description: 'Earn points on every purchase and unlock exclusive benefits',
      status: 'active',
      type: 'tiers',
      rules: {
        earnRate: 1,
        earnRule: '1 point per $1 spent',
        redeemRate: 100,
        redeemRule: '100 points = $1 discount',
        expirationDays: 365,
        minRedeemPoints: 500
      },
      tiers: [
        {
          id: 'bronze',
          name: 'Bronze',
          description: 'New member tier',
          minPoints: 0,
          maxPoints: 999,
          benefits: ['1 point per $1', 'Birthday discount', 'Early access to sales'],
          color: 'bg-amber-500',
          icon: '🥉',
          memberCount: 2500,
          avgOrderValue: 75,
          retentionRate: 65
        },
        {
          id: 'silver',
          name: 'Silver',
          description: 'Frequent customer tier',
          minPoints: 1000,
          maxPoints: 4999,
          benefits: ['1.2 points per $1', 'Free shipping', 'Exclusive products', 'Priority support'],
          color: 'bg-gray-400',
          icon: '🥈',
          memberCount: 1200,
          avgOrderValue: 125,
          retentionRate: 78
        },
        {
          id: 'gold',
          name: 'Gold',
          description: 'VIP customer tier',
          minPoints: 5000,
          maxPoints: 9999,
          benefits: ['1.5 points per $1', 'Free shipping', 'Exclusive products', 'Priority support', 'Personal shopper'],
          color: 'bg-yellow-500',
          icon: '🥇',
          memberCount: 450,
          avgOrderValue: 200,
          retentionRate: 85
        },
        {
          id: 'platinum',
          name: 'Platinum',
          description: 'Elite customer tier',
          minPoints: 10000,
          benefits: ['2 points per $1', 'Free shipping', 'Exclusive products', 'Priority support', 'Personal shopper', 'VIP events'],
          color: 'bg-purple-500',
          icon: '💎',
          memberCount: 120,
          avgOrderValue: 350,
          retentionRate: 92
        }
      ],
      metrics: {
        totalMembers: 4270,
        activeMembers: 3200,
        totalPointsEarned: 1250000,
        totalPointsRedeemed: 450000,
        totalRewardsGiven: 4500,
        avgPointsPerMember: 293,
        redemptionRate: 36
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z'
    },
    {
      id: '2',
      name: 'Referral Rewards',
      description: 'Earn rewards for referring friends and family',
      status: 'active',
      type: 'points',
      rules: {
        earnRate: 500,
        earnRule: '500 points for each successful referral',
        redeemRate: 100,
        redeemRule: '100 points = $1 discount',
        minRedeemPoints: 100
      },
      tiers: [],
      metrics: {
        totalMembers: 1500,
        activeMembers: 800,
        totalPointsEarned: 75000,
        totalPointsRedeemed: 25000,
        totalRewardsGiven: 250,
        avgPointsPerMember: 50,
        redemptionRate: 33
      },
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    }
  ];

  const filteredPrograms = loyaltyPrograms.filter(program => {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'points': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'tiers': return <Award className="h-4 w-4 text-purple-500" />;
      case 'cashback': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'stamps': return <Badge className="h-4 w-4 text-blue-500" />;
      default: return <Gift className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loyalty Programs</h2>
          <p className="text-gray-600 mt-1">Create and manage customer loyalty and rewards programs</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Create new loyalty program"
        >
          <Plus className="h-4 w-4" />
          <span>New Program</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(loyaltyPrograms.reduce((sum, p) => sum + p.metrics.totalMembers, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Points Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(loyaltyPrograms.reduce((sum, p) => sum + p.metrics.totalPointsEarned, 0))}
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
                {formatNumber(loyaltyPrograms.reduce((sum, p) => sum + p.metrics.totalRewardsGiven, 0))}
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
              <p className="text-sm font-medium text-gray-600">Avg. Redemption</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(loyaltyPrograms.reduce((sum, p) => sum + p.metrics.redemptionRate, 0) / loyaltyPrograms.length)}
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
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(program.type)}
                      <span className="text-sm text-gray-500 capitalize">{program.type}</span>
                    </div>
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
                      <span className="text-sm font-medium text-gray-500">Earn Rule:</span>
                      <span className="ml-1 text-sm text-gray-900">{program.rules.earnRule}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Redeem Rule:</span>
                      <span className="ml-1 text-sm text-gray-900">{program.rules.redeemRule}</span>
                    </div>
                  </div>

                  {/* Program Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Total Members:</span>
                      <span className="ml-1 text-sm font-semibold text-gray-900">{formatNumber(program.metrics.totalMembers)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Active Members:</span>
                      <span className="ml-1 text-sm font-semibold text-gray-900">{formatNumber(program.metrics.activeMembers)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Points Earned:</span>
                      <span className="ml-1 text-sm font-semibold text-gray-900">{formatNumber(program.metrics.totalPointsEarned)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Redemption Rate:</span>
                      <span className="ml-1 text-sm font-semibold text-gray-900">{formatPercentage(program.metrics.redemptionRate)}</span>
                    </div>
                  </div>

                  {/* Tiers (if applicable) */}
                  {program.tiers.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Loyalty Tiers</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {program.tiers.map((tier) => (
                          <div key={tier.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">{tier.icon}</span>
                              <span className="text-sm font-medium text-gray-900">{tier.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>{tier.memberCount} members</p>
                              <p>AOV: {formatCurrency(tier.avgOrderValue)}</p>
                              <p>Retention: {formatPercentage(tier.retentionRate)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

      {/* Empty State */}
      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <Star className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No loyalty programs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first loyalty program.'}
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

export default LoyaltyPrograms;












