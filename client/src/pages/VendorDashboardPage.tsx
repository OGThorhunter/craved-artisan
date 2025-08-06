import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import OnboardingPrompt from '../components/OnboardingPrompt';
import TaxForecastCard from '../components/TaxForecastCard';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
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
  PowerOff
} from 'lucide-react';

export const VendorDashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
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
      <div className="page-container bg-white min-h-screen">
        <div className="container-responsive py-8">
        
        {/* Storefront Management Bar */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Your Storefront:</span>
                <a 
                  href={`https://cravedartisan.com/vendor/${user?.id || 'your-store'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
                >
                  cravedartisan.com/vendor/{user?.profile?.businessName?.toLowerCase().replace(/\s+/g, '-') || 'your-store'}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Status:</span>
                <div className="flex items-center gap-2">
                  {siteIsLive ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Power className="w-4 h-4" />
                      <span className="font-medium">Live</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <PowerOff className="w-4 h-4" />
                      <span className="font-medium">Offline</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSiteToggle}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  siteIsLive 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {siteIsLive ? (
                  <>
                    <PowerOff className="w-4 h-4" />
                    Take Offline
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4" />
                    Go Live
                  </>
                )}
              </button>
              
              <Link href="/dashboard/vendor/site-settings">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm">
                  <Edit className="w-4 h-4" />
                  Edit Site
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Header */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="responsive-heading text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.profile?.firstName || user?.email || 'Vendor'}!
              </p>
              <p className="responsive-text text-gray-500 mt-1">
                Manage your store, products, and customer relationships
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="responsive-text text-gray-500">Store Status</p>
                <p className="text-green-600 font-medium">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-sm p-4 mb-8 border border-gray-100">
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
                <button className="bg-blue-600 text-white responsive-button rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Product
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#F7F2EC] rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Total Sales</p>
                <p className="responsive-heading text-gray-900">${stats.totalSales.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+{stats.monthlyGrowth}%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-[#F7F2EC] rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Total Orders</p>
                <p className="responsive-heading text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-[#F7F2EC] rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Active Products</p>
                <p className="responsive-heading text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Active listings</span>
            </div>
          </div>

          <div className="bg-[#F7F2EC] rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Average Rating</p>
                <p className="responsive-heading text-gray-900">{stats.averageRating}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(stats.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
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
          <div className="bg-[#F7F2EC] rounded-2xl shadow-sm p-6 border border-gray-100">
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
                        Review â†’
                      </button>
                    </Link>
                  </div>
                ))}
                {lowMarginData.lowMarginProducts.length > 3 && (
                  <div className="text-center pt-2">
                    <Link href="/dashboard/vendor/products">
                      <button className="text-blue-600 hover:text-blue-700 responsive-text font-medium">
                        View all {lowMarginData.lowMarginProducts.length} items â†’
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
          <div className="bg-[#F7F2EC] rounded-2xl shadow-sm p-6 border border-gray-100">
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
                        +{alert.priceIncrease}% â€¢ {alert.productName}
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
                      {batchUpdateMutation.isPending ? 'Updating...' : 'Update All Prices â†’'}
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
              <div className="bg-[#F7F2EC] rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
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
              <div className="bg-[#F7F2EC] rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
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
              <div className="bg-[#F7F2EC] rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
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
          <div className="bg-[#F7F2EC] rounded-2xl shadow-sm p-6 border border-gray-100">
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
                  <button className="bg-blue-600 text-white responsive-button rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
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
                    Only products with significant price changes (&gt;5%) will be updated.
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
              <div key={card.id} className="bg-[#F7F2EC] rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
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
                      View Details â†’
                    </button>
                  </Link>
                  <Link href={card.actionLink}>
                    <button className="responsive-button bg-primary-600 text-white rounded-lg hover:bg-primary-700 responsive-text font-medium transition-colors">
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
          <div className="bg-[#F7F2EC] rounded-2xl shadow-sm p-6 border border-gray-100">
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
