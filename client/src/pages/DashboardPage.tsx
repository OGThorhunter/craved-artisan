
import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Settings, ShoppingBag, Users, Calendar, Truck, Globe, Edit } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'CUSTOMER':
        return '/dashboard/customer';
      case 'VENDOR':
        return '/dashboard/vendor';
      case 'ADMIN':
        return '/dashboard/admin';
      case 'SUPPLIER':
        return '/dashboard/supplier';
      case 'EVENT_COORDINATOR':
        return '/dashboard/event-coordinator';
      case 'DROPOFF':
        return '/dashboard/dropoff';
      default:
        return '/dashboard';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'CUSTOMER':
        return 'Customer';
      case 'VENDOR':
        return 'Vendor';
      case 'ADMIN':
        return 'Administrator';
      case 'SUPPLIER':
        return 'Supplier';
      case 'EVENT_COORDINATOR':
        return 'Event Coordinator';
      case 'DROPOFF':
        return 'Dropoff Location';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'CUSTOMER':
        return <User className="h-6 w-6" />;
      case 'VENDOR':
        return <ShoppingBag className="h-6 w-6" />;
      case 'ADMIN':
        return <Settings className="h-6 w-6" />;
      case 'SUPPLIER':
        return <Truck className="h-6 w-6" />;
      case 'EVENT_COORDINATOR':
        return <Calendar className="h-6 w-6" />;
      case 'DROPOFF':
        return <Truck className="h-6 w-6" />;
      default:
        return <User className="h-6 w-6" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 py-8">
        
        {/* User Info Card */}
        <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 mb-8 border-2 border-[#5B6E02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#5B6E02] rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2C2C2C]">
                  Welcome back, {user?.email || 'User'}!
                </h1>
                <p className="text-[#2C2C2C]">Role: {user?.role || 'Unknown'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Storefront URL Section */}
        {user?.role === 'VENDOR' && (
          <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 mb-8 border-2 border-[#5B6E02]">
            <h4 className="text-lg font-semibold text-[#2C2C2C] mb-3">Storefront URL</h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2">
                <code className="text-sm text-[#2C2C2C]">https://craved-artisan.com/store/mock-artisan-store</code>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('https://craved-artisan.com/store/mock-artisan-store');
                  // You can add a toast notification here
                }}
                className="px-3 py-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors"
                title="Copy URL"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => setLocation('/store/mock-artisan-store')}
                className="flex-1 px-3 py-2 bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors text-sm"
              >
                View Storefront
              </button>
              <button
                onClick={() => setLocation('/dashboard/vendor/site-settings')}
                className="flex-1 px-3 py-2 border border-[#5B6E02] text-[#5B6E02] rounded-lg hover:bg-[#5B6E02] hover:text-white transition-colors text-sm"
              >
                <Edit className="w-4 h-4 inline mr-1" />
                Edit Storefront
              </button>
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Vendor Dashboard Card */}
          <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 border-2 border-[#5B6E02] hover:shadow-2xl transition-shadow cursor-pointer"
               onClick={() => setLocation('/dashboard/vendor')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#5B6E02] rounded-lg flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2C2C2C]">Vendor Dashboard</h3>
                <p className="text-[#2C2C2C] text-sm">Manage your products and orders</p>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 border-2 border-[#5B6E02] hover:shadow-2xl transition-shadow cursor-pointer"
               onClick={() => setLocation('/profile')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#5B6E02] rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2C2C2C]">Profile</h3>
                <p className="text-[#2C2C2C] text-sm">Update your account settings</p>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 border-2 border-[#5B6E02] hover:shadow-2xl transition-shadow cursor-pointer"
               onClick={() => setLocation('/subscription')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#5B6E02] rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2C2C2C]">Subscription</h3>
                <p className="text-[#2C2C2C] text-sm">Manage your subscription</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 border-2 border-[#5B6E02] hover:shadow-xl transition-shadow cursor-pointer"
               onClick={() => setLocation('/dashboard/vendor/analytics')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#5B6E02] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">Analytics</h3>
              <p className="text-[#2C2C2C] text-sm">View your business insights</p>
            </div>
          </div>

          <div className="bg-[#F7F2EC] rounded-2xl shadow-lg p-6 border-2 border-[#5B6E02] hover:shadow-xl transition-shadow cursor-pointer"
               onClick={() => setLocation('/dashboard/vendor/orders')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#5B6E02] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">Orders</h3>
              <p className="text-[#2C2C2C] text-sm">Manage your orders</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage; 