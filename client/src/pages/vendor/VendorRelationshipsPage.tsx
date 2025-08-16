import React, { useState } from 'react';
import { Link } from 'wouter';
import { Users, MapPin, Phone, Mail, Globe, Star, Calendar, Building, Gift, Share2, CheckCircle, Clock } from 'lucide-react';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';

interface Relationship {
  id: string;
  name: string;
  type: 'dropoff' | 'collaboration' | 'supplier' | 'partner';
  location: string;
  contact: string;
  email: string;
  website?: string;
  rating: number;
  status: 'active' | 'pending' | 'inactive';
  lastContact: string;
  description: string;
  tags: string[];
}

interface Referral {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'registered' | 'purchased' | 'qualified' | 'expired';
  dateReferred: string;
  dateRegistered?: string;
  datePurchased?: string;
  dateQualified?: string;
  rewardEarned: boolean;
  rewardType?: 'discount' | 'free_month';
}

const VendorRelationshipsPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralForm, setReferralForm] = useState({ name: '', email: '', message: '' });

  // Mock data for relationships
  const relationships: Relationship[] = [
    {
      id: '1',
      name: 'Downtown Atlanta Hub',
      type: 'dropoff',
      location: '123 Peachtree St, Atlanta, GA',
      contact: 'Sarah Johnson',
      email: 'sarah@downtownhub.com',
      website: 'https://downtownhub.com',
      rating: 4.8,
      status: 'active',
      lastContact: '2024-01-15',
      description: 'Primary dropoff location for downtown Atlanta area. Excellent customer service and reliable pickup times.',
      tags: ['downtown', 'reliable', 'customer-service']
    },
    {
      id: '2',
      name: 'Midtown Market',
      type: 'dropoff',
      location: '456 Piedmont Ave, Atlanta, GA',
      contact: 'Mike Chen',
      email: 'mike@midtownmarket.com',
      rating: 4.6,
      status: 'active',
      lastContact: '2024-01-12',
      description: 'High-traffic market location with great visibility. Customers love the convenience.',
      tags: ['midtown', 'high-traffic', 'convenient']
    },
    {
      id: '3',
      name: 'Buckhead Collection',
      type: 'dropoff',
      location: '789 Roswell Rd, Atlanta, GA',
      contact: 'Lisa Rodriguez',
      email: 'lisa@buckheadcollection.com',
      website: 'https://buckheadcollection.com',
      rating: 4.9,
      status: 'active',
      lastContact: '2024-01-18',
      description: 'Premium location in upscale Buckhead area. High-value customers and excellent sales.',
      tags: ['buckhead', 'premium', 'high-value']
    },
    {
      id: '4',
      name: 'Artisan Flour Co.',
      type: 'supplier',
      location: '321 Industrial Blvd, Marietta, GA',
      contact: 'David Wilson',
      email: 'david@artisanflour.com',
      website: 'https://artisanflour.com',
      rating: 4.7,
      status: 'active',
      lastContact: '2024-01-10',
      description: 'Premium organic flour supplier. Consistent quality and reliable delivery.',
      tags: ['supplier', 'organic', 'reliable']
    },
    {
      id: '5',
      name: 'Local Honey Collective',
      type: 'collaboration',
      location: '654 Farm Rd, Alpharetta, GA',
      contact: 'Emma Thompson',
      email: 'emma@localhoney.com',
      rating: 4.5,
      status: 'active',
      lastContact: '2024-01-08',
      description: 'Collaborative partnership for honey products. Joint marketing and shared customer base.',
      tags: ['collaboration', 'honey', 'joint-marketing']
    },
    {
      id: '6',
      name: 'Craft Market Network',
      type: 'partner',
      location: '987 Market St, Decatur, GA',
      contact: 'Robert Kim',
      email: 'robert@craftmarket.com',
      website: 'https://craftmarket.com',
      rating: 4.4,
      status: 'pending',
      lastContact: '2024-01-05',
      description: 'Network of craft markets across Georgia. Partnership opportunity for expanded reach.',
      tags: ['partner', 'network', 'expanded-reach']
    }
  ];

  // Mock data for referrals
  const referrals: Referral[] = [
    {
      id: '1',
      name: 'Jennifer Martinez',
      email: 'jennifer@artisanbakes.com',
      status: 'qualified',
      dateReferred: '2024-01-10',
      dateRegistered: '2024-01-15',
      datePurchased: '2024-01-20',
      dateQualified: '2024-04-20',
      rewardEarned: true,
      rewardType: 'discount'
    },
    {
      id: '2',
      name: 'Alex Thompson',
      email: 'alex@handmadecrafts.com',
      status: 'registered',
      dateReferred: '2024-01-25',
      dateRegistered: '2024-02-01',
      rewardEarned: false
    },
    {
      id: '3',
      name: 'Maria Rodriguez',
      email: 'maria@organicgoods.com',
      status: 'pending',
      dateReferred: '2024-02-05',
      rewardEarned: false
    }
  ];

  const filteredRelationships = relationships.filter(relationship => {
    const matchesType = filterType === 'all' || relationship.type === filterType;
    const matchesSearch = relationship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         relationship.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         relationship.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dropoff': return 'bg-blue-100 text-blue-800';
      case 'collaboration': return 'bg-green-100 text-green-800';
      case 'supplier': return 'bg-purple-100 text-purple-800';
      case 'partner': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReferralStatusColor = (status: string) => {
    switch (status) {
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'registered': return 'bg-blue-100 text-blue-800';
      case 'purchased': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReferralStatusIcon = (status: string) => {
    switch (status) {
      case 'qualified': return <CheckCircle className="w-4 h-4" />;
      case 'registered': return <Users className="w-4 h-4" />;
      case 'purchased': return <Gift className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the referral to your backend
    console.log('Referral submitted:', referralForm);
    setShowReferralModal(false);
    setReferralForm({ name: '', email: '', message: '' });
    // Show success message
  };

  const qualifiedReferrals = referrals.filter(r => r.status === 'qualified').length;
  const totalReferrals = referrals.length;

  return (
    <VendorDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2C2C2C]">Relationships</h1>
            <p className="text-gray-600 mt-2">Manage your business relationships and collaborations within the Craved Artisan community</p>
          </div>
          <button className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-6 py-3 rounded-lg transition-colors border-2 border-black shadow-md hover:shadow-lg">
            Add New Relationship
          </button>
        </div>

        {/* Referral Program Section */}
        <div className="bg-gradient-to-r from-[#5B6E02] to-[#8B4513] rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Refer a Friend Program</h2>
              <p className="text-white/90">Earn rewards by referring other vendors to Craved Artisan</p>
            </div>
            <button
              onClick={() => setShowReferralModal(true)}
              className="bg-white text-[#5B6E02] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Refer a Friend
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-6 h-6" />
                <h3 className="font-semibold">Reward Structure</h3>
              </div>
              <ul className="text-sm space-y-1">
                <li>• 50% discount on monthly fee per purchase</li>
                <li>• 1 month free with 2 verified referrals</li>
                <li>• Referrals must stay 3+ months</li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6" />
                <h3 className="font-semibold">Your Progress</h3>
              </div>
              <div className="text-2xl font-bold">{qualifiedReferrals}/2</div>
              <p className="text-sm">Qualified referrals for free month</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-6 h-6" />
                <h3 className="font-semibold">Total Referrals</h3>
              </div>
              <div className="text-2xl font-bold">{totalReferrals}</div>
              <p className="text-sm">Friends referred to date</p>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">Your Referrals</h2>
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReferralStatusColor(referral.status)} flex items-center gap-1`}>
                      {getReferralStatusIcon(referral.status)}
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#2C2C2C]">{referral.name}</div>
                    <div className="text-sm text-gray-600">{referral.email}</div>
                    <div className="text-xs text-gray-500">Referred: {new Date(referral.dateReferred).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  {referral.rewardEarned && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <Gift className="w-4 h-4" />
                      <span className="font-medium">
                        {referral.rewardType === 'discount' ? '50% Discount' : '1 Month Free'}
                      </span>
                    </div>
                  )}
                  {referral.status === 'qualified' && (
                    <div className="text-xs text-gray-500">
                      Qualified: {new Date(referral.dateQualified!).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search relationships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
            aria-label="Filter relationships by type"
          >
            <option value="all">All Types</option>
            <option value="dropoff">Dropoff Locations</option>
            <option value="collaboration">Collaborations</option>
            <option value="supplier">Suppliers</option>
            <option value="partner">Partners</option>
          </select>
        </div>

        {/* Relationships Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRelationships.map((relationship) => (
            <div key={relationship.id} className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#2C2C2C] mb-1">{relationship.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(relationship.type)}`}>
                        {relationship.type.charAt(0).toUpperCase() + relationship.type.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(relationship.status)}`}>
                        {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{relationship.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{relationship.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {relationship.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-[#5B6E02]" />
                  <span>{relationship.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-[#5B6E02]" />
                  <span>{relationship.contact}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-[#5B6E02]" />
                  <span>{relationship.email}</span>
                </div>
                
                {relationship.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4 text-[#5B6E02]" />
                    <a href={relationship.website} target="_blank" rel="noopener noreferrer" className="text-[#5B6E02] hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-[#5B6E02]" />
                  <span>Last contact: {new Date(relationship.lastContact).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex gap-2">
                  <button className="flex-1 bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-3 py-2 rounded-lg transition-colors text-sm">
                    Contact
                  </button>
                  <button className="flex-1 bg-[#8B4513] hover:bg-[#A0522D] text-white px-3 py-2 rounded-lg transition-colors text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRelationships.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No relationships found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters to find what you're looking for.</p>
            <button className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-6 py-3 rounded-lg transition-colors border-2 border-black shadow-md hover:shadow-lg">
              Add Your First Relationship
            </button>
          </div>
        )}

        {/* Referral Modal */}
        {showReferralModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#2C2C2C]">Refer a Friend</h3>
                <button
                  onClick={() => setShowReferralModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close referral modal"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleReferralSubmit} className="space-y-4">
                <div>
                  <label htmlFor="friend-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Friend's Name
                  </label>
                  <input
                    id="friend-name"
                    type="text"
                    value={referralForm.name}
                    onChange={(e) => setReferralForm({...referralForm, name: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="friend-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Friend's Email
                  </label>
                  <input
                    id="friend-email"
                    type="email"
                    value={referralForm.email}
                    onChange={(e) => setReferralForm({...referralForm, email: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="friend-message" className="block text-sm font-medium text-gray-700 mb-1">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    id="friend-message"
                    value={referralForm.message}
                    onChange={(e) => setReferralForm({...referralForm, message: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                    rows={3}
                    placeholder="Tell your friend why they should join Craved Artisan..."
                  />
                </div>
                
                <div className="bg-[#F7F2EC] p-3 rounded-lg">
                  <p className="text-sm text-[#2C2C2C]">
                    <strong>Reward:</strong> Earn 50% discount on monthly fee for each purchase, or 1 month free with 2 verified referrals who stay 3+ months.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReferralModal(false)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Cancel referral form"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-4 py-2 rounded-lg transition-colors"
                    aria-label="Submit referral form"
                  >
                    Send Referral
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorRelationshipsPage;
