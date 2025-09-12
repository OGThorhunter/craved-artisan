import React, { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Calendar,
  Clock,
  MapPin,
  ShoppingCart,
  Plus,
  Edit,
  Copy,
  Archive,
  Trash2,
  Search,
  ArrowLeft,
  CheckCircle,
  X,
  Settings,
  Tag,
  Package,
  Truck,
  Store,
  Globe,
  List
} from 'lucide-react';
import toast from 'react-hot-toast';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import MotivationalQuote from '@/components/dashboard/MotivationalQuote';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { getQuoteByCategory } from '@/data/motivationalQuotes';
import CreateEditSalesWindowDrawer from '@/components/sales-windows/CreateEditSalesWindowDrawer';
import BulkOperationsBar from '@/components/sales-windows/BulkOperationsBar';
import type { 
  SalesWindow, 
  SalesChannel, 
  WindowProduct, 
  WindowSettings, 
  MarketEvent, 
  SalesWindowStats 
} from '@/types/sales-windows';

const VendorSalesWindowsPage = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'open' | 'upcoming' | 'drafts' | 'closed'>('open');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChannels, setFilterChannels] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showMarketLinked, setShowMarketLinked] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status' | 'revenue'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingWindow, setEditingWindow] = useState<SalesWindow | undefined>(undefined);
  const [selectedWindows, setSelectedWindows] = useState<string[]>([]);
  const [showBatchOrderModal, setShowBatchOrderModal] = useState(false);
  const [batchOrderProducts, setBatchOrderProducts] = useState<Array<{product: any, quantity: number}>>([]);

  // Mock data for development - replace with actual API calls
  const [mockSalesWindows, setMockSalesWindows] = useState<SalesWindow[]>([
    {
      id: '1',
      name: 'Weekend Market Pickup',
      description: 'Fresh bread and pastries for weekend pickup',
      status: 'OPEN',
      isEvergreen: false,
      startDate: '2025-09-06T08:00:00Z',
      endDate: '2025-09-08T18:00:00Z',
      timezone: 'America/New_York',
      channels: [
        {
          type: 'MEETUP_PICKUP',
          config: {
            timeSlots: [
              { id: '1', startTime: '09:00', endTime: '12:00', maxCapacity: 50, currentCapacity: 25 },
              { id: '2', startTime: '14:00', endTime: '17:00', maxCapacity: 50, currentCapacity: 15 }
            ],
            pickupNotes: 'Pickup at our bakery location'
          }
        }
      ],
      products: [
        {
          productId: '1',
          name: 'Sourdough Bread',
          description: 'Traditional sourdough bread made with organic flour',
          price: 6.99,
          imageUrl: '/images/sourdough.jpg',
          tags: ['bread', 'sourdough', 'organic'],
          stock: 75,
          isAvailable: true,
          targetMargin: 0.4,
          recipeId: 'recipe-1',
          productType: 'food' as const,
          onWatchlist: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          vendorProfileId: 'vendor-1',
          priceOverride: 6.99,
          perOrderLimit: 3,
          totalCap: 100,
          isVisible: true,
          currentStock: 75
        }
      ],
      settings: {
        allowPreorders: true,
        showInStorefront: true,
        autoCloseWhenSoldOut: false,
        capacity: 100,
        tags: ['bread', 'weekend', 'pickup']
      },
      createdAt: '2025-09-01T10:00:00Z',
      updatedAt: '2025-09-01T10:00:00Z'
    },
    {
      id: '2',
      name: 'Holiday Delivery Special',
      description: 'Special holiday delivery service',
      status: 'SCHEDULED',
      isEvergreen: false,
      startDate: '2025-12-20T00:00:00Z',
      endDate: '2025-12-24T23:59:59Z',
      timezone: 'America/New_York',
      channels: [
        {
          type: 'DELIVERY',
          config: {
            serviceRadius: 25,
            baseFee: 5.99,
            perDistanceFee: 0.50,
            cutoffHours: 24
          }
        }
      ],
      products: [],
      settings: {
        allowPreorders: true,
        showInStorefront: true,
        autoCloseWhenSoldOut: true,
        capacity: 200,
        tags: ['holiday', 'delivery']
      },
      createdAt: '2025-09-01T10:00:00Z',
      updatedAt: '2025-09-01T10:00:00Z'
    }
  ]);

  // Calculate stats dynamically from actual data
  const mockStats: SalesWindowStats = {
    totalWindows: mockSalesWindows.length,
    openWindows: mockSalesWindows.filter(w => w.status === 'OPEN').length,
    scheduledWindows: mockSalesWindows.filter(w => w.status === 'SCHEDULED').length,
    draftWindows: mockSalesWindows.filter(w => w.status === 'DRAFT').length,
    closedWindows: mockSalesWindows.filter(w => ['CLOSED', 'ARCHIVED'].includes(w.status)).length,
    totalRevenue: 0 // TODO: Calculate from actual orders
  };

  // Filter and sort windows based on active tab and filters
  const getFilteredWindows = () => {
    let filtered = mockSalesWindows;

    // Filter by status based on active tab
    switch (activeTab) {
      case 'open':
        filtered = filtered.filter(w => w.status === 'OPEN');
        break;
      case 'upcoming':
        filtered = filtered.filter(w => w.status === 'SCHEDULED');
        break;
      case 'drafts':
        filtered = filtered.filter(w => w.status === 'DRAFT');
        break;
      case 'closed':
        filtered = filtered.filter(w => ['CLOSED', 'ARCHIVED'].includes(w.status));
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by channels
    if (filterChannels.length > 0) {
      filtered = filtered.filter(w => 
        w.channels.some(c => filterChannels.includes(c.type))
      );
    }

    // Filter by tags
    if (filterTags.length > 0) {
      filtered = filtered.filter(w => 
        w.settings.tags.some(tag => filterTags.includes(tag))
      );
    }

    // Filter by market linked
    if (showMarketLinked) {
      filtered = filtered.filter(w => w.marketId);
    }

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(w => {
        if (w.isEvergreen) return true;
        if (!w.startDate || !w.endDate) return false;
        const startDate = new Date(w.startDate);
        const endDate = new Date(w.endDate);
        const filterStart = new Date(dateRange.start);
        const filterEnd = new Date(dateRange.end);
        return startDate >= filterStart && endDate <= filterEnd;
      });
    }

    // Sort windows
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = a.isEvergreen ? new Date(0) : new Date(a.startDate || 0);
          bValue = b.isEvergreen ? new Date(0) : new Date(b.startDate || 0);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'revenue':
          aValue = 0; // TODO: Add actual revenue calculation
          bValue = 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-500 text-white border-green-600 shadow-lg animate-pulse';
      case 'SCHEDULED':
        return 'bg-blue-500 text-white border-blue-600 shadow-md';
      case 'DRAFT':
        return 'bg-gray-500 text-white border-gray-600 shadow-sm';
      case 'CLOSED':
        return 'bg-yellow-500 text-white border-yellow-600 shadow-sm';
      case 'ARCHIVED':
        return 'bg-red-500 text-white border-red-600 shadow-sm';
      default:
        return 'bg-gray-500 text-white border-gray-600 shadow-sm';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <CheckCircle className="h-4 w-4" />;
      case 'SCHEDULED':
        return <Clock className="h-4 w-4" />;
      case 'DRAFT':
        return <Edit className="h-4 w-4" />;
      case 'CLOSED':
        return <X className="h-4 w-4" />;
      case 'ARCHIVED':
        return <Archive className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'MEETUP_PICKUP':
        return <MapPin className="h-3 w-3" />;
      case 'DELIVERY':
        return <Truck className="h-3 w-3" />;
      case 'DROP_OFF_LOCATION':
        return <Package className="h-3 w-3" />;
      case 'MARKET':
        return <Store className="h-3 w-3" />;
      case 'CUSTOM':
        return <Settings className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  const getChannelLabel = (channelType: string) => {
    switch (channelType) {
      case 'MEETUP_PICKUP':
        return 'Pickup';
      case 'DELIVERY':
        return 'Delivery';
      case 'DROP_OFF_LOCATION':
        return 'Drop-off';
      case 'MARKET':
        return 'Market';
      case 'CUSTOM':
        return 'Custom';
      default:
        return channelType;
    }
  };

  const handleCreateWindow = () => {
    setEditingWindow(undefined);
    setIsDrawerOpen(true);
  };

  const handleEditWindow = (window: SalesWindow) => {
    setEditingWindow(window);
    setIsDrawerOpen(true);
  };

  const handleCreateBatchOrders = (products: Array<{product: any, quantity: number}>) => {
    setBatchOrderProducts(products);
    setShowBatchOrderModal(true);
    // In a real app, this would create actual orders in the order management system
    toast.success(`Created ${products.length} batch orders for ${products.reduce((sum, p) => sum + p.quantity, 0)} total items`);
  };

  const handleDuplicateWindow = (window: SalesWindow) => {
    const duplicatedWindow: SalesWindow = {
      ...window,
      id: `duplicate-${Date.now()}-${Math.random()}`,
      name: `${window.name} (Copy)`,
      status: 'DRAFT' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setMockSalesWindows(prev => [duplicatedWindow, ...prev]);
    toast.success(`Duplicated window: ${window.name}`);
    // Auto-switch to drafts tab to show the duplicated window
    setActiveTab('drafts');
  };

  const handleToggleStatus = (window: SalesWindow) => {
    if (window.status === 'OPEN') {
      // Warning for closing an open window
      const confirmed = globalThis.confirm(
        `⚠️ WARNING: You are about to CLOSE a live sales window.\n\n` +
        `This will:\n` +
        `• Stop accepting new orders immediately\n` +
        `• Notify customers that the window is closed\n` +
        `• Prevent any new sales from this window\n\n` +
        `Are you sure you want to close "${window.name}"?`
      );
      if (confirmed) {
        const updatedWindows = mockSalesWindows.map(w => 
          w.id === window.id ? { ...w, status: 'CLOSED' as const, updatedAt: new Date().toISOString() } : w
        );
        setMockSalesWindows(updatedWindows);
        toast.success(`Closed sales window: ${window.name}`);
      }
    } else if (window.status === 'SCHEDULED') {
      // Warning for opening a scheduled window
      const confirmed = globalThis.confirm(
        `⚠️ WARNING: You are about to OPEN a live sales window.\n\n` +
        `This will:\n` +
        `• Start accepting orders immediately\n` +
        `• Make the window visible to customers\n` +
        `• Begin live sales from this window\n\n` +
        `Are you sure you want to open "${window.name}" now?`
      );
      if (confirmed) {
        const updatedWindows = mockSalesWindows.map(w => 
          w.id === window.id ? { ...w, status: 'OPEN' as const, updatedAt: new Date().toISOString() } : w
        );
        setMockSalesWindows(updatedWindows);
        toast.success(`Opened sales window: ${window.name}`);
      }
    }
  };

  const handleDeleteWindow = (window: SalesWindow) => {
    const confirmed = globalThis.confirm(
      `⚠️ DANGER: You are about to PERMANENTLY DELETE this sales window.\n\n` +
      `This will:\n` +
      `• Permanently remove the window and all its data\n` +
      `• Cannot be undone or recovered\n` +
      `• All associated orders and history will be lost\n\n` +
      `Are you absolutely sure you want to delete "${window.name}"?\n\n` +
      `Type "DELETE" to confirm (case sensitive):`
    );
    
    if (confirmed) {
      const userInput = globalThis.prompt(
        `Type "DELETE" to confirm permanent deletion of "${window.name}":`
      );
      
      if (userInput === "DELETE") {
        const updatedWindows = mockSalesWindows.filter(w => w.id !== window.id);
        setMockSalesWindows(updatedWindows);
        toast.error(`Permanently deleted window: ${window.name}`);
      } else {
        toast.success("Deletion cancelled - confirmation text did not match");
      }
    }
  };

  const handleArchiveWindow = (window: SalesWindow) => {
    const confirmed = globalThis.confirm(
      `📦 ARCHIVE: You are about to archive this sales window.\n\n` +
      `This will:\n` +
      `• Move the window to archived status\n` +
      `• Hide it from normal views\n` +
      `• Preserve all data for future duplication\n` +
      `• Keep all settings and configurations\n\n` +
      `Are you sure you want to archive "${window.name}"?`
    );
    
    if (confirmed) {
      const updatedWindows = mockSalesWindows.map(w => 
        w.id === window.id 
          ? { ...w, status: 'ARCHIVED' as const, updatedAt: new Date().toISOString() }
          : w
      );
      setMockSalesWindows(updatedWindows);
      toast.success(`Archived window: ${window.name} (available for duplication)`);
    }
  };

  const handleSaveWindow = (windowData: Partial<SalesWindow>) => {
    if (editingWindow) {
      // Update existing window
      const updatedWindows = mockSalesWindows.map(w => 
        w.id === editingWindow.id 
          ? { ...w, ...windowData, id: editingWindow.id }
          : w
      );
      setMockSalesWindows(updatedWindows);
      toast.success(`Updated window: ${windowData.name}`);
    } else {
      // Create new window
      const newWindow: SalesWindow = {
        id: `window-${Date.now()}`,
        name: windowData.name || 'Untitled Window',
        description: windowData.description || '',
        status: windowData.status || 'DRAFT',
        isEvergreen: windowData.isEvergreen || false,
        startDate: windowData.startDate || '',
        endDate: windowData.endDate || '',
        timezone: windowData.timezone || 'America/New_York',
        channels: windowData.channels || [],
        products: windowData.products || [],
        settings: windowData.settings || {
          allowPreorders: true,
          showInStorefront: true,
          autoCloseWhenSoldOut: false,
          capacity: 100,
          tags: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setMockSalesWindows(prev => [newWindow, ...prev]);
      toast.success(`Created window: ${windowData.name}`);
      // Auto-switch to drafts tab to show the new window
      setActiveTab('drafts');
    }
    setEditingWindow(undefined);
    setIsDrawerOpen(false);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingWindow(undefined);
  };

  // Bulk operations
  const handleBulkStatusChange = (status: string) => {
    // Update selected windows status
    const updatedWindows = mockSalesWindows.map(window => 
      selectedWindows.includes(window.id) 
        ? { ...window, status: status as 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'ARCHIVED' }
        : window
    );
    setMockSalesWindows(updatedWindows);
    toast.success(`Updated ${selectedWindows.length} windows to ${status.toLowerCase()}`);
    setSelectedWindows([]);
  };

  const handleBulkArchive = () => {
    // Archive selected windows
    const updatedWindows = mockSalesWindows.map(window => 
      selectedWindows.includes(window.id) 
        ? { ...window, status: 'ARCHIVED' as const }
        : window
    );
    setMockSalesWindows(updatedWindows);
    toast.success(`Archived ${selectedWindows.length} windows`);
    setSelectedWindows([]);
  };

  const handleBulkDuplicate = () => {
    // Duplicate selected windows
    const windowsToDuplicate = mockSalesWindows.filter(window => 
      selectedWindows.includes(window.id)
    );
    
    const duplicatedWindows = windowsToDuplicate.map(window => ({
      ...window,
      id: `duplicate-${Date.now()}-${Math.random()}`,
      name: `${window.name} (Copy)`,
      status: 'DRAFT' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    setMockSalesWindows(prev => [...duplicatedWindows, ...prev]);
    toast.success(`Duplicated ${selectedWindows.length} windows`);
    setSelectedWindows([]);
    // Auto-switch to drafts tab to show the duplicated windows
    setActiveTab('drafts');
  };

  const handleBulkDelete = () => {
    // Delete selected windows
    const updatedWindows = mockSalesWindows.filter(window => 
      !selectedWindows.includes(window.id)
    );
    setMockSalesWindows(updatedWindows);
    toast.success(`Deleted ${selectedWindows.length} windows`);
    setSelectedWindows([]);
  };

  const handleSelectAll = () => {
    setSelectedWindows(mockSalesWindows.map(w => w.id));
  };

  const handleClearSelection = () => {
    setSelectedWindows([]);
  };

  const handleWindowSelection = (windowId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedWindows(prev => [...prev, windowId]);
    } else {
      setSelectedWindows(prev => prev.filter(id => id !== windowId));
    }
  };

  const filteredWindows = getFilteredWindows();

  return (
    <VendorDashboardLayout>
      <div className="p-6 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <DashboardHeader 
            title="Sales Windows"
            description="Create and manage your sales windows for different channels and time periods"
          />

          {/* Motivational Quote */}
          <MotivationalQuote
            quote={getQuoteByCategory('success').quote}
            author={getQuoteByCategory('success').author}
            icon={getQuoteByCategory('success').icon}
            variant={getQuoteByCategory('success').variant}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Windows</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalWindows}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.openWindows}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.scheduledWindows}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Edit className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.draftWindows}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Closed</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.closedWindows}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#F7F2EC' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${mockStats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="rounded-lg shadow-lg p-6 mb-8 hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#F7F2EC' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleCreateWindow}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Sales Window
                  </button>
                  <span className="text-xs text-gray-600 text-center">New windows start as drafts</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // TODO: Implement export functionality
                    const csvContent = filteredWindows.map(w => 
                      `${w.name},${w.status},${w.isEvergreen ? 'Evergreen' : w.startDate},${w.channels.map(c => c.type).join(';')},${w.products.length}`
                    ).join('\n');
                    const blob = new Blob([`Name,Status,Start Date,Channels,Products\n${csvContent}`], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `sales-windows-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    toast.success('Sales windows exported successfully');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  title="Export to CSV"
                >
                  <Settings className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  {viewMode === 'list' ? <Calendar className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  {viewMode === 'list' ? 'Calendar' : 'List'}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-lg shadow-lg mb-8" style={{ backgroundColor: '#F7F2EC' }}>
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { key: 'open', label: 'Open', count: mockStats.openWindows },
                  { key: 'upcoming', label: 'Upcoming', count: mockStats.scheduledWindows },
                  { key: 'drafts', label: 'Drafts', count: mockStats.draftWindows },
                  { key: 'closed', label: 'Closed/Archived', count: mockStats.closedWindows }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Bulk Operations Bar */}
            <BulkOperationsBar
              selectedWindows={selectedWindows}
              onBulkStatusChange={handleBulkStatusChange}
              onBulkArchive={handleBulkArchive}
              onBulkDuplicate={handleBulkDuplicate}
              onBulkDelete={handleBulkDelete}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              totalWindows={filteredWindows.length}
            />
          </div>


          {/* Quick Filters */}
          <div className="rounded-lg shadow-lg p-4 mb-6 hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#F7F2EC' }}>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Filter:</span>
              </div>
              
              <div>
                <label htmlFor="channel-filter" className="sr-only">Filter by Channel</label>
                <select
                  id="channel-filter"
                  value={filterChannels.length === 0 ? 'all' : filterChannels[0]}
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setFilterChannels([]);
                    } else {
                      setFilterChannels([e.target.value]);
                    }
                  }}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Channels</option>
                  <option value="MEETUP_PICKUP">Pickup</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="DROP_OFF_LOCATION">Drop-off</option>
                  <option value="MARKET">Market</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>

              <div>
                <label htmlFor="sort-by" className="sr-only">Sort by</label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="status">Sort by Status</option>
                  <option value="revenue">Sort by Revenue</option>
                </select>
              </div>

              <div>
                <label htmlFor="sort-order" className="sr-only">Sort Order</label>
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                  <input
                    type="checkbox"
                    checked={showMarketLinked}
                    onChange={(e) => setShowMarketLinked(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Market-linked only</span>
                </label>
              </div>

              <div className="ml-auto">
                <button
                  onClick={() => {
                    setFilterChannels([]);
                    setShowMarketLinked(false);
                    setSortBy('date');
                    setSortOrder('desc');
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {viewMode === 'list' ? (
            <div className="space-y-6">
              {filteredWindows.length === 0 ? (
                <div className="rounded-lg shadow-lg p-12 text-center" style={{ backgroundColor: '#F7F2EC' }}>
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sales windows found</h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab === 'open' && 'No open sales windows at the moment.'}
                    {activeTab === 'upcoming' && 'No upcoming sales windows scheduled.'}
                    {activeTab === 'drafts' && 'No draft sales windows created yet.'}
                    {activeTab === 'closed' && 'No closed or archived sales windows.'}
                  </p>
                  <button
                    onClick={handleCreateWindow}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Sales Window
                  </button>
                </div>
              ) : (
                filteredWindows.map((window) => (
                  <div key={window.id} className="bg-offwhite rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#F7F2EC' }}>
                    {window.status === 'OPEN' && (
                      <div className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 animate-pulse" />
                        <span className="font-bold">LIVE SALES WINDOW - Accepting Orders Now</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedWindows.includes(window.id)}
                              onChange={(e) => handleWindowSelection(window.id, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label={`Select ${window.name} for bulk operations`}
                            />
                          </label>
                          <h3 className="text-lg font-semibold text-gray-900">{window.name}</h3>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(window.status)}`}>
                            {getStatusIcon(window.status)}
                            {window.status}
                            {window.status === 'OPEN' && <span className="ml-1 text-xs">LIVE</span>}
                          </span>
                          {window.isEvergreen && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Clock className="h-3 w-3" />
                              Evergreen
                            </span>
                          )}
                          {window.marketId && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Store className="h-3 w-3" />
                              Market
                            </span>
                          )}
                        </div>
                        
                        {window.description && (
                          <p className="text-gray-600 mb-4">{window.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 mb-4">
                          {!window.isEvergreen && window.startDate && window.endDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(window.startDate).toLocaleDateString()} - {new Date(window.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{window.timezone}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                          {window.channels.map((channel, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {getChannelIcon(channel.type)}
                              {getChannelLabel(channel.type)}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Products: {window.products.length}</span>
                          <span>Capacity: {window.settings.capacity}</span>
                          {window.settings.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {window.settings.tags.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditWindow(window)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-brand-beige rounded-md transition-colors"
                          title="Edit window"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDuplicateWindow(window)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-brand-beige rounded-md transition-colors"
                          title="Duplicate window"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        
                        {window.status === 'OPEN' ? (
                          <button
                            onClick={() => handleToggleStatus(window)}
                            className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-white rounded-md transition-colors"
                            title="Close window"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        ) : window.status === 'SCHEDULED' ? (
                          <button
                            onClick={() => handleToggleStatus(window)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-white rounded-md transition-colors"
                            title="Open window"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        ) : null}
                        
                        <button
                          onClick={() => handleDeleteWindow(window)}
                          className="p-2 text-red-700 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete window permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        {window.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleArchiveWindow(window)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                            title="Archive window for future duplication"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center text-gray-600">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
                <p className="text-gray-600">Calendar view functionality coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>

          {/* Create/Edit Sales Window Drawer */}
          <CreateEditSalesWindowDrawer
            isOpen={isDrawerOpen}
            onClose={handleCloseDrawer}
            window={editingWindow}
            onSave={handleSaveWindow}
            onCreateBatchOrders={handleCreateBatchOrders}
          />

          {/* Batch Order Confirmation Modal */}
          {showBatchOrderModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Batch Orders Created</h3>
                    <button
                      onClick={() => setShowBatchOrderModal(false)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Close batch order modal"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <p className="text-green-800 font-medium">
                          Successfully created {batchOrderProducts.length} batch orders
                        </p>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        These orders have been moved to the Order Management tab for processing.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Order Summary:</h4>
                      {batchOrderProducts.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-sm text-gray-600">${item.product.priceOverride || item.product.price} each</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">Qty: {item.quantity}</p>
                            <p className="text-sm text-gray-600">
                              Total: ${(item.quantity * (item.product.priceOverride || item.product.price)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowBatchOrderModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowBatchOrderModal(false);
                      setLocation('/dashboard/vendor/orders');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Orders
                  </button>
                </div>
              </div>
            </div>
          )}
        </VendorDashboardLayout>
      );
    };

export default VendorSalesWindowsPage;
