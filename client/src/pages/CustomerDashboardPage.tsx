import { useState } from 'react';
import { Link } from 'wouter';
import { 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Star, 
  Package, 
  Clock, 
  User, 
  Settings,
  Search,
  Filter
} from 'lucide-react';

export const CustomerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('orders');

  // Mock data - in real app, this would come from API
  const orders = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      status: 'delivered',
      date: '2024-01-15',
      total: 89.99,
      items: [
        { name: 'Handcrafted Ceramic Mug Set', quantity: 1, price: 45.99 },
        { name: 'Artisan Soap Collection', quantity: 2, price: 22.00 }
      ],
      vendor: 'Sarah\'s Ceramics'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      status: 'shipped',
      date: '2024-01-20',
      total: 156.50,
      items: [
        { name: 'Handwoven Wool Scarf', quantity: 1, price: 78.00 },
        { name: 'Wooden Cutting Board', quantity: 1, price: 78.50 }
      ],
      vendor: 'Mountain Crafts'
    }
  ];

  const favorites = [
    {
      id: '1',
      name: 'Handcrafted Ceramic Mug Set',
      price: 45.99,
      image: '/api/placeholder/200/200',
      vendor: 'Sarah\'s Ceramics',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Artisan Soap Collection',
      price: 22.00,
      image: '/api/placeholder/200/200',
      vendor: 'Natural Soaps Co',
      rating: 4.9
    }
  ];

  const addresses = [
    {
      id: '1',
      type: 'shipping',
      name: 'John Doe',
      address: '123 Main St',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      isDefault: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'shipped': return 'text-blue-600 bg-blue-50';
      case 'processing': return 'text-yellow-600 bg-yellow-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <Package className="w-4 h-4" />;
      case 'shipped': return <Package className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, John!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>
              </Link>
              <Link href="/settings">
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'orders', label: 'Orders', icon: ShoppingBag },
                { id: 'favorites', label: 'Favorites', icon: Heart },
                { id: 'addresses', label: 'Addresses', icon: MapPin }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
                  <div className="flex items-center space-x-2">
                    <Link href="/dashboard/customer/orders">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        View All Orders
                      </button>
                    </Link>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search orders..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <button 
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Filter orders"
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {orders.map((order) => (
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
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-gray-900">${item.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          Vendor: <span className="text-gray-900">{order.vendor}</span>
                        </p>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                          View Details
                        </button>
                        {order.status === 'delivered' && (
                          <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Favorite Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{item.vendor}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-900">${item.price}</span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Link href={`/product/${item.id}`}>
                            <button className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                              View Product
                            </button>
                          </Link>
                          <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Addresses</h2>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Add New Address
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{address.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{address.type} Address</p>
                        </div>
                        {address.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{address.address}</p>
                        <p>{address.city}, {address.state} {address.zip}</p>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                          Edit
                        </button>
                        {!address.isDefault && (
                          <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                            Set as Default
                          </button>
                        )}
                        <button className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 