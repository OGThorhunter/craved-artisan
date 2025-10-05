import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Printer,
  Settings,
  Eye,
  AlertTriangle,
  CheckCircle,
  FileText,
  History,
  Zap,
  Search,
  Edit,
  Copy,
  List,
} from 'lucide-react';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';

// Types
interface PrinterProfile {
  id: string;
  name: string;
  type: string;
  engine: string;
  dpi: number;
  maxWidthIn: number;
  maxHeightIn: number;
  active: boolean;
  createdAt: string;
  networkAddr?: string;
}

interface LabelProfile {
  id: string;
  name: string;
  description?: string;
  widthIn: number;
  heightIn: number;
  orientation: string;
  engine: string;
  status: string;
  printerProfile: PrinterProfile;
  createdAt: string;
}

interface LabelTemplate {
  id: string;
  name: string;
  description?: string;
  engine: string;
  status: string;
  createdAt: string;
}

interface LabelJob {
  id: string;
  source: string;
  status: string;
  copies: number;
  engine: string;
  createdAt: string;
  renderedAt?: string;
  printedAt?: string;
  error?: string;
  labelProfile: LabelProfile;
  labelTemplate: LabelTemplate;
  printerProfile?: PrinterProfile;
  order?: Record<string, unknown>;
  orderItem?: Record<string, unknown>;
  product?: Record<string, unknown>;
}

interface LabelSuggestion {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  orderId?: string;
  orderItemId?: string;
  productId?: string;
  labelProfileId: string;
  templateId: string;
  copies: number;
  reason: string;
  missingFields?: string[];
}

type TabType = 'profiles' | 'printers' | 'templates' | 'smart-queue' | 'jobs-history';

const VendorLabelManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('smart-queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Fetch data
  const { data: labelProfiles, isLoading: isLoadingProfiles } = useQuery({
    queryKey: ['label-profiles'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/labels/profiles', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch label profiles');
      return response.json();
    },
  });

  const { data: printerProfiles, isLoading: isLoadingPrinters } = useQuery({
    queryKey: ['printer-profiles'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/labels/printer-profiles', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch printer profiles');
      return response.json();
    },
  });

  const { data: labelTemplates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['label-templates'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/labels/templates', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch label templates');
      return response.json();
    },
  });

  const { data: labelJobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['label-jobs', { status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/vendor/labels/queue?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch label jobs');
      return response.json();
    },
  });

  const { data: smartSuggestions, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ['label-suggestions'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/labels/smart-needed', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch smart suggestions');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutations
  const printJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/vendor/labels/jobs/${jobId}/print`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to print job');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['label-jobs'] });
      toast.success('Label printed successfully');
    },
    onError: () => {
      toast.error('Failed to print label');
    },
  });

  const createJobFromSuggestionMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      const response = await fetch(`/api/vendor/labels/suggestions/${suggestionId}/create-job`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create job from suggestion');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['label-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['label-suggestions'] });
      toast.success('Label job created successfully');
    },
    onError: () => {
      toast.error('Failed to create label job');
    },
  });

  const bulkCreateJobsMutation = useMutation({
    mutationFn: async (suggestionIds: string[]) => {
      const response = await fetch('/api/vendor/labels/suggestions/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ suggestionIds }),
      });
      if (!response.ok) throw new Error('Failed to create bulk jobs');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['label-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['label-suggestions'] });
      toast.success(`Created ${data.count} label jobs`);
    },
    onError: () => {
      toast.error('Failed to create bulk jobs');
    },
  });

  const getStatusColor = (status: string) => {
    const colors = {
      QUEUED: 'bg-yellow-100 text-yellow-800',
      RENDERED: 'bg-blue-100 text-blue-800',
      SENT: 'bg-purple-100 text-purple-800',
      PRINTED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handlePrintJob = (jobId: string) => {
    printJobMutation.mutate(jobId);
  };

  const handleCreateJobFromSuggestion = (suggestionId: string) => {
    createJobFromSuggestionMutation.mutate(suggestionId);
  };

  const handleBulkCreateJobs = () => {
    if (selectedJobs.length === 0) {
      toast.error('Please select suggestions to create jobs');
      return;
    }
    bulkCreateJobsMutation.mutate(selectedJobs);
  };

  const handleSelectSuggestion = (suggestionId: string) => {
    setSelectedJobs(prev => 
      prev.includes(suggestionId) 
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const handleSelectAllSuggestions = () => {
    if (selectedJobs.length === smartSuggestions?.suggestions?.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(smartSuggestions?.suggestions?.map((s: LabelSuggestion) => s.id) || []);
    }
  };

  const tabs = [
    { id: 'smart-queue', label: 'Smart Queue', icon: List },
    { id: 'jobs-history', label: 'Jobs History', icon: History },
    { id: 'profiles', label: 'Label Profiles', icon: Settings },
    { id: 'printers', label: 'Printer Profiles', icon: Printer },
    { id: 'templates', label: 'Templates', icon: FileText },
  ];

  return (
    <VendorDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Label Management</h1>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  {smartSuggestions?.summary?.total || 0} Suggestions
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="secondary"
                  className="text-xs px-2 py-1"
                >
                  <Plus className="h-4 w-4" />
                  New Profile
                </Button>
                
                <Button
                  variant="secondary"
                  className="text-xs px-2 py-1"
                >
                  <Plus className="h-4 w-4" />
                  New Template
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'smart-queue' && (
                <div className="space-y-6">
                  {/* Smart Queue Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Smart Queue</h2>
                      <p className="text-sm text-gray-500">
                        AI-suggested labels based on your orders and inventory
                      </p>
                    </div>
                    
                    {selectedJobs.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {selectedJobs.length} selected
                        </span>
                        <Button
                          variant="primary"
                          onClick={handleBulkCreateJobs}
                          disabled={bulkCreateJobsMutation.isPending}
                          className="text-xs px-2 py-1"
                        >
                          <Zap className="h-4 w-4" />
                          Create Jobs
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  {isLoadingSuggestions ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading suggestions...</p>
                    </div>
                  ) : smartSuggestions?.suggestions?.length === 0 ? (
                    <Card className="p-8 text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                      <p className="text-gray-500">No label suggestions at this time.</p>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {/* Select All */}
                      <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedJobs.length === smartSuggestions?.suggestions?.length}
                          onChange={handleSelectAllSuggestions}
                          className="rounded border-gray-300"
                          aria-label="Select all suggestions"
                        />
                        <span className="text-sm text-gray-600">Select all suggestions</span>
                      </div>

                      {/* Suggestions List */}
                      {smartSuggestions?.suggestions?.map((suggestion: LabelSuggestion) => (
                        <Card key={suggestion.id} className="p-4">
                          <div className="flex items-start space-x-4">
                            <input
                              type="checkbox"
                              checked={selectedJobs.includes(suggestion.id)}
                              onChange={() => handleSelectSuggestion(suggestion.id)}
                              className="mt-1 rounded border-gray-300"
                              aria-label={`Select suggestion: ${suggestion.title}`}
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium text-gray-900">{suggestion.title}</h3>
                                <Badge className={getPriorityColor(suggestion.priority)}>
                                  {suggestion.priority}
                                </Badge>
                                <Badge variant="default" className="bg-gray-100 text-gray-800">
                                  {suggestion.type}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                              <p className="text-xs text-gray-500 mb-3">{suggestion.reason}</p>
                              
                              {suggestion.missingFields && suggestion.missingFields.length > 0 && (
                                <div className="flex items-center space-x-2 mb-3">
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                  <span className="text-xs text-orange-600">
                                    Missing: {suggestion.missingFields.join(', ')}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{suggestion.copies} copies</span>
                                <span>•</span>
                                <span>Profile: {suggestion.labelProfileId}</span>
                                <span>•</span>
                                <span>Template: {suggestion.templateId}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="secondary"
                                onClick={() => handleCreateJobFromSuggestion(suggestion.id)}
                                disabled={createJobFromSuggestionMutation.isPending}
                                className="text-xs px-2 py-1"
                              >
                                <Plus className="h-4 w-4" />
                                Create Job
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'jobs-history' && (
                <div className="space-y-6">
                  {/* Jobs History Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Jobs History</h2>
                      <p className="text-sm text-gray-500">
                        All label jobs and their status
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search jobs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        aria-label="Filter by status"
                      >
                        <option value="">All Status</option>
                        <option value="QUEUED">Queued</option>
                        <option value="RENDERED">Rendered</option>
                        <option value="SENT">Sent</option>
                        <option value="PRINTED">Printed</option>
                        <option value="FAILED">Failed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Jobs List */}
                  {isLoadingJobs ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading jobs...</p>
                    </div>
                  ) : labelJobs?.jobs?.length === 0 ? (
                    <Card className="p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                      <p className="text-gray-500">No label jobs match your current filters.</p>
                    </Card>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Job
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Source
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Copies
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Engine
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {labelJobs?.jobs?.map((job: LabelJob) => (
                              <tr key={job.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {job.labelProfile.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {job.labelTemplate.name}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge variant="default" className="bg-gray-100 text-gray-800">
                                    {job.source}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge className={getStatusColor(job.status)}>
                                    {job.status}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {job.copies}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {job.engine}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex items-center space-x-2">
                                    {job.status === 'RENDERED' && (
                                      <Button
                                        variant="secondary"
                                        onClick={() => handlePrintJob(job.id)}
                                        disabled={printJobMutation.isPending}
                                        className="text-xs px-2 py-1"
                                      >
                                        <Printer className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button variant="secondary" className="text-xs px-2 py-1">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profiles' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Label Profiles</h2>
                      <p className="text-sm text-gray-500">
                        Configure label sizes, printers, and default settings
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      className="text-xs px-2 py-1"
                    >
                      <Plus className="h-4 w-4" />
                      New Profile
                    </Button>
                  </div>

                  {isLoadingProfiles ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading profiles...</p>
                    </div>
                  ) : labelProfiles?.profiles?.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles found</h3>
                      <p className="text-gray-500">Create your first label profile to get started.</p>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {labelProfiles?.profiles?.map((profile: LabelProfile) => (
                        <Card key={profile.id} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-medium text-gray-900">{profile.name}</h3>
                            <Badge className={getStatusColor(profile.status)}>
                              {profile.status}
                            </Badge>
                          </div>
                          
                          {profile.description && (
                            <p className="text-sm text-gray-600 mb-3">{profile.description}</p>
                          )}
                          
                          <div className="space-y-2 text-xs text-gray-500">
                            <div className="flex justify-between">
                              <span>Size:</span>
                              <span>{profile.widthIn}" × {profile.heightIn}"</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Orientation:</span>
                              <span>{profile.orientation}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Engine:</span>
                              <span>{profile.engine}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Printer:</span>
                              <span>{profile.printerProfile.name}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-4">
                            <Button variant="secondary" className="text-xs px-2 py-1">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="secondary" className="text-xs px-2 py-1">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'printers' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Printer Profiles</h2>
                      <p className="text-sm text-gray-500">
                        Configure printers and their capabilities
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      className="text-xs px-2 py-1"
                    >
                      <Plus className="h-4 w-4" />
                      New Printer
                    </Button>
                  </div>

                  {isLoadingPrinters ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading printers...</p>
                    </div>
                  ) : printerProfiles?.printers?.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Printer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No printers found</h3>
                      <p className="text-gray-500">Add your first printer to start printing labels.</p>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {printerProfiles?.printers?.map((printer: PrinterProfile) => (
                        <Card key={printer.id} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-medium text-gray-900">{printer.name}</h3>
                            <Badge className={printer.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {printer.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-xs text-gray-500">
                            <div className="flex justify-between">
                              <span>Type:</span>
                              <span>{printer.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Engine:</span>
                              <span>{printer.engine}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>DPI:</span>
                              <span>{printer.dpi}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Max Size:</span>
                              <span>{printer.maxWidthIn}" × {printer.maxHeightIn}"</span>
                            </div>
                            {printer.networkAddr && (
                              <div className="flex justify-between">
                                <span>Network:</span>
                                <span className="truncate max-w-32">{printer.networkAddr}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-4">
                            <Button variant="secondary" className="text-xs px-2 py-1">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="secondary" className="text-xs px-2 py-1">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Label Templates</h2>
                      <p className="text-sm text-gray-500">
                        Design and manage label templates
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      className="text-xs px-2 py-1"
                    >
                      <Plus className="h-4 w-4" />
                      New Template
                    </Button>
                  </div>

                  {isLoadingTemplates ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading templates...</p>
                    </div>
                  ) : labelTemplates?.templates?.length === 0 ? (
                    <Card className="p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                      <p className="text-gray-500">Create your first label template to get started.</p>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {labelTemplates?.templates?.map((template: LabelTemplate) => (
                        <Card key={template.id} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-medium text-gray-900">{template.name}</h3>
                            <Badge className={getStatusColor(template.status)}>
                              {template.status}
                            </Badge>
                          </div>
                          
                          {template.description && (
                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          )}
                          
                          <div className="space-y-2 text-xs text-gray-500">
                            <div className="flex justify-between">
                              <span>Engine:</span>
                              <span>{template.engine}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Created:</span>
                              <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-4">
                            <Button variant="secondary" className="text-xs px-2 py-1">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="secondary" className="text-xs px-2 py-1">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="secondary" className="text-xs px-2 py-1">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorLabelManagementPage;
