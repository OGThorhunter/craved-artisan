import React, { useState } from 'react';
import {
  Star,
  Gift,
  Users,
  Share2,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Settings,
  TrendingUp,
  Award,
  Target,
  Brain,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Percent,
  Calendar,
  User,
  Mail,
  MessageSquare,
  Zap,
  BarChart3,
  Filter,
  Search,
  X
} from 'lucide-react';

interface LoyaltyProgram {
  id: string;
  name: string;
  type: 'points' | 'punch_card' | 'tiered';
  status: 'active' | 'inactive' | 'draft';
  rules: {
    earnRate: number;
    burnRate: number;
    minRedemption: number;
    maxRedemption?: number;
    expirationDays?: number;
  };
  members: number;
  totalPoints: number;
  redemptions: number;
  createdAt: string;
}

interface ReferralProgram {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'draft';
  reward: {
    type: 'points' | 'discount' | 'credit';
    value: number;
    description: string;
  };
  issuedCodes: number;
  clicks: number;
  conversions: number;
  revenue: number;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  points: number;
  tier: string;
  lastActivity: string;
  referralCount: number;
  totalSpent: number;
  aiInsights: {
    likelyRedeemer: boolean;
    likelyReferrer: boolean;
    nextBestAction: string;
    riskScore: number;
  };
}

interface LoyaltyReferralsTabProps {
  loyaltyPrograms: LoyaltyProgram[];
  referralPrograms: ReferralProgram[];
  customers: Customer[];
  onLoyaltyCreate: (program: Partial<LoyaltyProgram>) => void;
  onLoyaltyUpdate: (program: LoyaltyProgram) => void;
  onLoyaltyDelete: (id: string) => void;
  onReferralCreate: (program: Partial<ReferralProgram>) => void;
  onReferralUpdate: (program: ReferralProgram) => void;
  onReferralDelete: (id: string) => void;
  onCustomerAction: (customerId: string, action: string) => void;
  onAIGenerate: (type: string) => void;
  onExportData: (format: string) => void;
  isLoading: boolean;
}

const LoyaltyReferralsTab: React.FC<LoyaltyReferralsTabProps> = ({
  loyaltyPrograms,
  referralPrograms,
  customers,
  onLoyaltyCreate,
  onLoyaltyUpdate,
  onLoyaltyDelete,
  onReferralCreate,
  onReferralUpdate,
  onReferralDelete,
  onCustomerAction,
  onAIGenerate,
  onExportData,
  isLoading
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'loyalty' | 'referrals' | 'customers' | 'insights'>('loyalty');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<LoyaltyProgram | ReferralProgram | null>(null);
  const [showProgramDetails, setShowProgramDetails] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatNumber = (value: number) => value.toLocaleString();
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'gold': return 'text-yellow-600';
      case 'silver': return 'text-gray-600';
      case 'bronze': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Loyalty & Referrals</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('loyalty')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeSubTab === 'loyalty' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Star className="h-4 w-4 inline mr-2" />
              Loyalty
            </button>
            <button
              onClick={() => setActiveSubTab('referrals')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeSubTab === 'referrals' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Share2 className="h-4 w-4 inline mr-2" />
              Referrals
            </button>
            <button
              onClick={() => setActiveSubTab('customers')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeSubTab === 'customers' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Customers
            </button>
            <button
              onClick={() => setActiveSubTab('insights')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeSubTab === 'insights' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Brain className="h-4 w-4 inline mr-2" />
              AI Insights
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => onExportData('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Export
          </button>
          
          <button
            onClick={() => onAIGenerate('insights')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Brain className="h-4 w-4" />
            Generate Insights
          </button>
        </div>
      </div>

      {/* Loyalty Programs Tab */}
      {activeSubTab === 'loyalty' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Loyalty Programs</h3>
            <button
              onClick={() => onLoyaltyCreate({})}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Program
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loyaltyPrograms.map((program) => (
              <div
                key={program.id}
                className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                style={{ backgroundColor: '#F7F2EC' }}
                onClick={() => {
                  setSelectedProgram(program);
                  setShowProgramDetails(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Star className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{program.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{program.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                    {program.status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Members</span>
                    <span className="font-semibold text-gray-900">{formatNumber(program.members)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Points</span>
                    <span className="font-semibold text-gray-900">{formatNumber(program.totalPoints)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Redemptions</span>
                    <span className="font-semibold text-gray-900">{formatNumber(program.redemptions)}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoyaltyUpdate(program);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Edit Program"
                    aria-label="Edit loyalty program"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoyaltyDelete(program.id);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete Program"
                    aria-label="Delete loyalty program"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referral Programs Tab */}
      {activeSubTab === 'referrals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Referral Programs</h3>
            <button
              onClick={() => onReferralCreate({})}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Program
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {referralPrograms.map((program) => (
              <div
                key={program.id}
                className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                style={{ backgroundColor: '#F7F2EC' }}
                onClick={() => {
                  setSelectedProgram(program);
                  setShowProgramDetails(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Share2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{program.name}</h4>
                      <p className="text-sm text-gray-600">{program.reward.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                    {program.status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Issued Codes</span>
                    <span className="font-semibold text-gray-900">{formatNumber(program.issuedCodes)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Clicks</span>
                    <span className="font-semibold text-gray-900">{formatNumber(program.clicks)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Conversions</span>
                    <span className="font-semibold text-gray-900">{formatNumber(program.conversions)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenue</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(program.revenue)}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReferralUpdate(program);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Edit Program"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReferralDelete(program.id);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete Program"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeSubTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Customer Insights</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => onAIGenerate('customer-insights')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Brain className="h-4 w-4" />
                Generate Insights
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                style={{ backgroundColor: '#F7F2EC' }}
                onClick={() => {
                  setSelectedCustomer(customer);
                  setShowCustomerDetails(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${getTierColor(customer.tier)}`}>{customer.tier}</div>
                    <div className="text-sm text-gray-500">{formatNumber(customer.points)} pts</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Spent</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Referrals</span>
                    <span className="font-semibold text-gray-900">{customer.referralCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Risk Score</span>
                    <span className={`font-semibold ${getRiskColor(customer.aiInsights.riskScore)}`}>
                      {customer.aiInsights.riskScore}/100
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2">
                  {customer.aiInsights.likelyRedeemer && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Likely Redeemer
                    </span>
                  )}
                  {customer.aiInsights.likelyReferrer && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Likely Referrer
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeSubTab === 'insights' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
            <button
              onClick={() => onAIGenerate('comprehensive')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Brain className="h-4 w-4" />
              Generate All Insights
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Likely Redeemers */}
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Gift className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Likely Redeemers</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Customers who are likely to redeem their points soon</p>
              <div className="space-y-3">
                {customers.filter(c => c.aiInsights.likelyRedeemer).slice(0, 3).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-600">{formatNumber(customer.points)} points</div>
                    </div>
                    <button
                      onClick={() => onCustomerAction(customer.id, 'send-redemption-reminder')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Send Reminder
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Likely Referrers */}
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Share2 className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Likely Referrers</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Customers who are likely to refer others</p>
              <div className="space-y-3">
                {customers.filter(c => c.aiInsights.likelyReferrer).slice(0, 3).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.referralCount} referrals</div>
                    </div>
                    <button
                      onClick={() => onCustomerAction(customer.id, 'send-referral-invite')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send Invite
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Best Actions */}
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Next Best Actions</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">AI-suggested actions to improve engagement</p>
              <div className="space-y-3">
                {customers.slice(0, 3).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.aiInsights.nextBestAction}</div>
                    </div>
                    <button
                      onClick={() => onCustomerAction(customer.id, customer.aiInsights.nextBestAction.toLowerCase())}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Execute
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Risk Assessment</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Customers at risk of churning</p>
              <div className="space-y-3">
                {customers.filter(c => c.aiInsights.riskScore >= 70).slice(0, 3).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-600">Risk: {customer.aiInsights.riskScore}/100</div>
                    </div>
                    <button
                      onClick={() => onCustomerAction(customer.id, 'send-retention-offer')}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Retain
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Program Details Modal */}
      {showProgramDetails && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedProgram.name}</h2>
                <button
                  onClick={() => setShowProgramDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close program details"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProgram.status)}`}>
                    {selectedProgram.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                  <p className="text-sm text-gray-900">{new Date(selectedProgram.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if ('type' in selectedProgram) {
                      onLoyaltyUpdate(selectedProgram as LoyaltyProgram);
                    } else {
                      onReferralUpdate(selectedProgram as ReferralProgram);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit Program
                </button>
                <button
                  onClick={() => {
                    if ('type' in selectedProgram) {
                      onLoyaltyDelete(selectedProgram.id);
                    } else {
                      onReferralDelete(selectedProgram.id);
                    }
                    setShowProgramDetails(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Program
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                <button
                  onClick={() => setShowCustomerDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                  aria-label="Close customer details"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                  <p className="text-lg font-semibold text-gray-900">{formatNumber(selectedCustomer.points)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tier</label>
                  <p className={`text-lg font-semibold ${getTierColor(selectedCustomer.tier)}`}>{selectedCustomer.tier}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Spent</label>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedCustomer.totalSpent)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Referrals</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedCustomer.referralCount}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Risk Score</label>
                    <p className={`text-lg font-semibold ${getRiskColor(selectedCustomer.aiInsights.riskScore)}`}>
                      {selectedCustomer.aiInsights.riskScore}/100
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Next Best Action</label>
                    <p className="text-sm text-gray-900">{selectedCustomer.aiInsights.nextBestAction}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onCustomerAction(selectedCustomer.id, 'send-message')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </button>
                <button
                  onClick={() => onCustomerAction(selectedCustomer.id, 'create-task')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Zap className="h-4 w-4" />
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyReferralsTab;
