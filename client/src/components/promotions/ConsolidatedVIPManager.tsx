import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Filter,
  Star,
  Crown,
  Gift,
  Users,
  Target,
  TrendingUp,
  Award,
  Edit,
  Trash2,
  Eye,
  Settings,
  BarChart3,
  Calendar,
  DollarSign,
  Percent,
  UserPlus,
  UserCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  Heart,
  Zap,
  Brain,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  X
} from 'lucide-react';

// Types for the comprehensive VIP system
interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;
  type: 'POINTS' | 'PUNCH_CARD' | 'TIER_BASED' | 'HYBRID';
  isActive: boolean;
  pointsPerDollar: number;
  tierThresholds?: { [key: string]: number };
  rewards?: Array<{
    id: string;
    name: string;
    pointsRequired: number;
    rewardType: 'DISCOUNT' | 'FREE_ITEM' | 'UPGRADE';
    value: number;
    description?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalCustomers: number;
    activeCustomers: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    avgPointsPerCustomer: number;
  };
}

interface CustomerLoyaltyPoints {
  id: string;
  loyaltyProgramId: string;
  userId: string;
  points: number;
  tierLevel?: string;
  lifetimePoints: number;
  lastActivity: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  transactions?: LoyaltyTransaction[];
}

interface LoyaltyTransaction {
  id: string;
  type: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'ADJUSTED';
  points: number;
  description?: string;
  orderId?: string;
  createdAt: string;
}

interface ReferralProgram {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  referrerReward: {
    type: 'POINTS' | 'DISCOUNT' | 'CASH' | 'FREE_ITEM';
    value: number;
    description?: string;
  };
  refereeReward: {
    type: 'POINTS' | 'DISCOUNT' | 'CASH' | 'FREE_ITEM';
    value: number;
    description?: string;
  };
  minimumPurchase?: number;
  expirationDays?: number;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    conversionRate: string;
    rewardsClaimed: number;
  };
}

interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  criteria: {
    minPurchases?: number;
    minSpent?: number;
    lastPurchaseDays?: number;
    loyaltyTier?: string;
    tags?: string[];
  };
  customerCount: number;
  lastUpdated: string;
  createdAt: string;
}

const ConsolidatedVIPManager: React.FC = () => {
  // State management
  const [activeView, setActiveView] = useState<'programs' | 'customers' | 'referrals' | 'segments' | 'analytics'>('programs');
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const queryClient = useQueryClient();

  // API queries
  const { data: loyaltyPrograms, isLoading: programsLoading } = useQuery({
    queryKey: ['loyalty-programs'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/loyalty/programs');
      if (!response.ok) throw new Error('Failed to fetch loyalty programs');
      const result = await response.json();
      return result.data || [];
    }
  });

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['loyalty-customers', selectedProgram],
    queryFn: async () => {
      if (!selectedProgram) return [];
      const response = await fetch(`/api/vendor/loyalty/programs/${selectedProgram}`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      const result = await response.json();
      return result.data?.customerPoints || [];
    },
    enabled: !!selectedProgram && activeView === 'customers'
  });

  const { data: referralPrograms, isLoading: referralsLoading } = useQuery({
    queryKey: ['referral-programs'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/loyalty/referrals');
      if (!response.ok) throw new Error('Failed to fetch referral programs');
      const result = await response.json();
      return result.data || [];
    }
  });

  const { data: segments, isLoading: segmentsLoading } = useQuery({
    queryKey: ['customer-segments'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/loyalty/segments');
      if (!response.ok) throw new Error('Failed to fetch customer segments');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Mutations
  const createProgramMutation = useMutation({
    mutationFn: async (programData: Partial<LoyaltyProgram>) => {
      const response = await fetch('/api/vendor/loyalty/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programData)
      });
      if (!response.ok) throw new Error('Failed to create program');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-programs'] });
      setShowCreateModal(false);
    }
  });

  const addPointsMutation = useMutation({
    mutationFn: async ({ programId, userId, points, description }: {
      programId: string;
      userId: string;
      points: number;
      description?: string;
    }) => {
      const response = await fetch(`/api/vendor/loyalty/programs/${programId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'EARNED',
          points,
          description
        })
      });
      if (!response.ok) throw new Error('Failed to add points');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-customers'] });
    }
  });

  const createReferralMutation = useMutation({
    mutationFn: async (referralData: Partial<ReferralProgram>) => {
      const response = await fetch('/api/vendor/loyalty/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(referralData)
      });
      if (!response.ok) throw new Error('Failed to create referral program');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-programs'] });
      setShowCreateModal(false);
    }
  });

  const createSegmentMutation = useMutation({
    mutationFn: async (segmentData: Partial<CustomerSegment>) => {
      const response = await fetch('/api/vendor/loyalty/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(segmentData)
      });
      if (!response.ok) throw new Error('Failed to create segment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-segments'] });
      setShowCreateModal(false);
    }
  });

  // Helper functions
  const getTierColor = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum':
      case 'diamond':
        return 'bg-purple-100 text-purple-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'silver':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'POINTS':
        return <Star className="w-4 h-4" />;
      case 'PUNCH_CARD':
        return <CheckCircle className="w-4 h-4" />;
      case 'TIER_BASED':
        return <Crown className="w-4 h-4" />;
      case 'HYBRID':
        return <Zap className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  // Render functions
  const renderProgramCard = (program: LoyaltyProgram) => (
    <div key={program.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {getTypeIcon(program.type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
            <p className="text-sm text-gray-600">{program.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            program.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {program.isActive ? 'Active' : 'Inactive'}
          </span>
          <button
            onClick={() => setSelectedProgram(program.id)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Type:</span>
          <span className="ml-1 font-medium">{program.type.replace('_', ' ')}</span>
        </div>
        <div>
          <span className="text-gray-500">Points per $:</span>
          <span className="ml-1 font-medium">{program.pointsPerDollar}</span>
        </div>
        <div>
          <span className="text-gray-500">Total Customers:</span>
          <span className="ml-1 font-medium">{program.stats?.totalCustomers || 0}</span>
        </div>
        <div>
          <span className="text-gray-500">Active Members:</span>
          <span className="ml-1 font-medium">{program.stats?.activeCustomers || 0}</span>
        </div>
      </div>

      {program.stats && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Points Earned</span>
            <span className="font-semibold text-blue-600">
              {program.stats.totalPointsEarned.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">Points Redeemed</span>
            <span className="font-semibold text-green-600">
              {program.stats.totalPointsRedeemed.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderCustomerCard = (customer: CustomerLoyaltyPoints) => (
    <div key={customer.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{customer.user.name || customer.user.email}</h4>
          <p className="text-sm text-gray-600">{customer.user.email}</p>
        </div>
        <div className="flex items-center space-x-2">
          {customer.tierLevel && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(customer.tierLevel)}`}>
              {customer.tierLevel}
            </span>
          )}
          <button
            onClick={() => {
              setSelectedItem(customer);
              setShowEditModal(true);
            }}
            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
            title="Manage Points"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Current Points</p>
          <p className="font-semibold text-lg text-blue-600">{customer.points.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Lifetime Points</p>
          <p className="font-semibold text-lg text-green-600">{customer.lifetimePoints.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Last Activity: {new Date(customer.lastActivity).toLocaleDateString()}</span>
          <button
            onClick={() => {
              const points = prompt('Points to add:');
              const description = prompt('Description (optional):') || undefined;
              if (points && selectedProgram) {
                addPointsMutation.mutate({
                  programId: selectedProgram,
                  userId: customer.userId,
                  points: parseInt(points),
                  description
                });
              }
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Add Points
          </button>
        </div>
      </div>
    </div>
  );

  const renderReferralCard = (referral: ReferralProgram) => (
    <div key={referral.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <UserPlus className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{referral.name}</h3>
            <p className="text-sm text-gray-600">{referral.description}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          referral.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {referral.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Referrer Gets</p>
          <p className="text-lg font-bold text-blue-900">
            {referral.referrerReward.type === 'POINTS' ? `${referral.referrerReward.value} points` :
             referral.referrerReward.type === 'DISCOUNT' ? `${referral.referrerReward.value}% off` :
             `$${referral.referrerReward.value}`}
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Referee Gets</p>
          <p className="text-lg font-bold text-green-900">
            {referral.refereeReward.type === 'POINTS' ? `${referral.refereeReward.value} points` :
             referral.refereeReward.type === 'DISCOUNT' ? `${referral.refereeReward.value}% off` :
             `$${referral.refereeReward.value}`}
          </p>
        </div>
      </div>

      {referral.stats && (
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="font-semibold text-gray-900">{referral.stats.totalReferrals}</p>
            <p className="text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-green-600">{referral.stats.completedReferrals}</p>
            <p className="text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-blue-600">{referral.stats.conversionRate}</p>
            <p className="text-gray-600">Conversion</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderSegmentCard = (segment: CustomerSegment) => (
    <div key={segment.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
            <p className="text-sm text-gray-600">{segment.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{segment.customerCount}</p>
          <p className="text-sm text-gray-600">customers</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {segment.criteria.minPurchases && (
          <div className="flex justify-between">
            <span className="text-gray-600">Min Purchases:</span>
            <span className="font-medium">{segment.criteria.minPurchases}</span>
          </div>
        )}
        {segment.criteria.minSpent && (
          <div className="flex justify-between">
            <span className="text-gray-600">Min Spent:</span>
            <span className="font-medium">${segment.criteria.minSpent}</span>
          </div>
        )}
        {segment.criteria.loyaltyTier && (
          <div className="flex justify-between">
            <span className="text-gray-600">Loyalty Tier:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(segment.criteria.loyaltyTier)}`}>
              {segment.criteria.loyaltyTier}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Updated: {new Date(segment.lastUpdated).toLocaleDateString()}</span>
          <button className="text-purple-600 hover:text-purple-800 font-medium">
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsDashboard = () => (
    <div className="space-y-6">
      {/* Overview metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Programs</p>
              <p className="text-2xl font-bold text-gray-900">
                {loyaltyPrograms?.filter((p: LoyaltyProgram) => p.isActive).length || 0}
              </p>
            </div>
            <Star className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {loyaltyPrograms?.reduce((sum: number, p: LoyaltyProgram) => sum + (p.stats?.totalCustomers || 0), 0) || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Points Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                {(loyaltyPrograms?.reduce((sum: number, p: LoyaltyProgram) => sum + (p.stats?.totalPointsEarned || 0), 0) || 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Referral Programs</p>
              <p className="text-2xl font-bold text-gray-900">
                {referralPrograms?.filter((r: ReferralProgram) => r.isActive).length || 0}
              </p>
            </div>
            <UserPlus className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Program performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Performance</h3>
        <div className="space-y-4">
          {loyaltyPrograms?.slice(0, 3).map((program: LoyaltyProgram) => (
            <div key={program.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getTypeIcon(program.type)}
                <div>
                  <p className="font-medium text-gray-900">{program.name}</p>
                  <p className="text-sm text-gray-600">{program.stats?.totalCustomers || 0} members</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  {(program.stats?.totalPointsEarned || 0).toLocaleString()} points
                </p>
                <p className="text-sm text-gray-600">
                  {Math.round(((program.stats?.activeCustomers || 0) / (program.stats?.totalCustomers || 1)) * 100)}% active
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const isLoading = programsLoading || customersLoading || referralsLoading || segmentsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">VIP & Loyalty Programs</h1>
          <p className="text-gray-600">Manage customer loyalty, rewards, and referral programs</p>
        </div>
        <button
          onClick={() => {
            setSelectedItem(null);
            setShowCreateModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Program</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'programs', label: 'Loyalty Programs', icon: Star },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'referrals', label: 'Referrals', icon: UserPlus },
            { id: 'segments', label: 'Segments', icon: Target },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Program selector for customers view */}
      {activeView === 'customers' && (
        <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
          <Crown className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">Select a loyalty program to view customers</p>
            <select
              value={selectedProgram || ''}
              onChange={(e) => setSelectedProgram(e.target.value || null)}
              className="mt-1 px-3 py-1 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Select loyalty program"
            >
              <option value="">Choose a program...</option>
              {loyaltyPrograms?.map((program: LoyaltyProgram) => (
                <option key={program.id} value={program.id}>{program.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div>
          {activeView === 'programs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loyaltyPrograms?.map((program: LoyaltyProgram) => renderProgramCard(program))}
              {loyaltyPrograms?.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Loyalty Programs</h3>
                  <p className="text-gray-600 mb-4">Create your first loyalty program to reward customers</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Create Program
                  </button>
                </div>
              )}
            </div>
          )}

          {activeView === 'customers' && selectedProgram && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {customers?.map((customer: CustomerLoyaltyPoints) => renderCustomerCard(customer))}
            </div>
          )}

          {activeView === 'referrals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {referralPrograms?.map((referral: ReferralProgram) => renderReferralCard(referral))}
              {referralPrograms?.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Referral Programs</h3>
                  <p className="text-gray-600 mb-4">Create referral programs to grow through word-of-mouth</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Create Referral Program
                  </button>
                </div>
              )}
            </div>
          )}

          {activeView === 'segments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {segments?.map((segment: CustomerSegment) => renderSegmentCard(segment))}
              {segments?.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Customer Segments</h3>
                  <p className="text-gray-600 mb-4">Create segments to target specific customer groups</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Create Segment
                  </button>
                </div>
              )}
            </div>
          )}

          {activeView === 'analytics' && renderAnalyticsDashboard()}
        </div>
      )}

      {/* Modals would go here */}
    </div>
  );
};

export default ConsolidatedVIPManager;
