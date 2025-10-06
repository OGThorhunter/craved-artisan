import React, { useState } from 'react';
import { 
  Crown, 
  Award,
  Users, 
  TrendingUp, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  Save
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface VIPTier {
  id: string;
  name: string;
  color: string;
  icon: string;
  requirements: {
    minSpent: number;
    minOrders: number;
    minLifetimeValue: number;
    customCriteria?: string;
  };
  benefits: string[];
  isActive: boolean;
  isDefault: boolean;
}

interface VIPCustomer {
  id: string;
  name: string;
  email: string;
  tier: string;
  totalSpent: number;
  lifetimeValue: number;
  joinDate: string;
  benefits: string[];
  status: 'active' | 'inactive';
  customNotes?: string;
}

interface VIPProgramSettings {
  programName: string;
  programDescription: string;
  isPublic: boolean;
  autoEnrollment: boolean;
  enrollmentCriteria: {
    minSpent: number;
    minOrders: number;
    minLifetimeValue: number;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
  };
}

const VIPProgramManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'tiers' | 'settings'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  // const [showTierModal, setShowTierModal] = useState(false);
  // const [showSettingsModal, setShowSettingsModal] = useState(false);
  // const [editingTier, setEditingTier] = useState<VIPTier | null>(null);

  // Program settings state
  const [programSettings, setProgramSettings] = useState<VIPProgramSettings>({
    programName: 'VIP Loyalty Program',
    programDescription: 'Exclusive benefits for our most valued customers',
    isPublic: true,
    autoEnrollment: true,
    enrollmentCriteria: {
      minSpent: 1000,
      minOrders: 5,
      minLifetimeValue: 1000
    },
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true
    },
    branding: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#F3F4F6'
    }
  });

  // VIP Tiers configuration
  const [vipTiers] = useState<VIPTier[]>([
    {
      id: 'gold',
      name: 'Gold',
      color: '#F59E0B',
      icon: '⭐',
      requirements: {
        minSpent: 1000,
        minOrders: 5,
        minLifetimeValue: 1000
      },
      benefits: ['Free shipping', '15% discount', 'Priority support'],
      isActive: true,
      isDefault: true
    },
    {
      id: 'platinum',
      name: 'Platinum',
      color: '#6B7280',
      icon: '🏆',
      requirements: {
        minSpent: 5000,
        minOrders: 15,
        minLifetimeValue: 5000
      },
      benefits: ['All Gold benefits', '20% discount', 'Early access to new products'],
      isActive: true,
      isDefault: true
    },
    {
      id: 'diamond',
      name: 'Diamond',
      color: '#3B82F6',
      icon: '💎',
      requirements: {
        minSpent: 15000,
        minOrders: 30,
        minLifetimeValue: 15000
      },
      benefits: ['All Platinum benefits', '25% discount', 'Exclusive products', 'Personal account manager'],
      isActive: true,
      isDefault: true
    }
  ]);

  // Mock VIP customers data
  const [vipCustomers] = useState<VIPCustomer[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      tier: 'diamond',
      totalSpent: 45000,
      lifetimeValue: 52000,
      joinDate: '2023-01-15',
      benefits: ['Free Shipping', 'Priority Support', 'Exclusive Products', '25% Discount'],
      status: 'active',
      customNotes: 'Prefers email communication'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      tier: 'platinum',
      totalSpent: 28000,
      lifetimeValue: 32000,
      joinDate: '2023-03-22',
      benefits: ['Free Shipping', 'Priority Support', '20% Discount'],
      status: 'active'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      tier: 'gold',
      totalSpent: 15000,
      lifetimeValue: 18000,
      joinDate: '2023-06-10',
      benefits: ['Free Shipping', '15% Discount'],
      status: 'active'
    }
  ]);

  const filteredCustomers = vipCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'all' || customer.tier === tierFilter;
    
    return matchesSearch && matchesTier;
  });

  const getTierInfo = (tierId: string) => {
    return vipTiers.find(tier => tier.id === tierId) || vipTiers[0];
  };

  // const getTierColor = (tierId: string) => {
  //   const tier = getTierInfo(tierId);
  //   return tier?.color || '#6B7280';
  // };

  const tierStats = {
    total: vipCustomers.length,
    active: vipCustomers.filter(c => c.status === 'active').length,
    totalValue: vipCustomers.reduce((sum, c) => sum + c.lifetimeValue, 0),
    tiers: vipTiers.reduce((acc, tier) => {
      acc[tier.id] = vipCustomers.filter(c => c.tier === tier.id).length;
      return acc;
    }, {} as Record<string, number>)
  };

  const handleSaveSettings = () => {
    // Save program settings
    console.log('Saving program settings:', programSettings);
    // setShowSettingsModal(false);
  };

  // const handleSaveTier = (tier: VIPTier) => {
  //   if (editingTier) {
  //     setVipTiers(prev => prev.map(t => t.id === tier.id ? tier : t));
  //   } else {
  //     setVipTiers(prev => [...prev, { ...tier, id: Date.now().toString() }]);
  //   }
  //   setShowTierModal(false);
  //   setEditingTier(null);
  // };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Crown className="w-8 h-8 text-purple-600" />
                {programSettings.programName}
              </h1>
              <p className="text-gray-600 mt-2">{programSettings.programDescription}</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="secondary"
                onClick={() => console.log('Customize Program clicked')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Customize Program
              </Button>
              <Button 
                variant="primary"
                onClick={() => console.log('Add Tier clicked')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tier
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'customers', label: 'VIP Customers', icon: Users },
              { id: 'tiers', label: 'Tier Management', icon: Award },
              { id: 'settings', label: 'Program Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'customers' | 'tiers' | 'settings')}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total VIPs</p>
                    <p className="text-2xl font-bold text-gray-900">{tierStats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active VIPs</p>
                    <p className="text-2xl font-bold text-green-600">{tierStats.active}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-purple-600">${tierStats.totalValue.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Program Status</p>
                    <p className="text-2xl font-bold text-green-600">Active</p>
                  </div>
                  <Crown className="h-8 w-8 text-yellow-600" />
                </div>
              </Card>
            </div>

            {/* Tier Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tier Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vipTiers.map((tier) => (
                  <div key={tier.id} className="p-4 rounded-lg border" style={{ borderColor: tier.color }}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{tier.icon}</span>
                      <div>
                        <h4 className="font-semibold" style={{ color: tier.color }}>{tier.name}</h4>
                        <p className="text-sm text-gray-600">{tierStats.tiers[tier.id] || 0} customers</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {tier.benefits.slice(0, 2).map((benefit, index) => (
                        <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {benefit}
                        </div>
                      ))}
                      {tier.benefits.length > 2 && (
                        <p className="text-xs text-gray-500">+{tier.benefits.length - 2} more benefits</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search VIP customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    title="Filter by tier"
                  >
                    <option value="all">All Tiers</option>
                    {vipTiers.map(tier => (
                      <option key={tier.id} value={tier.id}>{tier.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* VIP Customers Table */}
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">VIP Customers ({filteredCustomers.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lifetime Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benefits</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => {
                      const tier = getTierInfo(customer.tier);
                      return (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: tier?.color }}
                            >
                              <span>{tier?.icon}</span>
                              {tier?.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${customer.totalSpent.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${customer.lifetimeValue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {customer.benefits.slice(0, 2).map((benefit, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  {benefit}
                                </span>
                              ))}
                              {customer.benefits.length > 2 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                  +{customer.benefits.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              customer.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {customer.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button 
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit customer"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                title="Remove from VIP"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'tiers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">VIP Tiers</h3>
              <Button 
                variant="primary"
                onClick={() => console.log('Add New Tier clicked')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Tier
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vipTiers.map((tier) => (
                <Card key={tier.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tier.icon}</span>
                      <div>
                        <h4 className="font-semibold text-lg" style={{ color: tier.color }}>{tier.name}</h4>
                        <p className="text-sm text-gray-600">{tierStats.tiers[tier.id] || 0} customers</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => console.log('Edit tier clicked')}
                        title="Edit tier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {!tier.isDefault && (
                        <button 
                          className="text-red-600 hover:text-red-900"
                          title="Delete tier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Requirements</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Min spent: ${tier.requirements.minSpent.toLocaleString()}</li>
                        <li>• Min orders: {tier.requirements.minOrders}</li>
                        <li>• Min lifetime value: ${tier.requirements.minLifetimeValue.toLocaleString()}</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Benefits</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program Name</label>
                  <input
                    type="text"
                    value={programSettings.programName}
                    onChange={(e) => setProgramSettings(prev => ({ ...prev, programName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    aria-label="Program name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program Description</label>
                  <textarea
                    value={programSettings.programDescription}
                    onChange={(e) => setProgramSettings(prev => ({ ...prev, programDescription: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    aria-label="Program description"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={programSettings.isPublic}
                      onChange={(e) => setProgramSettings(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Public program (visible to customers)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={programSettings.autoEnrollment}
                      onChange={(e) => setProgramSettings(prev => ({ ...prev, autoEnrollment: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Auto-enrollment</span>
                  </label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Criteria</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Spent</label>
                  <input
                    type="number"
                    value={programSettings.enrollmentCriteria.minSpent}
                    onChange={(e) => setProgramSettings(prev => ({ 
                      ...prev, 
                      enrollmentCriteria: { ...prev.enrollmentCriteria, minSpent: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    aria-label="Minimum spent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Orders</label>
                  <input
                    type="number"
                    value={programSettings.enrollmentCriteria.minOrders}
                    onChange={(e) => setProgramSettings(prev => ({ 
                      ...prev, 
                      enrollmentCriteria: { ...prev.enrollmentCriteria, minOrders: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    aria-label="Minimum orders"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Lifetime Value</label>
                  <input
                    type="number"
                    value={programSettings.enrollmentCriteria.minLifetimeValue}
                    onChange={(e) => setProgramSettings(prev => ({ 
                      ...prev, 
                      enrollmentCriteria: { ...prev.enrollmentCriteria, minLifetimeValue: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    aria-label="Minimum lifetime value"
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button 
                variant="primary"
                onClick={handleSaveSettings}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VIPProgramManager;
