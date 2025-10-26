import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';

interface ExportJob {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'scheduled' | 'automated';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  dataSource: string;
  format: 'csv' | 'xlsx' | 'json' | 'pdf' | 'xml';
  filters: {
    field: string;
    operator: string;
    value: any;
  }[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    timezone: string;
  };
  destination: {
    type: 'email' | 'ftp' | 's3' | 'webhook' | 'local';
    config: any;
  };
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  fileSize?: number;
  downloadUrl?: string;
}

interface Integration {
  id: string;
  name: string;
  type: 'crm' | 'email' | 'analytics' | 'storage' | 'webhook' | 'api';
  status: 'active' | 'inactive' | 'error' | 'pending';
  description: string;
  icon: string;
  config: any;
  lastSync?: string;
  nextSync?: string;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DataExportProps {
  exportJobs: ExportJob[];
  integrations: Integration[];
  onExportCreate: (exportJob: Omit<ExportJob, 'id' | 'createdAt' | 'progress'>) => void;
  onExportUpdate: (exportJob: ExportJob) => void;
  onExportDelete: (exportJobId: string) => void;
  onExportRun: (exportJobId: string) => void;
  onExportCancel: (exportJobId: string) => void;
  onIntegrationCreate: (integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onIntegrationUpdate: (integration: Integration) => void;
  onIntegrationDelete: (integrationId: string) => void;
  onIntegrationSync: (integrationId: string) => void;
}

const DataExport: React.FC<DataExportProps> = ({
  exportJobs,
  integrations,
  onExportCreate,
  onExportUpdate,
  onExportDelete,
  onExportRun,
  onExportCancel,
  onIntegrationCreate,
  onIntegrationUpdate,
  onIntegrationDelete,
  onIntegrationSync,
}) => {
  const [activeTab, setActiveTab] = useState<'exports' | 'integrations'>('exports');
  const [isCreatingExport, setIsCreatingExport] = useState(false);
  const [isCreatingIntegration, setIsCreatingIntegration] = useState(false);
  const [editingExport, setEditingExport] = useState<ExportJob | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    format: '',
  });

  const [newExport, setNewExport] = useState<Partial<ExportJob>>({
    name: '',
    description: '',
    type: 'manual',
    dataSource: 'opportunities',
    format: 'csv',
    filters: [],
    destination: {
      type: 'email',
      config: {},
    },
  });

  const [newIntegration, setNewIntegration] = useState<Partial<Integration>>({
    name: '',
    type: 'crm',
    description: '',
    syncFrequency: 'daily',
    isEnabled: true,
    config: {},
  });

  const queryClient = useQueryClient();

  // Filter exports
  const filteredExports = exportJobs.filter(exportJob => {
    const matchesSearch = searchTerm === '' || 
      exportJob.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exportJob.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filters.status === '' || exportJob.status === filters.status;
    const matchesType = filters.type === '' || exportJob.type === filters.type;
    const matchesFormat = filters.format === '' || exportJob.format === filters.format;

    return matchesSearch && matchesStatus && matchesType && matchesFormat;
  });

  // Filter integrations
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = searchTerm === '' || 
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Handle create export
  const handleCreateExport = () => {
    if (!newExport.name || !newExport.description) return;

    const exportJob: Omit<ExportJob, 'id' | 'createdAt' | 'progress'> = {
      name: newExport.name,
      description: newExport.description,
      type: newExport.type || 'manual',
      status: 'pending',
      dataSource: newExport.dataSource || 'opportunities',
      format: newExport.format || 'csv',
      filters: newExport.filters || [],
      schedule: newExport.schedule,
      destination: newExport.destination || {
        type: 'email',
        config: {},
      },
    };

    onExportCreate(exportJob);
    setIsCreatingExport(false);
    setNewExport({
      name: '',
      description: '',
      type: 'manual',
      dataSource: 'opportunities',
      format: 'csv',
      filters: [],
      destination: {
        type: 'email',
        config: {},
      },
    });
  };

  // Handle create integration
  const handleCreateIntegration = () => {
    if (!newIntegration.name || !newIntegration.description) return;

    const integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'> = {
      name: newIntegration.name,
      description: newIntegration.description,
      type: newIntegration.type || 'crm',
      status: 'pending',
      icon: '',
      config: newIntegration.config || {},
      syncFrequency: newIntegration.syncFrequency || 'daily',
      isEnabled: newIntegration.isEnabled || true,
    };

    onIntegrationCreate(integration);
    setIsCreatingIntegration(false);
    setNewIntegration({
      name: '',
      type: 'crm',
      description: '',
      syncFrequency: 'daily',
      isEnabled: true,
      config: {},
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      pending: <AppIcon name="clock" className="h-4 w-4" />,
      running: <AppIcon name="refresh" className="h-4 w-4 animate-spin" />,
      completed: <AppIcon name="check-circle" className="h-4 w-4" />,
      failed: <AppIcon name="x-circle" className="h-4 w-4" />,
      cancelled: <AppIcon name="x-circle" className="h-4 w-4" />,
      active: <AppIcon name="check-circle" className="h-4 w-4" />,
      inactive: <AppIcon name="pause" className="h-4 w-4" />,
      error: <AppIcon name="alert-circle" className="h-4 w-4" />,
    };
    return iconMap[status] || <AppIcon name="clock" className="h-4 w-4" />;
  };

  // Get format icon
  const getFormatIcon = (format: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      csv: <AppIcon name="file-csv" className="h-4 w-4" />,
      xlsx: <AppIcon name="file-xlsx" className="h-4 w-4" />,
      json: <AppIcon name="file-json" className="h-4 w-4" />,
      pdf: <AppIcon name="file-pdf" className="h-4 w-4" />,
      xml: <AppIcon name="file" className="h-4 w-4" />,
    };
    return iconMap[format] || <AppIcon name="file" className="h-4 w-4" />;
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      crm: <AppIcon name="users" className="h-4 w-4" />,
      email: <AppIcon name="mail" className="h-4 w-4" />,
      analytics: <AppIcon name="bar-chart" className="h-4 w-4" />,
      storage: <AppIcon name="hard-drive" className="h-4 w-4" />,
      webhook: <AppIcon name="zap" className="h-4 w-4" />,
      api: <AppIcon name="link" className="h-4 w-4" />,
    };
    return iconMap[type] || <AppIcon name="database" className="h-4 w-4" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Export & Integration</h2>
          <p className="text-gray-600">Manage data exports and third-party integrations</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('exports')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'exports' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Exports
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'integrations' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Integrations
            </button>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'exports') {
                setIsCreatingExport(true);
              } else {
                setIsCreatingIntegration(true);
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <AppIcon name="plus" className="h-4 w-4" />
            <span>Create {activeTab === 'exports' ? 'Export' : 'Integration'}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <AppIcon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {activeTab === 'exports' && (
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="manual">Manual</option>
                <option value="scheduled">Scheduled</option>
                <option value="automated">Automated</option>
              </select>
              <select
                value={filters.format}
                onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Formats</option>
                <option value="csv">CSV</option>
                <option value="xlsx">Excel</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF</option>
                <option value="xml">XML</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Exports Tab */}
      {activeTab === 'exports' && (
        <div className="space-y-4">
          {filteredExports.map((exportJob) => (
            <div key={exportJob.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getFormatIcon(exportJob.format)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{exportJob.name}</h3>
                    <p className="text-sm text-gray-600">{exportJob.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(exportJob.status)}`}>
                    {exportJob.status}
                  </span>
                  <button
                    onClick={() => setEditingExport(exportJob)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <AppIcon name="edit" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onExportDelete(exportJob.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <AppIcon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Data Source</p>
                  <p className="text-sm font-medium text-gray-900">{exportJob.dataSource}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Format</p>
                  <p className="text-sm font-medium text-gray-900">{exportJob.format.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="text-sm font-medium text-gray-900">{exportJob.type}</p>
                </div>
              </div>

              {exportJob.status === 'running' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-gray-900">
                      {exportJob.progress.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportJob.progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Created: {new Date(exportJob.createdAt).toLocaleDateString()}</span>
                  {exportJob.completedAt && (
                    <span>Completed: {new Date(exportJob.completedAt).toLocaleDateString()}</span>
                  )}
                  {exportJob.fileSize && (
                    <span>Size: {formatFileSize(exportJob.fileSize)}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {exportJob.status === 'pending' && (
                    <button
                      onClick={() => onExportRun(exportJob.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      <AppIcon name="play" className="h-3 w-3" />
                      <span>Run</span>
                    </button>
                  )}
                  {exportJob.status === 'running' && (
                    <button
                      onClick={() => onExportCancel(exportJob.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      <AppIcon name="stop" className="h-3 w-3" />
                      <span>Cancel</span>
                    </button>
                  )}
                  {exportJob.status === 'completed' && exportJob.downloadUrl && (
                    <button
                      onClick={() => window.open(exportJob.downloadUrl, '_blank')}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <AppIcon name="download" className="h-3 w-3" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <div key={integration.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getTypeIcon(integration.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </span>
                  <button
                    onClick={() => setEditingIntegration(integration)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <AppIcon name="edit" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium text-gray-900">{integration.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sync Frequency:</span>
                  <span className="text-sm font-medium text-gray-900">{integration.syncFrequency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Sync:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {integration.lastSync ? 
                      new Date(integration.lastSync).toLocaleDateString() : 
                      'Never'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Next Sync:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {integration.nextSync ? 
                      new Date(integration.nextSync).toLocaleDateString() : 
                      'Not scheduled'
                    }
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={integration.isEnabled}
                      onChange={(e) => {
                        const updated = { ...integration, isEnabled: e.target.checked };
                        onIntegrationUpdate(updated);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Enabled</span>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onIntegrationSync(integration.id)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <AppIcon name="refresh" className="h-3 w-3" />
                    <span>Sync</span>
                  </button>
                  <button
                    onClick={() => onIntegrationDelete(integration.id)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Export Modal */}
      {isCreatingExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Create New Export</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Export Name *</label>
                  <input
                    type="text"
                    value={newExport.name}
                    onChange={(e) => setNewExport({ ...newExport, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter export name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newExport.type}
                    onChange={(e) => setNewExport({ ...newExport, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="manual">Manual</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="automated">Automated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newExport.description}
                  onChange={(e) => setNewExport({ ...newExport, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter export description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
                  <select
                    value={newExport.dataSource}
                    onChange={(e) => setNewExport({ ...newExport, dataSource: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="opportunities">Opportunities</option>
                    <option value="customers">Customers</option>
                    <option value="campaigns">Email Campaigns</option>
                    <option value="communications">Communications</option>
                    <option value="automation">Automation Rules</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <select
                    value={newExport.format}
                    onChange={(e) => setNewExport({ ...newExport, format: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="csv">CSV</option>
                    <option value="xlsx">Excel</option>
                    <option value="json">JSON</option>
                    <option value="pdf">PDF</option>
                    <option value="xml">XML</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                <select
                  value={newExport.destination?.type}
                  onChange={(e) => setNewExport({ 
                    ...newExport, 
                    destination: { ...newExport.destination, type: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="ftp">FTP</option>
                  <option value="s3">Amazon S3</option>
                  <option value="webhook">Webhook</option>
                  <option value="local">Local Download</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
              <button
                onClick={() => setIsCreatingExport(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateExport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <AppIcon name="download" className="h-4 w-4" />
                <span>Create Export</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Integration Modal */}
      {isCreatingIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Create New Integration</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Integration Name *</label>
                  <input
                    type="text"
                    value={newIntegration.name}
                    onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter integration name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newIntegration.type}
                    onChange={(e) => setNewIntegration({ ...newIntegration, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="crm">CRM</option>
                    <option value="email">Email</option>
                    <option value="analytics">Analytics</option>
                    <option value="storage">Storage</option>
                    <option value="webhook">Webhook</option>
                    <option value="api">API</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newIntegration.description}
                  onChange={(e) => setNewIntegration({ ...newIntegration, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter integration description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sync Frequency</label>
                <select
                  value={newIntegration.syncFrequency}
                  onChange={(e) => setNewIntegration({ ...newIntegration, syncFrequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newIntegration.isEnabled}
                  onChange={(e) => setNewIntegration({ ...newIntegration, isEnabled: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Enable integration</label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
              <button
                onClick={() => setIsCreatingIntegration(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateIntegration}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <AppIcon name="link" className="h-4 w-4" />
                <span>Create Integration</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataExport;

