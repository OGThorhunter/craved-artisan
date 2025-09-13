import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Edit,
  Trash2,
  Printer,
  Settings,
  Eye,
  Copy,
  Download,
  Upload,
  Search,
  Filter,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  FileText
} from 'lucide-react';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import { LabelProfile, PrinterProfile, CreateLabelProfileRequest, CreatePrinterProfileRequest } from '@/types/label';

const LabelProfilesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'printers'>('profiles');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LabelProfile | PrinterProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const queryClient = useQueryClient();

  // Fetch label profiles
  const { data: labelProfilesResponse, isLoading: loadingProfiles } = useQuery({
    queryKey: ['label-profiles'],
    queryFn: async () => {
      const response = await fetch('/api/label-profiles', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch label profiles');
      return response.json();
    },
  });

  // Fetch printer profiles
  const { data: printerProfilesResponse, isLoading: loadingPrinters } = useQuery({
    queryKey: ['printer-profiles'],
    queryFn: async () => {
      const response = await fetch('/api/printer-profiles', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch printer profiles');
      return response.json();
    },
  });

  const labelProfiles = labelProfilesResponse?.data || [];
  const printerProfiles = printerProfilesResponse?.data || [];

  // Create label profile mutation
  const createLabelProfileMutation = useMutation({
    mutationFn: async (data: CreateLabelProfileRequest) => {
      const response = await fetch('/api/label-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create label profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['label-profiles'] });
      toast.success('Label profile created successfully');
      setShowCreateModal(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create label profile: ${error.message}`);
    },
  });

  // Create printer profile mutation
  const createPrinterProfileMutation = useMutation({
    mutationFn: async (data: CreatePrinterProfileRequest) => {
      const response = await fetch('/api/printer-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create printer profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printer-profiles'] });
      toast.success('Printer profile created successfully');
      setShowCreateModal(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create printer profile: ${error.message}`);
    },
  });

  // Delete mutations
  const deleteLabelProfileMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/label-profiles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete label profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['label-profiles'] });
      toast.success('Label profile deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete label profile: ${error.message}`);
    },
  });

  const deletePrinterProfileMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/printer-profiles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete printer profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printer-profiles'] });
      toast.success('Printer profile deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete printer profile: ${error.message}`);
    },
  });

  const handleCreate = () => {
    setEditingItem(null);
    setShowCreateModal(true);
  };

  const handleEdit = (item: LabelProfile | PrinterProfile) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleDelete = (id: string, type: 'label' | 'printer') => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      if (type === 'label') {
        deleteLabelProfileMutation.mutate(id);
      } else {
        deletePrinterProfileMutation.mutate(id);
      }
    }
  };

  const formatDimensions = (width: number, height: number) => {
    return `${width}" × ${height}"`;
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-600" />
    );
  };

  const getDriverIcon = (driver: string) => {
    switch (driver) {
      case 'PDF':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'ZPL':
        return <Printer className="h-4 w-4 text-green-600" />;
      case 'TSPL':
        return <Printer className="h-4 w-4 text-orange-600" />;
      case 'BrotherQL':
        return <Printer className="h-4 w-4 text-purple-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredProfiles = labelProfiles.filter((profile: LabelProfile) => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' ? profile.isActive : !profile.isActive);
    return matchesSearch && matchesStatus;
  });

  const filteredPrinters = printerProfiles.filter((printer: PrinterProfile) => {
    const matchesSearch = printer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' ? printer.isActive : !printer.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loadingProfiles || loadingPrinters) {
    return (
      <VendorDashboardLayout>
        <div className="min-h-screen bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Label Management</h1>
                <p className="text-gray-600 mt-2">
                  Manage label profiles and printer configurations for your products
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('profiles')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profiles'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Label Profiles ({labelProfiles.length})
                </button>
                <button
                  onClick={() => setActiveTab('printers')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'printers'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Printer Profiles ({printerProfiles.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search profiles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Filter by status"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'profiles' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile: LabelProfile) => (
                <div key={profile.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(profile.isActive)}
                        <h3 className="text-lg font-medium text-gray-900">{profile.name}</h3>
                      </div>
                      <div className="relative">
                        <button 
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="More options"
                          aria-label="More options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {profile.description && (
                      <p className="text-gray-600 text-sm mb-4">{profile.description}</p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Size:</span>
                        <span className="font-medium">{formatDimensions(profile.mediaWidthIn, profile.mediaHeightIn)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">DPI:</span>
                        <span className="font-medium">{profile.dpi}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Engine:</span>
                        <span className="font-medium">{profile.engine}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Copies:</span>
                        <span className="font-medium">{profile.copiesPerUnit}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(profile)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit profile"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(profile.id, 'label')}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete profile"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">
                        {profile.printerProfile?.name || 'No printer'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrinters.map((printer: PrinterProfile) => (
                <div key={printer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(printer.isActive)}
                        <h3 className="text-lg font-medium text-gray-900">{printer.name}</h3>
                      </div>
                      <div className="relative">
                        <button 
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="More options"
                          aria-label="More options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      {getDriverIcon(printer.driver)}
                      <span className="text-sm text-gray-600">{printer.driver}</span>
                      {printer.isColor && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Color
                        </span>
                      )}
                      {printer.isThermal && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Thermal
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">DPI:</span>
                        <span className="font-medium">{printer.dpi}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Max Size:</span>
                        <span className="font-medium">{formatDimensions(printer.maxWidthIn, printer.maxHeightIn)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Media Types:</span>
                        <span className="font-medium">{printer.mediaSupported.length}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(printer)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit printer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(printer.id, 'printer')}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete printer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {printer.address && (
                        <span className="text-xs text-gray-500 truncate max-w-24">
                          {printer.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {((activeTab === 'profiles' && filteredProfiles.length === 0) ||
            (activeTab === 'printers' && filteredPrinters.length === 0)) && (
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No {activeTab} found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new {activeTab === 'profiles' ? 'label' : 'printer'} profile.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create {activeTab === 'profiles' ? 'Label' : 'Printer'} Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default LabelProfilesPage;
