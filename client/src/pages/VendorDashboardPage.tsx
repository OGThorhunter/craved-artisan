import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import OnboardingPrompt from '../components/OnboardingPrompt';
import TaxForecastCard from '../components/TaxForecastCard';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import InspirationalQuote from '../components/InspirationalQuote';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Star, 
  Plus,
  Eye,
  BarChart3,
  Settings,
  ShoppingCart,
  Store,
  Palette,
  Target,
  Calendar,
  MessageSquare,
  FileText,
  Shield,
  CreditCard,
  Truck,
  Award,
  AlertTriangle,
  TrendingDown,
  RefreshCw,
  CheckCircle,
  XCircle,
  ExternalLink,
  Edit,
  Globe,
  Power,
  PowerOff,
  ShoppingBag
} from 'lucide-react';

export const VendorDashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  
  // Site status state - in real app this would come from API
  const [siteIsLive, setSiteIsLive] = useState(true);
  
  // Handle site status toggle
  const handleSiteToggle = () => {
    const newStatus = !siteIsLive;
    setSiteIsLive(newStatus);
    toast.success(newStatus ? 'Storefront is now live!' : 'Storefront taken offline');
  };

  // API functions
  const fetchVendorProfile = async () => {
    const response = await axios.get('/api/vendor/profile', {
      withCredentials: true
    });
    return response.data;
  };

  const fetchLowMarginProducts = async () => {
    const response = await axios.get('/api/vendor/products/low-margin', {
      withCredentials: true
    });
    return response.data;
  };

  const fetchIngredientPriceAlerts = async () => {
    const response = await axios.get('/api/vendor/products/ingredient-price-alerts', {
      withCredentials: true
    });
    return response.data;
  };

  const batchUpdatePricing = async (data: { targetMargin: number; productIds?: string[] }) => {
    const response = await axios.post('/api/vendor/products/batch-update-pricing', data, {
      withCredentials: true
    });
    return response.data;
  };

  // React Query hooks
  const { data: vendorProfile, isLoading: vendorProfileLoading } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn: fetchVendorProfile,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: lowMarginData, isLoading: lowMarginLoading } = useQuery({
    queryKey: ['low-margin-products'],
    queryFn: fetchLowMarginProducts,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: priceAlertsData, isLoading: priceAlertsLoading } = useQuery({
    queryKey: ['ingredient-price-alerts'],
    queryFn: fetchIngredientPriceAlerts,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const batchUpdateMutation = useMutation({
    mutationFn: batchUpdatePricing,
    onSuccess: (data) => {
      toast.success(`Updated ${data.summary.updated} products with new pricing`);
      queryClient.invalidateQueries({ queryKey: ['low-margin-products'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient-price-alerts'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update pricing';
      toast.error(message);
    }
  });

  // Mock data - in real app, this would come from API
  const stats = {
    totalSales: 12450.75,
    totalOrders: 89,
    totalProducts: 24,
    averageRating: 4.8,
    monthlyGrowth: 12.5,
    totalCustomers: 156,
    lowStockItems: 3,
    lowMarginItems: lowMarginData?.count || 0,
    priceAlerts: priceAlertsData?.count || 0,
    watchlistItems: 5 // This would come from API in real implementation
  };

  // Check if vendor has completed Stripe onboarding
  if (!vendorProfileLoading && vendorProfile && !vendorProfile.stripeAccountId) {
    return <OnboardingPrompt />;
  }

  // Store overview cards configuration
  const storeOverviewCards = [
    {
      id: 'products',
      title: 'Product Catalog',
      description: 'Manage your product catalog, add new items, and track inventory',
      icon: Package,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/dashboard/vendor/products',
      stats: `${stats.totalProducts} active products`,
      action: 'Manage Products',
      actionLink: '/dashboard/vendor/products'
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'View sales reports, customer insights, and performance metrics',
      icon: BarChart3,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/dashboard/vendor/analytics',
      stats: `$${stats.totalSales.toLocaleString()} total sales`,
      action: 'View Reports',
      actionLink: '/dashboard/vendor/analytics'
    },
    {
      id: 'customers',
      title: 'Customer Management',
      description: 'Manage customer relationships, view orders, and track loyalty',
      icon: Users,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/dashboard/vendor/orders',
      stats: `${stats.totalCustomers} total customers`,
      action: 'View Orders',
      actionLink: '/dashboard/vendor/orders'
    }
  ];

  // Quick action cards for common tasks
  const quickActions = [
    {
      id: 'manage-products',
      title: 'Manage Products',
      description: 'View and manage your product catalog',
      icon: Package,
      color: 'bg-blue-500',
      link: '/dashboard/vendor/products'
    },
    {
      id: 'add-product',
      title: 'Add New Product',
      description: 'Create a new product listing',
      icon: Plus,
      color: 'bg-emerald-500',
      link: '/dashboard/vendor/products'
    },
              {
            id: 'watchlist',
            title: 'Product Watchlist',
            description: 'Monitor products with price volatility',
            icon: Eye,
            color: 'bg-yellow-500',
            link: '/dashboard/watchlist'
          },
          {
            id: 'orders',
            title: 'Order Fulfillment',
            description: 'Manage and track customer orders',
            icon: Package,
            color: 'bg-blue-500',
            link: '/dashboard/orders'
          },
          {
            id: 'delivery-batching',
            title: 'Delivery Batching',
            description: 'Organize orders by delivery day',
            icon: Calendar,
            color: 'bg-purple-500',
            link: '/dashboard/vendor/delivery-batching'
          },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Check your performance metrics',
      icon: TrendingUp,
      color: 'bg-cyan-500',
      link: '/dashboard/vendor/analytics'
    },
    {
      id: 'manage-orders',
      title: 'Process Orders',
      description: 'Handle pending orders',
      icon: Truck,
      color: 'bg-amber-500',
      link: '/dashboard/vendor/orders'
    },
    {
      id: 'store-settings',
      title: 'Store Settings',
      description: 'Update your store profile',
      icon: Store,
      color: 'bg-slate-500',
      link: '/dashboard/vendor/site-settings'
    },
    {
      id: 'view-financials',
      title: 'View Financials',
      description: 'Check your financial performance',
      icon: DollarSign,
      color: 'bg-emerald-500',
      link: '/vendor/financial'
    }
  ];

  return (
    <VendorDashboardLayout>
      <div className="container-responsive py-8">
        
        {/* Storefront Management Bar */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 mb-6 border-2 border-[#5B6E02] relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#5B6E02] rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#5B6E02] rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#5B6E02] mb-2">Storefront Management</h1>
                <p className="text-gray-600">Manage your products, orders, and store settings</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setLocation('/store/mock-artisan-store')}
                  className="bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  <span>View Storefront</span>
                </button>
                <button
                  onClick={() => setLocation('/dashboard/vendor/products')}
                  className="bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit Storefront</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Page Header */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 mb-6 border-2 border-[#5B6E02]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.profile?.firstName || user?.email || 'Vendor'}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-gray-500">Store Status</p>
                <p className="text-green-600 font-medium">Active</p>
              </div>
            </div>
          </div>
          <InspirationalQuote />
        </div>

        {/* Horizontal Navigation */}
        <div className="bg-[#E8CBAE] rounded-2xl shadow-sm p-4 mb-8 border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/dashboard/vendor/products">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium responsive-text">
                  <Package className="w-5 h-5" />
                  Products
                </button>
              </Link>
              <Link href="/dashboard/vendor/orders">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium responsive-text">
                  <FileText className="w-5 h-5" />
                  Orders
                </button>
              </Link>
              <Link href="/dashboard/vendor/analytics">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium responsive-text">
                  <BarChart3 className="w-5 h-5" />
                  Analytics
                </button>
              </Link>
              <Link href="/dashboard/vendor/inventory">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium responsive-text">
                  <ShoppingCart className="w-5 h-5" />
                  Inventory
                </button>
              </Link>
              <Link href="/vendor/financial">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium responsive-text">
                  <DollarSign className="w-5 h-5" />
                  Financials
                </button>
              </Link>
              <Link href="/dashboard/vendor/delivery-batching">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium responsive-text">
                  <Calendar className="w-5 h-5" />
                  Delivery
                </button>
              </Link>
              <Link href="/dashboard/watchlist">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium responsive-text">
                  <Eye className="w-5 h-5" />
                  Watchlist
                </button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/vendor/site-settings">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium responsive-text">
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
              </Link>
              <Link href="/dashboard/vendor/products">
                <button className="bg-[#5B6E02] text-white responsive-button rounded-lg hover:bg-[#4A5A01] transition-colors font-medium flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Product
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#E8F5E8] rounded-2xl shadow-xl p-6 border-2 border-[#5B6E02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-[#5B6E02]">$12,450</p>
                <p className="text-green-600 text-sm">+12% from last month</p>
              </div>
              <div className="w-12 h-12 bg-[#5B6E02] rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-[#E0F2F7] rounded-2xl shadow-xl p-6 border-2 border-[#5B6E02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Orders</p>
                <p className="text-2xl font-bold text-[#5B6E02]">24</p>
                <p className="text-blue-600 text-sm">8 pending fulfillment</p>
              </div>
              <div className="w-12 h-12 bg-[#5B6E02] rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 border-2 border-[#5B6E02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Products</p>
                <p className="text-2xl font-bold text-[#5B6E02]">156</p>
                <p className="text-orange-600 text-sm">12 low stock</p>
              </div>
              <div className="w-12 h-12 bg-[#5B6E02] rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 border-2 border-[#5B6E02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Customers</p>
                <p className="text-2xl font-bold text-[#5B6E02]">1,234</p>
                <p className="text-purple-600 text-sm">+45 this week</p>
              </div>
              <div className="w-12 h-12 bg-[#5B6E02] rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tax Forecast Section */}
        {user && (
          <div className="mb-8">
            <h2 className="responsive-subheading text-gray-900 mb-4">Tax Forecast & Obligations</h2>
            <TaxForecastCard vendorId={user.id} />
          </div>
        )}

        {/* Margin Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Low Margin Products Alert */}
          <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 border-2 border-[#5B6E02]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Low Margin Products</h3>
                  <p className="responsive-text text-gray-600">Products with margins below 35%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="responsive-heading text-red-600">{stats.lowMarginItems}</p>
                <p className="responsive-text text-gray-500">items need attention</p>
              </div>
            </div>
            
            {lowMarginLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : lowMarginData?.lowMarginProducts?.length > 0 ? (
              <div className="space-y-3">
                {lowMarginData.lowMarginProducts.slice(0, 3).map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="responsive-text text-gray-600">
                        Margin: <span className={`font-medium ${
                          product.marginAnalysis.status === 'danger' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {product.marginAnalysis.currentMargin}%
                        </span>
                      </p>
                    </div>
                    <Link href="/dashboard/vendor/products">
                      <button className="text-blue-600 hover:text-blue-700 responsive-text font-medium">
                        Review →
                      </button>
                    </Link>
                  </div>
                ))}
                {lowMarginData.lowMarginProducts.length > 3 && (
                  <div className="text-center pt-2">
                    <Link href="/dashboard/vendor/products">
                      <button className="text-blue-600 hover:text-blue-700 responsive-text font-medium">
                        View all {lowMarginData.lowMarginProducts.length} items →
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600">All products have healthy margins!</p>
              </div>
            )}
          </div>

          {/* Ingredient Price Alerts */}
          <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 border-2 border-[#5B6E02]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Price Alerts</h3>
                  <p className="responsive-text text-gray-600">Ingredient price increases detected</p>
                </div>
              </div>
              <div className="text-right">
                <p className="responsive-heading text-orange-600">{stats.priceAlerts}</p>
                <p className="responsive-text text-gray-500">price changes</p>
              </div>
            </div>
            
            {priceAlertsLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : priceAlertsData?.alerts?.length > 0 ? (
              <div className="space-y-3">
                {priceAlertsData.alerts.slice(0, 3).map((alert: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{alert.ingredientName}</p>
                      <p className="responsive-text text-gray-600">
                        +{alert.priceIncrease}% • {alert.productName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="responsive-text font-medium text-orange-600">
                        ${alert.currentCost}
                      </p>
                      <p className="text-xs text-gray-500">
                        was ${alert.previousCost}
                      </p>
                    </div>
                  </div>
                ))}
                {priceAlertsData.alerts.length > 3 && (
                  <div className="text-center pt-2">
                    <button 
                      onClick={() => batchUpdateMutation.mutate({ targetMargin: 35 })}
                      disabled={batchUpdateMutation.isPending}
                      className="text-blue-600 hover:text-blue-700 responsive-text font-medium disabled:opacity-50"
                    >
                      {batchUpdateMutation.isPending ? 'Updating...' : 'Update All Prices →'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600">No significant price changes detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="responsive-subheading text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/dashboard/vendor/products">
              <div className="bg-[#E0F2F7] rounded-xl shadow-xl p-6 border-2 border-[#5B6E02] hover:shadow-2xl transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-500 bg-opacity-10">
                    <Plus className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Add New Product</h3>
                    <p className="responsive-text text-gray-600">Create a new product listing</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/vendor/batch-pricing">
              <div className="bg-[#E8F5E8] rounded-xl shadow-xl p-6 border-2 border-[#5B6E02] hover:shadow-2xl transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-emerald-500 bg-opacity-10">
                    <DollarSign className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Batch Pricing</h3>
                    <p className="responsive-text text-gray-600">Update pricing across products</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/vendor/analytics">
              <div className="bg-amber-50 rounded-xl shadow-xl p-6 border-2 border-[#5B6E02] hover:shadow-2xl transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-cyan-500 bg-opacity-10">
                    <TrendingUp className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">View Analytics</h3>
                    <p className="responsive-text text-gray-600">Check performance metrics</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Batch Pricing Update Section */}
        <div className="mb-8">
          <div className="bg-amber-50 rounded-2xl shadow-xl p-6 border-2 border-[#5B6E02]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="responsive-subheading text-gray-900">Batch Pricing Update</h2>
                <p className="text-gray-600 mt-1">Update pricing across your inventory based on target margins</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="responsive-text text-gray-500">Target Margin</p>
                  <p className="text-lg font-semibold text-gray-900">35%</p>
                </div>
                <Link href="/dashboard/vendor/batch-pricing">
                  <button className="bg-[#5B6E02] text-white responsive-button rounded-lg hover:bg-[#4A5A01] transition-colors font-medium flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Manage Pricing
                  </button>
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="responsive-text font-medium text-gray-900">Total Products</p>
                    <p className="responsive-heading text-gray-900">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="responsive-text font-medium text-gray-900">Low Margin Items</p>
                    <p className="responsive-heading text-orange-600">{stats.lowMarginItems}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="responsive-text font-medium text-gray-900">Healthy Margins</p>
                    <p className="responsive-heading text-green-600">{stats.totalProducts - stats.lowMarginItems}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <div className="p-1 bg-blue-100 rounded">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="responsive-text font-medium text-blue-900">How it works</p>
                  <p className="text-sm text-blue-700 mt-1">
                    The system will calculate new prices for all products with recipes, ensuring they meet your 35% target margin. 
                    Only products with significant price changes (>5%) will be updated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Overview Cards */}
        <div>
          <h2 className="responsive-subheading text-gray-900 mb-4">Store Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeOverviewCards.map((card) => (
              <div key={card.id} className="bg-amber-50 rounded-2xl shadow-xl p-6 border-2 border-[#5B6E02] hover:shadow-2xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${card.bgColor}`}>
                    <card.icon className={`w-8 h-8 ${card.iconColor}`} />
                  </div>
                  <div className="text-right">
                    <p className="responsive-text text-gray-500">{card.stats}</p>
                  </div>
                </div>
                
                <h3 className="responsive-subheading text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{card.description}</p>
                
                <div className="flex items-center justify-between">
                  <Link href={card.link}>
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                      View Details →
                    </button>
                  </Link>
                  <Link href={card.actionLink}>
                    <button className="responsive-button bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] responsive-text font-medium transition-colors">
                      {card.action}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-amber-50 rounded-2xl shadow-xl p-6 border-2 border-[#5B6E02]">
            <h2 className="responsive-subheading text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">New order received</p>
                  <p className="responsive-text text-gray-600">Order #ORD-2024-003 for $89.99</p>
                </div>
                <span className="responsive-text text-gray-500">2 hours ago</span>
              </div>
              
              {priceAlertsData?.alerts?.length > 0 && (
                <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Ingredient price increase detected</p>
                    <p className="responsive-text text-gray-600">
                      {priceAlertsData.alerts[0].ingredientName} increased by {priceAlertsData.alerts[0].priceIncrease}%
                    </p>
                  </div>
                  <span className="responsive-text text-gray-500">1 hour ago</span>
                </div>
              )}
              
              {lowMarginData?.lowMarginProducts?.length > 0 && (
                <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Low margin products detected</p>
                    <p className="responsive-text text-gray-600">
                      {lowMarginData.lowMarginProducts.length} products have margins below 35%
                    </p>
                  </div>
                  <span className="responsive-text text-gray-500">3 hours ago</span>
                </div>
              )}
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">New review received</p>
                  <p className="responsive-text text-gray-600">5-star review for "Handcrafted Ceramic Mug Set"</p>
                </div>
                <span className="responsive-text text-gray-500">1 day ago</span>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Low stock alert</p>
                  <p className="responsive-text text-gray-600">"Artisan Soap Collection" is running low</p>
                </div>
                <span className="responsive-text text-gray-500">2 days ago</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </VendorDashboardLayout>
  );
}; 
