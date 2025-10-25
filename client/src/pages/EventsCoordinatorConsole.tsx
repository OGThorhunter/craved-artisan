import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  Filter,
  Search,
  Star,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const colors = {
  bg: 'bg-[#F7F2EC]',
  card: 'bg-white/70',
  border: 'border-[#7F232E]/15',
  primary: 'bg-[#7F232E] text-white hover:bg-[#6b1e27]',
  secondary: 'border-[#7F232E]/30 text-[#7F232E] bg-white/80 hover:bg-white',
  accent: 'text-[#5B6E02]',
  ink: 'text-[#2b2b2b]',
  sub: 'text-[#4b4b4b]',
};

type Event = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  imageUrl?: string;
  startAt: string;
  endAt: string;
  city?: string;
  state?: string;
  status: string;
  capacity?: number;
  minStallPrice?: number;
  _count: {
    interests: number;
    favorites: number;
    reviews: number;
    vendors: number;
    stalls: number;
  };
  stalls: Array<{
    id: string;
    name: string;
    price: number;
    qtyTotal: number;
    qtySold: number;
  }>;
  vendors: Array<{
    id: string;
    status: string;
    message?: string;
    vendor: {
      id: string;
      storeName: string;
      imageUrl?: string;
    };
    stall?: {
      name: string;
      price: number;
    };
  }>;
};

type VendorApplication = {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  vendor: {
    id: string;
    storeName: string;
    imageUrl?: string;
    city?: string;
    state?: string;
    ratingAvg?: number;
    ratingCount?: number;
  };
  stall?: {
    name: string;
    price: number;
  };
};

type TabType = 'events' | 'applications' | 'analytics';

export default function EventsCoordinatorConsole() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('events');
  // const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  // const [showCreateEvent, setShowCreateEvent] = useState(false);
  // const [showEditEvent, setShowEditEvent] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState<VendorApplication | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string>('');
  const [applicationMessage, setApplicationMessage] = useState('');

  const queryClient = useQueryClient();

  // Fetch coordinator events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['coordinator', 'events'],
    queryFn: async () => {
      const response = await fetch('/api/events/coordinator');
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json() as Promise<Event[]>;
    },
  });

  // Fetch vendor applications
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['coordinator', 'applications'],
    queryFn: async () => {
      const response = await fetch('/api/events/applications');
      if (!response.ok) throw new Error('Failed to fetch applications');
      return response.json() as Promise<VendorApplication[]>;
    },
  });

  // Update vendor application status
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status, message }: { applicationId: string; status: string; message?: string }) => {
      const response = await fetch(`/api/events/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, message }),
      });
      if (!response.ok) throw new Error('Failed to update application');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator', 'applications'] });
      setShowApplicationModal(null);
      setApplicationStatus('');
      setApplicationMessage('');
    },
  });

  // Delete event
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator', 'events'] });
    },
  });

  // Publish/unpublish event
  const publishEventMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      const endpoint = status === 'PUBLISHED' ? 'publish' : 'unpublish';
      const response = await fetch(`/api/events/${eventId}/${endpoint}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to update event status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator', 'events'] });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      full: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'success';
      case 'DRAFT': return 'secondary';
      case 'CANCELLED': return 'destructive';
      case 'ENDED': return 'secondary';
      default: return 'secondary';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PAID': return 'success';
      case 'APPLIED': return 'secondary';
      case 'WAITLIST': return 'warning';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  const renderEventsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2b2b2b]">My Events</h2>
          <p className="text-[#4b4b4b] mt-1">Manage your events and track performance</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setLocation('/events/create')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#7F232E]/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-[#7F232E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2b2b2b]">{events.length}</p>
              <p className="text-sm text-[#4b4b4b]">Total Events</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#5B6E02]/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-[#5B6E02]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2b2b2b]">
                {events.reduce((sum, event) => sum + event._count.interests, 0)}
              </p>
              <p className="text-sm text-[#4b4b4b]">Total Interest</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2b2b2b]">
                {events.reduce((sum, event) => sum + event._count.vendors, 0)}
              </p>
              <p className="text-sm text-[#4b4b4b]">Vendor Applications</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2b2b2b]">
                {events.filter(e => e.status === 'PUBLISHED').length}
              </p>
              <p className="text-sm text-[#4b4b4b]">Published</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Events List */}
      {eventsLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 text-[#4b4b4b] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">No events yet</h3>
          <p className="text-[#4b4b4b] mb-4">
            Create your first event to start connecting with vendors and attendees.
          </p>
          <Button
            variant="primary"
            onClick={() => setLocation('/events/create')}
          >
            Create Event
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map(event => {
            const dateInfo = formatDate(event.startAt);
            const totalRevenue = event.stalls.reduce((sum, stall) => sum + (stall.price * stall.qtySold), 0);
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {event.imageUrl ? (
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#7F232E]/20 to-[#5B6E02]/20 flex items-center justify-center">
                          <Calendar className="h-8 w-8 text-[#7F232E]/60" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-[#2b2b2b] truncate">{event.title}</h3>
                          {event.summary && (
                            <p className="text-sm text-[#4b4b4b] mt-1 line-clamp-2">{event.summary}</p>
                          )}
                        </div>
                        <Badge variant={getStatusColor(event.status) as 'default' | 'secondary' | 'destructive'}>
                          {event.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-[#4b4b4b] mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {dateInfo.full}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.city}, {event.state}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event._count.interests} interested
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${totalRevenue.toFixed(0)} revenue
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setLocation(`/events/${event.slug}`)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setLocation(`/events/${event.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => publishEventMutation.mutate({
                            eventId: event.id,
                            status: event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
                          })}
                        >
                          {event.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => deleteEventMutation.mutate(event.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderApplicationsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2b2b2b]">Vendor Applications</h2>
          <p className="text-[#4b4b4b] mt-1">Review and manage vendor applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="secondary" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      {/* Application Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#2b2b2b]">
              {applications.filter(a => a.status === 'APPLIED').length}
            </p>
            <p className="text-sm text-[#4b4b4b]">Pending</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#2b2b2b]">
              {applications.filter(a => a.status === 'APPROVED').length}
            </p>
            <p className="text-sm text-[#4b4b4b]">Approved</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#2b2b2b]">
              {applications.filter(a => a.status === 'PAID').length}
            </p>
            <p className="text-sm text-[#4b4b4b]">Paid</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#2b2b2b]">
              {applications.filter(a => a.status === 'WAITLIST').length}
            </p>
            <p className="text-sm text-[#4b4b4b]">Waitlist</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#2b2b2b]">
              {applications.filter(a => a.status === 'CANCELLED').length}
            </p>
            <p className="text-sm text-[#4b4b4b]">Cancelled</p>
          </div>
        </Card>
      </div>

      {/* Applications List */}
      {applicationsLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-[#4b4b4b] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">No applications yet</h3>
          <p className="text-[#4b4b4b]">
            Vendor applications will appear here once they apply to your events.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map(application => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {application.vendor.imageUrl ? (
                      <img 
                        src={application.vendor.imageUrl} 
                        alt={application.vendor.storeName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#7F232E]/20 to-[#5B6E02]/20 flex items-center justify-center">
                        <Users className="h-6 w-6 text-[#7F232E]/60" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#2b2b2b] truncate">
                        {application.vendor.storeName}
                      </h3>
                      {application.vendor.ratingAvg && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-[#4b4b4b]">
                            {application.vendor.ratingAvg.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-[#4b4b4b] mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {application.vendor.city}, {application.vendor.state}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                      {application.stall && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {application.stall.name} - ${application.stall.price}
                        </div>
                      )}
                    </div>
                    
                    {application.message && (
                      <p className="text-sm text-[#4b4b4b] line-clamp-2 mb-2">
                        "{application.message}"
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getApplicationStatusColor(application.status) as 'default' | 'secondary' | 'destructive'}>
                      {application.status}
                    </Badge>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowApplicationModal(application);
                        setApplicationStatus(application.status);
                      }}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#2b2b2b]">Analytics</h2>
        <p className="text-[#4b4b4b] mt-1">Track your event performance and insights</p>
      </div>
      
      <Card className="p-8 text-center">
        <TrendingUp className="h-12 w-12 text-[#4b4b4b] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#2b2b2b] mb-2">Analytics coming soon</h3>
        <p className="text-[#4b4b4b]">
          Detailed analytics and reporting features will be available here.
        </p>
      </Card>
    </div>
  );

  return (
    <div className={`${colors.bg} min-h-screen`}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#7F232E]/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2b2b2b]">Event Coordinator Console</h1>
              <p className="text-[#4b4b4b] mt-1">Manage your events and vendor applications</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setLocation('/events')}
            >
              View Public Events
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 bg-white/50 rounded-xl p-1">
          {[
            { id: 'events', label: 'My Events' },
            { id: 'applications', label: 'Applications' },
            { id: 'analytics', label: 'Analytics' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#7F232E] text-white'
                  : 'text-[#4b4b4b] hover:text-[#7F232E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'events' && renderEventsTab()}
          {activeTab === 'applications' && renderApplicationsTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </motion.div>
      </div>

      {/* Application Review Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                {showApplicationModal.vendor.imageUrl ? (
                  <img 
                    src={showApplicationModal.vendor.imageUrl} 
                    alt={showApplicationModal.vendor.storeName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#7F232E]/20 to-[#5B6E02]/20 flex items-center justify-center">
                    <Users className="h-8 w-8 text-[#7F232E]/60" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-[#2b2b2b]">
                    {showApplicationModal.vendor.storeName}
                  </h3>
                  {showApplicationModal.vendor.ratingAvg && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-[#4b4b4b]">
                        {showApplicationModal.vendor.ratingAvg.toFixed(1)} ({showApplicationModal.vendor.ratingCount} reviews)
                      </span>
                    </div>
                  )}
                </div>
                
                <p className="text-[#4b4b4b] mb-2">
                  {showApplicationModal.vendor.city}, {showApplicationModal.vendor.state}
                </p>
                
                <Badge variant={getApplicationStatusColor(showApplicationModal.status) as 'default' | 'secondary' | 'destructive'}>
                  {showApplicationModal.status}
                </Badge>
              </div>
            </div>
            
            {showApplicationModal.message && (
              <div className="mb-6">
                <h4 className="font-medium text-[#2b2b2b] mb-2">Application Message</h4>
                <p className="text-[#4b4b4b] bg-gray-50 p-3 rounded-lg">
                  "{showApplicationModal.message}"
                </p>
              </div>
            )}
            
            {showApplicationModal.stall && (
              <div className="mb-6">
                <h4 className="font-medium text-[#2b2b2b] mb-2">Requested Stall</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{showApplicationModal.stall.name}</span>
                    <span className="text-[#7F232E] font-semibold">${showApplicationModal.stall.price}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#4b4b4b] mb-2">Status</label>
                <select
                  value={applicationStatus}
                  onChange={(e) => setApplicationStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                  title="Select application status"
                >
                  <option value="APPLIED">Applied</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PAID">Paid</option>
                  <option value="WAITLIST">Waitlist</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#4b4b4b] mb-2">Message to Vendor</label>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Optional message to send to the vendor..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[#7F232E]/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowApplicationModal(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => updateApplicationMutation.mutate({
                  applicationId: showApplicationModal.id,
                  status: applicationStatus,
                  message: applicationMessage,
                })}
                disabled={updateApplicationMutation.isPending}
              >
                {updateApplicationMutation.isPending ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
