import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Share, 
  Save, 
  Play, 
  Pause, 
  Settings, 
  Filter,
  BarChart3,
  LineChart,
  PieChart,
  Table,
  Calendar,
  Users,
  DollarSign,
  Target,
  Mail,
  MessageSquare,
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  MoreVertical,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'table' | 'chart' | 'dashboard' | 'export';
  category: 'sales' | 'customers' | 'marketing' | 'finance' | 'operations';
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  isPublic: boolean;
  isScheduled: boolean;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    recipients: string[];
  };
  data: {
    source: string;
    filters: {
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
      value: any;
    }[];
    groupBy: string[];
    orderBy: {
      field: string;
      direction: 'asc' | 'desc';
    }[];
    limit?: number;
  };
  visualization: {
    chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table';
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
    showLegend: boolean;
    showDataLabels: boolean;
  };
  permissions: {
    canView: string[];
    canEdit: string[];
    canDelete: string[];
  };
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
  nextRun?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'customers' | 'marketing' | 'finance' | 'operations';
  type: 'table' | 'chart' | 'dashboard' | 'export';
  isPopular: boolean;
  data: any;
  visualization: any;
  createdAt: string;
}

interface ReportsBuilderProps {
  reports: Report[];
  templates: ReportTemplate[];
  onReportCreate: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onReportUpdate: (report: Report) => void;
  onReportDelete: (reportId: string) => void;
  onReportRun: (reportId: string) => void;
  onReportSchedule: (reportId: string, schedule: any) => void;
}

const ReportsBuilder: React.FC<ReportsBuilderProps> = ({
  reports,
  templates,
  onReportCreate,
  onReportUpdate,
  onReportDelete,
  onReportRun,
  onReportSchedule,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    status: '',
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  const [newReport, setNewReport] = useState<Partial<Report>>({
    name: '',
    description: '',
    type: 'table',
    category: 'sales',
    status: 'draft',
    isPublic: false,
    isScheduled: false,
    data: {
      source: 'opportunities',
      filters: [],
      groupBy: [],
      orderBy: [],
    },
    visualization: {
      chartType: 'table',
      showLegend: true,
      showDataLabels: false,
    },
    permissions: {
      canView: [],
      canEdit: [],
      canDelete: [],
    },
  });

  const queryClient = useQueryClient();

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filters.category === '' || report.category === filters.category;
    const matchesType = filters.type === '' || report.type === filters.type;
    const matchesStatus = filters.status === '' || report.status === filters.status;

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Handle create report
  const handleCreate = () => {
    if (!newReport.name || !newReport.description) return;

    const report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'> = {
      name: newReport.name,
      description: newReport.description,
      type: newReport.type || 'table',
      category: newReport.category || 'sales',
      status: newReport.status || 'draft',
      isPublic: newReport.isPublic || false,
      isScheduled: newReport.isScheduled || false,
      schedule: newReport.schedule,
      data: newReport.data || {
        source: 'opportunities',
        filters: [],
        groupBy: [],
        orderBy: [],
      },
      visualization: newReport.visualization || {
        chartType: 'table',
        showLegend: true,
        showDataLabels: false,
      },
      permissions: newReport.permissions || {
        canView: [],
        canEdit: [],
        canDelete: [],
      },
    };

    onReportCreate(report);
    setIsCreating(false);
    setNewReport({
      name: '',
      description: '',
      type: 'table',
      category: 'sales',
      status: 'draft',
      isPublic: false,
      isScheduled: false,
      data: {
        source: 'opportunities',
        filters: [],
        groupBy: [],
        orderBy: [],
      },
      visualization: {
        chartType: 'table',
        showLegend: true,
        showDataLabels: false,
      },
      permissions: {
        canView: [],
        canEdit: [],
        canDelete: [],
      },
    });
  };

  // Handle update report
  const handleUpdate = () => {
    if (!editingReport) return;

    const updatedReport = {
      ...editingReport,
      updatedAt: new Date().toISOString(),
    };

    onReportUpdate(updatedReport);
    setEditingReport(null);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      archived: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      sales: 'bg-blue-100 text-blue-800',
      customers: 'bg-green-100 text-green-800',
      marketing: 'bg-purple-100 text-purple-800',
      finance: 'bg-yellow-100 text-yellow-800',
      operations: 'bg-orange-100 text-orange-800',
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      table: <Table className="h-4 w-4" />,
      chart: <BarChart3 className="h-4 w-4" />,
      dashboard: <BarChart3 className="h-4 w-4" />,
      export: <Download className="h-4 w-4" />,
    };
    return iconMap[type] || <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports Builder</h2>
          <p className="text-gray-600">Create and manage custom reports and dashboards</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Copy className="h-4 w-4" />
            <span>Templates</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Table className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Create Report</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="sales">Sales</option>
              <option value="customers">Customers</option>
              <option value="marketing">Marketing</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="table">Table</option>
              <option value="chart">Chart</option>
              <option value="dashboard">Dashboard</option>
              <option value="export">Export</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Run
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getTypeIcon(report.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.name}</div>
                          <div className="text-sm text-gray-500">{report.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(report.category)}`}>
                        {report.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.lastRun ? 
                        new Date(report.lastRun).toLocaleDateString() : 
                        'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onReportRun(report.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingReport(report)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onReportDelete(report.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getTypeIcon(report.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingReport(report)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onReportDelete(report.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {report.type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(report.category)}`}>
                    {report.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Run:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {report.lastRun ? 
                      new Date(report.lastRun).toLocaleDateString() : 
                      'Never'
                    }
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => onReportRun(report.id)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  <Play className="h-3 w-3" />
                  <span>Run</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  <Eye className="h-3 w-3" />
                  <span>View</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  <Download className="h-3 w-3" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Report Templates</h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      {template.isPopular && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowTemplates(false);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || editingReport) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {isCreating ? 'Create New Report' : 'Edit Report'}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Name *</label>
                  <input
                    type="text"
                    value={isCreating ? newReport.name : editingReport?.name || ''}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewReport({ ...newReport, name: e.target.value });
                      } else if (editingReport) {
                        setEditingReport({ ...editingReport, name: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={isCreating ? newReport.category : editingReport?.category || 'sales'}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewReport({ ...newReport, category: e.target.value as any });
                      } else if (editingReport) {
                        setEditingReport({ ...editingReport, category: e.target.value as any });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sales">Sales</option>
                    <option value="customers">Customers</option>
                    <option value="marketing">Marketing</option>
                    <option value="finance">Finance</option>
                    <option value="operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={isCreating ? newReport.description : editingReport?.description || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewReport({ ...newReport, description: e.target.value });
                    } else if (editingReport) {
                      setEditingReport({ ...editingReport, description: e.target.value });
                    }
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter report description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select
                    value={isCreating ? newReport.type : editingReport?.type || 'table'}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewReport({ ...newReport, type: e.target.value as any });
                      } else if (editingReport) {
                        setEditingReport({ ...editingReport, type: e.target.value as any });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="table">Table</option>
                    <option value="chart">Chart</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="export">Export</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={isCreating ? newReport.status : editingReport?.status || 'draft'}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewReport({ ...newReport, status: e.target.value as any });
                      } else if (editingReport) {
                        setEditingReport({ ...editingReport, status: e.target.value as any });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
                <select
                  value={isCreating ? newReport.data?.source : editingReport?.data?.source || 'opportunities'}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewReport({ 
                        ...newReport, 
                        data: { ...newReport.data, source: e.target.value }
                      });
                    } else if (editingReport) {
                      setEditingReport({ 
                        ...editingReport, 
                        data: { ...editingReport.data, source: e.target.value }
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="opportunities">Opportunities</option>
                  <option value="customers">Customers</option>
                  <option value="campaigns">Email Campaigns</option>
                  <option value="communications">Communications</option>
                  <option value="automation">Automation Rules</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isCreating ? newReport.isPublic : editingReport?.isPublic || false}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewReport({ ...newReport, isPublic: e.target.checked });
                      } else if (editingReport) {
                        setEditingReport({ ...editingReport, isPublic: e.target.checked });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Public Report</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isCreating ? newReport.isScheduled : editingReport?.isScheduled || false}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewReport({ ...newReport, isScheduled: e.target.checked });
                      } else if (editingReport) {
                        setEditingReport({ ...editingReport, isScheduled: e.target.checked });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Scheduled Report</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingReport(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={isCreating ? handleCreate : handleUpdate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                <span>{isCreating ? 'Create Report' : 'Update Report'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsBuilder;


