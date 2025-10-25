import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ShoppingCart,
  Edit,
  Copy,
  Archive,
  Trash2,
  CheckCircle,
  X,
  Settings,
  Tag,
  Package,
  Truck,
  Store,
  Globe,
  List,
  Wand2
} from 'lucide-react';
import toast from 'react-hot-toast';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import MotivationalQuote from '@/components/dashboard/MotivationalQuote';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SalesWindowWizard from '@/components/sales-windows/SalesWindowWizard';
import SalesWindowReconciliation from '@/components/sales-windows/SalesWindowReconciliation';
import { getQuoteByCategory } from '@/data/motivationalQuotes';
import type {
  SalesWindow,
  SalesWindowStats
} from '@/types/sales-windows';

const VendorSalesWindowsPage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'upcoming' | 'closed'>('all');
  const [searchTerm] = useState('');
  const [filterChannels, setFilterChannels] = useState<string[]>([]);
  const [filterTags] = useState<string[]>([]);
  const [showMarketLinked, setShowMarketLinked] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'cards' | 'calendar'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status' | 'revenue'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedWindows, setSelectedWindows] = useState<string[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [reconciliationWindow, setReconciliationWindow] = useState<{
    id: string;
    name: string;
    products: Array<{
      productId: string;
      name: string;
      holdQuantity: number;
      priceOverride?: number;
      price?: number;
    }>;
  } | null>(null);

  // Mock data for development - replace with actual API calls
  const [mockSalesWindows, setMockSalesWindows] = useState<SalesWindow[]>([
    {
      id: '1',
      vendorId: 'vendor-1',
      type: 'PARK_PICKUP',
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
      vendorId: 'vendor-1',
      type: 'DELIVERY',
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

  // Calculate stats dynamically from actual data based on dates
  const calculateWindowStatus = (window: SalesWindow): 'OPEN' | 'SCHEDULED' | 'CLOSED' | 'ARCHIVED' => {
    if (window.status === 'ARCHIVED') return 'ARCHIVED';
    if (window.status === 'CLOSED') return 'CLOSED';
    
    const now = new Date();
    const preorderStart = window.startDate ? new Date(window.startDate) : null;
    const eventEnd = window.endDate ? new Date(window.endDate) : null;
    
    // If event has ended, it's closed
    if (eventEnd && eventEnd < now) {
      return 'CLOSED';
    }
    
    // If pre-order window is open, window is OPEN
    if (preorderStart && preorderStart <= now) {
      return 'OPEN';
    }
    
    // Otherwise it's scheduled/upcoming
    return 'SCHEDULED';
  };

  const mockStats: SalesWindowStats = {
    totalWindows: mockSalesWindows.length,
    openWindows: mockSalesWindows.filter(w => calculateWindowStatus(w) === 'OPEN').length,
    scheduledWindows: mockSalesWindows.filter(w => calculateWindowStatus(w) === 'SCHEDULED').length,
    draftWindows: 0, // No more drafts
    closedWindows: mockSalesWindows.filter(w => ['CLOSED', 'ARCHIVED'].includes(calculateWindowStatus(w))).length,
    totalRevenue: 0 // TODO: Calculate from actual orders
  };

  // Filter and sort windows based on active tab and filters
  const getFilteredWindows = () => {
    let filtered = mockSalesWindows;

    // Filter by status based on active tab using calculated status
    switch (activeTab) {
      case 'all':
        // Show all windows - no status filtering
        break;
      case 'open':
        filtered = filtered.filter(w => calculateWindowStatus(w) === 'OPEN');
        break;
      case 'upcoming':
        filtered = filtered.filter(w => calculateWindowStatus(w) === 'SCHEDULED');
        break;
      case 'closed':
        filtered = filtered.filter(w => ['CLOSED', 'ARCHIVED'].includes(calculateWindowStatus(w)));
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
        w.channels?.some(c => filterChannels.includes(c.type)) ?? false
      );
    }

    // Filter by tags
    if (filterTags.length > 0) {
      filtered = filtered.filter(w => 
        w.settings?.tags?.some(tag => filterTags.includes(tag)) ?? false
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
      let aValue: string | number | Date, bValue: string | number | Date;
      
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


  const handleDuplicateWindow = (window: SalesWindow) => {
    const duplicatedWindow: SalesWindow = {
      ...window,
      id: `duplicate-${Date.now()}-${Math.random()}`,
      name: `${window.name} (Copy)`,
      status: 'SCHEDULED' as const, // Duplicates default to scheduled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setMockSalesWindows(prev => [duplicatedWindow, ...prev]);
    toast.success(`Duplicated window: ${window.name}`);
    // Auto-switch to upcoming tab to show the duplicated window
    setActiveTab('upcoming');
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


  const handleWindowSelection = (windowId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedWindows(prev => [...prev, windowId]);
    } else {
      setSelectedWindows(prev => prev.filter(id => id !== windowId));
    }
  };

  const handleWizardComplete = (windowData: {
    name: string;
    description: string;
    preorderStartDate: string;
    preorderEndDate: string;
    eventStartDate: string;
    eventEndDate: string;
    channels: Array<{ type: string; config: Record<string, unknown> }>;
    products: Array<{
      productId: string;
      preorderQuantity: number;
      holdQuantity: number;
      maxPreorderQuantity?: number;
    }>;
    settings: {
      allowPreorders: boolean;
      showInStorefront: boolean;
      autoCloseWhenSoldOut: boolean;
      capacity: number;
      tags: string[];
    };
  }) => {
    // Calculate initial status based on dates
    const now = new Date();
    const preorderStart = new Date(windowData.preorderStartDate);
    const eventEnd = new Date(windowData.eventEndDate);
    
    let initialStatus: 'OPEN' | 'SCHEDULED' | 'CLOSED' = 'SCHEDULED';
    if (preorderStart <= now && eventEnd > now) {
      initialStatus = 'OPEN';
    } else if (eventEnd < now) {
      initialStatus = 'CLOSED';
    }
    
    // Create new sales window from wizard data
    const newWindow: SalesWindow = {
      id: Date.now().toString(),
      vendorId: 'vendor-1', // TODO: Get from auth context
      type: windowData.channels[0]?.type as SalesWindow['type'] || 'PARK_PICKUP',
      name: windowData.name,
      description: windowData.description,
      status: initialStatus,
      isEvergreen: false,
      startDate: windowData.eventStartDate,
      endDate: windowData.eventEndDate,
      timezone: 'America/New_York',
      channels: windowData.channels.map(channel => ({
        type: channel.type as 'MEETUP_PICKUP' | 'DELIVERY' | 'DROP_OFF_LOCATION' | 'MARKET' | 'CUSTOM',
        config: channel.config
      })),
      products: windowData.products?.map(product => ({
        productId: product.productId,
        name: `Product ${product.productId}`, // Mock name - would come from API
        description: `Product description for ${product.productId}`,
        price: 0, // Mock price - would come from API
        stock: product.holdQuantity,
        isAvailable: true,
        targetMargin: 0.4,
        productType: 'food' as const,
        onWatchlist: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        vendorProfileId: 'vendor-1',
        priceOverride: 0,
        perOrderLimit: product.maxPreorderQuantity || 0,
        totalCap: product.holdQuantity,
        isVisible: true,
        currentStock: product.holdQuantity
      })) || [],
      settings: {
        allowPreorders: windowData.settings.allowPreorders,
        showInStorefront: windowData.settings.showInStorefront,
        autoCloseWhenSoldOut: windowData.settings.autoCloseWhenSoldOut,
        capacity: windowData.settings.capacity,
        tags: windowData.settings.tags
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMockSalesWindows(prev => [newWindow, ...prev]);
    
    // Create automatic orders for "hold for sale" items
    if (windowData.products && windowData.products.length > 0) {
      createHoldForSaleOrders(newWindow, windowData.products);
    }
    
    toast.success(`Created sales window: ${windowData.name} (Status: ${initialStatus})`);
    setShowWizard(false);
    // Switch to appropriate tab based on status
    if (initialStatus === 'OPEN') {
      setActiveTab('open');
    } else if (initialStatus === 'SCHEDULED') {
      setActiveTab('upcoming');
    }
  };

  const createHoldForSaleOrders = (salesWindow: SalesWindow, products: Array<{
    productId: string;
    preorderQuantity: number;
    holdQuantity: number;
    maxPreorderQuantity?: number;
  }>) => {
    // Mock product data - in real app, this would come from API
    const mockProductData = {
      '1': { name: 'Sourdough Loaf', price: 8.50, recipeId: 'recipe-sourdough', leadTimeDays: 2 },
      '2': { name: 'Chocolate Chip Cookies', price: 3.00, recipeId: 'recipe-cookies', leadTimeDays: 1 },
      '3': { name: 'Artisan Pizza', price: 15.00, recipeId: 'recipe-pizza', leadTimeDays: 1 },
      '4': { name: 'Fresh Croissants', price: 4.50, recipeId: 'recipe-croissants', leadTimeDays: 1 }
    };

    products.forEach((product) => {
      if (product.holdQuantity > 0) {
        const productInfo = mockProductData[product.productId as keyof typeof mockProductData];
        if (productInfo) {
          // Calculate baking date based on event date and lead time
          const eventDate = salesWindow.startDate ? new Date(salesWindow.startDate) : new Date();
          const bakingDate = new Date(eventDate);
          bakingDate.setDate(bakingDate.getDate() - productInfo.leadTimeDays);
          
          // Create order for hold inventory
          const holdOrder = {
            id: `hold-${salesWindow.id}-${product.productId}-${Date.now()}`,
            orderNumber: `HOLD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            customerName: `Hold Inventory - ${salesWindow.name}`,
            customerEmail: 'system@cravedartisan.com',
            status: 'CONFIRMED',
            priority: 'HIGH',
            source: 'SALES_WINDOW_HOLD',
            salesWindowId: salesWindow.id,
            createdAt: new Date().toISOString(),
            dueAt: bakingDate.toISOString(),
            paymentStatus: 'SYSTEM_GENERATED',
            notes: `Auto-generated hold inventory for ${salesWindow.name}. Event date: ${eventDate.toLocaleDateString()}`,
            total: productInfo.price * product.holdQuantity,
            orderItems: [{
              id: `hold-item-${product.productId}`,
              productId: product.productId,
              productName: productInfo.name,
              quantity: product.holdQuantity,
              unitPrice: productInfo.price,
              total: productInfo.price * product.holdQuantity,
              status: 'PENDING',
              madeQty: 0,
              product: {
                id: product.productId,
                name: productInfo.name,
                recipeId: productInfo.recipeId,
                recipe: {
                  id: productInfo.recipeId,
                  name: `${productInfo.name} Recipe`,
                  ingredients: [], // Would be populated from actual recipe
                  steps: [], // Would be populated from actual recipe
                  yieldAmount: 1
                }
              }
            }],
            salesWindow: {
              id: salesWindow.id,
              name: salesWindow.name
            }
          };

          // Store the order in localStorage for now (in real app, this would be an API call)
          const existingOrders = JSON.parse(localStorage.getItem('vendorOrders') || '[]');
          existingOrders.push(holdOrder);
          localStorage.setItem('vendorOrders', JSON.stringify(existingOrders));
          
          // Dispatch custom event to notify orders page
          window.dispatchEvent(new CustomEvent('orderCreated', { detail: holdOrder }));
          
          toast.success(`Created hold inventory order for ${productInfo.name} (${product.holdQuantity} units) - Due: ${bakingDate.toLocaleDateString()}`);
        }
      }
    });
  };

  const handleReconcile = (window: SalesWindow) => {
    // Transform the sales window to match the reconciliation interface
    const reconciliationData = {
      id: window.id,
      name: window.name,
      products: window.products?.map(p => ({
        productId: p.productId,
        name: p.name,
        holdQuantity: p.currentStock || 0, // Use currentStock as holdQuantity
        priceOverride: p.priceOverride,
        price: p.price
      })) ?? []
    };
    setReconciliationWindow(reconciliationData);
    setShowReconciliation(true);
  };

  const handleReconciliationComplete = (reconciliationData: unknown) => {
    console.log('Reconciliation complete:', reconciliationData);
    // In real app, this would update the backend
    toast.success('Sales window reconciled successfully!');
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-[#F7F2EC] rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-200">
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

            <div className="bg-[#F7F2EC] rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-200">
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

            <div className="bg-[#F7F2EC] rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-200">
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

            <div className="bg-[#F7F2EC] rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-200">
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

            <div className="bg-[#F7F2EC] rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-200">
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
          <div className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 p-6 mb-8 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowWizard(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-medium"
                  title="Create new sales window with wizard"
                >
                  <Wand2 className="w-5 h-5" />
                  Create Sales Window Wizard
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement export functionality
                    const csvContent = filteredWindows.map(w => 
                      `${w.name},${w.status},${w.isEvergreen ? 'Evergreen' : w.startDate},${w.channels?.map(c => c.type).join(';') ?? ''},${w.products?.length ?? 0}`
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
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden">
                <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                    title="List view"
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                      viewMode === 'cards' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Card view"
                  >
                    <Package className="w-4 h-4" />
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                      viewMode === 'calendar' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Calendar view"
                  >
                    <Calendar className="w-4 h-4" />
                    Calendar
                </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { key: 'all', label: 'All', count: mockSalesWindows.length },
                  { key: 'open', label: 'Open', count: mockStats.openWindows },
                  { key: 'upcoming', label: 'Upcoming', count: mockStats.scheduledWindows },
                  { key: 'closed', label: 'Closed/Archived', count: mockStats.closedWindows }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as 'all' | 'open' | 'upcoming' | 'closed')}
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
            
          </div>


          {/* Quick Filters */}
          <div className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 p-4 mb-6 hover:shadow-md transition-all duration-300">
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
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'status' | 'revenue')}
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
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
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
            <div className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {filteredWindows.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sales windows found</h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab === 'all' && 'No sales windows found. Create your first one to get started!'}
                    {activeTab === 'open' && 'No open sales windows at the moment.'}
                    {activeTab === 'upcoming' && 'No upcoming sales windows scheduled.'}
                    {activeTab === 'closed' && 'No closed or archived sales windows.'}
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedWindows(filteredWindows.map(w => w.id));
                            } else {
                              setSelectedWindows([]);
                            }
                          }}
                          title="Select all"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channels</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWindows.map((window, index) => (
                      <tr key={window.id} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-[#FFFBF5]'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedWindows.includes(window.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWindows(prev => [...prev, window.id]);
                              } else {
                                setSelectedWindows(prev => prev.filter(id => id !== window.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            aria-label={`Select ${window.name}`}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const currentStatus = calculateWindowStatus(window);
                            return (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(currentStatus)}`}>
                                {getStatusIcon(currentStatus)}
                                {currentStatus}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{window.name}</div>
                            {window.description && (
                              <div className="text-sm text-gray-500 truncate max-w-md">{window.description}</div>
                            )}
                      </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {!window.isEvergreen && window.startDate && window.endDate ? (
                            <div>
                              <div>{new Date(window.startDate).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-400">to {new Date(window.endDate).toLocaleDateString()}</div>
                            </div>
                          ) : (
                            <span className="text-blue-600">Evergreen</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {window.channels?.map((channel, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                              >
                                {getChannelIcon(channel.type)}
                                {getChannelLabel(channel.type)}
                              </span>
                            )) ?? []}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {window.products?.length || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setShowWizard(true);
                                toast('Edit functionality coming soon - opening wizard for now');
                              }}
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                              title="Edit window"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDuplicateWindow(window)}
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                              title="Duplicate window"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            
                            {window.status === 'OPEN' ? (
                              <button
                                onClick={() => handleToggleStatus(window)}
                                className="p-1.5 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded transition-colors"
                                title="Close window"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            ) : window.status === 'SCHEDULED' ? (
                              <button
                                onClick={() => handleToggleStatus(window)}
                                className="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                                title="Open window"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            ) : null}
                            
                            <button
                              onClick={() => handleDeleteWindow(window)}
                              className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                              title="Delete window permanently"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            
                            {/* {window.status !== 'ARCHIVED' && (
                              <button
                                onClick={() => handleArchiveWindow(window)}
                                className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                                title="Archive window for future duplication"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                            )} */}
                            
                            {window.status === 'CLOSED' && (window.products?.length || 0) > 0 && (
                              <button
                                onClick={() => handleReconcile(window)}
                                className="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                                title="Reconcile inventory and sales"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : viewMode === 'cards' ? (
            <div className="space-y-4">
              {filteredWindows.length === 0 ? (
                <div className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sales windows found</h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab === 'all' && 'No sales windows found. Create your first one to get started!'}
                    {activeTab === 'open' && 'No open sales windows at the moment.'}
                    {activeTab === 'upcoming' && 'No upcoming sales windows scheduled.'}
                    {activeTab === 'closed' && 'No closed or archived sales windows.'}
                  </p>
                </div>
              ) : (
                filteredWindows.map((window) => {
                  const currentStatus = calculateWindowStatus(window);
                  return (
                  <div key={window.id} className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                    {currentStatus === 'OPEN' && (
                      <div className="bg-green-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 animate-pulse" />
                        <span className="font-bold text-sm">LIVE SALES WINDOW - Accepting Orders Now</span>
                      </div>
                    )}
                    
                    <div className={`p-4 bg-white ${currentStatus === 'OPEN' ? 'rounded-b-lg' : 'rounded-lg'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedWindows.includes(window.id)}
                              onChange={(e) => handleWindowSelection(window.id, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label={`Select ${window.name} for bulk operations`}
                            />
                          </label>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{window.name}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(currentStatus)}`}>
                                {getStatusIcon(currentStatus)}
                                {currentStatus}
                                {currentStatus === 'OPEN' && <span className="ml-1 text-xs">LIVE</span>}
                          </span>
                          {'isEvergreen' in window && window.isEvergreen && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Clock className="h-3 w-3" />
                              Evergreen
                            </span>
                          )}
                          {'marketId' in window && window.marketId && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Store className="h-3 w-3" />
                              Market
                            </span>
                          )}
                        </div>
                        
                        {window.description && (
                              <p className="text-sm text-gray-600 mb-2">{window.description}</p>
                        )}
                        
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                          {!('isEvergreen' in window && window.isEvergreen) && 'startDate' in window && 'endDate' in window && window.startDate && window.endDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(window.startDate).toLocaleDateString()} - {new Date(window.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                            <span>{'timezone' in window ? window.timezone : 'Unknown'}</span>
                          </div>
                              
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                <span>{window.products?.length || 0} products</span>
                        </div>
                        
                              <div className="flex items-center gap-1">
                                <ShoppingCart className="h-3 w-3" />
                                <span>Cap: {window.settings?.capacity || 0}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2">
                          {window.channels?.map((channel, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {getChannelIcon(channel.type)}
                              {getChannelLabel(channel.type)}
                            </span>
                          ))}
                          {window.settings?.tags && window.settings.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                                  <span className="text-xs text-gray-500">{window.settings?.tags?.join(', ') || ''}</span>
                            </div>
                          )}
                            </div>
                        </div>
                      </div>
                      
                        <div className="flex items-center gap-1 ml-4">
                        <button
                            onClick={() => {
                              // TODO: Implement edit functionality
                              // For now, open the wizard in edit mode
                              setShowWizard(true);
                              toast('Edit functionality coming soon - opening wizard for now');
                            }}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit window"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDuplicateWindow(window)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          title="Duplicate window"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        
                          {currentStatus === 'OPEN' ? (
                          <button
                            onClick={() => handleToggleStatus(window)}
                              className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-md transition-colors"
                            title="Close window"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          ) : currentStatus === 'SCHEDULED' ? (
                          <button
                            onClick={() => handleToggleStatus(window)}
                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors"
                            title="Open window"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        ) : null}
                        
                        <button
                          onClick={() => handleDeleteWindow(window)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete window permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        {/* {window.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleArchiveWindow(window)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                            title="Archive window for future duplication"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )} */}
                          
                          {currentStatus === 'CLOSED' && (window.products?.length || 0) > 0 && (
                            <button
                              onClick={() => handleReconcile(window)}
                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors"
                              title="Reconcile inventory and sales"
                            >
                              <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="bg-[#F7F2EC] rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center text-gray-600">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
                <p className="text-gray-600">Calendar view functionality coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sales Window Wizard */}
      <SalesWindowWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={handleWizardComplete}
      />

      {/* Sales Window Reconciliation */}
      {reconciliationWindow && (
        <SalesWindowReconciliation
          isOpen={showReconciliation}
          onClose={() => {
            setShowReconciliation(false);
            setReconciliationWindow(null);
          }}
          salesWindow={reconciliationWindow}
          onComplete={handleReconciliationComplete}
        />
      )}

        </VendorDashboardLayout>
      );
    };

export default VendorSalesWindowsPage;
