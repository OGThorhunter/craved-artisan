import { useState } from 'react';
import { Link } from 'wouter';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Star, 
  Plus,
  Eye
} from 'lucide-react';

export const VendorDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app, this would come from API
  const stats = {
    totalSales: 12450.75,
    totalOrders: 89,
    totalProducts: 24,
    averageRating: 4.8,
    monthlyGrowth: 12.5
  };

  const recentOrders = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      customer: 'John Doe',
      total: 89.99,
      status: 'pending',
      date: '2024-01-25',
      items: 2
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      customer: 'Jane Smith',
      total: 156.50,
      status: 'shipped',
      date: '2024-01-24',
      items: 3
    }
  ];

  const products = [
    {
      id: '1',
      name: 'Handcrafted Ceramic Mug Set',
      price: 45.99,
      stock: 15,
      sales: 23,
      image: '/api/placeholder/100/100',
      status: 'active'
    },
    {
      id: '2',
      name: 'Artisan Soap Collection',
      price: 22.00,
      stock: 8,
      sales: 45,
      image: '/api/placeholder/100/100',
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'shipped': return 'text-blue-600 bg-blue-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, Sarah's Ceramics!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/vendor/products/new">
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  <Plus className="w-5 h-5" />
                  <span>Add Product</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSales.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+{stats.monthlyGrowth}%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Active listings</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
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

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'orders', label: 'Orders' },
                { id: 'products', label: 'Products' },
                { id: 'analytics', label: 'Analytics' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Recent Orders */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                    <Link href="/dashboard/vendor/orders">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View All Orders
                      </button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                            <p className="text-sm text-gray-500">{order.customer}</p>
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.items} items
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${order.total}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Top Products</h2>
                    <Link href="/dashboard/vendor/products">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View All Products
                      </button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.slice(0, 4).map((product) => (
                      <div key={product.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500">${product.price}</p>
                          <p className="text-sm text-gray-500">{product.sales} sold</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{product.stock} in stock</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">All Orders</h2>
                  <div className="flex items-center space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option>All Status</option>
                      <option>Pending</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-500">Placed on {order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">${order.total}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Customer: <span className="text-gray-900">{order.customer}</span>
                        </p>
                        <div className="flex space-x-2">
                          <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                            View Details
                          </button>
                          {order.status === 'pending' && (
                            <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                              Mark Shipped
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">All Products</h2>
                  <Link href="/dashboard/vendor/products/new">
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                      Add New Product
                    </button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-lg font-semibold text-gray-900 mb-2">${product.price}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>{product.stock} in stock</span>
                          <span>{product.sales} sold</span>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/dashboard/vendor/products/${product.id}/edit`}>
                            <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                              Edit
                            </button>
                          </Link>
                          <Link href={`/product/${product.id}`}>
                            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">This Month</span>
                        <span className="font-semibold">$3,240.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Month</span>
                        <span className="font-semibold">$2,890.25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Growth</span>
                        <span className="text-green-600 font-semibold">+12.1%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Home & Garden</span>
                        <span className="font-semibold">45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jewelry</span>
                        <span className="font-semibold">32%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Clothing</span>
                        <span className="font-semibold">23%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 