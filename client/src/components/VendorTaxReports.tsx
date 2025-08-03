import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TaxSummary {
  currentYear: {
    year: number;
    grossAmount: number;
    platformFees: number;
    netAmount: number;
    transactionCount: number;
    requires1099K: boolean;
    thresholdRemaining: number;
  };
  previousYear: {
    year: number;
    grossAmount: number;
    platformFees: number;
    netAmount: number;
    transactionCount: number;
    requires1099K: boolean;
  };
  threshold: number;
}

interface TaxReportData {
  vendorId: string;
  year: number;
  totalGrossAmount: number;
  totalPlatformFees: number;
  totalNetAmount: number;
  transactionCount: number;
  requires1099K: boolean;
  monthlyBreakdown: {
    month: number;
    grossAmount: number;
    platformFees: number;
    netAmount: number;
    transactionCount: number;
  }[];
}

const VendorTaxReports: React.FC<{ vendorId: string }> = ({ vendorId }) => {
  const { user } = useAuth();
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGenerating1099K, setIsGenerating1099K] = useState(false);

  const fetchTaxSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const response = await axios.get(`/api/tax-reports/${vendorId}/summary`, {
        withCredentials: true
      });
      setTaxSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching tax summary:', error);
      toast.error('Failed to load tax summary');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchTaxSummary();
  }, [vendorId]);

  const generateTaxReport = async (format: 'json' | 'pdf' | 'csv') => {
    setIsGeneratingReport(true);
    try {
      const response = await axios.get(`/api/tax-reports/${vendorId}/${selectedYear}?format=${format}`, {
        withCredentials: true,
        responseType: format === 'json' ? 'json' : 'blob'
      });

      if (format === 'json') {
        // Display JSON data in a new tab
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write('<pre>' + JSON.stringify(response.data.data, null, 2) + '</pre>');
        }
      } else {
        // Download file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `tax-report-${selectedYear}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

      toast.success(`Tax report generated successfully (${format.toUpperCase()})`);
    } catch (error) {
      console.error('Error generating tax report:', error);
      toast.error('Failed to generate tax report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateForm1099K = async (format: 'pdf' | 'json') => {
    setIsGenerating1099K(true);
    try {
      const response = await axios.get(`/api/tax-reports/${vendorId}/${selectedYear}/1099k?format=${format}`, {
        withCredentials: true,
        responseType: format === 'json' ? 'json' : 'blob'
      });

      if (format === 'json') {
        // Display JSON data in a new tab
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write('<pre>' + JSON.stringify(response.data.data, null, 2) + '</pre>');
        }
      } else {
        // Download PDF
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `form-1099k-${selectedYear}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

      toast.success('1099-K form generated successfully');
    } catch (error: any) {
      console.error('Error generating 1099-K form:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to generate 1099-K form');
      }
    } finally {
      setIsGenerating1099K(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year);
    }
    return years;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to access tax reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Reports & 1099-K Forms</h1>
          <p className="text-gray-600">Generate tax reports and 1099-K forms for your business</p>
        </div>
        <button
          onClick={fetchTaxSummary}
          disabled={isLoadingSummary}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingSummary ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tax Summary Dashboard */}
      {taxSummary && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Year Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Year ({taxSummary.currentYear.year})</h3>
              {taxSummary.currentYear.requires1099K ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">1099-K Required</span>
                </div>
              ) : (
                <div className="flex items-center text-yellow-600">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">
                    ${formatCurrency(taxSummary.currentYear.thresholdRemaining)} to threshold
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Gross Amount:</span>
                <span className="font-semibold">{formatCurrency(taxSummary.currentYear.grossAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fees:</span>
                <span className="font-semibold">{formatCurrency(taxSummary.currentYear.platformFees)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-900 font-medium">Net Amount:</span>
                <span className="font-bold text-green-600">{formatCurrency(taxSummary.currentYear.netAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transactions:</span>
                <span className="font-semibold">{taxSummary.currentYear.transactionCount}</span>
              </div>
            </div>
          </div>

          {/* Previous Year Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Previous Year ({taxSummary.previousYear.year})</h3>
              {taxSummary.previousYear.requires1099K ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">1099-K Required</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <Info className="w-4 h-4 mr-1" />
                  <span className="text-sm">Below threshold</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Gross Amount:</span>
                <span className="font-semibold">{formatCurrency(taxSummary.previousYear.grossAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fees:</span>
                <span className="font-semibold">{formatCurrency(taxSummary.previousYear.platformFees)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-900 font-medium">Net Amount:</span>
                <span className="font-bold text-green-600">{formatCurrency(taxSummary.previousYear.netAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transactions:</span>
                <span className="font-semibold">{taxSummary.previousYear.transactionCount}</span>
              </div>
            </div>

            {/* Year-over-year comparison */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">YoY Change:</span>
                <div className="flex items-center">
                  {taxSummary.currentYear.grossAmount > taxSummary.previousYear.grossAmount ? (
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    taxSummary.currentYear.grossAmount > taxSummary.previousYear.grossAmount 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(taxSummary.currentYear.grossAmount - taxSummary.previousYear.grossAmount))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h3>
        
        <div className="flex items-center space-x-4 mb-6">
          <label className="text-sm font-medium text-gray-700">Select Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            aria-label="Select year for tax report generation"
          >
            {getYearOptions().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tax Report Generation */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-gray-900">Tax Report</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Generate comprehensive tax reports with monthly breakdowns and annual summaries.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => generateTaxReport('pdf')}
                disabled={isGeneratingReport}
                className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingReport ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                onClick={() => generateTaxReport('csv')}
                disabled={isGeneratingReport}
                className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingReport ? 'Generating...' : 'Download CSV'}
              </button>
              <button
                onClick={() => generateTaxReport('json')}
                disabled={isGeneratingReport}
                className="w-full flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {isGeneratingReport ? 'Generating...' : 'View JSON'}
              </button>
            </div>
          </div>

          {/* 1099-K Form Generation */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FileText className="w-5 h-5 text-red-600 mr-2" />
              <h4 className="font-medium text-gray-900">Form 1099-K</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Generate IRS Form 1099-K for payment card and third-party network transactions.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => generateForm1099K('pdf')}
                disabled={isGenerating1099K}
                className="w-full flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating1099K ? 'Generating...' : 'Download 1099-K PDF'}
              </button>
              <button
                onClick={() => generateForm1099K('json')}
                disabled={isGenerating1099K}
                className="w-full flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {isGenerating1099K ? 'Generating...' : 'View 1099-K Data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Important Tax Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 1099-K forms are required when gross payments exceed ${formatCurrency(taxSummary?.threshold || 5000)}</li>
              <li>• Tax reports include all platform fees and transaction details</li>
              <li>• Keep copies of all tax documents for your records</li>
              <li>• Consult with a tax professional for specific tax advice</li>
              <li>• Platform fees are deductible business expenses</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingSummary && (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mr-2" />
          <span className="text-gray-600">Loading tax summary...</span>
        </div>
      )}
    </div>
  );
};

export default VendorTaxReports; 