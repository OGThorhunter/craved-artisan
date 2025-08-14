'use client';

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  MapPin, Calendar, Clock, Users, Star, Heart, ShoppingBag, MessageCircle, 
  ExternalLink, Download, Upload, Settings, Bell, CheckCircle, AlertCircle,
  Camera, Video, ChevronLeft, ChevronRight, Play, Pause, ThumbsUp, Tag,
  Leaf, Award, TrendingUp, Eye, X, ChevronDown, ChevronUp, Plus, Minus,
  Star as StarFilled, MapPin as MapPinFilled, Calendar as CalendarFilled,
  Users as UsersFilled, ShoppingBag as ShoppingBagFilled, Camera as CameraFilled,
  Video as VideoFilled, MessageCircle as MessageCircleFilled, ExternalLink as ExternalLinkFilled,
  Download as DownloadFilled, Upload as UploadFilled, Settings as SettingsFilled,
  Bell as BellFilled, ThumbsUp as ThumbsUpFilled, Tag as TagFilled, Leaf as LeafFilled,
  Award as AwardFilled, TrendingUp as TrendingUpFilled, Eye as EyeFilled, Zap,
  Sparkles, Zap as ZapFilled, Sparkles as SparklesFilled, Gift, CreditCard,
  Package, Truck, Clock as ClockIcon, Truck as TruckIcon, Package as PackageIcon,
  Filter, Search, Grid, List, SortAsc, SortDesc, Share2, Copy, Edit, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  primaryZip: string;
  secondaryZips: string[];
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  walletBalance: number;
  referralCode: string;
  referralCount: number;
  totalSpent: number;
  joinDate: string;
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    marketing: boolean;
    defaultPickupMethod: 'pickup' | 'delivery';
  };
}

interface Order {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorAvatar: string;
  date: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked-up' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  pickupDate?: string;
  pickupTime?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  eta?: string;
  reviewed: boolean;
}

interface Vendor {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  nextAvailability: string;
  distance: number;
  tags: string[];
  featured: boolean;
}

interface Message {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorAvatar: string;
  subject: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  category: 'order' | 'product' | 'pickup' | 'general';
}

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  rsvpStatus: 'going' | 'maybe' | 'not-going';
  favoriteVendorsAttending: string[];
  image: string;
}

export default function CustomerDashboardPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favoriteVendors, setFavoriteVendors] = useState<Vendor[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'favorites' | 'messages' | 'events' | 'wallet' | 'settings'>('overview');
  const [showZIPManager, setShowZIPManager] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCustomer: Customer = {
      id: 'c1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      avatar: '/images/avatars/sarah.jpg',
      primaryZip: '30248',
      secondaryZips: ['30301', '30305'],
      loyaltyPoints: 1250,
      loyaltyTier: 'gold',
      walletBalance: 45.75,
      referralCode: 'SARAH2024',
      referralCount: 8,
      totalSpent: 1247.50,
      joinDate: '2023-03-15',
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        marketing: true,
        defaultPickupMethod: 'pickup'
      }
    };

    const mockOrders: Order[] = [
      {
        id: 'o1',
        vendorId: 'v1',
        vendorName: 'Rose Creek Bakery',
        vendorAvatar: '/images/vendors/rosecreek-avatar.jpg',
        date: '2024-02-10',
        status: 'ready',
        total: 32.50,
        items: [
          { id: 'i1', name: 'Sourdough Bread', quantity: 2, price: 9.00, image: '/images/products/sourdough-1.jpg' },
          { id: 'i2', name: 'Artisan Baguette', quantity: 1, price: 7.50, image: '/images/products/baguette.jpg' },
          { id: 'i3', name: 'Croissant', quantity: 2, price: 3.50, image: '/images/products/croissant.jpg' }
        ],
        pickupDate: '2024-02-12',
        pickupTime: '14:00-16:00',
        eta: 'Ready for pickup',
        reviewed: false
      },
      {
        id: 'o2',
        vendorId: 'v2',
        vendorName: 'Green Thumb Gardens',
        vendorAvatar: '/images/vendors/greenthumb-avatar.jpg',
        date: '2024-02-08',
        status: 'delivered',
        total: 18.75,
        items: [
          { id: 'i4', name: 'Organic Tomatoes', quantity: 2, price: 4.50, image: '/images/products/tomatoes.jpg' },
          { id: 'i5', name: 'Fresh Herbs', quantity: 3, price: 3.25, image: '/images/products/herbs.jpg' }
        ],
        deliveryDate: '2024-02-09',
        deliveryTime: '10:30',
        reviewed: true
      }
    ];

    const mockFavoriteVendors: Vendor[] = [
      {
        id: 'v1',
        name: 'Rose Creek Bakery',
        avatar: '/images/vendors/rosecreek-avatar.jpg',
        verified: true,
        rating: 4.8,
        reviewCount: 127,
        nextAvailability: '2024-02-15',
        distance: 2.3,
        tags: ['artisan', 'organic', 'local'],
        featured: true
      },
      {
        id: 'v2',
        name: 'Green Thumb Gardens',
        avatar: '/images/vendors/greenthumb-avatar.jpg',
        verified: true,
        rating: 4.9,
        reviewCount: 89,
        nextAvailability: '2024-02-14',
        distance: 1.8,
        tags: ['organic', 'seasonal', 'farm-fresh'],
        featured: false
      }
    ];

    const mockMessages: Message[] = [
      {
        id: 'm1',
        vendorId: 'v1',
        vendorName: 'Rose Creek Bakery',
        vendorAvatar: '/images/vendors/rosecreek-avatar.jpg',
        subject: 'Order #o1 Ready for Pickup',
        preview: 'Your order is ready for pickup at our location...',
        timestamp: '2024-02-10T14:30:00Z',
        unread: true,
        category: 'order'
      },
      {
        id: 'm2',
        vendorId: 'v2',
        vendorName: 'Green Thumb Gardens',
        vendorAvatar: '/images/vendors/greenthumb-avatar.jpg',
        subject: 'New Seasonal Items Available',
        preview: 'We just harvested fresh strawberries and...',
        timestamp: '2024-02-09T10:15:00Z',
        unread: false,
        category: 'product'
      }
    ];

    const mockEvents: Event[] = [
      {
        id: 'e1',
        name: 'Locust Grove Artisan Market',
        date: '2024-02-15',
        time: '09:00-17:00',
        location: 'Locust Grove Farmers Market',
        rsvpStatus: 'going',
        favoriteVendorsAttending: ['v1', 'v2'],
        image: '/images/events/market-1.jpg'
      }
    ];

    setCustomer(mockCustomer);
    setOrders(mockOrders);
    setFavoriteVendors(mockFavoriteVendors);
    setMessages(mockMessages);
    setUpcomingEvents(mockEvents);
    setLoading(false);
  }, []);

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600';
      case 'silver': return 'text-gray-500';
      case 'gold': return 'text-yellow-500';
      case 'platinum': return 'text-purple-500';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'preparing': return 'text-orange-600 bg-orange-100';
      case 'ready': return 'text-green-600 bg-green-100';
      case 'picked-up': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleReorder = (order: Order) => {
    setSelectedOrder(order);
    setShowReorderModal(true);
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(customer?.referralCode || '');
    // TODO: Show toast notification
  };

  if (loading) return <div>Loading...</div>;
  if (!customer) return <div>Customer not found.</div>;

  return (
    <div className="page-container bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={customer.avatar} alt={customer.name} className="w-16 h-16 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {customer.name}!</h1>
                <p className="text-gray-600">Member since {new Date(customer.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-green">{customer.loyaltyPoints}</div>
                <div className="text-sm text-gray-600">Loyalty Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-maroon">${customer.walletBalance}</div>
                <div className="text-sm text-gray-600">Wallet Balance</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'orders', label: 'Orders', icon: ShoppingBag },
              { id: 'favorites', label: 'Favorites', icon: Heart },
              { id: 'messages', label: 'Messages', icon: MessageCircle },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'wallet', label: 'Wallet', icon: CreditCard },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-brand-green text-brand-green'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-brand-green">{orders.length}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-brand-maroon">{favoriteVendors.length}</div>
                  <div className="text-sm text-gray-600">Favorite Vendors</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">{messages.filter(m => m.unread).length}</div>
                  <div className="text-sm text-gray-600">Unread Messages</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600">{upcomingEvents.length}</div>
                  <div className="text-sm text-gray-600">Upcoming Events</div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Recent Orders</h2>
                  <Link href="/dashboard/customer/orders" className="text-brand-green hover:text-brand-green/80">
                    View all →
                  </Link>
                </div>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <img src={order.vendorAvatar} alt={order.vendorName} className="w-12 h-12 rounded-full" />
                        <div>
                          <h3 className="font-semibold">{order.vendorName}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.date).toLocaleDateString()} • ${order.total}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReorder(order)}
                          className="px-3 py-1 text-sm bg-brand-green text-white rounded hover:bg-brand-green/80"
                        >
                          Reorder
                        </button>
                        <Link
                          href={`/vendors/${order.vendorId}`}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Visit Store
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Favorite Vendors */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Favorite Vendors</h2>
                  <Link href="/dashboard/customer/favorites" className="text-brand-green hover:text-brand-green/80">
                    View all →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteVendors.map((vendor) => (
                    <div key={vendor.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={vendor.avatar} alt={vendor.name} className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{vendor.name}</h3>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{vendor.rating}</span>
                            <span className="text-sm text-gray-600">({vendor.reviewCount})</span>
                          </div>
                        </div>
                        {vendor.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {vendor.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{vendor.distance} mi away</span>
                        <Link
                          href={`/vendors/${vendor.id}`}
                          className="text-brand-green hover:text-brand-green/80 text-sm font-medium"
                        >
                          Visit Store →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loyalty & Wallet */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Loyalty Program</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Tier</span>
                      <span className={`font-semibold ${getLoyaltyTierColor(customer.loyaltyTier)}`}>
                        {customer.loyaltyTier.charAt(0).toUpperCase() + customer.loyaltyTier.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Points to Next Tier</span>
                      <span className="font-semibold">250 more points</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-brand-green h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Referral Program</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Referral Code</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{customer.referralCode}</span>
                        <button
                          onClick={handleCopyReferralCode}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Copy referral code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Friends Referred</span>
                      <span className="font-semibold">{customer.referralCount}</span>
                    </div>
                    <button className="w-full bg-brand-green text-white py-2 px-4 rounded-lg hover:bg-brand-green/80">
                      Share Referral Code
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Order History</h2>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      <Download className="w-4 h-4 inline mr-1" />
                      Export
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      <Filter className="w-4 h-4 inline mr-1" />
                      Filter
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <img src={order.vendorAvatar} alt={order.vendorName} className="w-12 h-12 rounded-full" />
                          <div>
                            <h3 className="font-semibold">{order.vendorName}</h3>
                            <p className="text-sm text-gray-600">Order #{order.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${order.total}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(order.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace('-', ' ')}
                          </span>
                          {order.eta && <span className="text-sm text-gray-600">{order.eta}</span>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReorder(order)}
                            className="px-3 py-1 text-sm bg-brand-green text-white rounded hover:bg-brand-green/80"
                          >
                            Reorder
                          </button>
                          <Link
                            href={`/vendors/${order.vendorId}`}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Visit Store
                          </Link>
                          {!order.reviewed && (
                            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                              Leave Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Favorite Vendors</h2>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      <Grid className="w-4 h-4 inline mr-1" />
                      Grid
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      <List className="w-4 h-4 inline mr-1" />
                      List
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteVendors.map((vendor) => (
                    <div key={vendor.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={vendor.avatar} alt={vendor.name} className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{vendor.name}</h3>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{vendor.rating}</span>
                            <span className="text-sm text-gray-600">({vendor.reviewCount})</span>
                          </div>
                        </div>
                        {vendor.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {vendor.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{vendor.distance} mi away</span>
                        <Link
                          href={`/vendors/${vendor.id}`}
                          className="text-brand-green hover:text-brand-green/80 text-sm font-medium"
                        >
                          Visit Store →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Messages</h2>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      <Filter className="w-4 h-4 inline mr-1" />
                      Filter
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`border border-gray-200 rounded-lg p-4 ${message.unread ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-center gap-4">
                        <img src={message.vendorAvatar} alt={message.vendorName} className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{message.vendorName}</h3>
                            <span className="text-sm text-gray-600">
                              {new Date(message.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{message.subject}</p>
                          <p className="text-sm text-gray-500">{message.preview}</p>
                        </div>
                        {message.unread && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Upcoming Events</h2>
                  <Link href="/events" className="text-brand-green hover:text-brand-green/80">
                    Browse all events →
                  </Link>
                </div>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <img src={event.image} alt={event.name} className="w-16 h-16 rounded object-cover" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{event.name}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(event.date).toLocaleDateString()} • {event.time}
                          </p>
                          <p className="text-sm text-gray-600">{event.location}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            event.rsvpStatus === 'going' ? 'bg-green-100 text-green-800' :
                            event.rsvpStatus === 'maybe' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {event.rsvpStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'wallet' && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Wallet Balance</h2>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-brand-green">${customer.walletBalance}</div>
                    <p className="text-gray-600">Available Balance</p>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full bg-brand-green text-white py-2 px-4 rounded-lg hover:bg-brand-green/80">
                      Add Funds
                    </button>
                    <button className="w-full border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50">
                      View Transaction History
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Loyalty Program</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Tier</span>
                      <span className={`font-semibold ${getLoyaltyTierColor(customer.loyaltyTier)}`}>
                        {customer.loyaltyTier.charAt(0).toUpperCase() + customer.loyaltyTier.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Points</span>
                      <span className="font-semibold">{customer.loyaltyPoints}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Points to Next Tier</span>
                      <span className="font-semibold">250 more points</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-brand-green h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={customer.name}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={customer.email}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Notification Preferences</h3>
                    <div className="space-y-3">
                                             <div className="flex items-center justify-between">
                         <label className="text-sm">Email Notifications</label>
                         <input
                           type="checkbox"
                           checked={customer.preferences.notifications.email}
                           className="rounded"
                           aria-label="Email notifications"
                         />
                       </div>
                       <div className="flex items-center justify-between">
                         <label className="text-sm">Push Notifications</label>
                         <input
                           type="checkbox"
                           checked={customer.preferences.notifications.push}
                           className="rounded"
                           aria-label="Push notifications"
                         />
                       </div>
                       <div className="flex items-center justify-between">
                         <label className="text-sm">SMS Notifications</label>
                         <input
                           type="checkbox"
                           checked={customer.preferences.notifications.sms}
                           className="rounded"
                           aria-label="SMS notifications"
                         />
                       </div>
                       <div className="flex items-center justify-between">
                         <label className="text-sm">Marketing Communications</label>
                         <input
                           type="checkbox"
                           checked={customer.preferences.marketing}
                           className="rounded"
                           aria-label="Marketing communications"
                         />
                       </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Default Pickup Method</h3>
                                         <select
                       value={customer.preferences.defaultPickupMethod}
                       className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                       aria-label="Default pickup method"
                     >
                       <option value="pickup">Pickup</option>
                       <option value="delivery">Delivery</option>
                     </select>
                  </div>

                  <button className="w-full bg-brand-green text-white py-2 px-4 rounded-lg hover:bg-brand-green/80">
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reorder Modal */}
      <AnimatePresence>
        {showReorderModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowReorderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Reorder from {selectedOrder.vendorName}</h3>
                <button
                  onClick={() => setShowReorderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  Add these items to your cart:
                </p>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">${item.price} each</p>
                    </div>
                                         <div className="flex items-center gap-2">
                       <button 
                         className="p-1 hover:bg-gray-100 rounded"
                         title="Decrease quantity"
                         aria-label="Decrease quantity"
                       >
                         <Minus className="w-4 h-4" />
                       </button>
                       <span className="w-8 text-center">{item.quantity}</span>
                       <button 
                         className="p-1 hover:bg-gray-100 rounded"
                         title="Increase quantity"
                         aria-label="Increase quantity"
                       >
                         <Plus className="w-4 h-4" />
                       </button>
                     </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <button className="flex-1 bg-brand-green text-white py-2 px-4 rounded-lg hover:bg-brand-green/80">
                    Add to Cart
                  </button>
                  <Link
                    href={`/vendors/${selectedOrder.vendorId}`}
                    className="flex-1 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 text-center"
                  >
                    Visit Store
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
