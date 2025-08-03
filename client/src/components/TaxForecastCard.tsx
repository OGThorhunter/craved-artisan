import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  AlertTriangle, CheckCircle, DollarSign, Calendar, Clock,
  TrendingUp, TrendingDown, FileText, Bell, Calculator,
  RefreshCw, Info, AlertCircle, CheckSquare, Square
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TaxProjection {
  quarter: string;
  year: number;
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalCogs: number;
  totalExpenses: number;
  netIncome: number;
  estimatedTax: number;
  selfEmploymentTax: number;
  incomeTax: number;
  dueDate: Date;
  status: 'upcoming' | 'overdue' | 'paid' | 'estimated';
  daysUntilDue: number;
  alertLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

interface TaxSummary {
  totalUpcoming: number;
  totalOverdue: number;
  overdueCount: number;
  upcomingCount: number;
  nextDueDate: Date | null;
  nextDueAmount: number | null;
  currentQuarterProjection: TaxProjection | null;
}

interface TaxForecastCardProps {
  vendorId: string;
  className?: string;
}

const TaxForecastCard: React.FC<TaxForecastCardProps> = ({
  vendorId,
  className = ''
}) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [obligations, setObligations] = useState<TaxProjection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');

  const fetchTaxData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [summaryResponse, obligationsResponse] = await Promise.all([
        axios.get(`/api/tax-projection/vendor/${vendorId}/summary`, {
          withCredentials: true
        }),
        axios.get(`/api/tax-projection/vendor/${vendorId}/obligations`, {
          withCredentials: true
        })
      ]);

      setSummary(summaryResponse.data.summary);
      setObligations(obligationsResponse.data.obligations);
    } catch (err: any) {
      console.error('Error fetching tax data:', err);
      setError(err.response?.data?.message || 'Failed to load tax data');
      toast.error('Failed to load tax forecast');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchTaxData();
    }
  }, [vendorId]);

  const sendReminder = async (quarter: string, year: number) => {
    try {
      await axios.post(`/api/tax-projection/vendor/${vendorId}/reminder`, {
        quarter,
        year
      }, { withCredentials: true });

      toast.success('Tax reminder sent successfully');
    } catch (err: any) {
      console.error('Error sending reminder:', err);
      toast.error('Failed to send reminder');
    }
  };

  const confirmPayment = async (quarter: string, year: number, amount: number) => {
    try {
      await axios.post(`/api/tax-projection/vendor/${vendorId}/confirm-payment`, {
        quarter,
        year,
        paidAmount: amount
      }, { withCredentials: true });

      toast.success('Payment confirmed successfully');
      fetchTaxData(); // Refresh data
    } catch (err: any) {
      console.error('Error confirming payment:', err);
      toast.error('Failed to confirm payment');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'upcoming': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'paid': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Calculator className="w-8 h-8 mx-auto mb-2" />
          <p>Please log in to view tax forecast</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading tax forecast...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Tax Forecast Error</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <button
            onClick={fetchTaxData}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Calculator className="w-8 h-8 mx-auto mb-2" />
          <p>No tax data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tax Forecast</h3>
              <p className="text-sm text-gray-500">Quarterly tax obligations</p>
            </div>
          </div>
          <button
            onClick={fetchTaxData}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh tax data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Upcoming */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Upcoming</span>
            </div>
            <div className="text-xl font-bold text-blue-900">
              {formatCurrency(summary.totalUpcoming)}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {summary.upcomingCount} obligation{summary.upcomingCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Total Overdue */}
          {summary.totalOverdue > 0 && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Overdue</span>
              </div>
              <div className="text-xl font-bold text-red-900">
                {formatCurrency(summary.totalOverdue)}
              </div>
              <p className="text-xs text-red-700 mt-1">
                {summary.overdueCount} obligation{summary.overdueCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Next Due */}
          {summary.nextDueDate && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Next Due</span>
              </div>
              <div className="text-xl font-bold text-yellow-900">
                {formatCurrency(summary.nextDueAmount || 0)}
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                {formatDate(summary.nextDueDate)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Current Quarter Projection */}
      {summary.currentQuarterProjection && (
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Current Quarter ({summary.currentQuarterProjection.quarter} {summary.currentQuarterProjection.year})</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="font-semibold text-gray-900">{formatCurrency(summary.currentQuarterProjection.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Net Income</p>
                <p className="font-semibold text-gray-900">{formatCurrency(summary.currentQuarterProjection.netIncome)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Tax</p>
                <p className="font-semibold text-gray-900">{formatCurrency(summary.currentQuarterProjection.estimatedTax)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-semibold text-gray-900">{formatDate(summary.currentQuarterProjection.dueDate)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Obligations */}
      <div className="p-6">
        <h4 className="font-medium text-gray-900 mb-4">Upcoming Obligations</h4>
        <div className="space-y-3">
          {obligations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming tax obligations</p>
          ) : (
            obligations.map((obligation, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(obligation.status)}`}>
                      {obligation.status === 'overdue' && <AlertTriangle className="w-3 h-3" />}
                      {obligation.status === 'upcoming' && <Clock className="w-3 h-3" />}
                      {obligation.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                      <span>{obligation.status.charAt(0).toUpperCase() + obligation.status.slice(1)}</span>
                    </div>
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getAlertLevelColor(obligation.alertLevel)}`}>
                      {getAlertIcon(obligation.alertLevel)}
                      <span>{obligation.alertLevel.charAt(0).toUpperCase() + obligation.alertLevel.slice(1)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(obligation.estimatedTax)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {obligation.quarter} {obligation.year}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600">Revenue</p>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(obligation.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Net Income</p>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(obligation.netIncome)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Due Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(obligation.dueDate)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {obligation.daysUntilDue > 0 ? (
                      <span>{obligation.daysUntilDue} days until due</span>
                    ) : obligation.daysUntilDue < 0 ? (
                      <span className="text-red-600">{Math.abs(obligation.daysUntilDue)} days overdue</span>
                    ) : (
                      <span className="text-yellow-600">Due today</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {obligation.status === 'upcoming' && (
                      <button
                        onClick={() => sendReminder(obligation.quarter, obligation.year)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <Bell className="w-3 h-3 inline mr-1" />
                        Remind
                      </button>
                    )}
                    {obligation.status === 'overdue' && (
                      <button
                        onClick={() => confirmPayment(obligation.quarter, obligation.year, obligation.estimatedTax)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <CheckSquare className="w-3 h-3 inline mr-1" />
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxForecastCard; 