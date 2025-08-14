'use client';

import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Link } from 'wouter';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  Heart,
  Share2,
  MessageCircle,
  ExternalLink,
  Download,
  Upload,
  Settings,
  Bell,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Camera,
  Video,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ThumbsUp,
  Tag,
  Leaf,
  Award,
  TrendingUp,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Star as StarFilled,
  MapPin as MapPinFilled,
  Calendar as CalendarFilled,
  Users as UsersFilled,
  ShoppingBag as ShoppingBagFilled,
  Camera as CameraFilled,
  Video as VideoFilled,
  MessageCircle as MessageCircleFilled,
  ExternalLink as ExternalLinkFilled,
  Download as DownloadFilled,
  Upload as UploadFilled,
  Settings as SettingsFilled,
  Bell as BellFilled,
  ThumbsUp as ThumbsUpFilled,
  Tag as TagFilled,
  Leaf as LeafFilled,
  Award as AwardFilled,
  TrendingUp as TrendingUpFilled,
  Eye as EyeFilled,
  Zap,
  Sparkles,
  Zap as ZapFilled,
  Sparkles as SparklesFilled
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  date: string;
  time: string;
  endTime: string;
  location: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    coordinates: { lat: number; lng: number };
  };
  type: 'market' | 'class' | 'popup' | 'festival' | 'workshop' | 'tasting';
  category: string;
  vendorCount: number;
  maxVendors: number;
  attendeeCount: number;
  maxAttendees: number;
  price: number;
  vendorPrice: number;
  image: string;
  bannerImage: string;
  tags: string[];
  badges: string[];
  featured: boolean;
  vendorCallout: {
    footTraffic: number;
    pastEarnings: number;
    tableCost: number;
    aiMatchScore: number;
  };
  vendors: Array<{
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    booth: string;
    boothCoordinates: { x: number; y: number };
    products: Array<{
      id: string;
      name: string;
      price: number;
      image: string;
    }>;
  }>;
  logistics: {
    parking: boolean;
    restrooms: boolean;
    foodTrucks: boolean;
    kidFriendly: boolean;
    wheelchairAccessible: boolean;
    petFriendly: boolean;
  };
  schedule: Array<{
    time: string;
    activity: string;
    description: string;
  }>;
  chat: Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    message: string;
    timestamp: string;
  }>;
  boothMap: Array<{
    id: string;
    booth: string;
    vendorId?: string;
    vendorName?: string;
    coordinates: { x: number; y: number };
    available: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function EventDetailPage() {
  const [, params] = useRoute("/events/:eventId");
  const eventId = params?.eventId ?? "";

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'schedule' | 'chat' | 'logistics'>('overview');
  const [selectedBooth, setSelectedBooth] = useState<string | null>(null);
  const [showVendorSignup, setShowVendorSignup] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'none' | 'going' | 'maybe' | 'not-going'>('none');
  const [chatMessage, setChatMessage] = useState('');
  const [isCoordinator, setIsCoordinator] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockEvent: Event = {
      id: eventId,
      name: 'Locust Grove Artisan Market',
      description: 'Join us for a day of local artisans, fresh food, and community connection.',
      longDescription: `The Locust Grove Artisan Market is our flagship community event, bringing together over 50 local artisans, farmers, and food vendors for a day of celebration and connection.

This year's market features:
• Handcrafted goods from local artisans
• Fresh produce from family farms
• Live music and entertainment
• Food trucks and local cuisine
• Kids' activities and crafts
• Educational workshops and demonstrations

Whether you're looking for unique gifts, fresh ingredients, or just a fun day out with the family, there's something for everyone at the Locust Grove Artisan Market.`,
      date: '2024-02-15',
      time: '09:00',
      endTime: '17:00',
      location: {
        name: 'Locust Grove Farmers Market',
        address: '123 Main St',
        city: 'Locust Grove',
        state: 'GA',
        zip: '30248',
        coordinates: { lat: 33.3467, lng: -84.1091 }
      },
      type: 'market',
      category: 'Artisan Market',
      vendorCount: 45,
      maxVendors: 60,
      attendeeCount: 1200,
      maxAttendees: 2000,
      price: 0,
      vendorPrice: 75,
      image: '/images/events/market-1.jpg',
      bannerImage: '/images/events/market-banner-1.jpg',
      tags: ['artisan', 'local', 'handmade', 'fresh', 'community'],
      badges: ['Popular', 'Vendor spots available', 'Kid friendly'],
      featured: true,
      vendorCallout: {
        footTraffic: 2500,
        pastEarnings: 850,
        tableCost: 75,
        aiMatchScore: 92
      },
      vendors: [
        {
          id: 'v1',
          name: 'Rose Creek Bakery',
          avatar: '/images/vendors/rosecreek-avatar.jpg',
          verified: true,
          booth: 'A12',
          boothCoordinates: { x: 120, y: 80 },
          products: [
            { id: 'p1', name: 'Sourdough Bread', price: 9.00, image: '/images/products/sourdough-1.jpg' },
            { id: 'p2', name: 'Artisan Baguette', price: 7.50, image: '/images/products/baguette.jpg' }
          ]
        },
        {
          id: 'v2',
          name: 'Green Thumb Gardens',
          avatar: '/images/vendors/greenthumb-avatar.jpg',
          verified: true,
          booth: 'B15',
          boothCoordinates: { x: 200, y: 120 },
          products: [
            { id: 'p3', name: 'Organic Tomatoes', price: 4.50, image: '/images/products/tomatoes.jpg' },
            { id: 'p4', name: 'Fresh Herbs', price: 3.00, image: '/images/products/herbs.jpg' }
          ]
        }
      ],
      logistics: {
        parking: true,
        restrooms: true,
        foodTrucks: true,
        kidFriendly: true,
        wheelchairAccessible: true,
        petFriendly: false
      },
      schedule: [
        { time: '09:00', activity: 'Market Opens', description: 'Vendors set up and market begins' },
        { time: '10:00', activity: 'Live Music', description: 'Local band performance' },
        { time: '12:00', activity: 'Food Truck Arrival', description: 'Lunch options available' },
        { time: '15:00', activity: 'Craft Demo', description: 'Live artisan demonstration' },
        { time: '17:00', activity: 'Market Closes', description: 'Thank you for visiting!' }
      ],
      chat: [
        {
          id: 'c1',
          userId: 'u1',
          userName: 'Sarah M.',
          userAvatar: '/images/avatars/sarah.jpg',
          message: 'Can\'t wait for this market! Will there be gluten-free options?',
          timestamp: '2024-02-10T10:30:00Z'
        },
        {
          id: 'c2',
          userId: 'u2',
          userName: 'Mike R.',
          userAvatar: '/images/avatars/mike.jpg',
          message: 'I\'ll be there with my pottery! Booth C8 if anyone wants to stop by.',
          timestamp: '2024-02-10T11:15:00Z'
        }
      ],
      boothMap: [
        { id: '1', booth: 'A12', vendorId: 'v1', vendorName: 'Rose Creek Bakery', coordinates: { x: 120, y: 80 }, available: false },
        { id: '2', booth: 'B15', vendorId: 'v2', vendorName: 'Green Thumb Gardens', coordinates: { x: 200, y: 120 }, available: false },
        { id: '3', booth: 'C8', vendorId: 'v3', vendorName: 'Mike\'s Pottery', coordinates: { x: 280, y: 160 }, available: false },
        { id: '4', booth: 'A15', coordinates: { x: 160, y: 80 }, available: true },
        { id: '5', booth: 'B8', coordinates: { x: 240, y: 120 }, available: true }
      ],
      createdAt: '2024-01-15',
      updatedAt: '2024-02-10'
    };

    setEvent(mockEvent);
    setLoading(false);
  }, [eventId]);

  if (loading) return <div>Loading...</div>;
  if (!event) return <div>Event not found.</div>;

  const handleRSVP = (status: 'going' | 'maybe' | 'not-going') => {
    setRsvpStatus(status);
    setShowRSVP(false);
    // TODO: Send RSVP to API
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      // TODO: Send message to API
      setChatMessage('');
    }
  };

  const renderBoothMap = () => (
    <div className="relative bg-gray-100 rounded-lg p-4 h-96">
      <div className="text-center mb-4">
        <h3 className="font-semibold">Booth Map</h3>
        <p className="text-sm text-gray-600">Click on booths for details</p>
      </div>
      
      <div className="relative w-full h-80 bg-white rounded border">
        {event.boothMap.map((booth) => (
          <button
            key={booth.id}
            onClick={() => setSelectedBooth(booth.booth)}
            className={`absolute w-16 h-16 rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-colors ${
              booth.available
                ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
                : 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'
            }`}
            style={{
              left: `${booth.coordinates.x}px`,
              top: `${booth.coordinates.y}px`
            }}
            title={booth.vendorName || `Booth ${booth.booth} - Available`}
            aria-label={booth.vendorName || `Booth ${booth.booth} - Available`}
          >
            {booth.booth}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span>Occupied</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/events" className="hover:text-gray-700">Events</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{event.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <img src={event.bannerImage} alt={event.name} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 text-white">
            <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
            <div className="flex items-center gap-4 text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{event.time} - {event.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{event.location.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-brand-green">{event.vendorCount}</div>
                  <div className="text-sm text-gray-600">Vendors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-brand-maroon">{event.attendeeCount}</div>
                  <div className="text-sm text-gray-600">Attending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{event.maxVendors - event.vendorCount}</div>
                  <div className="text-sm text-gray-600">Spots Left</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{event.price === 0 ? 'Free' : `$${event.price}`}</div>
                  <div className="text-sm text-gray-600">Entry</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b">
                <div className="flex overflow-x-auto">
                  {['overview', 'vendors', 'schedule', 'chat', 'logistics'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab
                          ? 'border-b-2 border-brand-green text-brand-green'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-semibold mb-3">About this event</h3>
                        <p className="text-gray-700 leading-relaxed">{event.longDescription}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Event Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-brand-green" />
                            <div>
                              <p className="font-medium">Date & Time</p>
                              <p className="text-sm text-gray-600">
                                {new Date(event.date).toLocaleDateString()} • {event.time} - {event.endTime}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-brand-green" />
                            <div>
                              <p className="font-medium">Location</p>
                              <p className="text-sm text-gray-600">
                                {event.location.name}<br />
                                {event.location.address}, {event.location.city}, {event.location.state} {event.location.zip}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {event.tags.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'vendors' && (
                    <motion.div
                      key="vendors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Featured Vendors</h3>
                        <Link
                          href={`/events/${event.id}/vendors`}
                          className="text-brand-green hover:text-brand-green/80"
                        >
                          View all vendors →
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {event.vendors.map((vendor) => (
                          <div key={vendor.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <img src={vendor.avatar} alt={vendor.name} className="w-12 h-12 rounded-full" />
                              <div>
                                <h4 className="font-semibold">{vendor.name}</h4>
                                <p className="text-sm text-gray-600">Booth {vendor.booth}</p>
                              </div>
                              {vendor.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {vendor.products.slice(0, 2).map((product) => (
                                <div key={product.id} className="flex items-center gap-2">
                                  <img src={product.image} alt={product.name} className="w-8 h-8 rounded object-cover" />
                                  <div className="text-sm">
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-gray-600">${product.price}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <Link
                              href={`/vendors/${vendor.id}`}
                              className="text-brand-green hover:text-brand-green/80 text-sm font-medium"
                            >
                              Shop in advance →
                            </Link>
                          </div>
                        ))}
                      </div>

                      {renderBoothMap()}
                    </motion.div>
                  )}

                  {activeTab === 'schedule' && (
                    <motion.div
                      key="schedule"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold">Event Schedule</h3>
                      {event.schedule.map((item, index) => (
                        <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                          <div className="text-center">
                            <div className="font-semibold text-brand-green">{item.time}</div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.activity}</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'chat' && (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold">Event Chat</h3>
                      
                      <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-4">
                        {event.chat.map((message) => (
                          <div key={message.id} className="flex gap-3">
                            <img src={message.userAvatar} alt={message.userName} className="w-8 h-8 rounded-full" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{message.userName}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(message.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{message.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleChatSubmit} className="flex gap-2">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/80 transition-colors"
                        >
                          Send
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {activeTab === 'logistics' && (
                    <motion.div
                      key="logistics"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold">Event Logistics</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(event.logistics).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            {value ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <X className="w-5 h-5 text-red-500" />
                            )}
                            <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Getting There</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <strong>Address:</strong> {event.location.address}, {event.location.city}, {event.location.state} {event.location.zip}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Parking:</strong> Free parking available on-site
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Public Transit:</strong> Bus routes 15 and 23 stop nearby
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* RSVP Section */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">RSVP</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleRSVP('going')}
                  className={`w-full py-2 px-4 rounded-lg border-2 transition-colors ${
                    rsvpStatus === 'going'
                      ? 'border-brand-green bg-brand-green text-white'
                      : 'border-gray-300 hover:border-brand-green'
                  }`}
                >
                  Going
                </button>
                <button
                  onClick={() => handleRSVP('maybe')}
                  className={`w-full py-2 px-4 rounded-lg border-2 transition-colors ${
                    rsvpStatus === 'maybe'
                      ? 'border-yellow-500 bg-yellow-500 text-white'
                      : 'border-gray-300 hover:border-yellow-500'
                  }`}
                >
                  Maybe
                </button>
                <button
                  onClick={() => handleRSVP('not-going')}
                  className={`w-full py-2 px-4 rounded-lg border-2 transition-colors ${
                    rsvpStatus === 'not-going'
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-gray-300 hover:border-red-500'
                  }`}
                >
                  Not Going
                </button>
              </div>
            </div>

            {/* Vendor Signup */}
            {event.vendorCount < event.maxVendors && (
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Become a Vendor</h3>
                <div className="space-y-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-green">${event.vendorCallout.footTraffic}</div>
                    <div className="text-sm text-gray-600">Avg. Foot Traffic</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-green">${event.vendorCallout.pastEarnings}</div>
                    <div className="text-sm text-gray-600">Avg. Past Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-maroon">${event.vendorPrice}</div>
                    <div className="text-sm text-gray-600">Table Cost</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowVendorSignup(true)}
                  className="w-full bg-brand-green text-white py-2 px-4 rounded-lg hover:bg-brand-green/80 transition-colors"
                >
                  Apply as Vendor
                </button>
              </div>
            )}

            {/* Share */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Share Event</h3>
              <div className="flex gap-2">
                <button className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Facebook
                </button>
                <button className="flex-1 p-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors">
                  Twitter
                </button>
                <button className="flex-1 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Calendar Integration */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Add to Calendar</h3>
              <div className="space-y-2">
                <button className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Google Calendar
                </button>
                <button className="w-full p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                  Apple Calendar
                </button>
                <button className="w-full p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Outlook
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Signup Modal */}
      <AnimatePresence>
        {showVendorSignup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowVendorSignup(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Apply as Vendor</h3>
                <button
                  onClick={() => setShowVendorSignup(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  Apply to become a vendor at {event.name}. Table cost: ${event.vendorPrice}
                </p>
                <input
                  type="text"
                  placeholder="Business Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
                <textarea
                  placeholder="Describe your products/services"
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
                <button className="w-full bg-brand-green text-white py-2 px-4 rounded-lg hover:bg-brand-green/80 transition-colors">
                  Submit Application
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
