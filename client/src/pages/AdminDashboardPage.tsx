import { useState } from 'react';
import { Link } from 'wouter';
import { 
  Users, 
  Store, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app, this would come from API
  const stats = {
    totalUsers: 1247,
    totalVendors: 89,
    totalProducts: 1245,
    totalRevenue: 156789.50,
    pendingApprovals: 12,
    activeEvents: 8
  };

  const pendingApprovals = [
    {
      id: '1',
      type: 'vendor',
      name: 'Sarah Johnson',
      business: 'Sarah\'s Ceramics',
      submitted: '2024-01-25',
      status: 'pending'
    },
    {
      id: '2',
      type: 'product',
      name: 'Handcrafted Mug Set',
      vendor: 'Mountain Crafts',
      submitted: '2024-01-24',
      status: 'pending'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'user_registration',
      message: 'New customer registered: john.doe@email.com',
      timestamp: '2024-01-25 14:30',
      status: 'success'
    },
    {
      id: '2',
      type: 'vendor_approval',
      message: 'Vendor approved: Sarah\'s Ceramics',
      timestamp: '2024-01-25 13:15',
      status: 'success'
    },
    {
      id: '3',
      type: 'order_issue',
      message: 'Order #ORD-2024-001 reported as damaged',
      timestamp: '2024-01-25 12:45',
      status: 'warning'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">System overview and management</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/settings">
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Store className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVendors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeEvents}</p>
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
                { id: 'approvals', label: 'Approvals' },
                { id: 'users', label: 'Users' },
                { id: 'vendors', label: 'Vendors' },
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
                {/* Pending Approvals */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Pending Approvals</h2>
                    <Link href="/admin/approvals">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View All Approvals
                      </button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {pendingApprovals.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Shield className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.type === 'vendor' ? item.business : item.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.type === 'vendor' ? 'Vendor Application' : 'Product Submission'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Submitted {item.submitted}</p>
                          <div className="flex space-x-2 mt-2">
                            <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                              Approve
                            </button>
                            <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        {getStatusIcon(activity.status)}
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'approvals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">All Pending Approvals</h2>
                  <div className="flex items-center space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm" aria-label="Filter by type">
                      <option>All Types</option>
                      <option>Vendor Applications</option>
                      <option>Product Submissions</option>
                      <option>Event Applications</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {pendingApprovals.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.type === 'vendor' ? item.business : item.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.type === 'vendor' ? 'Vendor Application' : 'Product Submission'}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending Review
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Submitted on {item.submitted}
                        </p>
                        <div className="flex space-x-2">
                          <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                            View Details
                          </button>
                          <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                            Approve
                          </button>
                          <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Add User
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">All Users</h3>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm" aria-label="Filter by role">
                          <option>All Roles</option>
                          <option>Customer</option>
                          <option>Vendor</option>
                          <option>Admin</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-500 text-center py-8">
                      User management interface coming soon...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vendors' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Vendor Management</h2>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Add Vendor
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">All Vendors</h3>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Search vendors..."
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm" aria-label="Filter by status">
                          <option>All Status</option>
                          <option>Active</option>
                          <option>Suspended</option>
                          <option>Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-500 text-center py-8">
                      Vendor management interface coming soon...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">System Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">This Month</span>
                        <span className="font-semibold">+156 users</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Month</span>
                        <span className="font-semibold">+142 users</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Growth Rate</span>
                        <span className="text-green-600 font-semibold">+9.9%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">This Month</span>
                        <span className="font-semibold">$45,230.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Month</span>
                        <span className="font-semibold">$41,890.25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Growth</span>
                        <span className="text-green-600 font-semibold">+8.0%</span>
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