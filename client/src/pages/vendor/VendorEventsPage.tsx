import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Star, CheckCircle, XCircle } from 'lucide-react';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  capacity: number;
  registered: number;
  rating: number;
  status: 'registered' | 'available' | 'full' | 'past';
  category: string;
  price: string;
}

const VendorEventsPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for events
  const events: Event[] = [
    {
      id: '1',
      name: 'Atlanta Food Festival',
      date: 'March 15, 2024',
      time: '10:00 AM - 6:00 PM',
      location: 'Centennial Olympic Park, Atlanta, GA',
      description: 'Annual food festival showcasing the best of Atlanta\'s culinary scene. Perfect opportunity for artisan food vendors.',
      capacity: 100,
      registered: 85,
      rating: 4.8,
      status: 'registered',
      category: 'Food Festival',
      price: '$150'
    },
    {
      id: '2',
      name: 'Spring Craft Market',
      date: 'April 22, 2024',
      time: '9:00 AM - 5:00 PM',
      location: 'Piedmont Park, Atlanta, GA',
      description: 'Spring craft market featuring handmade goods, jewelry, and artisan products.',
      capacity: 75,
      registered: 72,
      rating: 4.6,
      status: 'registered',
      category: 'Craft Market',
      price: '$100'
    },
    {
      id: '3',
      name: 'Local Artisan Fair',
      date: 'May 8, 2024',
      time: '11:00 AM - 7:00 PM',
      location: 'Grant Park, Atlanta, GA',
      description: 'Local artisan fair celebrating handmade and locally sourced products.',
      capacity: 50,
      registered: 50,
      rating: 4.7,
      status: 'full',
      category: 'Artisan Fair',
      price: '$75'
    },
    {
      id: '4',
      name: 'Summer Market Series',
      date: 'June 12-15, 2024',
      time: '10:00 AM - 8:00 PM',
      location: 'Various locations across Atlanta',
      description: 'Four-day summer market series across different Atlanta neighborhoods.',
      capacity: 200,
      registered: 45,
      rating: 4.5,
      status: 'available',
      category: 'Market Series',
      price: '$200'
    },
    {
      id: '5',
      name: 'Holiday Craft Show',
      date: 'December 7-8, 2024',
      time: '9:00 AM - 6:00 PM',
      location: 'Atlanta Convention Center',
      description: 'Holiday craft show perfect for seasonal products and gifts.',
      capacity: 150,
      registered: 23,
      rating: 4.9,
      status: 'available',
      category: 'Holiday Show',
      price: '$175'
    },
    {
      id: '6',
      name: 'Farm to Table Expo',
      date: 'September 20, 2024',
      time: '12:00 PM - 8:00 PM',
      location: 'Atlanta Botanical Garden',
      description: 'Farm to table expo focusing on sustainable and organic products.',
      capacity: 80,
      registered: 67,
      rating: 4.4,
      status: 'available',
      category: 'Farm Expo',
      price: '$125'
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'full': return 'bg-red-100 text-red-800';
      case 'past': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered': return <CheckCircle className="w-4 h-4" />;
      case 'available': return <Calendar className="w-4 h-4" />;
      case 'full': return <XCircle className="w-4 h-4" />;
      case 'past': return <Clock className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <VendorDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2C2C2C]">Events</h1>
            <p className="text-gray-600 mt-2">Discover and manage your participation in local events and markets</p>
          </div>
          <button className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-6 py-3 rounded-lg transition-colors border-2 border-black shadow-md hover:shadow-lg">
            Browse All Events
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
            aria-label="Filter events by status"
          >
            <option value="all">All Events</option>
            <option value="registered">Registered</option>
            <option value="available">Available</option>
            <option value="full">Full</option>
            <option value="past">Past Events</option>
          </select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#2C2C2C] mb-1">{event.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)} flex items-center gap-1`}>
                        {getStatusIcon(event.status)}
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{event.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                
                {/* Price */}
                <div className="text-lg font-bold text-[#5B6E02]">{event.price}</div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-[#5B6E02]" />
                  <span>{event.date}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-[#5B6E02]" />
                  <span>{event.time}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-[#5B6E02]" />
                  <span>{event.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-[#5B6E02]" />
                  <span>{event.registered}/{event.capacity} registered</span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex gap-2">
                  {event.status === 'available' && (
                    <button className="flex-1 bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-3 py-2 rounded-lg transition-colors text-sm">
                      Register Now
                    </button>
                  )}
                  {event.status === 'registered' && (
                    <button className="flex-1 bg-[#8B4513] hover:bg-[#A0522D] text-white px-3 py-2 rounded-lg transition-colors text-sm">
                      View Details
                    </button>
                  )}
                  {event.status === 'full' && (
                    <button className="flex-1 bg-gray-400 text-white px-3 py-2 rounded-lg text-sm cursor-not-allowed">
                      Waitlist
                    </button>
                  )}
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm">
                    More Info
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters to find events.</p>
            <button className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-6 py-3 rounded-lg transition-colors border-2 border-black shadow-md hover:shadow-lg">
              Browse All Events
            </button>
          </div>
        )}
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorEventsPage;
