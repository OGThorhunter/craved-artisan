'use client';

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  Heart,
  Share2,
  Filter,
  Grid,
  List,
  Map,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Camera,
  Video,
  MessageCircle,
  ExternalLink,
  Download,
  Upload,
  Settings,
  Bell,
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
  X,
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
  Zap,
  Sparkles,
  ThumbsUp as ThumbsUpFilled,
  Tag as TagFilled,
  Leaf as LeafFilled,
  Award as AwardFilled,
  TrendingUp as TrendingUpFilled,
  Eye as EyeFilled,
  Zap as ZapFilled,
  Sparkles as SparklesFilled
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: string;
  name: string;
  description: string;
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
  createdAt: string;
  updatedAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar' | 'map'>('grid');
  const [zipCode, setZipCode] = useState('');
  const [detectedZip, setDetectedZip] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [vendorCapacity, setVendorCapacity] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showVendorCallout, setShowVendorCallout] = useState(false);
  const [isCoordinator, setIsCoordinator] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: '1',
        name: 'Locust Grove Artisan Market',
        description: 'Join us for a day of local artisans, fresh food, and community connection. Over 50 vendors showcasing handmade goods, fresh produce, and unique crafts.',
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
            products: [
              { id: 'p1', name: 'Sourdough Bread', price: 9.00, image: '/images/products/sourdough-1.jpg' },
              { id: 'p2', name: 'Artisan Baguette', price: 7.50, image: '/images/products/baguette.jpg' }
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
          }
        ],
        createdAt: '2024-01-15',
        updatedAt: '2024-02-10'
      },
      {
        id: '2',
        name: 'Sourdough Baking Workshop',
        description: 'Learn the art of sourdough bread making from master baker Maria Rodriguez. Hands-on workshop includes starter creation, dough handling, and baking techniques.',
        date: '2024-02-20',
        time: '14:00',
        endTime: '18:00',
        location: {
          name: 'Rose Creek Bakery',
          address: '456 Oak Ave',
          city: 'Locust Grove',
          state: 'GA',
          zip: '30248',
          coordinates: { lat: 33.3489, lng: -84.1075 }
        },
        type: 'class',
        category: 'Cooking Class',
        vendorCount: 1,
        maxVendors: 1,
        attendeeCount: 8,
        maxAttendees: 12,
        price: 85,
        vendorPrice: 0,
        image: '/images/events/workshop-1.jpg',
        bannerImage: '/images/events/workshop-banner-1.jpg',
        tags: ['baking', 'sourdough', 'hands-on', 'educational'],
        badges: ['Limited spots', 'Hands-on', 'Take home starter'],
        featured: false,
        vendorCallout: {
          footTraffic: 0,
          pastEarnings: 0,
          tableCost: 0,
          aiMatchScore: 0
        },
        vendors: [],
        logistics: {
          parking: true,
          restrooms: true,
          foodTrucks: false,
          kidFriendly: false,
          wheelchairAccessible: true,
          petFriendly: false
        },
        schedule: [
          { time: '14:00', activity: 'Introduction', description: 'Meet and greet, overview of sourdough' },
          { time: '14:30', activity: 'Starter Creation', description: 'Learn to create and maintain a starter' },
          { time: '15:30', activity: 'Dough Mixing', description: 'Hands-on dough preparation' },
          { time: '16:30', activity: 'Shaping & Baking', description: 'Final shaping and baking techniques' },
          { time: '18:00', activity: 'Wrap Up', description: 'Q&A and take home instructions' }
        ],
        chat: [],
        createdAt: '2024-01-20',
        updatedAt: '2024-02-05'
      }
    ];

    setEvents(mockEvents);
    setLoading(false);
  }, []);

  const handleZipSearch = () => {
    // TODO: Implement ZIP code search with geolocation
    console.log('Searching for events near ZIP:', zipCode);
  };

  const handleDetectLocation = () => {
    // TODO: Implement geolocation detection
    console.log('Detecting location...');
  };

  const renderEventCard = (event: Event) => (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative">
        <img src={event.bannerImage} alt={event.name} className="w-full h-48 object-cover" />
        {event.featured && (
          <div className="absolute top-4 left-4 bg-brand-green text-white px-2 py-1 text-xs font-medium rounded">
            Featured
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => {/* TODO: Save to calendar */}}
            className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            title="Save to calendar"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => {/* TODO: Add to wishlist */}}
            className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            title="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{event.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
              <span>•</span>
              <Clock className="w-4 h-4" />
              <span>{event.time} - {event.endTime}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-brand-maroon">
              {event.price === 0 ? 'Free' : `$${event.price}`}
            </div>
            {event.vendorPrice > 0 && (
              <div className="text-sm text-gray-600">Vendor: ${event.vendorPrice}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{event.location.name}</span>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-600">{event.location.city}, {event.location.state}</span>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {event.badges.map((badge, index) => (
            <span key={index} className="px-2 py-1 text-xs bg-brand-cream text-brand-maroon rounded-full">
              {badge}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{event.vendorCount}/{event.maxVendors} vendors</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{event.attendeeCount} attending</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/events/${event.id}`}
              className="bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-brand-green/80 transition-colors"
            >
              View Details
            </Link>
            {event.vendorPrice > 0 && event.vendorCount < event.maxVendors && (
              <button className="border border-brand-green text-brand-green px-4 py-2 rounded-lg hover:bg-brand-green hover:text-white transition-colors">
                Become a Vendor
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-maroon text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Discover Amazing Events</h1>
            <p className="text-xl opacity-90">Handmade markets, live classes, artisan pop-ups, and more</p>
          </div>

          {/* ZIP Search */}
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Enter ZIP code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
                {detectedZip && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                      {detectedZip}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleDetectLocation}
                className="px-4 py-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="Detect my location"
              >
                <MapPin className="w-5 h-5" />
              </button>
              <button
                onClick={handleZipSearch}
                className="px-6 py-3 bg-white text-brand-green rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Banner */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-green" />
                <span className="text-sm font-medium">
                  {detectedZip || zipCode || 'Enter ZIP to find events'}
                </span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">
                {events.length} events found
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <div className="flex border border-gray-300 rounded-lg">
                {['grid', 'list', 'calendar', 'map'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={`p-2 transition-colors ${
                      viewMode === mode
                        ? 'bg-brand-green text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} view`}
                  >
                    {mode === 'grid' && <Grid className="w-4 h-4" />}
                    {mode === 'list' && <List className="w-4 h-4" />}
                    {mode === 'calendar' && <Calendar className="w-4 h-4" />}
                    {mode === 'map' && <Map className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                                     <select
                     value={selectedEventType}
                     onChange={(e) => setSelectedEventType(e.target.value)}
                     className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                     aria-label="Select event type"
                   >
                    <option value="all">All Types</option>
                    <option value="market">Markets</option>
                    <option value="class">Classes</option>
                    <option value="popup">Pop-ups</option>
                    <option value="festival">Festivals</option>
                    <option value="workshop">Workshops</option>
                    <option value="tasting">Tastings</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                     <select
                     value={selectedCategory}
                     onChange={(e) => setSelectedCategory(e.target.value)}
                     className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                     aria-label="Select category"
                   >
                    <option value="all">All Categories</option>
                    <option value="food">Food & Drink</option>
                    <option value="crafts">Crafts & Art</option>
                    <option value="music">Music & Entertainment</option>
                    <option value="education">Education</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                    />
                    <span className="text-gray-500 self-center">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Capacity</label>
                                     <select
                     value={vendorCapacity}
                     onChange={(e) => setVendorCapacity(e.target.value)}
                     className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                     aria-label="Select vendor capacity"
                   >
                    <option value="all">All Events</option>
                    <option value="available">Vendor Spots Available</option>
                    <option value="limited">Limited Spots</option>
                    <option value="full">Full</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* View Modes */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(renderEventCard)}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            {events.map(renderEventCard)}
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Calendar View</h2>
            <p className="text-gray-600">Calendar view coming soon...</p>
          </div>
        )}

        {viewMode === 'map' && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Map View</h2>
            <p className="text-gray-600">Map view coming soon...</p>
          </div>
        )}
      </div>

      {/* Vendor Callout Banner */}
      <AnimatePresence>
        {showVendorCallout && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg border p-4 z-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Become a Vendor</h3>
                <p className="text-sm text-gray-600">Join our community of artisans</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-brand-green">2,500+</div>
                  <div className="text-xs text-gray-600">Avg. Foot Traffic</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-brand-green">$850</div>
                  <div className="text-xs text-gray-600">Avg. Earnings</div>
                </div>
                <button className="bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-brand-green/80 transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
