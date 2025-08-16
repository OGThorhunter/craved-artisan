import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  Calendar,
  Clock,
  Truck,
  Shield,
  Award,
  Leaf,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Filter,
  Search,
  X,
  Plus,
  Minus,
  MessageCircle,
  Share2,
  Eye,
  Camera,
  Video,
  Package,
  Users,
  ThumbsUp,
  Clock as ClockIcon,
  AlertCircle,
  Globe,
  ExternalLink
} from 'lucide-react';
import L from 'leaflet';
import * as turf from '@turf/turf';

// Fix for Leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default store data
const defaultStoreData = {
  siteName: 'Artisan Bakes Atlanta',
  tagline: 'Handcrafted with Love',
  primaryColor: '#5B6E02',
  secondaryColor: '#8B4513',
  city: 'Atlanta',
  state: 'GA',
  isVerified: true,
  isOnVacation: false,
  vacationReturnDate: '2024-02-15',
  responseTime: '2 hours',
  sustainabilityCommitments: ['Carbon Neutral', 'Zero Waste', 'Local Ingredients'],
  values: ['Community First', 'Traditional Methods', 'Quality Over Quantity'],
  contactInfo: {
    phone: '(404) 555-0123',
    email: 'hello@artisanbakesatlanta.com',
    website: 'https://artisanbakesatlanta.com',
    address: '123 Artisan Way, Atlanta, GA 30301',
    businessHours: {
      'Monday - Friday': '7:00 AM - 6:00 PM',
      'Saturday': '8:00 AM - 5:00 PM',
      'Sunday': '9:00 AM - 3:00 PM'
    }
  },
  coverageZips: ['30248', '30301', '30302', '30303', '30304', '30305', '30306', '30307', '30308', '30309', '30310', '30311', '30312', '30313', '30314', '30315', '30316', '30317', '30318', '30319', '30320', '30321', '30322', '30324', '30325', '30326', '30327', '30328', '30329', '30330', '30331', '30332', '30333', '30334', '30336', '30337', '30338', '30339', '30340', '30341', '30342', '30343', '30344', '30345', '30346', '30347', '30348', '30349', '30350', '30353', '30354', '30355', '30356', '30357', '30358', '30359', '30360', '30361', '30362', '30363', '30364', '30365', '30366', '30367', '30368', '30369', '30370', '30371', '30372', '30373', '30374', '30375', '30376', '30377', '30378', '30379', '30380', '30381', '30382', '30383', '30384', '30385', '30386', '30387', '30388', '30389', '30390', '30391', '30392', '30393', '30394', '30395', '30396', '30397', '30398', '30399'],
  sections: [
    {
      id: '1',
      type: 'hero',
      title: 'Welcome to Artisan Bakes Atlanta',
      content: 'Handcrafted sourdough bread and artisanal pastries made with love and the finest ingredients. Every bite tells a story of tradition, passion, and community.',
      backgroundColor: '#F7F2EC',
      textColor: '#2C2C2C',
      padding: 'py-16',
      margin: 'mb-8'
    },
    {
      id: '2',
      type: 'about',
      title: 'Our Story',
      content: 'We started as a small family bakery with a passion for creating authentic, delicious bread using traditional methods and modern techniques. Our sourdough starter has been lovingly maintained for over 15 years, creating the perfect foundation for our artisanal breads.',
      backgroundColor: '#FFFFFF',
      textColor: '#2C2C2C',
      padding: 'py-12',
      margin: 'mb-8'
    },
    {
      id: '3',
      type: 'products',
      title: 'Featured Products',
      content: 'Discover our signature collection of handcrafted breads, pastries, and artisanal goods.',
      backgroundColor: '#F7F2EC',
      textColor: '#2C2C2C',
      padding: 'py-12',
      margin: 'mb-8'
    },
    {
      id: '4',
      type: 'contact',
      title: 'Get in Touch',
      content: 'Ready to experience the difference that passion and tradition make? Contact us to place an order or learn more about our products.',
      backgroundColor: '#FFFFFF',
      textColor: '#2C2C2C',
      padding: 'py-12',
      margin: 'mb-8'
    }
  ]
};

// Mock product data
const products = [
  {
    id: '1',
    name: 'Artisan Sourdough',
    price: 8.99,
    originalPrice: 10.99,
    image: '/product-sourdough.jpg',
    category: 'Bread',
    tags: ['Organic', 'Handmade', 'LocalTo30248'],
    availability: 'In Stock',
    pickupDays: ['Wednesday', 'Saturday'],
    stockLevel: 'Low Stock',
    rating: 4.8,
    reviewCount: 127,
    description: 'Traditional sourdough bread with a perfect crust and tangy flavor.',
    isVerified: true
  },
  {
    id: '2',
    name: 'Buttery Croissants',
    price: 4.99,
    originalPrice: null,
    image: '/product-croissants.jpg',
    category: 'Pastries',
    tags: ['European Butter', 'Handmade', 'Fresh Daily'],
    availability: 'In Stock',
    pickupDays: ['Daily'],
    stockLevel: 'In Stock',
    rating: 4.9,
    reviewCount: 89,
    description: 'Buttery, flaky croissants made with European butter.',
    isVerified: true
  },
  {
    id: '3',
    name: 'Herb Focaccia',
    price: 6.99,
    originalPrice: null,
    image: '/product-focaccia.jpg',
    category: 'Bread',
    tags: ['Herbs', 'Olive Oil', 'Artisan'],
    availability: 'Back Soon',
    pickupDays: ['Friday', 'Sunday'],
    stockLevel: 'Back Soon',
    rating: 4.7,
    reviewCount: 76,
    description: 'Herb-infused focaccia with olive oil and sea salt.',
    isVerified: true
  }
];

// Mock reviews
const reviews = [
  {
    id: '1',
    customerName: 'Sarah M.',
    rating: 5,
    date: '2024-01-15',
    title: 'Amazing sourdough!',
    content: 'The best sourdough I\'ve ever had. Perfect crust and amazing flavor. Will definitely order again!',
    photos: ['/review1.jpg'],
    isVerified: true,
    helpful: 12
  },
  {
    id: '2',
    customerName: 'Mike R.',
    rating: 5,
    date: '2024-01-10',
    title: 'Fresh and delicious',
    content: 'Everything was fresh and tasted amazing. The croissants were perfect!',
    photos: [],
    isVerified: true,
    helpful: 8
  }
];

// Mock events data
const upcomingEvents = [
  {
    id: '1',
    name: 'Sourdough Workshop',
    date: '2024-01-20',
    time: '2:00 PM - 4:00 PM',
    type: 'Workshop',
    spots: 12,
    available: 8
  },
  {
    id: '2',
    name: 'Artisan Market',
    date: '2024-01-25',
    time: '10:00 AM - 6:00 PM',
    type: 'Market',
    spots: 50,
    available: 35
  }
];

const DemoStorefrontPage: React.FC = () => {
  const [storeData, setStoreData] = useState(defaultStoreData);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showVacationOverlay, setShowVacationOverlay] = useState(storeData.isOnVacation);
  const [zipCode, setZipCode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Load saved store data from localStorage
  useEffect(() => {
    const savedSections = localStorage.getItem('storefront-sections');
    const savedSettings = localStorage.getItem('storefront-settings');
    
    if (savedSections && savedSettings) {
      try {
        const sections = JSON.parse(savedSections);
        const settings = JSON.parse(savedSettings);
        
        setStoreData({
          ...storeData,
          sections: sections,
          siteName: settings.siteName || storeData.siteName,
          tagline: settings.tagline || storeData.tagline,
          primaryColor: settings.primaryColor || storeData.primaryColor,
          secondaryColor: settings.secondaryColor || storeData.secondaryColor
        });
      } catch (error) {
        console.error('Error loading saved store data:', error);
      }
    }
  }, []);

  const addToCart = (product: any) => {
    setCart([...cart, { ...product, quantity: 1 }]);
    setShowQuickAddModal(false);
  };

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      if (max && product.price > max) return false;
      if (min && product.price < min) return false;
    }
    if (selectedTags.length > 0 && !selectedTags.some(tag => product.tags.includes(tag))) return false;
    return true;
  });

  const allTags = Array.from(new Set(products.flatMap(p => p.tags)));

  if (showVacationOverlay) {
    return (
      <div className="min-h-screen bg-white">
        {/* Vacation Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">On Vacation</h2>
            <p className="text-gray-600 mb-4">
              {storeData.siteName} is currently on vacation and will return on{' '}
              {new Date(storeData.vacationReturnDate).toLocaleDateString()}
            </p>
            <div className="space-y-3">
              <button 
                onClick={toggleFollow}
                className={`w-full px-4 py-2 rounded-lg transition-colors ${
                  isFollowing 
                    ? 'bg-gray-100 text-gray-700' 
                    : 'bg-[#5B6E02] hover:bg-[#4A5A01] text-white'
                }`}
              >
                <Heart className={`w-4 h-4 inline mr-2 ${isFollowing ? 'fill-current text-red-500' : ''}`} />
                {isFollowing ? 'Following' : 'Follow for Updates'}
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-[#5B6E02] rounded-full flex items-center justify-center text-white font-bold">
                {storeData.siteName.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: storeData.primaryColor }}>
                  {storeData.siteName}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>{storeData.city}, {storeData.state}</span>
                  {storeData.isVerified && (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleFollow}
                className={`p-2 transition-colors rounded-lg ${
                  isFollowing 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-600 hover:text-[#5B6E02]'
                }`} 
                aria-label="Add to favorites"
              >
                <Heart className={`w-5 h-5 ${isFollowing ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={() => setShowQuickAddModal(true)}
                className="p-2 text-gray-600 hover:text-[#5B6E02] transition-colors relative" 
                aria-label="View shopping cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              <Link href="/dashboard">
                <button className="bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Vendor Highlights */}
      <div className="bg-gradient-to-r from-[#5B6E02] to-[#8B4513] text-white py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Top Seller</span>
            </div>
            <div className="flex items-center space-x-2">
              <Leaf className="w-4 h-4" />
              <span>Carbon Neutral Packaging</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Response time: {storeData.responseTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#F7F2EC] to-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#2C2C2C] mb-4">
                {storeData.siteName}
              </h1>
              <p className="text-xl text-gray-600 mb-4">{storeData.tagline}</p>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-gray-600">(127 reviews)</span>
                </div>
                {storeData.isVerified && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Verified</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={toggleFollow}
                  className={`px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl ${
                    isFollowing 
                      ? 'bg-gray-100 text-gray-700 border border-gray-300' 
                      : 'bg-[#5B6E02] hover:bg-[#4A5A01] text-white'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow Store'}
                </button>
                <button 
                  onClick={() => setShowMessageModal(true)}
                  className="border border-[#5B6E02] text-[#5B6E02] hover:bg-[#5B6E02] hover:text-white px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Message Vendor
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-64 rounded-lg shadow-lg border border-gray-200 relative overflow-hidden">
                <CoverageMap 
                  coverageZips={storeData.coverageZips}
                  city={storeData.city}
                  state={storeData.state}
                  upcomingEvents={upcomingEvents}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#F7F2EC] rounded-xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="font-medium">Filters:</span>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none shadow-sm"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="Bread">Bread</option>
              <option value="Pastries">Pastries</option>
            </select>

            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none shadow-sm"
              aria-label="Filter by price range"
            >
              <option value="all">All Prices</option>
              <option value="0-5">Under $5</option>
              <option value="5-10">$5 - $10</option>
              <option value="10-20">$10 - $20</option>
            </select>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="ZIP Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none w-24 shadow-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTags(prev => 
                    prev.includes(tag) 
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  )}
                  className={`px-3 py-1 rounded-full text-sm transition-colors shadow-sm ${
                    selectedTags.includes(tag)
                      ? 'bg-[#5B6E02] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-6">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-[#F7F2EC] rounded-xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200"></div>
                  {product.stockLevel === 'Low Stock' && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs shadow-md">
                      Low Stock
                    </div>
                  )}
                  {product.stockLevel === 'Back Soon' && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs shadow-md">
                      Back Soon
                    </div>
                  )}
                  {product.isVerified && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-md">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-[#2C2C2C] flex-1 mr-4">{product.name}</h3>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold" style={{ color: storeData.primaryColor }}>
                        ${product.price}
                      </div>
                      {product.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          ${product.originalPrice}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  
                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-gray-500">({product.reviewCount})</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 flex-1">
                      Pickup: {product.pickupDays.join(', ')}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowQuickAddModal(true);
                      }}
                      className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg flex-shrink-0 ml-4"
                      disabled={product.availability === 'Back Soon'}
                    >
                      {product.availability === 'Back Soon' ? 'Notify Me' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fulfillment Info */}
        <div className="bg-[#F7F2EC] rounded-xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-4">Fulfillment & Pickup</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-[#5B6E02]" />
              <div>
                <div className="font-medium">Next Pickup</div>
                <div className="text-sm text-gray-600">Wednesday, Jan 17 • 2:00 PM</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-[#5B6E02]" />
              <div>
                <div className="font-medium">Pickup Location</div>
                <div className="text-sm text-gray-600">123 Artisan Way, Atlanta</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Truck className="w-6 h-6 text-[#5B6E02]" />
              <div>
                <div className="font-medium">Delivery</div>
                <div className="text-sm text-gray-600">Available in {storeData.coverageZips.length} ZIP codes • $5.99</div>
              </div>
            </div>
          </div>
          
          {/* Upcoming Events */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-[#2C2C2C] mb-3">Upcoming Events This Week</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-[#2C2C2C]">{event.name}</h5>
                      <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()} • {event.time}</p>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{event.type}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{event.available} spots left</div>
                      <button className="bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-3 py-1 rounded text-sm shadow-sm">
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vendor Story */}
        <div className="bg-[#F7F2EC] rounded-xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-4">Our Story</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                We started as a small family bakery with a passion for creating authentic, delicious bread using traditional methods and modern techniques. Our sourdough starter has been lovingly maintained for over 15 years, creating the perfect foundation for our artisanal breads.
              </p>
              <div className="space-y-3">
                <h4 className="font-semibold text-[#2C2C2C]">Sustainability Commitments:</h4>
                <div className="flex flex-wrap gap-2">
                  {storeData.sustainabilityCommitments.map(commitment => (
                    <span key={commitment} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {commitment}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-[#2C2C2C]">Our Values:</h4>
              <div className="space-y-2">
                {storeData.values.map(value => (
                  <div key={value} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-[#F7F2EC] rounded-xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#2C2C2C]">Customer Reviews</h3>
            <button className="text-[#5B6E02] hover:text-[#4A5A01] font-medium">
              View All Reviews
            </button>
          </div>
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{review.customerName}</span>
                    {review.isVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <h4 className="font-semibold text-[#2C2C2C] mb-1">{review.title}</h4>
                <p className="text-gray-700 text-sm mb-2">{review.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(review.date).toLocaleDateString()}</span>
                  <button className="flex items-center space-x-1 hover:text-[#5B6E02]">
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful ({review.helpful})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust & Safety */}
        <div className="bg-[#F7F2EC] rounded-xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-4">Trust & Safety</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-green-500" />
              <div>
                <div className="font-medium">Secure Checkout</div>
                <div className="text-sm text-gray-600">SSL encrypted payments</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <div className="font-medium">Verified Vendor</div>
                <div className="text-sm text-gray-600">Identity confirmed</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Package className="w-6 h-6 text-green-500" />
              <div>
                <div className="font-medium">Return Policy</div>
                <div className="text-sm text-gray-600">7-day satisfaction guarantee</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Social Links */}
        <div className="bg-[#F7F2EC] rounded-xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-4">Contact & Follow Us</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div>
              <h4 className="font-semibold text-[#2C2C2C] mb-3">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#5B6E02]" />
                  <span className="text-gray-700">{storeData.contactInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#5B6E02]" />
                  <span className="text-gray-700">{storeData.contactInfo.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-[#5B6E02]" />
                  <a href={storeData.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-[#5B6E02] hover:underline flex items-center gap-1">
                    {storeData.contactInfo.website.replace('https://', '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-[#5B6E02]" />
                  <span className="text-gray-700">{storeData.contactInfo.address}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="font-medium text-[#2C2C2C] mb-2">Business Hours</h5>
                <div className="space-y-1 text-sm text-gray-600">
                  {Object.entries(storeData.contactInfo.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span>{day}</span>
                      <span>{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Social Links */}
            <div>
              <h4 className="font-semibold text-[#2C2C2C] mb-3">Follow Us</h4>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="p-3 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors shadow-md hover:shadow-lg">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors shadow-md hover:shadow-lg">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors shadow-md hover:shadow-lg">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors shadow-md hover:shadow-lg">
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-[#2C2C2C] mb-2">Service Coverage</h5>
                <p className="text-sm text-gray-600 mb-2">
                  We deliver to {storeData.coverageZips.length} ZIP codes in the Atlanta metro area.
                </p>
                <div className="text-xs text-gray-500">
                  Enter your ZIP code above to check if we deliver to your area.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Quick Add Modal */}
      {showQuickAddModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add to Cart</h3>
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div>
                  <h4 className="font-medium">{selectedProduct.name}</h4>
                  <p className="text-lg font-bold" style={{ color: storeData.primaryColor }}>
                    ${selectedProduct.price}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center space-x-2">
                  <button className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center" aria-label="Decrease quantity">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center">1</span>
                  <button className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center" aria-label="Increase quantity">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => addToCart(selectedProduct)}
                  className="flex-1 bg-[#8B4513] hover:bg-[#A0522D] text-white py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => setShowQuickAddModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Vendor Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Message Vendor</h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Email *</label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Phone</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  placeholder="What's this about?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  rows={4}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 bg-[#5B6E02] hover:bg-[#4A5A01] text-white py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Send Message
                </button>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#2C2C2C] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2024 {storeData.siteName}. All rights reserved.</p>
            <p className="text-gray-400 mt-2">{storeData.tagline}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Coverage Map Component
const CoverageMap: React.FC<{
  coverageZips: string[];
  city: string;
  state: string;
  upcomingEvents: any[];
}> = ({ coverageZips, city, state, upcomingEvents }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coverageCenter, setCoverageCenter] = useState<[number, number]>([33.7490, -84.3880]); // Atlanta default
  const [zipCoordinates, setZipCoordinates] = useState<Map<string, [number, number]>>(new Map());
  const [vendorLocation, setVendorLocation] = useState<[number, number] | null>(null);

  const OPENCAGE_API_KEY = '34637b52b6e943038881f8617378aace';

  // Geocode vendor address
  useEffect(() => {
    const geocodeVendorAddress = async () => {
      try {
        console.log('Geocoding vendor address...');
        const address = `123 Artisan Way, ${city}, ${state}`;
        console.log('Address:', address);
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${OPENCAGE_API_KEY}&limit=1`
        );
        const data = await response.json();
        console.log('Geocoding response:', data);
        
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry;
          console.log('Vendor coordinates:', lat, lng);
          setVendorLocation([lat, lng]);
          setCoverageCenter([lat, lng]);
        } else {
          console.log('No geocoding results found');
        }
      } catch (error) {
        console.error('Error geocoding vendor address:', error);
      }
    };

    geocodeVendorAddress();
  }, [city, state]);

  // Geocode ZIP codes
  useEffect(() => {
    const geocodeZips = async () => {
      const coordinates = new Map<string, [number, number]>();
      
      // Only geocode first 10 ZIP codes to avoid API rate limits
      const zipsToGeocode = coverageZips.slice(0, 10);
      
      for (const zip of zipsToGeocode) {
        try {
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${zip}&key=${OPENCAGE_API_KEY}&limit=1`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry;
            coordinates.set(zip, [lat, lng]);
          }
        } catch (error) {
          console.error(`Error geocoding ZIP ${zip}:`, error);
        }
        
        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setZipCoordinates(coordinates);
    };

    if (vendorLocation) {
      geocodeZips();
    }
  }, [coverageZips, vendorLocation]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || !vendorLocation) {
      console.log('Map initialization conditions:', {
        hasMapRef: !!mapRef.current,
        hasMapInstance: !!mapInstanceRef.current,
        hasVendorLocation: !!vendorLocation
      });
      return;
    }

    console.log('Initializing map with vendor location:', vendorLocation);
    
    // Initialize map
    const map = L.map(mapRef.current, {
      center: vendorLocation,
      zoom: 10,
      zoomControl: false,
      attributionControl: false
    });

    console.log('Map instance created');

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    console.log('Tiles added to map');

    // Add custom zoom controls
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Create coverage area visualization
    createCoverageAreas(map, coverageZips);
    
    // Add event markers
    addEventMarkers(map, upcomingEvents);

    mapInstanceRef.current = map;
    setIsLoading(false);
    console.log('Map setup complete');

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coverageZips, upcomingEvents, vendorLocation]);

  const createCoverageAreas = (map: L.Map, zips: string[]) => {
    if (!vendorLocation) return;

    // Create a coverage circle around the vendor location
    const coverageRadius = 25; // miles
    const coverageCircle = L.circle(vendorLocation, {
      radius: coverageRadius * 1609.34, // Convert miles to meters
      color: '#5B6E02',
      fillColor: '#5B6E02',
      fillOpacity: 0.1,
      weight: 2
    }).addTo(map);

    // Add vendor location marker
    const vendorIcon = L.divIcon({
      className: 'vendor-marker',
      html: `<div style="width: 32px; height: 32px; background-color: #5B6E02; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                 <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
               </svg>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    const vendorMarker = L.marker(vendorLocation, { icon: vendorIcon }).addTo(map);
    vendorMarker.bindTooltip(`
      <div class="text-sm">
        <div class="font-medium">${city}, ${state}</div>
        <div class="text-gray-600">Vendor Location</div>
      </div>
    `, { permanent: false });

    // Add ZIP code markers at their actual coordinates
    zipCoordinates.forEach((coords, zip) => {
      const marker = L.circleMarker(coords, {
        radius: 4,
        fillColor: '#8B4513',
        color: '#5B6E02',
        weight: 2,
        fillOpacity: 0.8
      }).addTo(map);

      marker.bindTooltip(`ZIP ${zip}`, { permanent: false });
    });

    // Add coverage info overlay
    const coverageInfo = L.control({ position: 'bottomleft' });
    coverageInfo.onAdd = () => {
      const div = L.DomUtil.create('div', 'coverage-info');
      div.innerHTML = `
        <div class="bg-white rounded-lg p-3 shadow-lg border border-gray-200 text-xs">
          <div class="font-medium text-gray-900">${zips.length} ZIP codes</div>
          <div class="text-gray-600">${city}, ${state} Metro Area</div>
          <div class="text-xs text-gray-500 mt-1">25-mile delivery radius</div>
        </div>
      `;
      return div;
    };
    coverageInfo.addTo(map);
  };

  const addEventMarkers = (map: L.Map, events: any[]) => {
    if (!vendorLocation) return;

    events.forEach((event, index) => {
      // Position events around the vendor location
      const angle = (index / events.length) * 2 * Math.PI;
      const radius = 15 + Math.random() * 10; // 15-25 miles from vendor
      const lat = vendorLocation[0] + (radius * Math.cos(angle)) / 69;
      const lng = vendorLocation[1] + (radius * Math.sin(angle)) / (69 * Math.cos(vendorLocation[0] * Math.PI / 180));

      const eventIcon = L.divIcon({
        className: 'event-marker',
        html: `<div style="width: 24px; height: 24px; background-color: #3B82F6; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                   <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                 </svg>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: eventIcon }).addTo(map);
      marker.bindTooltip(`
        <div class="text-sm">
          <div class="font-medium">${event.name}</div>
          <div class="text-gray-600">${event.date} • ${event.time}</div>
          <div class="text-xs text-blue-600">${event.available} spots left</div>
        </div>
      `, { permanent: false });
    });
  };

  if (isLoading || !vendorLocation) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#5B6E02] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Globe className="w-6 h-6 text-[#5B6E02]" />
          </div>
          <div className="text-sm font-medium text-[#5B6E02]">
            {!vendorLocation ? 'Geocoding Address...' : 'Loading Map...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Legend */}
      <div className="absolute top-2 right-2 bg-white rounded-lg p-2 shadow-lg border border-gray-200 text-xs">
        <div className="text-gray-600 mb-1">Coverage</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[#5B6E02] rounded-full border-2 border-white shadow-md"></div>
            <span className="text-gray-700">Vendor</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#5B6E02] rounded-full opacity-60"></div>
            <span className="text-gray-700">Service Area</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#8B4513] rounded-full"></div>
            <span className="text-gray-700">ZIP Codes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Events</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoStorefrontPage;
