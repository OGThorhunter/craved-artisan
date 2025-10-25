import React, { useState, useEffect, useRef } from 'react';
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
  FileText,
  Palette
} from 'lucide-react';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import type { LabelProfile, PrinterProfile, CreateLabelProfileRequest, CreatePrinterProfileRequest } from '@/types/label-system';

const LabelProfilesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'printers'>('profiles');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LabelProfile | PrinterProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Preview state
  const [previewData, setPreviewData] = useState({
    name: 'Sample Product',
    sku: 'SKU-12345',
    price: '$12.99',
    bornOnDate: '2025-01-15',
    expirationDate: '2025-02-15',
    ingredients: 'Flour, Water, Salt, Yeast',
    allergens: 'Contains: Wheat',
    notes: 'Fresh baked daily'
  });

  // Logo preview state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Element positioning state
  const [elementPositions, setElementPositions] = useState({
    productName: { x: 10, y: 10 },
    sku: { x: 10, y: 40 },
    price: { x: 200, y: 10 },
    logo: { x: 10, y: 10 },
    dates: { x: 10, y: 70 },
    ingredients: { x: 10, y: 100 },
    allergens: { x: 10, y: 150 },
    notes: { x: 10, y: 180 }
  });

  // Form state for create modal
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    printerType: '',
    driver: '',
    dpi: '',
    width: '',
    height: '',
    orientation: 'portrait',
    cornerRadius: '',
    logoFile: null as File | null,
    logoPosition: 'top-left',
    logoSize: 15,
    logoOpacity: 100,
    safeMargin: '',
    bleedArea: '',
    copiesPerUnit: 1,
    autoScaling: true,
    // Data fields
    productName: true,
    sku: true,
    price: false,
    weightSize: false,
    bornOnDate: false,
    expirationDate: false,
    bestByDate: false,
    createdDate: false,
    ingredients: false,
    allergens: false,
    nutritionFacts: false,
    storageInstructions: false,
    freeFormNotes: false,
    batchNumber: false,
    lotNumber: false,
    qrCode: false
  });

  // Printer form state
  const [printerFormData, setPrinterFormData] = useState({
    name: '',
    driver: '',
    dpi: '',
    maxWidthIn: '',
    maxHeightIn: '',
    isColor: false,
    isThermal: false,
    address: '',
    mediaSupported: [] as string[]
  });

  const queryClient = useQueryClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    setFormData({
      name: '',
      description: '',
      printerType: '',
      driver: '',
      dpi: '',
      width: '',
      height: '',
      orientation: 'portrait',
      cornerRadius: '',
      logoFile: null,
      logoPosition: 'top-left',
      logoSize: 15,
      logoOpacity: 100,
      safeMargin: '',
      bleedArea: '',
      copiesPerUnit: 1,
      autoScaling: true,
      productName: true,
      sku: true,
      price: false,
      weightSize: false,
      bornOnDate: false,
      expirationDate: false,
      bestByDate: false,
      createdDate: false,
      ingredients: false,
      allergens: false,
      nutritionFacts: false,
      storageInstructions: false,
      freeFormNotes: false,
      batchNumber: false,
      lotNumber: false,
      qrCode: false
    });
    setShowCreateModal(true);
  };

  // Quick size preset handlers
  const handleQuickSize = (width: number, height: number) => {
    setFormData(prev => ({
      ...prev,
      width: width.toString(),
      height: height.toString()
    }));
  };

  // Logo upload handler
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }

      // Validate file type
      if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
        toast.error('Please upload a PNG, JPG, or SVG file');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setFormData(prev => ({
          ...prev,
          logoFile: file
        }));
        toast.success('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Form input handlers
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update preview data in real-time for certain fields
    if (['name', 'sku', 'price', 'bornOnDate', 'expirationDate', 'ingredients', 'allergens', 'freeFormNotes'].includes(field)) {
      setPreviewData(prev => ({
        ...prev,
        [field === 'freeFormNotes' ? 'notes' : field]: value || ''
      }));
    }
  };

  // Element positioning handlers
  const handleElementDrag = (element: string, x: number, y: number) => {
    setElementPositions(prev => ({
      ...prev,
      [element]: { x, y }
    }));
  };

  const handleElementPositionChange = (element: string, field: 'x' | 'y', value: number) => {
    setElementPositions(prev => ({
      ...prev,
      [element]: {
        ...((prev as any)[element] || {}),
        [field]: value
      }
    }));
  };

  // Create profile handler
  const handleCreateProfile = async () => {
    // Validate required fields
    if (!formData.name || !formData.printerType || !formData.driver || !formData.dpi || !formData.width || !formData.height) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Prepare the profile data for API
      const profileData = {
        name: formData.name,
        description: formData.description,
        mediaWidthIn: parseFloat(formData.width),
        mediaHeightIn: parseFloat(formData.height),
        orientation: formData.orientation,
        cornerRadius: parseFloat(formData.cornerRadius) || 0.125,
        bleedIn: parseFloat(formData.bleedArea) || 0.125,
        safeMarginIn: parseFloat(formData.safeMargin) || 0.25,
        engine: formData.driver.toUpperCase() as 'PDF' | 'ZPL' | 'TSPL' | 'BrotherQL',
        dpi: parseInt(formData.dpi) as 203 | 300 | 600,
        templateId: 'default-template',
        printerProfileId: 'printer-1',
        copiesPerUnit: formData.copiesPerUnit || 1,
        rules: {
          includeCustomerOnPickup: false,
          boldAllergens: formData.allergens,
          requireNutritionForWholesale: formData.nutritionFacts
        },
        dataBindings: {
          productName: formData.productName,
          sku: formData.sku,
          price: formData.price,
          weightSize: formData.weightSize,
          bornOnDate: formData.bornOnDate,
          expirationDate: formData.expirationDate,
          bestByDate: formData.bestByDate,
          createdDate: formData.createdDate,
          ingredients: formData.ingredients,
          allergens: formData.allergens,
          nutritionFacts: formData.nutritionFacts,
          storageInstructions: formData.storageInstructions,
          freeFormNotes: formData.freeFormNotes,
          batchNumber: formData.batchNumber,
          lotNumber: formData.lotNumber,
          qrCode: formData.qrCode,
          logoFile: formData.logoFile ? formData.logoFile.name : null,
          logoPosition: formData.logoPosition,
          logoSize: formData.logoSize,
          logoOpacity: formData.logoOpacity
        }
      };

      // Call the API
      const response = await fetch('/api/label-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to create label profile');
      }

      // Update preview data with current form data
      setPreviewData(prev => ({
        ...prev,
        name: formData.name || 'Sample Product',
        sku: formData.sku ? 'SKU123456' : '',
        price: formData.price ? '$12.99' : '',
        bornOnDate: formData.bornOnDate ? '2025-01-15' : '',
        expirationDate: formData.expirationDate ? '2025-01-22' : '',
        ingredients: formData.ingredients ? 'Flour, Water, Salt, Yeast' : '',
        allergens: formData.allergens ? 'Contains: Wheat' : '',
        notes: formData.freeFormNotes ? 'Fresh baked daily' : ''
      }));

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['label-profiles'] });
      
      toast.success('Label profile created successfully!');
      setShowCreateModal(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        printerType: '',
        driver: '',
        dpi: '',
        width: '',
        height: '',
        orientation: 'portrait',
        cornerRadius: '',
        logoFile: null,
        logoPosition: 'top-left',
        logoSize: 15,
        logoOpacity: 100,
        safeMargin: '',
        bleedArea: '',
        copiesPerUnit: 1,
        autoScaling: true,
        productName: true,
        sku: true,
        price: false,
        weightSize: false,
        bornOnDate: false,
        expirationDate: false,
        bestByDate: false,
        createdDate: false,
        ingredients: false,
        allergens: false,
        nutritionFacts: false,
        storageInstructions: false,
        freeFormNotes: false,
        batchNumber: false,
        lotNumber: false,
        qrCode: false
      });
    } catch (error) {
      console.error('Error creating label profile:', error);
      toast.error('Failed to create label profile. Please try again.');
    }
  };

  // Generate print preview handler
  const handleGeneratePrintPreview = () => {
    console.log('Generating print preview with data:', formData);
    setShowPreviewModal(true);
    toast.success('Print preview generated!');
  };

  // Printer form handlers
  const handlePrinterFormChange = (field: string, value: any) => {
    setPrinterFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Create printer profile handler
  const handleCreatePrinterProfile = () => {
    // Validate required fields
    if (!printerFormData.name || !printerFormData.driver || !printerFormData.dpi || !printerFormData.maxWidthIn || !printerFormData.maxHeightIn) {
      toast.error('Please fill in all required fields');
      return;
    }

    // TODO: Implement actual API call
    console.log('Creating printer profile with data:', printerFormData);
    toast.success('Printer profile created successfully!');
    setShowPrinterModal(false);
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

  const handleView = (item: LabelProfile | PrinterProfile) => {
    // For now, just show a toast with item details
    const details = activeTab === 'profiles' 
      ? `Label Profile: ${item.name}\nSize: ${formatDimensions((item as LabelProfile).mediaWidthIn, (item as LabelProfile).mediaHeightIn)}\nDPI: ${(item as LabelProfile).dpi}\nEngine: ${(item as LabelProfile).engine}`
      : `Printer: ${item.name}\nDriver: ${(item as PrinterProfile).driver}\nDPI: ${(item as PrinterProfile).dpi}\nMax Size: ${formatDimensions((item as PrinterProfile).maxWidthIn, (item as PrinterProfile).maxHeightIn)}`;
    
    toast.success(details, { duration: 5000 });
  };

  const handleMenuAction = (action: string, item: LabelProfile | PrinterProfile) => {
    switch (action) {
      case 'view':
        handleView(item);
        break;
      case 'edit':
        handleEdit(item);
        break;
      case 'delete':
        handleDelete(item.id, activeTab === 'profiles' ? 'label' : 'printer');
        break;
      case 'duplicate':
        // For now, just show a toast
        toast.success(`${activeTab === 'profiles' ? 'Label profile' : 'Printer'} duplicated successfully`);
        break;
      default:
        break;
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
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <header className="bg-[#F7F2EC] rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#333]">Label Management</h1>
                <p className="text-[#777] mt-2">
                  Manage label profiles and printer configurations for your products
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href="/dashboard/vendor/labels/editor"
                  className="inline-flex items-center px-4 py-2 border border-[#5B6E02] text-[#5B6E02] shadow-sm text-sm font-medium rounded-md hover:bg-[#5B6E02] hover:text-white transition-colors"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Template Editor
                </a>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setPrinterFormData({
                      name: '',
                      driver: '',
                      dpi: '',
                      maxWidthIn: '',
                      maxHeightIn: '',
                      isColor: false,
                      isThermal: false,
                      address: '',
                      mediaSupported: []
                    });
                    setShowPrinterModal(true);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  title="Create new printer profile"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Printer</span>
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5D01] transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Build Label</span>
                </button>
              </div>
            </div>
          </header>

          {/* Tabs */}
          <section className="bg-[#F7F2EC] rounded-lg p-6 shadow-md">
            <div className="border-b border-[#D4B896]">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('profiles')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profiles'
                      ? 'border-[#5B6E02] text-[#5B6E02]'
                      : 'border-transparent text-[#777] hover:text-[#333] hover:border-[#D4B896]'
                  }`}
                >
                  Label Profiles ({labelProfiles.length})
                </button>
                <button
                  onClick={() => setActiveTab('printers')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'printers'
                      ? 'border-[#5B6E02] text-[#5B6E02]'
                      : 'border-transparent text-[#777] hover:text-[#333] hover:border-[#D4B896]'
                  }`}
                >
                  Printer Profiles ({printerProfiles.length})
                </button>
              </nav>
            </div>
          </section>

          {/* Search and Filters */}
          <section className="bg-[#F7F2EC] rounded-lg p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#777]" />
                  <input
                    type="text"
                    placeholder="Search profiles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-[#D4B896] rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent w-full sm:w-64 bg-white"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-[#D4B896] rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent bg-white"
                  title="Filter by status"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="bg-[#F7F2EC] rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-[#333] mb-4">
              {activeTab === 'profiles' ? 'Label Profiles' : 'Printer Profiles'}
            </h2>
            {activeTab === 'profiles' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfiles.map((profile: LabelProfile) => (
                  <div key={profile.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(profile.isActive)}
                        <h3 className="text-lg font-medium text-[#333]">{profile.name}</h3>
                      </div>
                      <div className="relative" ref={dropdownRef}>
                        <button 
                          onClick={() => setOpenDropdown(openDropdown === profile.id ? null : profile.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="More options"
                          aria-label="More options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openDropdown === profile.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleMenuAction('view', profile);
                                  setOpenDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="h-4 w-4 mr-3" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  handleMenuAction('edit', profile);
                                  setOpenDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4 mr-3" />
                                Edit Profile
                              </button>
                              <button
                                onClick={() => {
                                  handleMenuAction('duplicate', profile);
                                  setOpenDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Copy className="h-4 w-4 mr-3" />
                                Duplicate
                              </button>
                              <button
                                onClick={() => {
                                  handleMenuAction('delete', profile);
                                  setOpenDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-3" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {profile.description && (
                      <p className="text-[#777] text-sm mb-4">{profile.description}</p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#777]">Size:</span>
                        <span className="font-medium text-[#333]">{formatDimensions(profile.mediaWidthIn, profile.mediaHeightIn)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#777]">DPI:</span>
                        <span className="font-medium text-[#333]">{profile.dpi}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#777]">Engine:</span>
                        <span className="font-medium text-[#333]">{profile.engine}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#777]">Copies:</span>
                        <span className="font-medium text-[#333]">{profile.copiesPerUnit}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-[#D4B896]">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(profile)}
                          className="p-2 text-[#777] hover:text-[#5B6E02] transition-colors"
                          title="Edit profile"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(profile.id, 'label')}
                          className="p-2 text-[#777] hover:text-red-600 transition-colors"
                          title="Delete profile"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xs text-[#777]">
                        {profile.printerProfileId || 'No printer'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrinters.map((printer: PrinterProfile) => (
                <div key={printer.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(printer.isActive)}
                        <h3 className="text-lg font-medium text-[#333]">{printer.name}</h3>
                      </div>
                      <div className="relative" ref={dropdownRef}>
                        <button 
                          onClick={() => setOpenDropdown(openDropdown === printer.id ? null : printer.id)}
                          className="p-1 text-[#777] hover:text-[#333]"
                          title="More options"
                          aria-label="More options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openDropdown === printer.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleMenuAction('view', printer);
                                  setOpenDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="h-4 w-4 mr-3" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  handleMenuAction('edit', printer);
                                  setOpenDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4 mr-3" />
                                Edit Printer
                              </button>
                              <button
                                onClick={() => {
                                  handleMenuAction('duplicate', printer);
                                  setOpenDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Copy className="h-4 w-4 mr-3" />
                                Duplicate
                              </button>
                              <button
                                onClick={() => {
                                  handleMenuAction('delete', printer);
                                  setOpenDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-3" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      {getDriverIcon(printer.driver)}
                      <span className="text-sm text-[#777]">{printer.driver}</span>
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
                        <span className="text-[#777]">DPI:</span>
                        <span className="font-medium text-[#333]">{printer.dpi}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#777]">Max Size:</span>
                        <span className="font-medium text-[#333]">{formatDimensions(printer.maxWidthIn, printer.maxHeightIn)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#777]">Media Types:</span>
                        <span className="font-medium text-[#333]">{printer.mediaSupported.length}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-[#D4B896]">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(printer)}
                          className="p-2 text-[#777] hover:text-[#5B6E02] transition-colors"
                          title="Edit printer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(printer.id, 'printer')}
                          className="p-2 text-[#777] hover:text-red-600 transition-colors"
                          title="Delete printer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {printer.address && (
                        <span className="text-xs text-[#777] truncate max-w-24">
                          {printer.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
          </section>

          {/* Empty State */}
          {((activeTab === 'profiles' && filteredProfiles.length === 0) ||
            (activeTab === 'printers' && filteredPrinters.length === 0)) && (
            <div className="bg-[#F7F2EC] rounded-lg p-8 text-center shadow-md">
              <Settings className="mx-auto h-12 w-12 text-[#777]" />
              <h3 className="mt-2 text-sm font-medium text-[#333]">
                No {activeTab} found
              </h3>
              <p className="mt-1 text-sm text-[#777]">
                Get started by creating a new {activeTab === 'profiles' ? 'label' : 'printer'} profile.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#5B6E02] hover:bg-[#4A5D01]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create {activeTab === 'profiles' ? 'Label' : 'Printer'} Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Build Label Profile
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Standard Product Label"
                        title="Enter profile name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief description of this label"
                        title="Enter description"
                      />
                    </div>
                  </div>
                </div>

                {/* Printer Configuration */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Printer Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Printer Type *
                      </label>
                      <select 
                        value={formData.printerType}
                        onChange={(e) => handleFormChange('printerType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        title="Select printer type"
                      >
                        <option value="">Select Type</option>
                        <option value="thermal">Thermal Printer</option>
                        <option value="inkjet">Inkjet Printer</option>
                        <option value="laser">Laser Printer</option>
                        <option value="dot-matrix">Dot Matrix</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Driver *
                      </label>
                      <select 
                        value={formData.driver}
                        onChange={(e) => handleFormChange('driver', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        title="Select driver"
                      >
                        <option value="">Select Driver</option>
                        <option value="ZPL">ZPL (Zebra)</option>
                        <option value="TSPL">TSPL (TSC)</option>
                        <option value="BrotherQL">Brother QL</option>
                        <option value="PDF">PDF (Universal)</option>
                        <option value="ESC/POS">ESC/POS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        DPI *
                      </label>
                      <select 
                        value={formData.dpi}
                        onChange={(e) => handleFormChange('dpi', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        title="Select DPI"
                      >
                        <option value="">Select DPI</option>
                        <option value="203">203 DPI (Standard)</option>
                        <option value="300">300 DPI (High Quality)</option>
                        <option value="600">600 DPI (Ultra High)</option>
                        <option value="1200">1200 DPI (Print Quality)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Paper Size & Layout */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Paper Size & Layout</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width (inches) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="12"
                        value={formData.width}
                        onChange={(e) => handleFormChange('width', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="4.0"
                        title="Enter width in inches"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (inches) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="12"
                        value={formData.height}
                        onChange={(e) => handleFormChange('height', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="6.0"
                        title="Enter height in inches"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Orientation
                      </label>
                      <select 
                        value={formData.orientation}
                        onChange={(e) => handleFormChange('orientation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        title="Select orientation"
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Corner Radius
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="0.5"
                        value={formData.cornerRadius}
                        onChange={(e) => handleFormChange('cornerRadius', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.125"
                        title="Enter corner radius in inches"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quick Size Presets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleQuickSize(2, 1)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        2" x 1" (Small)
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleQuickSize(3, 2)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        3" x 2" (Medium)
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleQuickSize(4, 6)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        4" x 6" (Standard)
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleQuickSize(6, 4)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        6" x 4" (Large)
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setFormData(prev => ({ ...prev, width: '', height: '' }));
                        }}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Label Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Live Label Preview</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Label Preview & Logo Upload
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white relative">
                        {/* Live Label Preview */}
                        <div 
                          className="bg-white border-2 border-gray-300 shadow-lg mx-auto relative overflow-hidden"
                          style={{
                            width: '300px',
                            height: '200px',
                            position: 'relative'
                          }}
                        >
                          {/* Logo Area */}
                          {logoPreview && formData.logoFile && (
                            <div 
                              className="absolute"
                              style={{
                                left: `${elementPositions.logo.x}px`,
                                top: `${elementPositions.logo.y}px`,
                                width: `${formData.logoSize}px`,
                                height: `${formData.logoSize}px`,
                                opacity: formData.logoOpacity / 100
                              }}
                            >
                              <img 
                                src={logoPreview} 
                                alt="Logo" 
                                className="w-full h-full object-contain"
                                draggable={false}
                              />
                            </div>
                          )}
                          
                          {/* Product Name */}
                          {formData.productName && (
                            <div 
                              className="absolute"
                              style={{
                                left: `${elementPositions.productName.x}px`,
                                top: `${elementPositions.productName.y}px`,
                                right: '10px'
                              }}
                            >
                              <div className="text-lg font-bold text-gray-900 truncate">
                                {formData.name || 'Sample Product'}
                              </div>
                            </div>
                          )}
                          
                          {/* SKU/Barcode */}
                          {formData.sku && (
                            <div className="absolute top-8 left-12 right-2">
                              <div className="text-sm text-gray-600">
                                SKU: SKU-12345
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                ████████████████████
                              </div>
                            </div>
                          )}
                          
                          {/* Price */}
                          {formData.price && (
                            <div 
                              className="absolute"
                              style={{
                                left: `${elementPositions.price.x}px`,
                                top: `${elementPositions.price.y}px`
                              }}
                            >
                              <div className="text-lg font-bold text-green-600">
                                $12.99
                              </div>
                            </div>
                          )}
                          
                          {/* Dates */}
                          {(formData.bornOnDate || formData.expirationDate) && (
                            <div className="absolute top-24 left-2 right-2">
                              <div className="text-xs text-gray-600 space-y-1">
                                {formData.bornOnDate && <div>Born: 2025-01-15</div>}
                                {formData.expirationDate && <div>Expires: 2025-02-15</div>}
                              </div>
                            </div>
                          )}
                          
                          {/* Ingredients */}
                          {formData.ingredients && (
                            <div className="absolute top-36 left-2 right-2">
                              <div className="text-xs text-gray-700">
                                <div className="font-semibold">Ingredients:</div>
                                <div className="mt-1">Flour, Water, Salt, Yeast</div>
                              </div>
                            </div>
                          )}
                          
                          {/* Allergens */}
                          {formData.allergens && (
                            <div className="absolute top-48 left-2 right-2">
                              <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                                Contains: Wheat
                              </div>
                            </div>
                          )}
                          
                          {/* Notes */}
                          {formData.freeFormNotes && (
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="text-xs text-gray-600 italic">
                                Fresh baked daily
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Upload Area Overlay */}
                        {!logoPreview && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                            <div className="text-center text-white">
                              <FileText className="mx-auto h-12 w-12 text-white mb-2" />
                              <p className="text-sm">
                                <label className="text-blue-300 hover:text-blue-200 cursor-pointer">
                                  Click to upload logo
                                  <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/svg+xml"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                  />
                                </label>
                              </p>
                              <p className="text-xs text-gray-300">PNG, JPG, SVG up to 2MB</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Logo Controls */}
                        {logoPreview && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm text-green-600">
                              ✓ {formData.logoFile?.name} uploaded
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setLogoPreview(null);
                                setFormData(prev => ({ ...prev, logoFile: null }));
                              }}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Remove Logo
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Quick Position Controls */}
                      <div className="mt-4 bg-gray-100 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3">Element Positioning</h5>
                        <div className="grid grid-cols-2 gap-4">
                          {logoPreview && formData.logoFile && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Logo Position
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">X Position</label>
                                  <input
                                    type="number"
                                    value={elementPositions.logo.x}
                                    onChange={(e) => handleElementPositionChange('logo', 'x', parseInt(e.target.value) || 0)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                    min="0"
                                    max="250"
                                    title="Set logo X position in pixels"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Y Position</label>
                                  <input
                                    type="number"
                                    value={elementPositions.logo.y}
                                    onChange={(e) => handleElementPositionChange('logo', 'y', parseInt(e.target.value) || 0)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                    min="0"
                                    max="150"
                                    title="Set logo Y position in pixels"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Product Name Position
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">X Position</label>
                                <input
                                  type="number"
                                  value={elementPositions.productName.x}
                                  onChange={(e) => handleElementPositionChange('productName', 'x', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  min="0"
                                  max="250"
                                  title="Set product name X position in pixels"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Y Position</label>
                                <input
                                  type="number"
                                  value={elementPositions.productName.y}
                                  onChange={(e) => handleElementPositionChange('productName', 'y', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  min="0"
                                  max="150"
                                  title="Set product name Y position in pixels"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Logo Position
                        </label>
                        <select 
                          value={formData.logoPosition}
                          onChange={(e) => handleFormChange('logoPosition', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          title="Select logo position"
                        >
                          <option value="top-left">Top Left</option>
                          <option value="top-center">Top Center</option>
                          <option value="top-right">Top Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-center">Bottom Center</option>
                          <option value="bottom-right">Bottom Right</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Logo Size (%)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="50"
                          value={formData.logoSize}
                          onChange={(e) => handleFormChange('logoSize', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="15"
                          title="Enter logo size percentage"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Logo Opacity
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.logoOpacity}
                          onChange={(e) => handleFormChange('logoOpacity', parseInt(e.target.value))}
                          className="w-full"
                          title="Adjust logo opacity"
                        />
                        <div className="text-xs text-gray-500 text-center">{formData.logoOpacity}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Fields Configuration */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Data Fields Configuration</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Information
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={formData.productName}
                              onChange={(e) => handleFormChange('productName', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                            />
                            <span className="ml-2 text-sm text-gray-700">Product Name</span>
                          </label>
                          <label className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={formData.sku}
                              onChange={(e) => handleFormChange('sku', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                            />
                            <span className="ml-2 text-sm text-gray-700">SKU/Barcode</span>
                          </label>
                          <label className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={formData.price}
                              onChange={(e) => handleFormChange('price', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                            />
                            <span className="ml-2 text-sm text-gray-700">Price</span>
                          </label>
                          <label className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={formData.weightSize}
                              onChange={(e) => handleFormChange('weightSize', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                            />
                            <span className="ml-2 text-sm text-gray-700">Weight/Size</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Information
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <span className="ml-2 text-sm text-gray-700">Born On Date</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <span className="ml-2 text-sm text-gray-700">Expiration Date</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <span className="ml-2 text-sm text-gray-700">Best By Date</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <span className="ml-2 text-sm text-gray-700">Created Date</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Information
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <span className="ml-2 text-sm text-gray-700">Ingredients List</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <span className="ml-2 text-sm text-gray-700">Allergen Warnings</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <span className="ml-2 text-sm text-gray-700">Nutrition Facts</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <span className="ml-2 text-sm text-gray-700">Storage Instructions</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Fields
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <span className="ml-2 text-sm text-gray-700">Free Form Notes</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <span className="ml-2 text-sm text-gray-700">Batch Number</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <span className="ml-2 text-sm text-gray-700">Lot Number</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <span className="ml-2 text-sm text-gray-700">QR Code</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Safe Margin (inches)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.125"
                        title="Enter safe margin in inches"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bleed Area (inches)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="0.25"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.0625"
                        title="Enter bleed area in inches"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Copies Per Unit
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1"
                        title="Enter copies per unit"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Enable auto-scaling for different paper sizes</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <div className="space-x-3">
                <button
                  onClick={handleCreateProfile}
                  className="px-6 py-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5D01] transition-colors"
                >
                  Create Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit {activeTab === 'profiles' ? 'Label' : 'Printer'} Profile
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    defaultValue={editingItem.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    title="Edit profile name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    defaultValue={(editingItem as any).description || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    title="Edit profile description"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={editingItem.isActive}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    title="Toggle profile active status"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement edit functionality
                  setShowEditModal(false);
                  toast.success(`${activeTab === 'profiles' ? 'Label' : 'Printer'} profile updated successfully!`);
                }}
                className="px-4 py-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5D01] transition-colors"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Label Preview
                </h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Label Preview */}
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Label Preview</h4>
                  <div className="bg-gray-100 p-8 rounded-lg flex justify-center">
                    <div 
                      className="bg-white border-2 border-gray-300 shadow-lg"
                      style={{
                        width: '300px',
                        height: '200px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Logo Area */}
                      {logoPreview && formData.logoFile && (
                        <div 
                          className="absolute"
                          style={{
                            left: `${elementPositions.logo.x}px`,
                            top: `${elementPositions.logo.y}px`,
                            width: `${formData.logoSize}px`,
                            height: `${formData.logoSize}px`,
                            opacity: formData.logoOpacity / 100
                          }}
                        >
                          <img 
                            src={logoPreview} 
                            alt="Logo" 
                            className="w-full h-full object-contain"
                            draggable={false}
                          />
                        </div>
                      )}
                      
                      {/* Product Name */}
                      {formData.productName && (
                        <div 
                          className="absolute"
                          style={{
                            left: `${elementPositions.productName.x}px`,
                            top: `${elementPositions.productName.y}px`,
                            right: '10px'
                          }}
                        >
                          <div className="text-lg font-bold text-gray-900 truncate">
                            {formData.name || 'Sample Product'}
                          </div>
                        </div>
                      )}
                      
                      {/* SKU/Barcode */}
                      {formData.sku && (
                        <div className="absolute top-8 left-12 right-2">
                          <div className="text-sm text-gray-600">
                            SKU: {formData.sku ? 'SKU-12345' : 'SKU-12345'}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            ████████████████████
                          </div>
                        </div>
                      )}
                      
                      {/* Price */}
                      {formData.price && (
                        <div 
                          className="absolute"
                          style={{
                            left: `${elementPositions.price.x}px`,
                            top: `${elementPositions.price.y}px`
                          }}
                        >
                          <div className="text-lg font-bold text-green-600">
                            $12.99
                          </div>
                        </div>
                      )}
                      
                      {/* Dates */}
                      {(formData.bornOnDate || formData.expirationDate) && (
                        <div className="absolute top-24 left-2 right-2">
                          <div className="text-xs text-gray-600 space-y-1">
                            {formData.bornOnDate && <div>Born: 2025-01-15</div>}
                            {formData.expirationDate && <div>Expires: 2025-02-15</div>}
                          </div>
                        </div>
                      )}
                      
                      {/* Ingredients */}
                      {formData.ingredients && (
                        <div className="absolute top-36 left-2 right-2">
                          <div className="text-xs text-gray-700">
                            <div className="font-semibold">Ingredients:</div>
                            <div className="mt-1">Flour, Water, Salt, Yeast</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Allergens */}
                      {formData.allergens && (
                        <div className="absolute top-48 left-2 right-2">
                          <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                            Contains: Wheat
                          </div>
                        </div>
                      )}
                      
                      {/* Notes */}
                      {formData.freeFormNotes && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="text-xs text-gray-600 italic">
                            Fresh baked daily
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Label Specifications */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">Label Specifications</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Size:</span>
                        <span className="ml-2 font-medium">
                          {formData.width && formData.height ? `${formData.width}" × ${formData.height}"` : '4" × 6"'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">DPI:</span>
                        <span className="ml-2 font-medium">{formData.dpi || '300'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Orientation:</span>
                        <span className="ml-2 font-medium capitalize">{formData.orientation || 'Portrait'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Printer:</span>
                        <span className="ml-2 font-medium">{formData.driver || 'Thermal'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Engine:</span>
                        <span className="ml-2 font-medium">{formData.driver || 'ZPL'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Copies:</span>
                        <span className="ml-2 font-medium">{formData.copiesPerUnit || 1}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Preview Controls */}
                <div className="w-full lg:w-80">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Preview Controls</h4>
                  
                  {/* Current Form Data Display */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                        {formData.name || 'Sample Product'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                        SKU-12345
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                        $12.99
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Born On
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                          2025-01-15
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expires
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                          2025-02-15
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ingredients
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm min-h-[60px]">
                        Flour, Water, Salt, Yeast
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allergens
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                        Contains: Wheat
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                        Fresh baked daily
                      </div>
                    </div>
                  </div>
                  
                  {/* Element Positioning Controls */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">Element Positioning</h5>
                    <div className="space-y-3">
                      {logoPreview && formData.logoFile && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logo Position
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">X Position</label>
                              <input
                                type="number"
                                value={elementPositions.logo.x}
                                onChange={(e) => handleElementPositionChange('logo', 'x', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                min="0"
                                max="250"
                                title="Set logo X position in pixels"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Y Position</label>
                              <input
                                type="number"
                                value={elementPositions.logo.y}
                                onChange={(e) => handleElementPositionChange('logo', 'y', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                min="0"
                                max="150"
                                title="Set logo Y position in pixels"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name Position
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">X Position</label>
                              <input
                                type="number"
                                value={elementPositions.productName.x}
                                onChange={(e) => handleElementPositionChange('productName', 'x', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                min="0"
                                max="250"
                                title="Set product name X position in pixels"
                              />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Y Position</label>
                            <input
                              type="number"
                              value={elementPositions.productName.y}
                              onChange={(e) => handleElementPositionChange('productName', 'y', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              min="0"
                              max="150"
                              title="Set product name Y position in pixels"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price Position
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">X Position</label>
                              <input
                                type="number"
                                value={elementPositions.price.x}
                                onChange={(e) => handleElementPositionChange('price', 'x', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                min="0"
                                max="250"
                                title="Set price X position in pixels"
                              />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Y Position</label>
                            <input
                              type="number"
                              value={elementPositions.price.y}
                              onChange={(e) => handleElementPositionChange('price', 'y', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              min="0"
                              max="150"
                              title="Set price Y position in pixels"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview Actions */}
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => {
                        // Reset to default sample data
                        setPreviewData({
                          name: 'Sample Product',
                          sku: 'SKU-12345',
                          price: '$12.99',
                          bornOnDate: '2025-01-15',
                          expirationDate: '2025-02-15',
                          ingredients: 'Flour, Water, Salt, Yeast',
                          allergens: 'Contains: Wheat',
                          notes: 'Fresh baked daily'
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Reset Sample Data
                    </button>
                    
                    <button
                      onClick={handleGeneratePrintPreview}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Generate Print Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5D01] transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printer Modal */}
      {showPrinterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Add Printer Profile
                </h3>
                <button
                  onClick={() => setShowPrinterModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Printer Name *
                      </label>
                      <input
                        type="text"
                        value={printerFormData.name}
                        onChange={(e) => handlePrinterFormChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Main Thermal Printer"
                        title="Enter printer name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Network Address
                      </label>
                      <input
                        type="text"
                        value={printerFormData.address}
                        onChange={(e) => handlePrinterFormChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="192.168.1.100 or \\\\server\\printer"
                        title="Enter network address"
                      />
                    </div>
                  </div>
                </div>

                {/* Printer Configuration */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Printer Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Driver *
                      </label>
                      <select 
                        value={printerFormData.driver}
                        onChange={(e) => handlePrinterFormChange('driver', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        title="Select driver"
                      >
                        <option value="">Select Driver</option>
                        <option value="ZPL">ZPL (Zebra)</option>
                        <option value="TSPL">TSPL (TSC)</option>
                        <option value="BrotherQL">Brother QL</option>
                        <option value="PDF">PDF (Universal)</option>
                        <option value="ESC/POS">ESC/POS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        DPI *
                      </label>
                      <select 
                        value={printerFormData.dpi}
                        onChange={(e) => handlePrinterFormChange('dpi', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        title="Select DPI"
                      >
                        <option value="">Select DPI</option>
                        <option value="203">203 DPI (Standard)</option>
                        <option value="300">300 DPI (High Quality)</option>
                        <option value="600">600 DPI (Ultra High)</option>
                        <option value="1200">1200 DPI (Print Quality)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Maximum Size */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Maximum Label Size</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Width (inches) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="12"
                        value={printerFormData.maxWidthIn}
                        onChange={(e) => handlePrinterFormChange('maxWidthIn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="4.0"
                        title="Enter maximum width in inches"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Height (inches) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="12"
                        value={printerFormData.maxHeightIn}
                        onChange={(e) => handlePrinterFormChange('maxHeightIn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="6.0"
                        title="Enter maximum height in inches"
                      />
                    </div>
                  </div>
                </div>

                {/* Printer Capabilities */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Printer Capabilities</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={printerFormData.isColor}
                          onChange={(e) => handlePrinterFormChange('isColor', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                        />
                        <span className="ml-2 text-sm text-gray-700">Color Printer</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={printerFormData.isThermal}
                          onChange={(e) => handlePrinterFormChange('isThermal', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                        />
                        <span className="ml-2 text-sm text-gray-700">Thermal Printer</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setShowPrinterModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePrinterProfile}
                className="px-6 py-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5D01] transition-colors"
              >
                Create Printer Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </VendorDashboardLayout>
  );
};

export default LabelProfilesPage;
