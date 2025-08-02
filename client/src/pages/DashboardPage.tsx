
import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Settings, ShoppingBag, Users, Calendar, Truck } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user.profile?.firstName || user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    {getRoleIcon(user.role)}
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {user.profile?.firstName} {user.profile?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    Role: {getRoleDisplayName(user.role)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Role-specific Dashboard */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {getRoleDisplayName(user.role)} Dashboard
                    </h3>
                    <p className="text-sm text-gray-500">
                      Access your role-specific features
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setLocation(getDashboardLink())}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Settings */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Profile</h3>
                    <p className="text-sm text-gray-500">
                      Manage your account settings
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setLocation('/profile')}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Panel (if admin) */}
            {user.role === 'ADMIN' && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Admin Panel</h3>
                      <p className="text-sm text-gray-500">
                        Manage users and system settings
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setLocation('/dashboard/admin')}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Access Admin Panel
                    </button>
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

export default DashboardPage; 