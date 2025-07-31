import { useState } from 'react';
import { Link } from 'wouter';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle,
  DollarSign
} from 'lucide-react';

export const DropoffDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app, this would come from API
  const stats = {
    totalDropoffs: 156,
    pendingDropoffs: 23,
    completedDropoffs: 133,
    totalRevenue: 12450.75,
    averageRating: 4.8,
    activeLocations: 8
  };

  const pendingDropoffs = [
    {
      id: '1',
      vendor: 'Sarah\'s Ceramics',
      customer: 'John Doe',
      items: 2,
      location: 'Portland Artisan Market',
      scheduledTime: '2024-01-25 14:00',
      status: 'pending'
    },
    {
      id: '2',
      vendor: 'Mountain Crafts',
      customer: 'Jane Smith',
      items: 1,
      location: 'Spring Craft Fair',
      scheduledTime: '2024-01-25 15:30',
      status: 'pending'
    }
  ];

  const recentDropoffs = [
    {
      id: '3',
      vendor: 'Natural Soaps Co',
      customer: 'Mike Johnson',
      items: 3,
      location: 'Holiday Artisan Market',
      completedTime: '2024-01-24 16:00',
      status: 'completed',
      rating: 5
    }
  ];

  const locations = [
    {
      id: '1',
      name: 'Portland Artisan Market',
      address: 'Pioneer Courthouse Square',
      activeDropoffs: 12,
      status: 'active'
    },
    {
      id: '2',
      name: 'Spring Craft Fair',
      address: 'Oregon Convention Center',
      activeDropoffs: 8,
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
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
              <h1 className="text-3xl font-bold text-gray-900">Dropoff Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage product dropoffs and deliveries</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/dropoff/schedule">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Schedule Dropoff
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
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Dropoffs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDropoffs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDropoffs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedDropoffs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <MapPin className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Locations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeLocations}</p>
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
                { id: 'dropoffs', label: 'Dropoffs' },
                { id: 'locations', label: 'Locations' },
                { id: 'schedule', label: 'Schedule' }
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
                {/* Pending Dropoffs */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Pending Dropoffs</h2>
                    <Link href="/dashboard/dropoff/dropoffs">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View All Dropoffs
                      </button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {pendingDropoffs.map((dropoff) => (
                      <div key={dropoff.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Dropoff #{dropoff.id}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {dropoff.vendor} → {dropoff.customer}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dropoff.status)}`}>
                            {dropoff.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{dropoff.items} items</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{dropoff.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{dropoff.scheduledTime}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            Start Dropoff
                          </button>
                          <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Dropoffs */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Dropoffs</h2>
                  <div className="space-y-4">
                    {recentDropoffs.map((dropoff) => (
                      <div key={dropoff.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Dropoff #{dropoff.id}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {dropoff.vendor} → {dropoff.customer}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <CheckCircle
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < dropoff.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dropoff.status)}`}>
                              {dropoff.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{dropoff.items} items</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{dropoff.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{dropoff.completedTime}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dropoffs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">All Dropoffs</h2>
                  <div className="flex items-center space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm" aria-label="Filter by status">
                      <option>All Status</option>
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Dropoff Management</h3>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Search dropoffs..."
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-500 text-center py-8">
                      Dropoff management interface coming soon...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'locations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Dropoff Locations</h2>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Add Location
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {locations.map((location) => (
                    <div key={location.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                          <p className="text-sm text-gray-500">{location.address}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          location.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {location.status}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{location.activeDropoffs} active dropoffs</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                          View Details
                        </button>
                        <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                          Edit Location
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Dropoff Schedule</h2>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Schedule New Dropoff
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Calendar View</h3>
                      <div className="flex items-center space-x-2">
                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm" aria-label="Filter by location">
                          <option>All Locations</option>
                          <option>Portland Artisan Market</option>
                          <option>Spring Craft Fair</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-500 text-center py-8">
                      Calendar interface coming soon...
                    </p>
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