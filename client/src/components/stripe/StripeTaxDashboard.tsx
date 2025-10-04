import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  Info,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface TaxRate {
  id: string;
  displayName: string;
  percentage: number;
  inclusive: boolean;
  jurisdiction: string;
  effectiveDate: string;
}

interface TaxTransaction {
  id: string;
  amount: number;
  taxAmount: number;
  taxRate: number;
  jurisdiction: string;
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

interface StripeTaxData {
  accountStatus: 'active' | 'pending' | 'restricted';
  taxRates: TaxRate[];
  recentTransactions: TaxTransaction[];
  monthlySummary: {
    totalTaxCollected: number;
    totalTransactions: number;
    topJurisdictions: { name: string; amount: number; percentage: number }[];
  };
  complianceStatus: {
    nexEnabled: boolean;
    registrationStatus: 'registered' | 'pending' | 'not_registered';
    nextFilingDate: string;
  };
}

// Mock data for demonstration
const getMockStripeTaxData = async (): Promise<StripeTaxData> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  return {
    accountStatus: 'active',
    taxRates: [
      {
        id: 'txr_georgia_sales',
        displayName: 'Georgia Sales Tax',
        percentage: 4.0,
        inclusive: false,
        jurisdiction: 'Georgia, US',
        effectiveDate: '2024-01-01'
      },
      {
        id: 'txr_fulton_county',
        displayName: 'Fulton County Tax',
        percentage: 1.5,
        inclusive: false,
        jurisdiction: 'Fulton County, GA',
        effectiveDate: '2024-01-01'
      },
      {
        id: 'txr_atlanta_city',
        displayName: 'Atlanta City Tax',
        percentage: 1.0,
        inclusive: false,
        jurisdiction: 'Atlanta, GA',
        effectiveDate: '2024-01-01'
      }
    ],
    recentTransactions: [
      {
        id: 'txn_001',
        amount: 125.50,
        taxAmount: 8.15,
        taxRate: 6.5,
        jurisdiction: 'Georgia, US',
        date: '2024-10-01',
        description: 'Handmade Soap Set Sale',
        status: 'completed'
      },
      {
        id: 'txn_002',
        amount: 89.00,
        taxAmount: 5.79,
        taxRate: 6.5,
        jurisdiction: 'Georgia, US',
        date: '2024-10-01',
        description: 'Artisan Bread Sale',
        status: 'completed'
      },
      {
        id: 'txn_003',
        amount: 45.00,
        taxAmount: 2.93,
        taxRate: 6.5,
        jurisdiction: 'Georgia, US',
        date: '2024-09-30',
        description: 'Organic Honey Sale',
        status: 'pending'
      }
    ],
    monthlySummary: {
      totalTaxCollected: 1247.85,
      totalTransactions: 156,
      topJurisdictions: [
        { name: 'Georgia, US', amount: 1247.85, percentage: 100 },
        { name: 'Fulton County, GA', amount: 623.93, percentage: 50 },
        { name: 'Atlanta, GA', amount: 415.95, percentage: 33.3 }
      ]
    },
    complianceStatus: {
      nexEnabled: true,
      registrationStatus: 'registered',
      nextFilingDate: '2024-11-20'
    }
  };
};

const StripeTaxDashboard: React.FC = () => {
  const [taxData, setTaxData] = useState<StripeTaxData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    const fetchTaxData = async () => {
      try {
        setIsLoading(true);
        const data = await getMockStripeTaxData();
        setTaxData(data);
      } catch {
        setError('Failed to load tax data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaxData();
  }, [selectedPeriod]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#F7F2EC] rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !taxData) {
    return (
      <div className="bg-[#F7F2EC] rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p>{error || 'Failed to load Stripe tax data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F2EC] rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stripe Tax Dashboard</h2>
          <p className="text-gray-600">Automated tax calculation and compliance powered by Stripe</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open('https://dashboard.stripe.com/tax', '_blank')}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Stripe Dashboard</span>
          </button>
          <button
            onClick={() => window.location.reload()}
            title="Refresh tax data"
            className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Account Status */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Account Status</h3>
              <p className="text-sm text-gray-600">Stripe Tax is {taxData.accountStatus}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            taxData.accountStatus === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {taxData.accountStatus.charAt(0).toUpperCase() + taxData.accountStatus.slice(1)}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-500">This Month</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${taxData.monthlySummary.totalTaxCollected.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Tax Collected</div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <span className="text-sm text-gray-500">This Month</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {taxData.monthlySummary.totalTransactions}
          </div>
          <div className="text-sm text-gray-600">Taxable Transactions</div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-purple-500" />
            <span className="text-sm text-gray-500">Next Filing</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {new Date(taxData.complianceStatus.nextFilingDate).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-600">Tax Filing Due Date</div>
        </div>
      </div>

      {/* Tax Rates */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configured Tax Rates</h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jurisdiction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Effective Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taxData.taxRates.map((rate) => (
                  <tr key={rate.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rate.displayName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rate.percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rate.jurisdiction}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(rate.effectiveDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tax Transactions</h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taxData.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                      <div className="text-sm text-gray-500">{transaction.jurisdiction}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.taxAmount.toFixed(2)} ({transaction.taxRate}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1">{transaction.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Compliance Status */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${taxData.complianceStatus.nexEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <div className="font-medium text-gray-900">Nexus Registration</div>
              <div className="text-sm text-gray-600">
                {taxData.complianceStatus.nexEnabled ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              taxData.complianceStatus.registrationStatus === 'registered' ? 'bg-green-500' : 
              taxData.complianceStatus.registrationStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <div>
              <div className="font-medium text-gray-900">Registration Status</div>
              <div className="text-sm text-gray-600 capitalize">
                {taxData.complianceStatus.registrationStatus.replace('_', ' ')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <div className="font-medium text-gray-900">Next Filing Date</div>
              <div className="text-sm text-gray-600">
                {new Date(taxData.complianceStatus.nextFilingDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Powered by Stripe Tax</p>
            <p>
              Stripe Tax automatically calculates, collects, and remits sales tax for your transactions. 
              Tax rates are updated in real-time based on your customer's location and product type.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeTaxDashboard;
