import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, TrendingUp, Shield, CheckCircle, DollarSign, 
  Calendar, MapPin, AlertTriangle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import { useLocation } from 'wouter';

export default function UsersAnalyticsPage() {
  const [, setLocation] = useLocation();
  
  // In production, this would fetch real analytics data
  const mockAnalytics = {
    byRole: {
      mau: 1247,
      dau: 423,
      conversion: {
        customerToVendor: 5.2,
        vendorToCoordinator: 2.1
      },
      retention: {
        month1: 85,
        month3: 72,
        month6: 65,
        month12: 58
      }
    },
    vendors: {
      activationFunnel: {
        signup: 156,
        kyc: 134,
        firstListing: 112,
        firstSale: 89,
        firstPayout: 78
      },
      gmvDistribution: [
        { range: '$0-$1k', count: 45 },
        { range: '$1k-$5k', count: 67 },
        { range: '$5k-$10k', count: 32 },
        { range: '$10k+', count: 12 }
      ],
      disputeRate: 1.2
    },
    compliance: {
      emailVerified: 82,
      mfaEnabled: 34,
      stripeRequirements: 23,
      riskScoreDistribution: {
        low: 75,
        medium: 18,
        high: 5,
        critical: 2
      }
    },
    geographic: {
      topStates: [
        { state: 'GA', users: 456, revenue: 125000 },
        { state: 'FL', users: 234, revenue: 89000 },
        { state: 'NC', users: 178, revenue: 67000 },
        { state: 'SC', users: 123, revenue: 45000 }
      ],
      topZips: [
        { zip: '30248', users: 89, revenue: 34000 },
        { zip: '30301', users: 67, revenue: 28000 },
        { zip: '30318', users: 54, revenue: 21000 }
      ]
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F7F2EC]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#7F232E]/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#7F232E] rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2b2b2b]">User Analytics</h1>
                <p className="text-sm text-[#4b4b4b]">
                  User metrics, funnels, and compliance posture
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setLocation('/control/users')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* By Role Metrics */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[#2b2b2b] mb-6">User Activity</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-600 mb-1">MAU</div>
              <div className="text-3xl font-bold text-gray-900">{mockAnalytics.byRole.mau}</div>
              <div className="text-xs text-gray-500 mt-1">Monthly Active Users</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm font-medium text-green-600 mb-1">DAU</div>
              <div className="text-3xl font-bold text-gray-900">{mockAnalytics.byRole.dau}</div>
              <div className="text-xs text-gray-500 mt-1">Daily Active Users</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm font-medium text-purple-600 mb-1">Customer → Vendor</div>
              <div className="text-3xl font-bold text-gray-900">{mockAnalytics.byRole.conversion.customerToVendor}%</div>
              <div className="text-xs text-gray-500 mt-1">Conversion Rate</div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm font-medium text-orange-600 mb-1">12-Month Retention</div>
              <div className="text-3xl font-bold text-gray-900">{mockAnalytics.byRole.retention.month12}%</div>
              <div className="text-xs text-gray-500 mt-1">Cohort Retention</div>
            </div>
          </div>
          
          {/* Retention Cohort */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Cohort Retention</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Month 1', value: mockAnalytics.byRole.retention.month1 },
                { label: 'Month 3', value: mockAnalytics.byRole.retention.month3 },
                { label: 'Month 6', value: mockAnalytics.byRole.retention.month6 },
                { label: 'Month 12', value: mockAnalytics.byRole.retention.month12 }
              ].map((item) => (
                <div key={item.label} className="text-center p-3 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">{item.label}</div>
                  <div className="text-2xl font-bold text-gray-900">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Vendor Activation Funnel */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[#2b2b2b] mb-6">Vendor Activation Funnel</h2>
          
          <div className="space-y-4">
            {[
              { stage: 'Signup', count: mockAnalytics.vendors.activationFunnel.signup, percent: 100 },
              { stage: 'KYC Complete', count: mockAnalytics.vendors.activationFunnel.kyc, percent: 85.9 },
              { stage: 'First Listing', count: mockAnalytics.vendors.activationFunnel.firstListing, percent: 71.8 },
              { stage: 'First Sale', count: mockAnalytics.vendors.activationFunnel.firstSale, percent: 57.1 },
              { stage: 'First Payout', count: mockAnalytics.vendors.activationFunnel.firstPayout, percent: 50.0 }
            ].map((step) => (
              <div key={step.stage} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-gray-700">{step.stage}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-end px-3"
                    style={{ width: `${step.percent}%` }}
                  >
                    <span className="text-white text-sm font-semibold">{step.count}</span>
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">{step.percent.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* GMV Distribution */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[#2b2b2b] mb-6">GMV Distribution</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {mockAnalytics.vendors.gmvDistribution.map((bucket) => (
              <div key={bucket.range} className="p-4 border rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-2">{bucket.range}</div>
                <div className="text-3xl font-bold text-gray-900">{bucket.count}</div>
                <div className="text-xs text-gray-500 mt-1">vendors</div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Compliance Posture */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[#2b2b2b] mb-6">Compliance Posture</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Verification Stats */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Verification</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Email Verified</span>
                    <span className="text-sm font-semibold text-gray-900">{mockAnalytics.compliance.emailVerified}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${mockAnalytics.compliance.emailVerified}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">MFA Enabled</span>
                    <span className="text-sm font-semibold text-gray-900">{mockAnalytics.compliance.mfaEnabled}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${mockAnalytics.compliance.mfaEnabled}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Risk Distribution */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Risk Distribution</h3>
              <div className="space-y-2">
                {[
                  { label: 'Low', value: mockAnalytics.compliance.riskScoreDistribution.low, color: 'bg-green-500' },
                  { label: 'Medium', value: mockAnalytics.compliance.riskScoreDistribution.medium, color: 'bg-yellow-500' },
                  { label: 'High', value: mockAnalytics.compliance.riskScoreDistribution.high, color: 'bg-orange-500' },
                  { label: 'Critical', value: mockAnalytics.compliance.riskScoreDistribution.critical, color: 'bg-red-500' }
                ].map((risk) => (
                  <div key={risk.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{risk.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className={`${risk.color} h-2 rounded-full`} style={{ width: `${risk.value}%` }}></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-12 text-right">{risk.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Open Issues */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Open Issues</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-orange-900">Stripe Requirements</span>
                  <span className="text-xl font-bold text-orange-600">{mockAnalytics.compliance.stripeRequirements}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Geographic Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-[#2b2b2b] mb-6">Top States</h2>
            
            <div className="space-y-3">
              {mockAnalytics.geographic.topStates.map((state, index) => (
                <div key={state.state} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{state.state}</div>
                    <div className="text-sm text-gray-600">{state.users} users</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${(state.revenue / 1000).toFixed(0)}k</div>
                    <div className="text-xs text-gray-500">revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-bold text-[#2b2b2b] mb-6">Top ZIP Codes</h2>
            
            <div className="space-y-3">
              {mockAnalytics.geographic.topZips.map((zip, index) => (
                <div key={zip.zip} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{zip.zip}</div>
                    <div className="text-sm text-gray-600">{zip.users} users</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${(zip.revenue / 1000).toFixed(0)}k</div>
                    <div className="text-xs text-gray-500">revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

