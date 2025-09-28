import React from 'react';
import { Link } from 'wouter';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome to your Craved Artisan dashboard</p>
          </div>

          {/* Dashboard Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vendor Dashboard */}
            <Link href="/dashboard/vendor/pulse">
              <div className="bg-brand-cream rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-48 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Vendor Dashboard</h3>
                    <p className="text-sm text-gray-600">Manage your products & business</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex-1">
                  Access your vendor pulse, products, orders, and analytics
                </div>
              </div>
            </Link>

            {/* Customer Dashboard */}
            <Link href="/dashboard/customer">
              <div className="bg-brand-cream rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-48 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Customer Dashboard</h3>
                    <p className="text-sm text-gray-600">Track your orders & favorites</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex-1">
                  View your orders, watchlist, and shopping history
                </div>
              </div>
            </Link>

            {/* Event Coordinator Dashboard */}
            <Link href="/dashboard/event-coordinator">
              <div className="bg-brand-cream rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-48 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-brand-green/10 rounded-lg">
                    <Activity className="w-6 h-6 text-brand-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Event Coordinator</h3>
                    <p className="text-sm text-gray-600">Manage events & vendors</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex-1">
                  Coordinate events, manage vendors, and track attendance
                </div>
              </div>
            </Link>

            {/* Admin Dashboard */}
            <Link href="/dashboard/admin">
              <div className="bg-brand-cream rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-48 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Settings className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Admin Dashboard</h3>
                    <p className="text-sm text-gray-600">System administration</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex-1">
                  Manage users, system settings, and platform analytics
                </div>
              </div>
            </Link>

            {/* Dropoff Dashboard */}
            <Link href="/dashboard/dropoff">
              <div className="bg-brand-cream rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-48 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Dropoff Center</h3>
                    <p className="text-sm text-gray-600">Manage dropoff operations</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex-1">
                  Handle customer dropoffs and inventory management
                </div>
              </div>
            </Link>

            {/* Analytics */}
            <Link href="/dashboard/vendor/analytics">
              <div className="bg-brand-cream rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-48 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                    <p className="text-sm text-gray-600">Business insights & reports</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex-1">
                  View detailed analytics and performance metrics
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/dashboard/vendor/products" className="block">
                <button className="w-full bg-brand-cream rounded-lg p-4 text-left hover:bg-brand-cream/80 transition-all shadow-md hover:shadow-lg h-24 flex flex-col justify-center">
                  <Package className="w-5 h-5 text-gray-600 mb-2" />
                  <div className="font-medium text-gray-900">Manage Products</div>
                  <div className="text-sm text-gray-600">Add or edit products</div>
                </button>
              </Link>
              
              <Link href="/dashboard/vendor/orders" className="block">
                <button className="w-full bg-brand-cream rounded-lg p-4 text-left hover:bg-brand-cream/80 transition-all shadow-md hover:shadow-lg h-24 flex flex-col justify-center">
                  <ShoppingCart className="w-5 h-5 text-gray-600 mb-2" />
                  <div className="font-medium text-gray-900">View Orders</div>
                  <div className="text-sm text-gray-600">Track order status</div>
                </button>
              </Link>
              
              <Link href="/dashboard/vendor/promotions" className="block">
                <button className="w-full bg-brand-cream rounded-lg p-4 text-left hover:bg-brand-cream/80 transition-all shadow-md hover:shadow-lg h-24 flex flex-col justify-center">
                  <Activity className="w-5 h-5 text-gray-600 mb-2" />
                  <div className="font-medium text-gray-900">Promotions</div>
                  <div className="text-sm text-gray-600">Manage sales & offers</div>
                </button>
              </Link>
              
              <Link href="/dashboard/vendor/labels" className="block">
                <button className="w-full bg-brand-cream rounded-lg p-4 text-left hover:bg-brand-cream/80 transition-all shadow-md hover:shadow-lg h-24 flex flex-col justify-center">
                  <Settings className="w-5 h-5 text-gray-600 mb-2" />
                  <div className="font-medium text-gray-900">Labels</div>
                  <div className="text-sm text-gray-600">Print & manage labels</div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}