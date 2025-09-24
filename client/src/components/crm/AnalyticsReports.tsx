import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Settings,
  Filter,
  Search,
  FileText,
  PieChart,
  LineChart,
  Activity,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
  X
} from 'lucide-react';

interface AnalyticsData {
  customers: { total: number; growth: number };
  sales: { 
    pipelineValue: number; 
    conversionRate: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  performance: {
    customerSatisfaction: number;
    responseTime: number;
  };
}

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'customer' | 'performance' | 'custom';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';
  createdAt: string;
  lastRun?: string;
  schedule?: string;
  createdBy: string;
}

interface ExportJob {
  id: string;
  name: string;
  type: 'customers' | 'opportunities' | 'tasks' | 'analytics';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: 'csv' | 'xlsx' | 'pdf';
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

interface AnalyticsReportsProps {
  analytics: AnalyticsData;
  reports: Report[];
  onReportCreate: (report: Partial<Report>) => void;
  onReportUpdate: (report: Report) => void;
  onReportDelete: (id: string) => void;
  onReportRun: (id: string) => void;
  onExportCreate: (exportJob: Partial<ExportJob>) => void;
  onExportRun: (id: string) => void;
  onTimeRangeChange: (range: string) => void;
  timeRange: string;
  isLoading: boolean;
}

const AnalyticsReports: React.FC<AnalyticsReportsProps> = ({
  analytics,
  reports,
  onReportCreate,
  onReportUpdate,
  onReportDelete,
  onReportRun,
  onExportCreate,
  onExportRun,
  onTimeRangeChange,
  timeRange,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports' | 'export'>('analytics');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportDetails, setShowReportDetails] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sales': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'performance': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-600">Track performance and generate insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
          
          <button
            onClick={() => {
              if (activeTab === 'reports') onReportCreate({});
              else if (activeTab === 'export') onExportCreate({});
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {activeTab === 'reports' ? 'Create Report' : activeTab === 'export' ? 'Create Export' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
            { id: 'reports', label: 'Reports', icon: FileText, count: reports.length },
            { id: 'export', label: 'Data Export', icon: Download }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Analytics Dashboard */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics?.sales?.totalRevenue || 0)}
                  </p>
                  <p className="text-sm text-green-600">+12.5% from last month</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics?.sales?.pipelineValue || 0)}
                  </p>
                  <p className="text-sm text-blue-600">+8.2% from last month</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.sales?.conversionRate?.toFixed(1) || 0}%
                  </p>
                  <p className="text-sm text-purple-600">+2.1% from last month</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.performance?.customerSatisfaction || 0}/5
                  </p>
                  <p className="text-sm text-yellow-600">+0.3 from last month</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <LineChart className="h-12 w-12" />
                <span className="ml-2">Chart will be implemented</span>
              </div>
            </div>

            {/* Customer Distribution Chart */}
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Customer Distribution</h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <PieChart className="h-12 w-12" />
                <span className="ml-2">Chart will be implemented</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics?.sales?.averageOrderValue || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.performance?.responseTime || 0}h
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.customers?.total || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Reports Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={reportTypeFilter}
                onChange={(e) => setReportTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="sales">Sales</option>
                <option value="customer">Customer</option>
                <option value="performance">Performance</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Reports List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                  style={{ backgroundColor: '#F7F2EC' }}
                  onClick={() => {
                    setSelectedReport(report);
                    setShowReportDetails(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                        {report.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        Created {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReportRun(report.id);
                        }}
                        className="p-2 text-green-600 hover:text-green-700 transition-colors"
                        title="Run Report"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReportUpdate(report);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit Report"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                          setShowReportDetails(true);
                        }}
                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Data Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="text-center py-12">
            <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Export</h3>
            <p className="text-gray-600 mb-4">Export your CRM data in various formats</p>
            <button
              onClick={() => onExportCreate({})}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="h-4 w-4" />
              Create Export
            </button>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showReportDetails && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedReport.name}</h2>
                <button
                  onClick={() => setShowReportDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Report Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Type:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedReport.type)}`}>
                        {selectedReport.type}
                      </span>
                    </p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                        {selectedReport.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Created:</span> {new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                    {selectedReport.lastRun && (
                      <p><span className="font-medium">Last Run:</span> {new Date(selectedReport.lastRun).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
                  {selectedReport.schedule ? (
                    <p className="text-gray-700">{selectedReport.schedule}</p>
                  ) : (
                    <p className="text-gray-500">No schedule set</p>
                  )}
                </div>
              </div>
              
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700">{selectedReport.description}</p>
              </div>
              
              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      onReportRun(selectedReport.id);
                      setShowReportDetails(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    Run Report
                  </button>
                  <button
                    onClick={() => onReportUpdate(selectedReport)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsReports;
