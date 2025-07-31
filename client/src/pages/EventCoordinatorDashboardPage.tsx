import { useState } from 'react';
import { Link } from 'wouter';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Plus,
  CheckCircle
} from 'lucide-react';

export const EventCoordinatorDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app, this would come from API
  const stats = {
    totalEvents: 24,
    activeEvents: 8,
    totalVendors: 156,
    totalAttendees: 1247,
    upcomingEvents: 5,
    completedEvents: 11
  };

  const upcomingEvents = [
    {
      id: '1',
      name: 'Portland Artisan Market',
      date: '2024-02-15',
      location: 'Pioneer Courthouse Square',
      vendors: 45,
      attendees: 320,
      status: 'upcoming'
    },
    {
      id: '2',
      name: 'Spring Craft Fair',
      date: '2024-02-22',
      location: 'Oregon Convention Center',
      vendors: 32,
      attendees: 280,
      status: 'upcoming'
    }
  ];

  const recentEvents = [
    {
      id: '3',
      name: 'Holiday Artisan Market',
      date: '2024-01-20',
      location: 'Lloyd Center',
      vendors: 38,
      attendees: 450,
      status: 'completed',
      revenue: 12450.75
    }
  ];

  const vendorApplications = [
    {
      id: '1',
      vendor: 'Sarah\'s Ceramics',
      event: 'Portland Artisan Market',
      category: 'Home & Garden',
      status: 'pending',
      submitted: '2024-01-25'
    },
    {
      id: '2',
      vendor: 'Mountain Crafts',
      event: 'Spring Craft Fair',
      category: 'Jewelry',
      status: 'approved',
      submitted: '2024-01-24'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
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
              <h1 className="text-3xl font-bold text-gray-900">Event Coordinator Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage events and coordinate vendors</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/event-coordinator/events/new">
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  <Plus className="w-5 h-5" />
                  <span>Create Event</span>
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
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVendors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Attendees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAttendees.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedEvents}</p>
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
                { id: 'events', label: 'Events' },
                { id: 'vendors', label: 'Vendors' },
                { id: 'applications', label: 'Applications' },
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
                {/* Upcoming Events */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
                    <Link href="/dashboard/event-coordinator/events">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View All Events
                      </button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {event.date}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {event.location}
                              </div>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">{event.vendors}</p>
                            <p className="text-sm text-gray-500">Vendors</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">{event.attendees}</p>
                            <p className="text-sm text-gray-500">Expected Attendees</p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Link href={`/dashboard/event-coordinator/events/${event.id}`}>
                            <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                              View Details
                            </button>
                          </Link>
                          <Link href={`/dashboard/event-coordinator/events/${event.id}/edit`}>
                            <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                              Edit Event
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Events */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Events</h2>
                  <div className="space-y-4">
                    {recentEvents.map((event) => (
                      <div key={event.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {event.date}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {event.location}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">${event.revenue?.toLocaleString()}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {event.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900">{event.vendors}</p>
                            <p className="text-sm text-gray-500">Vendors</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900">{event.attendees}</p>
                            <p className="text-sm text-gray-500">Attendees</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900">${event.revenue?.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Revenue</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">All Events</h2>
                  <Link href="/dashboard/event-coordinator/events/new">
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                      Create New Event
                    </button>
                  </Link>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Event Management</h3>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Search events..."
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm" aria-label="Filter by status">
                          <option>All Status</option>
                          <option>Upcoming</option>
                          <option>Active</option>
                          <option>Completed</option>
                          <option>Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-500 text-center py-8">
                      Event management interface coming soon...
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
                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm" aria-label="Filter by category">
                          <option>All Categories</option>
                          <option>Home & Garden</option>
                          <option>Jewelry</option>
                          <option>Clothing</option>
                          <option>Food & Beverages</option>
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

            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Vendor Applications</h2>
                  <div className="flex items-center space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm" aria-label="Filter by status">
                      <option>All Status</option>
                      <option>Pending</option>
                      <option>Approved</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {vendorApplications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{application.vendor}</h3>
                          <p className="text-sm text-gray-500">Event: {application.event}</p>
                          <p className="text-sm text-gray-500">Category: {application.category}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            application.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : application.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {application.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">Submitted {application.submitted}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                          View Application
                        </button>
                        {application.status === 'pending' && (
                          <>
                            <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                              Approve
                            </button>
                            <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Event Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Performance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Attendance</span>
                        <span className="font-semibold">342 attendees</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Revenue</span>
                        <span className="font-semibold">$12,450</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vendor Satisfaction</span>
                        <span className="text-green-600 font-semibold">4.8/5.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Categories</h3>
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
                        <span className="text-gray-600">Food & Beverages</span>
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