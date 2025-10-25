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
  ExternalLink,
  Settings

} from 'lucide-react';

import SimpleSiteEditor from '../../components/vendor/SimpleSiteEditor';

// Default store data
const defaultStoreData = {
  siteName: 'Artisan Bakes Atlanta',
  tagline: 'Handcrafted with Love',
  primaryColor: '#5B6E02',
  secondaryColor: '#8B4513',
  fontColor: '#2C2C2C',
  buttonColor: '#8B4513',
  linkColor: '#5B6E02',
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
  socialMedia: {
    instagram: 'https://instagram.com/artisanbakesatlanta',
    facebook: 'https://facebook.com/artisanbakesatlanta',
    twitter: 'https://twitter.com/artisanbakesatl',
    youtube: 'https://youtube.com/@artisanbakesatlanta',
    tiktok: 'https://tiktok.com/@artisanbakesatlanta'
  },
  coverageZips: ['30248', '30301', '30302', '30303', '30304', '30305', '30306', '30307', '30308', '30309', '30310', '30311', '30312', '30313', '30314', '30315', '30316', '30317', '30318', '30319', '30320', '30321', '30322', '30324', '30325', '30326', '30327', '30328', '30329', '30330', '30331', '30332', '30333', '30334', '30336', '30337', '30338', '30339', '30340', '30341', '30342', '30343', '30344', '30345', '30346', '30347', '30348', '30349', '30350', '30353', '30354', '30355', '30356', '30357', '30358', '30359', '30360', '30361', '30362', '30363', '30364', '30365', '30366', '30367', '30368', '30369', '30370', '30371', '30372', '30373', '30374', '30375', '30376', '30377', '30378', '30379', '30380', '30381', '30382', '30383', '30384', '30385', '30386', '30387', '30388', '30389', '30390', '30391', '30392', '30393', '30394', '30395', '30396', '30397', '30398', '30399'],
  sections: [
    {
      id: '1',
      type: 'hero',
      title: 'Welcome to Artisan Bakes Atlanta',
      content: 'Handcrafted sourdough bread and artisanal pastries made with love and the finest ingredients. Every bite tells a story of tradition, passion, and community.',
      settings: {
        backgroundColor: '#F7F2EC',
        textColor: '#2C2C2C',
        padding: 'py-16',
        margin: 'mb-8'
      }
    },
    {
      id: '2',
      type: 'about',
      title: 'Our Story',
      content: 'We started as a small family bakery with a passion for creating authentic, delicious bread using traditional methods and modern techniques. Our sourdough starter has been lovingly maintained for over 15 years, creating the perfect foundation for our artisanal breads.',
      settings: {
        backgroundColor: '#FFFFFF',
        textColor: '#2C2C2C',
        padding: 'py-12',
        margin: 'mb-8'
      }
    },
    {
      id: '3',
      type: 'products',
      title: 'Featured Products',
      content: 'Discover our signature collection of handcrafted breads, pastries, and artisanal goods.',
      settings: {
        backgroundColor: '#F7F2EC',
        textColor: '#2C2C2C',
        padding: 'py-12',
        margin: 'mb-8'
      }
    },
    {
      id: '4',
      type: 'contact',
      title: 'Get in Touch',
      content: 'Ready to experience the difference that passion and tradition make? Contact us to place an order or learn more about our products.',
      settings: {
        backgroundColor: '#FFFFFF',
        textColor: '#2C2C2C',
        padding: 'py-12',
        margin: 'mb-8'
      }
    }
  ]
};

// Mock product data - Different products for each location
const products = [
  // Main Pickup Location Products
  {
    id: 'main-1',
    name: 'Classic Sourdough Loaf',
    price: 8.99,
    originalPrice: 10.99,
    image: '/product-sourdough.jpg',
    category: 'Bread',
    tags: ['Organic', 'Sourdough'],
    availability: 'In Stock',
    pickupDays: ['Mon-Fri'],
    stockLevel: 'In Stock',
    rating: 4.8,
    reviewCount: 127,
    description: 'Our signature sourdough with a perfect crust',
    isVerified: true,
    locationId: 'main',
    locationType: 'pickup'
  },
  {
    id: 'main-2',
    name: 'Butter Croissants (6-pack)',
    price: 12.99,
    originalPrice: null,
    image: '/product-croissants.jpg',
    category: 'Pastries',
    tags: ['Butter', 'French'],
    availability: 'In Stock',
    pickupDays: ['Daily'],
    stockLevel: 'In Stock',
    rating: 4.9,
    reviewCount: 89,
    description: 'Buttery, flaky French pastries',
    isVerified: true,
    locationId: 'main',
    locationType: 'pickup'
  },
  {
    id: 'main-3',
    name: 'Chocolate Chip Cookies (12-pack)',
    price: 9.99,
    originalPrice: null,
    image: '/product-cookies.jpg',
    category: 'Pastries',
    tags: ['Sweet', 'Chocolate'],
    availability: 'In Stock',
    pickupDays: ['Daily'],
    stockLevel: 'In Stock',
    rating: 4.7,
    reviewCount: 65,
    description: 'Fresh baked cookies with premium chocolate',
    isVerified: true,
    locationId: 'main',
    locationType: 'pickup'
  },

  // Midtown Pickup Location Products
  {
    id: 'midtown-1',
    name: 'Multigrain Artisan Bread',
    price: 7.99,
    originalPrice: null,
    image: '/product-multigrain.jpg',
    category: 'Bread',
    tags: ['Whole Grain', 'Organic'],
    availability: 'In Stock',
    pickupDays: ['Tue-Sat'],
    stockLevel: 'In Stock',
    rating: 4.6,
    reviewCount: 54,
    description: 'Hearty multigrain with seeds and nuts',
    isVerified: true,
    locationId: 'midtown',
    locationType: 'pickup'
  },
  {
    id: 'midtown-2',
    name: 'Almond Croissants (4-pack)',
    price: 14.99,
    originalPrice: null,
    image: '/product-almond-croissants.jpg',
    category: 'Pastries',
    tags: ['Almond', 'French'],
    availability: 'In Stock',
    pickupDays: ['Tue-Sat'],
    stockLevel: 'Low Stock',
    rating: 4.9,
    reviewCount: 43,
    description: 'Croissants filled with almond cream',
    isVerified: true,
    locationId: 'midtown',
    locationType: 'pickup'
  },
  {
    id: 'midtown-3',
    name: 'Cinnamon Rolls (4-pack)',
    price: 10.99,
    originalPrice: null,
    image: '/product-cinnamon-rolls.jpg',
    category: 'Pastries',
    tags: ['Sweet', 'Cinnamon'],
    availability: 'In Stock',
    pickupDays: ['Tue-Sat'],
    stockLevel: 'In Stock',
    rating: 4.8,
    reviewCount: 78,
    description: 'Warm, gooey rolls with cream cheese frosting',
    isVerified: true,
    locationId: 'midtown',
    locationType: 'pickup'
  },

  // Storefront 0 Products (Saturday Farmers Market)
  {
    id: 'store-0-1',
    name: 'Rustic Country Loaf',
    price: 9.99,
    originalPrice: null,
    image: '/product-country-loaf.jpg',
    category: 'Bread',
    tags: ['Organic', 'Rustic'],
    availability: 'In Stock',
    pickupDays: ['Saturday'],
    stockLevel: 'In Stock',
    rating: 4.7,
    reviewCount: 92,
    description: 'Traditional country-style bread',
    isVerified: true,
    locationId: 'storefront-0',
    locationType: 'storefront'
  },
  {
    id: 'store-0-2',
    name: 'Blueberry Muffins (6-pack)',
    price: 11.99,
    originalPrice: null,
    image: '/product-blueberry-muffins.jpg',
    category: 'Pastries',
    tags: ['Sweet', 'Blueberry'],
    availability: 'In Stock',
    pickupDays: ['Saturday'],
    stockLevel: 'In Stock',
    rating: 4.8,
    reviewCount: 61,
    description: 'Fresh blueberry muffins with streusel topping',
    isVerified: true,
    locationId: 'storefront-0',
    locationType: 'storefront'
  },
  {
    id: 'store-0-3',
    name: 'Focaccia Bread',
    price: 8.99,
    originalPrice: null,
    image: '/product-focaccia.jpg',
    category: 'Bread',
    tags: ['Italian', 'Herb'],
    availability: 'In Stock',
    pickupDays: ['Saturday'],
    stockLevel: 'In Stock',
    rating: 4.6,
    reviewCount: 47,
    description: 'Italian flatbread with rosemary and olive oil',
    isVerified: true,
    locationId: 'storefront-0',
    locationType: 'storefront'
  },

  // Storefront 1 Products (Sunday Afternoon Market)
  {
    id: 'store-1-1',
    name: 'Baguette (French Bread)',
    price: 5.99,
    originalPrice: null,
    image: '/product-baguette.jpg',
    category: 'Bread',
    tags: ['French', 'Classic'],
    availability: 'In Stock',
    pickupDays: ['Sunday'],
    stockLevel: 'In Stock',
    rating: 4.9,
    reviewCount: 112,
    description: 'Classic French baguette with crispy crust',
    isVerified: true,
    locationId: 'storefront-1',
    locationType: 'storefront'
  },
  {
    id: 'store-1-2',
    name: 'Pain au Chocolat (4-pack)',
    price: 13.99,
    originalPrice: null,
    image: '/product-pain-au-chocolat.jpg',
    category: 'Pastries',
    tags: ['Chocolate', 'French'],
    availability: 'In Stock',
    pickupDays: ['Sunday'],
    stockLevel: 'In Stock',
    rating: 4.9,
    reviewCount: 87,
    description: 'Chocolate-filled pastries',
    isVerified: true,
    locationId: 'storefront-1',
    locationType: 'storefront'
  },

  // Event 0 Products
  {
    id: 'event-0-1',
    name: 'Pretzel Rolls (6-pack)',
    price: 8.99,
    originalPrice: null,
    image: '/product-pretzel-rolls.jpg',
    category: 'Bread',
    tags: ['Pretzel', 'Salt'],
    availability: 'In Stock',
    pickupDays: ['Event Days'],
    stockLevel: 'In Stock',
    rating: 4.7,
    reviewCount: 56,
    description: 'Soft pretzel-style dinner rolls',
    isVerified: true,
    locationId: 'event-0',
    locationType: 'event'
  },
  {
    id: 'event-0-2',
    name: 'Danish Pastries (4-pack)',
    price: 12.99,
    originalPrice: null,
    image: '/product-danish.jpg',
    category: 'Pastries',
    tags: ['Sweet', 'Fruit'],
    availability: 'In Stock',
    pickupDays: ['Event Days'],
    stockLevel: 'Low Stock',
    rating: 4.8,
    reviewCount: 72,
    description: 'Assorted fruit-filled Danish pastries',
    isVerified: true,
    locationId: 'event-0',
    locationType: 'event'
  },

  // Event 1 Products
  {
    id: 'event-1-1',
    name: 'Ciabatta Bread',
    price: 7.99,
    originalPrice: null,
    image: '/product-ciabatta.jpg',
    category: 'Bread',
    tags: ['Italian', 'Artisan'],
    availability: 'In Stock',
    pickupDays: ['Event Days'],
    stockLevel: 'In Stock',
    rating: 4.6,
    reviewCount: 49,
    description: 'Italian white bread with open crumb',
    isVerified: true,
    locationId: 'event-1',
    locationType: 'event'
  },
  {
    id: 'event-1-2',
    name: 'Lemon Poppy Seed Muffins (6-pack)',
    price: 10.99,
    originalPrice: null,
    image: '/product-lemon-muffins.jpg',
    category: 'Pastries',
    tags: ['Sweet', 'Lemon'],
    availability: 'In Stock',
    pickupDays: ['Event Days'],
    stockLevel: 'In Stock',
    rating: 4.7,
    reviewCount: 58,
    description: 'Light and zesty lemon muffins',
    isVerified: true,
    locationId: 'event-1',
    locationType: 'event'
  },

  // Event 2 Products
  {
    id: 'event-2-1',
    name: 'Rye Bread',
    price: 8.99,
    originalPrice: null,
    image: '/product-rye.jpg',
    category: 'Bread',
    tags: ['Rye', 'Seeds'],
    availability: 'In Stock',
    pickupDays: ['Event Days'],
    stockLevel: 'In Stock',
    rating: 4.5,
    reviewCount: 38,
    description: 'Traditional rye with caraway seeds',
    isVerified: true,
    locationId: 'event-2',
    locationType: 'event'
  },
  {
    id: 'event-2-2',
    name: 'Scones (4-pack)',
    price: 11.99,
    originalPrice: null,
    image: '/product-scones.jpg',
    category: 'Pastries',
    tags: ['British', 'Cream'],
    availability: 'In Stock',
    pickupDays: ['Event Days'],
    stockLevel: 'In Stock',
    rating: 4.8,
    reviewCount: 64,
    description: 'British-style scones with clotted cream',
    isVerified: true,
    locationId: 'event-2',
    locationType: 'event'
  }
];

// Order window options
const orderWindows = [
  {
    id: 'home-delivery',
    name: 'Home Delivery',
    description: 'Delivery to your door',
    address: 'Atlanta Metro Area',
    days: ['Wednesday', 'Saturday'],
    time: '2:00 PM - 8:00 PM',
    fee: '$5.99',
    status: 'Open',
    location: 'Atlanta Metro Area',
    orderBy: 'Tuesday 6:00 PM'
  },
  {
    id: 'farmers-market-sat',
    name: 'Atlanta Farmers Market - Saturday',
    description: 'Weekly farmers market',
    address: '4500 Peachtree Rd NE, Atlanta, GA 30319',
    days: ['Saturday'],
    time: '10:00 AM - 6:00 PM',
    eventUrl: 'https://atlantafarmersmarket.com',
    status: 'Open',
    location: '4500 Peachtree Rd NE, Atlanta, GA 30319',
    orderBy: 'Friday 5:00 PM'
  },
  {
    id: 'ponce-market-sun',
    name: 'Ponce City Market - Sunday',
    description: 'Artisan pop-up market',
    address: '675 Ponce de Leon Ave NE, Atlanta, GA 30308',
    days: ['Sunday'],
    time: '11:00 AM - 7:00 PM',
    eventUrl: 'https://poncecitymarket.com/events',
    status: 'Open',
    location: '675 Ponce de Leon Ave NE, Atlanta, GA 30308',
    orderBy: 'Saturday 6:00 PM'
  },
  {
    id: 'krog-market-first-sat',
    name: 'Krog Street Market - First Saturday',
    description: 'Monthly artisan market',
    address: '99 Krog St NE, Atlanta, GA 30307',
    days: ['First Saturday'],
    time: '9:00 AM - 5:00 PM',
    eventUrl: 'https://krogstreetmarket.com/artisan-market',
    status: 'Open',
    location: '99 Krog St NE, Atlanta, GA 30307',
    orderBy: 'Friday 5:00 PM'
  },
  {
    id: 'workshop-jan20',
    name: 'Sourdough Workshop - Jan 20',
    description: 'Learn sourdough bread making',
    address: '123 Artisan Way, Atlanta, GA 30301',
    days: ['Saturday'],
    time: '2:00 PM - 4:00 PM',
    eventUrl: null,
    status: 'Open',
    location: '123 Artisan Way, Atlanta, GA 30301',
    orderBy: 'Friday 5:00 PM'
  },
  {
    id: 'bread-class-feb1',
    name: 'Bread Making Class - Feb 1',
    description: 'Hands-on bread making workshop',
    address: '123 Artisan Way, Atlanta, GA 30301',
    days: ['Thursday'],
    time: '1:00 PM - 4:00 PM',
    eventUrl: null,
    status: 'Open',
    location: '123 Artisan Way, Atlanta, GA 30301',
    orderBy: 'Wednesday 5:00 PM'
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
  },
  {
    id: '3',
    customerName: 'Jennifer L.',
    rating: 4,
    date: '2024-01-08',
    title: 'Great quality bread',
    content: 'The whole wheat loaf was hearty and nutritious. Perfect for sandwiches and toast.',
    photos: [],
    isVerified: true,
    helpful: 5
  },
  {
    id: '4',
    customerName: 'David K.',
    rating: 5,
    date: '2024-01-05',
    title: 'Outstanding service',
    content: 'Not only is the bread amazing, but the delivery was prompt and the packaging was eco-friendly.',
    photos: ['/review4.jpg'],
    isVerified: true,
    helpful: 15
  },
  {
    id: '5',
    customerName: 'Lisa P.',
    rating: 4,
    date: '2024-01-03',
    title: 'Love the focaccia',
    content: 'The herb focaccia is my new favorite. Perfect texture and the herbs are so fresh!',
    photos: [],
    isVerified: false,
    helpful: 3
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
    available: 8,
    address: '123 Artisan Way, Atlanta, GA 30301',
    description: 'Learn the art of sourdough bread making from our master baker',
    eventUrl: null,
    coordinates: [33.7490, -84.3880],
    location: '123 Artisan Way, Atlanta, GA 30301'
  },
  {
    id: '2',
    name: 'Atlanta Farmers Market',
    date: '2024-01-25',
    time: '10:00 AM - 6:00 PM',
    type: 'Market',
    spots: 50,
    available: 35,
    address: '4500 Peachtree Rd NE, Atlanta, GA 30319',
    description: 'Weekly farmers market featuring local artisans and fresh produce',
    eventUrl: 'https://atlantafarmersmarket.com',
    coordinates: [33.8590, -84.3580],
    location: '4500 Peachtree Rd NE, Atlanta, GA 30319'
  },
  {
    id: '3',
    name: 'Ponce City Market Pop-up',
    date: '2024-01-28',
    time: '11:00 AM - 7:00 PM',
    type: 'Market',
    spots: 30,
    available: 22,
    address: '675 Ponce de Leon Ave NE, Atlanta, GA 30308',
    description: 'Artisan pop-up market in the heart of Ponce City Market',
    eventUrl: 'https://poncecitymarket.com/events',
    coordinates: [33.7690, -84.3590],
    location: '675 Ponce de Leon Ave NE, Atlanta, GA 30308'
  },
  {
    id: '4',
    name: 'Bread Making Class',
    date: '2024-02-01',
    time: '1:00 PM - 4:00 PM',
    type: 'Workshop',
    spots: 15,
    available: 12,
    address: '123 Artisan Way, Atlanta, GA 30301',
    description: 'Hands-on bread making workshop for beginners',
    eventUrl: null,
    coordinates: [33.7490, -84.3880],
    location: '123 Artisan Way, Atlanta, GA 30301'
  },
  {
    id: '5',
    name: 'Krog Street Market',
    date: '2024-02-03',
    time: '9:00 AM - 5:00 PM',
    type: 'Market',
    spots: 40,
    available: 28,
    address: '99 Krog St NE, Atlanta, GA 30307',
    description: 'Monthly artisan market at Krog Street Market',
    eventUrl: 'https://krogstreetmarket.com/artisan-market',
    coordinates: [33.7590, -84.3590],
    location: '99 Krog St NE, Atlanta, GA 30307'
  }
];

const DemoStorefrontPage: React.FC = () => {
  const [storeData, setStoreData] = useState(defaultStoreData);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showVacationOverlay, setShowVacationOverlay] = useState(storeData.isOnVacation);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSiteEditor, setShowSiteEditor] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{type: 'pickup' | 'storefront' | 'event', id: string, name: string} | null>(null);
  const [siteSettings, setSiteSettings] = useState({
    siteName: storeData.siteName,
    tagline: storeData.tagline,
    ourStory: 'We started as a small family bakery with a passion for creating authentic, delicious bread using traditional methods and modern techniques. Our sourdough starter has been lovingly maintained for over 15 years, creating the perfect foundation for our artisanal breads.',
    values: storeData.values,
    sustainabilityCommitments: storeData.sustainabilityCommitments,
    awards: ['Best Bakery 2024 - Atlanta Magazine', 'Gold Medal - National Bread Competition', 'Top 10 Artisan Bakers in Georgia'],
    charities: ['Atlanta Community Food Bank', 'Local Schools Breakfast Program', 'Sustainable Farming Initiative'],
    trustAndSafety: {
      secureCheckout: 'SSL encrypted payments',
      verifiedVendor: 'Identity confirmed',
      returnPolicy: '7-day satisfaction guarantee'
    },
    pageBackgroundColor: '#FFFFFF',
    boxBackgroundColor: '#F7F2EC',
    fontColor: '#2C2C2C',
    buttonColor: '#8B4513',
    linkColor: '#5B6E02',
    logo: '',
    backgroundImage: '',
    // New fields for contact and business info
    contactInfo: {
      phone: storeData.contactInfo.phone,
      email: storeData.contactInfo.email,
      website: storeData.contactInfo.website,
      address: storeData.contactInfo.address,
    },
    businessHours: {
      'Monday - Friday': storeData.contactInfo.businessHours['Monday - Friday'],
      'Saturday': storeData.contactInfo.businessHours['Saturday'],
      'Sunday': storeData.contactInfo.businessHours['Sunday'],
    },
    socialMedia: {
      instagram: storeData.socialMedia.instagram,
      facebook: storeData.socialMedia.facebook,
      twitter: storeData.socialMedia.twitter,
      youtube: storeData.socialMedia.youtube,
      tiktok: storeData.socialMedia.tiktok,
    },
  });




  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('artisan-bakes-atlanta-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        
        // Merge loaded settings with current siteSettings to ensure complete structure
        const mergedSettings = {
          ...siteSettings, // Start with current complete structure
          ...settings, // Override with loaded settings
          // Ensure nested objects are properly merged
          contactInfo: {
            ...siteSettings.contactInfo,
            ...settings.contactInfo,
          },
          businessHours: {
            ...siteSettings.businessHours,
            ...settings.businessHours,
          },
          socialMedia: {
            ...siteSettings.socialMedia,
            ...settings.socialMedia,
          },
        };
        
        setSiteSettings(mergedSettings);
        
        // Update store data with saved settings
        setStoreData(prev => ({
          ...prev,
          siteName: settings.siteName || prev.siteName,
          tagline: settings.tagline || prev.tagline,
          primaryColor: settings.buttonColor || prev.primaryColor,
          secondaryColor: settings.linkColor || prev.secondaryColor,
          fontColor: settings.fontColor || prev.fontColor,
          buttonColor: settings.buttonColor || prev.buttonColor,
          linkColor: settings.linkColor || prev.linkColor,
          // Update contact info if available
          contactInfo: {
            ...prev.contactInfo,
            phone: settings.contactInfo?.phone || prev.contactInfo.phone,
            email: settings.contactInfo?.email || prev.contactInfo.email,
            website: settings.contactInfo?.website || prev.contactInfo.website,
            address: settings.contactInfo?.address || prev.contactInfo.address,
            businessHours: {
              'Monday - Friday': settings.businessHours?.['Monday - Friday'] || prev.contactInfo.businessHours['Monday - Friday'],
              'Saturday': settings.businessHours?.Saturday || prev.contactInfo.businessHours['Saturday'],
              'Sunday': settings.businessHours?.Sunday || prev.contactInfo.businessHours['Sunday'],
            }
          },
          // Update social media if available
          socialMedia: {
            ...prev.socialMedia,
            instagram: settings.socialMedia?.instagram || prev.socialMedia.instagram,
            facebook: settings.socialMedia?.facebook || prev.socialMedia.facebook,
            twitter: settings.socialMedia?.twitter || prev.socialMedia.twitter,
            youtube: settings.socialMedia?.youtube || prev.socialMedia.youtube,
            tiktok: settings.socialMedia?.tiktok || prev.socialMedia.tiktok,
          }
        }));
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  const handleSaveSiteSettings = (settings: any) => {
    setSiteSettings(settings);
    
    // Save to localStorage
    localStorage.setItem('artisan-bakes-atlanta-settings', JSON.stringify(settings));
    
    // Update store data with new settings
    setStoreData(prev => ({
      ...prev,
      siteName: settings.siteName,
      tagline: settings.tagline,
      primaryColor: settings.buttonColor,
      secondaryColor: settings.linkColor,
      fontColor: settings.fontColor,
      buttonColor: settings.buttonColor,
      linkColor: settings.linkColor,
      // Update contact info
      contactInfo: {
        ...prev.contactInfo,
        phone: settings.contactInfo.phone,
        email: settings.contactInfo.email,
        website: settings.contactInfo.website,
        address: settings.contactInfo.address,
        businessHours: {
          'Monday - Friday': settings.businessHours['Monday - Friday'],
          'Saturday': settings.businessHours['Saturday'],
          'Sunday': settings.businessHours['Sunday'],
        }
      },
      // Update social media
      socialMedia: {
        ...prev.socialMedia,
        instagram: settings.socialMedia.instagram,
        facebook: settings.socialMedia.facebook,
        twitter: settings.socialMedia.twitter,
        youtube: settings.socialMedia.youtube,
        tiktok: settings.socialMedia.tiktok,
      }
    }));
  };

  const addToCart = (product: any) => {
    setCart([...cart, { ...product, quantity: quantity }]);
    setShowQuickAddModal(false);
    setQuantity(1); // Reset quantity for next use
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const filteredProducts = products.filter(product => {
    // Filter by selected location (pickup, storefront, or event)
    if (!selectedLocation) return false;
    
    // Match products to selected location
    if (product.locationId !== selectedLocation.id || product.locationType !== selectedLocation.type) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    
    // Filter by price range
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      if (max && product.price > max) return false;
      if (min && product.price < min) return false;
    }
    
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
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
                         <div className="flex items-center space-x-4">
               <div 
                 className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                 style={{ backgroundColor: storeData.primaryColor }}
               >
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
                onClick={() => setShowCartModal(true)}
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

              <button 
                onClick={() => setShowSiteEditor(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Settings className="w-4 h-4" />
                Edit Site
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

      

      {/* Main Content */}
      <main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        style={{ backgroundColor: siteSettings.pageBackgroundColor }}
      >
                 {/* Hero Section */}
         <div 
           className="rounded-2xl mb-8 shadow-xl overflow-hidden"
           style={{ 
             background: `linear-gradient(to right, ${siteSettings.boxBackgroundColor}, white)` 
           }}
         >
           {/* Banner Image */}
           <div className="w-full h-48 relative">
             {siteSettings.backgroundImage ? (
               <img 
                 src={siteSettings.backgroundImage} 
                 alt="Store banner" 
                 className="w-full h-full object-cover"
               />
                           ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(to right, ${storeData.primaryColor}, ${storeData.secondaryColor})`
                  }}
                >
                  <div className="text-center text-white">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Banner Image Placeholder</p>
                    <p className="text-xs opacity-50">Vendors can upload their banner here</p>
                  </div>
                </div>
              )}
           </div>
           
                       {/* Vendor Info Overlay */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div>
                  {/* Logo and Slogan Section */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-[#5B6E02] overflow-hidden">
                      {siteSettings.logo ? (
                        <img 
                          src={siteSettings.logo} 
                          alt="Store logo" 
                          className="w-full h-full object-cover"
                        />
                                             ) : (
                         <div className="text-center">
                           <div 
                             className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center"
                             style={{ backgroundColor: storeData.primaryColor }}
                           >
                             <span className="text-white text-xs font-bold">AB</span>
                           </div>
                           <div className="text-xs text-gray-500">Logo</div>
                         </div>
                       )}
                    </div>
                    <div className="flex-1">
                                             <h1 className="text-4xl font-bold mb-2" style={{ color: siteSettings.fontColor }}>
                         {siteSettings.siteName}
                       </h1>
                      <p className="text-lg text-gray-600 italic">"{siteSettings.tagline}"</p>
                    </div>
                  </div>
                 <div className="flex items-center space-x-4 mb-6">
                                     <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold" style={{ color: siteSettings.fontColor }}>4.8</span>
                    <span style={{ color: siteSettings.fontColor }}>(127 reviews)</span>
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
                         : 'text-white'
                     }`}
                     style={{
                       backgroundColor: isFollowing ? undefined : siteSettings.buttonColor
                     }}
                   >
                     {isFollowing ? 'Following' : 'Follow Store'}
                   </button>
                   <button 
                     onClick={() => setShowMessageModal(true)}
                     className="px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                     style={{
                       borderColor: siteSettings.linkColor,
                       color: siteSettings.linkColor
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.backgroundColor = siteSettings.linkColor;
                       e.currentTarget.style.color = 'white';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.backgroundColor = 'transparent';
                       e.currentTarget.style.color = siteSettings.linkColor;
                     }}
                   >
                     Message Vendor
                   </button>
                 </div>
               </div>
               
               {/* Vendor Badges */}
               <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                 <h3 className="text-lg font-semibold mb-4" style={{ color: siteSettings.fontColor }}>Vendor Highlights</h3>
                 <div className="space-y-4">
                   <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                       <Award className="w-5 h-5 text-yellow-600" />
                     </div>
                     <div>
                       <div className="font-medium" style={{ color: siteSettings.fontColor }}>Top Seller</div>
                       <div className="text-sm" style={{ color: siteSettings.fontColor }}>Consistently high ratings</div>
                     </div>
                   </div>
                   <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                       <Leaf className="w-5 h-5 text-green-600" />
                     </div>
                     <div>
                       <div className="font-medium" style={{ color: siteSettings.fontColor }}>Carbon Neutral Packaging</div>
                       <div className="text-sm" style={{ color: siteSettings.fontColor }}>Eco-friendly materials</div>
                     </div>
                   </div>
                   <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                       <Clock className="w-5 h-5 text-blue-600" />
                     </div>
                     <div>
                       <div className="font-medium" style={{ color: siteSettings.fontColor }}>Response time: {storeData.responseTime}</div>
                       <div className="text-sm" style={{ color: siteSettings.fontColor }}>Quick customer service</div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
         
                  {/* Where to Find Us - Three Box Layout */}
         <div className="mb-8">
           <div className="flex items-start justify-between mb-6">
             <div>
               <h2 className="text-2xl font-bold" style={{ color: siteSettings.fontColor }}>
                 Where to Find Us
               </h2>
               <p className="text-sm mt-2" style={{ color: siteSettings.fontColor, opacity: 0.7 }}>
                 Click on any location below to view products available at that sales window
               </p>
             </div>
             {selectedLocation && (
               <button
                 onClick={() => setSelectedLocation(null)}
                 className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                 style={{ color: siteSettings.fontColor }}
               >
                 Clear Selection
               </button>
             )}
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Pickup Locations */}
             <div 
               className="rounded-2xl p-6 shadow-xl border border-gray-200"
               style={{ backgroundColor: siteSettings.boxBackgroundColor }}
             >
               <div className="flex items-center gap-2 mb-4">
                 <MapPin className="w-6 h-6" style={{ color: siteSettings.linkColor }} />
                 <h3 className="text-xl font-bold" style={{ color: siteSettings.fontColor }}>
                   Pickup Locations
                 </h3>
               </div>
               <p className="text-sm mb-4" style={{ color: siteSettings.fontColor, opacity: 0.8 }}>
                 Order online and pick up at these locations
               </p>
               
               <div className="space-y-3">
                 <button
                   onClick={() => setSelectedLocation({type: 'pickup', id: 'main', name: 'Main Location'})}
                   className={`w-full text-left bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
                     selectedLocation?.type === 'pickup' && selectedLocation?.id === 'main' 
                       ? 'ring-2 ring-offset-2' 
                       : ''
                   }`}
                  style={{
                    borderColor: selectedLocation?.type === 'pickup' && selectedLocation?.id === 'main' 
                      ? siteSettings.linkColor 
                      : undefined
                  }}
                 >
                   <h4 className="font-semibold mb-1" style={{ color: siteSettings.fontColor }}>
                     Main Location
                   </h4>
                   <p className="text-sm mb-2" style={{ color: siteSettings.fontColor, opacity: 0.7 }}>
                     123 Artisan Way, Atlanta, GA 30301
                   </p>
                   <div className="text-xs space-y-1" style={{ color: siteSettings.fontColor, opacity: 0.6 }}>
                     <div>Mon-Fri: 7AM - 6PM</div>
                     <div>Sat: 8AM - 5PM</div>
                     <div>Sun: 9AM - 3PM</div>
                   </div>
                   {selectedLocation?.type === 'pickup' && selectedLocation?.id === 'main' && (
                     <div className="mt-2 text-xs font-medium" style={{ color: siteSettings.linkColor }}>
                       ✓ Showing products for this location
                     </div>
                   )}
                 </button>
                 
                 <button
                   onClick={() => setSelectedLocation({type: 'pickup', id: 'midtown', name: 'Midtown Location'})}
                   className={`w-full text-left bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
                     selectedLocation?.type === 'pickup' && selectedLocation?.id === 'midtown' 
                       ? 'ring-2 ring-offset-2' 
                       : ''
                   }`}
                   style={{
                    borderColor: selectedLocation?.type === 'pickup' && selectedLocation?.id === 'midtown' 
                      ? siteSettings.linkColor 
                      : undefined
                   }}
                 >
                   <h4 className="font-semibold mb-1" style={{ color: siteSettings.fontColor }}>
                     Midtown Location
                   </h4>
                   <p className="text-sm mb-2" style={{ color: siteSettings.fontColor, opacity: 0.7 }}>
                     456 Peachtree St, Atlanta, GA 30308
                   </p>
                   <div className="text-xs space-y-1" style={{ color: siteSettings.fontColor, opacity: 0.6 }}>
                     <div>Tue-Sat: 9AM - 5PM</div>
                     <div>Closed Sun-Mon</div>
                   </div>
                   {selectedLocation?.type === 'pickup' && selectedLocation?.id === 'midtown' && (
                     <div className="mt-2 text-xs font-medium" style={{ color: siteSettings.linkColor }}>
                       ✓ Showing products for this location
                     </div>
                   )}
                 </button>
               </div>
             </div>

             {/* Storefronts */}
             <div 
               className="rounded-2xl p-6 shadow-xl border border-gray-200"
               style={{ backgroundColor: siteSettings.boxBackgroundColor }}
             >
               <div className="flex items-center gap-2 mb-4">
                 <Package className="w-6 h-6" style={{ color: siteSettings.buttonColor }} />
                 <h3 className="text-xl font-bold" style={{ color: siteSettings.fontColor }}>
                   Storefronts
                 </h3>
               </div>
               <p className="text-sm mb-4" style={{ color: siteSettings.fontColor, opacity: 0.8 }}>
                 Find us at these retail locations
               </p>
               
               <div className="space-y-3">
                 {orderWindows.slice(0, 2).map((window, index) => (
                   <button
                     key={index}
                     onClick={() => setSelectedLocation({type: 'storefront', id: `storefront-${index}`, name: window.name})}
                     className={`w-full text-left bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
                       selectedLocation?.type === 'storefront' && selectedLocation?.id === `storefront-${index}` 
                         ? 'ring-2 ring-offset-2' 
                         : ''
                     }`}
                     style={{
                       borderColor: selectedLocation?.type === 'storefront' && selectedLocation?.id === `storefront-${index}` 
                         ? siteSettings.buttonColor 
                         : undefined
                     }}
                   >
                     <div className="flex items-start justify-between mb-2">
                       <h4 className="font-semibold" style={{ color: siteSettings.fontColor }}>
                         {window.name}
                       </h4>
                       {'status' in window && window.status && (
                         <span 
                           className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                           style={{ 
                             backgroundColor: window.status === 'Open' ? '#22c55e20' : '#ef444420',
                             color: window.status === 'Open' ? '#16a34a' : '#dc2626'
                           }}
                         >
                           {window.status}
                         </span>
                       )}
                     </div>
                     <div className="space-y-1 text-sm">
                       <div className="flex items-center gap-2" style={{ color: siteSettings.fontColor, opacity: 0.8 }}>
                         <Clock className="w-3 h-3" />
                         <span>{window.time}</span>
                       </div>
                       {'location' in window && window.location && (
                         <div className="flex items-center gap-2" style={{ color: siteSettings.fontColor, opacity: 0.8 }}>
                           <MapPin className="w-3 h-3" />
                           <span className="text-xs">{window.location}</span>
                         </div>
                       )}
                       {'orderBy' in window && window.orderBy && (
                         <div className="flex items-center gap-2 text-orange-600 font-medium text-xs">
                           <Package className="w-3 h-3" />
                           <span>Order by: {window.orderBy}</span>
                         </div>
                       )}
                     </div>
                     {selectedLocation?.type === 'storefront' && selectedLocation?.id === `storefront-${index}` && (
                       <div className="mt-2 text-xs font-medium" style={{ color: siteSettings.buttonColor }}>
                         ✓ Showing products for this location
                       </div>
                     )}
                   </button>
                 ))}
               </div>
             </div>

             {/* Markets & Vendor Events */}
             <div 
               className="rounded-2xl p-6 shadow-xl border border-gray-200"
               style={{ backgroundColor: siteSettings.boxBackgroundColor }}
             >
               <div className="flex items-center gap-2 mb-4">
                 <Calendar className="w-6 h-6" style={{ color: siteSettings.linkColor }} />
                 <h3 className="text-xl font-bold" style={{ color: siteSettings.fontColor }}>
                   Markets & Events
                 </h3>
               </div>
               <p className="text-sm mb-4" style={{ color: siteSettings.fontColor, opacity: 0.8 }}>
                 Visit us at upcoming markets and events
               </p>
               
               <div className="space-y-3">
                 {upcomingEvents.slice(0, 3).map((event, index) => (
                   <button
                     key={`event-${index}`}
                     onClick={() => setSelectedLocation({type: 'event', id: `event-${index}`, name: event.name})}
                     className={`w-full text-left bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
                       selectedLocation?.type === 'event' && selectedLocation?.id === `event-${index}` 
                         ? 'ring-2 ring-offset-2' 
                         : ''
                     }`}
                     style={{
                       borderColor: selectedLocation?.type === 'event' && selectedLocation?.id === `event-${index}` 
                         ? siteSettings.linkColor 
                         : undefined
                     }}
                   >
                     <div className="flex items-start justify-between mb-2">
                       <h4 className="font-semibold text-sm" style={{ color: siteSettings.fontColor }}>
                         {event.name}
                       </h4>
                       <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                         Event
                       </span>
                     </div>
                     <div className="space-y-1 text-xs">
                       <div className="flex items-center gap-2" style={{ color: siteSettings.fontColor, opacity: 0.8 }}>
                         <Calendar className="w-3 h-3" />
                         <span>{event.date}</span>
                       </div>
                       <div className="flex items-center gap-2" style={{ color: siteSettings.fontColor, opacity: 0.8 }}>
                         <MapPin className="w-3 h-3" />
                         <span>{'location' in event ? event.location : event.address}</span>
                       </div>
                     </div>
                     {selectedLocation?.type === 'event' && selectedLocation?.id === `event-${index}` && (
                       <div className="mt-2 text-xs font-medium" style={{ color: siteSettings.linkColor }}>
                         ✓ Showing products for this event
                       </div>
                     )}
                   </button>
                 ))}
               </div>
             </div>
           </div>
         </div>

                 {/* Filters */}
         <div 
           className="rounded-xl shadow-xl p-6 mb-8"
           style={{ backgroundColor: siteSettings.boxBackgroundColor }}
         >
           <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center space-x-2">
               <Filter className="w-4 h-4" style={{ color: siteSettings.fontColor }} />
               <span className="font-medium" style={{ color: siteSettings.fontColor }}>Filters:</span>
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
           </div>
         </div>

        {/* Products Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: siteSettings.fontColor }}>Products</h2>
            {selectedLocation && (
              <span className="text-sm px-4 py-2 rounded-lg shadow-sm" style={{ backgroundColor: siteSettings.boxBackgroundColor, color: siteSettings.fontColor }}>
                Showing products for: <span className="font-semibold">{selectedLocation.name}</span>
              </span>
            )}
          </div>

          {!selectedLocation ? (
            <div className="text-center py-16 rounded-xl shadow-xl border border-gray-200" style={{ backgroundColor: siteSettings.boxBackgroundColor }}>
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2" style={{ color: siteSettings.fontColor }}>
                Select a Location to View Products
              </h3>
              <p className="text-gray-600 mb-4">
                Choose a pickup location, storefront, or event above to see available products
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 rounded-xl shadow-xl border border-gray-200" style={{ backgroundColor: siteSettings.boxBackgroundColor }}>
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2" style={{ color: siteSettings.fontColor }}>
                No Products Match Your Filters
              </h3>
              <p className="text-gray-600">
                Try adjusting your category, price, or tag filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                             <div key={product.id} className="rounded-xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow duration-300 flex flex-col"
                    style={{ backgroundColor: siteSettings.boxBackgroundColor }}>
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
                
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold flex-1 mr-4" style={{ color: siteSettings.fontColor }}>{product.name}</h3>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold" style={{ color: siteSettings.buttonColor }}>
                        ${product.price}
                      </div>
                      {product.originalPrice && (
                        <div className="text-sm line-through" style={{ color: siteSettings.fontColor }}>
                          ${product.originalPrice}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3" style={{ color: siteSettings.fontColor }}>{product.description}</p>
                  
                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium" style={{ color: siteSettings.fontColor }}>{product.rating}</span>
                    <span className="text-sm" style={{ color: siteSettings.fontColor }}>({product.reviewCount})</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded" style={{ color: siteSettings.fontColor }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs mb-3" style={{ color: siteSettings.fontColor }}>
                    Pickup: {product.pickupDays.join(', ')}
                  </div>
                  
                  {/* Button section - always takes up the same space */}
                  <div className="mt-auto space-y-3">
                    <button
                                              onClick={() => {
                          setSelectedProduct(product);
                          setQuantity(1); // Reset quantity when opening modal
                          setShowQuickAddModal(true);
                        }}
                                             className={`w-full px-4 py-2 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg ${
                         product.availability === 'Back Soon' || product.availability === 'Out of Stock'
                           ? 'bg-gray-400 text-white cursor-not-allowed'
                           : 'text-white'
                       }`}
                       style={{
                         backgroundColor: product.availability === 'Back Soon' || product.availability === 'Out of Stock' 
                           ? '#9CA3AF' 
                           : storeData.buttonColor
                       }}
                      disabled={product.availability === 'Back Soon' || product.availability === 'Out of Stock'}
                    >
                      {product.availability === 'Back Soon' || product.availability === 'Out of Stock' 
                        ? 'Out of Stock' 
                        : 'Add to Cart'
                      }
                    </button>
                    {(product.availability === 'Back Soon' || product.availability === 'Out of Stock') && (
                      <button
                        onClick={() => {
                          // Handle notify when back in stock
                          alert(`You'll be notified when ${product.name} is back in stock!`);
                        }}
                                                 className="w-full px-4 py-2 border rounded-lg transition-colors text-sm shadow-md hover:shadow-lg hover:text-white"
                         style={{
                           borderColor: storeData.linkColor,
                           color: storeData.linkColor
                         }}
                         onMouseEnter={(e) => {
                           e.currentTarget.style.backgroundColor = storeData.linkColor;
                         }}
                         onMouseLeave={(e) => {
                           e.currentTarget.style.backgroundColor = 'transparent';
                         }}
                      >
                        Notify When Available
                      </button>
                    )}
                    {/* Invisible spacer for products without the second button */}
                    {!(product.availability === 'Back Soon' || product.availability === 'Out of Stock') && (
                      <div className="h-10"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Vendor Story */}
        <div className="rounded-xl shadow-xl p-6 mb-8"
             style={{ backgroundColor: siteSettings.boxBackgroundColor }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: siteSettings.fontColor }}>Our Story</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="leading-relaxed mb-4" style={{ color: siteSettings.fontColor }}>
                {siteSettings.ourStory || 'We started as a small family bakery with a passion for creating authentic, delicious bread using traditional methods and modern techniques. Our sourdough starter has been lovingly maintained for over 15 years, creating the perfect foundation for our artisanal breads.'}
              </p>
              <div className="space-y-3">
                <h4 className="font-semibold" style={{ color: siteSettings.fontColor }}>Sustainability Commitments:</h4>
                <div className="flex flex-wrap gap-2">
                  {(siteSettings.sustainabilityCommitments || storeData.sustainabilityCommitments).map(commitment => (
                    <span key={commitment} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {commitment}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold" style={{ color: siteSettings.fontColor }}>Our Values:</h4>
              <div className="space-y-2">
                {(siteSettings.values || storeData.values).map(value => (
                  <div key={value} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span style={{ color: siteSettings.fontColor }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Awards & Charities */}
        {((siteSettings.awards && siteSettings.awards.length > 0) || (siteSettings.charities && siteSettings.charities.length > 0)) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Awards & Achievements */}
            {siteSettings.awards && siteSettings.awards.length > 0 && (
              <div 
                className="rounded-xl shadow-xl p-6"
                style={{ backgroundColor: siteSettings.boxBackgroundColor }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-xl font-bold" style={{ color: siteSettings.fontColor }}>
                    Awards & Recognition
                  </h3>
                </div>
                <div className="space-y-3">
                  {siteSettings.awards.filter(award => award.trim()).map((award, index) => (
                    <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-yellow-600" />
                      </div>
                      <p className="text-sm flex-1" style={{ color: siteSettings.fontColor }}>{award}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supported Charities */}
            {siteSettings.charities && siteSettings.charities.length > 0 && (
              <div 
                className="rounded-xl shadow-xl p-6"
                style={{ backgroundColor: siteSettings.boxBackgroundColor }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-6 h-6 text-red-500" />
                  <h3 className="text-xl font-bold" style={{ color: siteSettings.fontColor }}>
                    Supporting Our Community
                  </h3>
                </div>
                <div className="space-y-3">
                  {siteSettings.charities.filter(charity => charity.trim()).map((charity, index) => (
                    <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="w-4 h-4 text-red-500" />
                      </div>
                      <p className="text-sm flex-1" style={{ color: siteSettings.fontColor }}>{charity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        <div className="rounded-xl shadow-xl p-6 mb-8"
             style={{ backgroundColor: siteSettings.boxBackgroundColor }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold" style={{ color: siteSettings.fontColor }}>Customer Reviews</h3>
            {reviews.length > 2 && (
                              <button 
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="font-medium flex items-center gap-2"
                  style={{ color: siteSettings.linkColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = siteSettings.buttonColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = siteSettings.linkColor;
                  }}
                >
                  {showAllReviews ? 'Show Less' : `View All ${reviews.length} Reviews`}
                  {showAllReviews ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
            )}
          </div>
          <div className="space-y-4">
            {(showAllReviews ? reviews : reviews.slice(0, 2)).map(review => (
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
                  <button 
                    onClick={() => {
                      if (helpfulReviews.has(review.id)) {
                        setHelpfulReviews(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(review.id);
                          return newSet;
                        });
                        alert('Removed from helpful!');
                      } else {
                        setHelpfulReviews(prev => new Set([...prev, review.id]));
                        alert('Marked as helpful!');
                      }
                    }}
                    className={`flex items-center space-x-1 transition-colors ${
                      helpfulReviews.has(review.id) 
                        ? 'text-[#5B6E02]' 
                        : 'hover:text-[#5B6E02]'
                    }`}
                  >
                    <ThumbsUp className={`w-3 h-3 ${helpfulReviews.has(review.id) ? 'fill-current' : ''}`} />
                    <span>Helpful ({review.helpful + (helpfulReviews.has(review.id) ? 1 : 0)})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust & Safety */}
        <div className="rounded-xl shadow-xl p-6 mb-8"
             style={{ backgroundColor: siteSettings.boxBackgroundColor }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: siteSettings.fontColor }}>Trust & Safety</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-green-500" />
              <div>
                <div className="font-medium" style={{ color: siteSettings.fontColor }}>Secure Checkout</div>
                <div className="text-sm" style={{ color: siteSettings.fontColor, opacity: 0.7 }}>
                  {siteSettings.trustAndSafety?.secureCheckout || 'SSL encrypted payments'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <div className="font-medium" style={{ color: siteSettings.fontColor }}>Verified Vendor</div>
                <div className="text-sm" style={{ color: siteSettings.fontColor, opacity: 0.7 }}>
                  {siteSettings.trustAndSafety?.verifiedVendor || 'Identity confirmed'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Package className="w-6 h-6 text-green-500" />
              <div>
                <div className="font-medium" style={{ color: siteSettings.fontColor }}>Return Policy</div>
                <div className="text-sm" style={{ color: siteSettings.fontColor, opacity: 0.7 }}>
                  {siteSettings.trustAndSafety?.returnPolicy || '7-day satisfaction guarantee'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Social Links */}
        <div className="rounded-xl shadow-xl p-6 mb-8"
             style={{ backgroundColor: siteSettings.boxBackgroundColor }}>
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-4">Contact & Follow Us</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div>
              <h4 className="font-semibold mb-3" style={{ color: siteSettings.fontColor }}>Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5" style={{ color: siteSettings.linkColor }} />
                  <span style={{ color: siteSettings.fontColor }}>{siteSettings.contactInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5" style={{ color: siteSettings.linkColor }} />
                  <span style={{ color: siteSettings.fontColor }}>{siteSettings.contactInfo.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5" style={{ color: siteSettings.linkColor }} />
                  <a href={siteSettings.contactInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1" style={{ color: siteSettings.linkColor }}>
                    {siteSettings.contactInfo.website.replace('https://', '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5" style={{ color: siteSettings.linkColor }} />
                  <span style={{ color: siteSettings.fontColor }}>{siteSettings.contactInfo.address}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="font-medium mb-2" style={{ color: siteSettings.fontColor }}>Business Hours</h5>
                <div className="space-y-1 text-sm" style={{ color: siteSettings.fontColor }}>
                  {Object.entries(siteSettings.businessHours).map(([day, hours]) => (
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
              <h4 className="font-semibold mb-3" style={{ color: siteSettings.fontColor }}>Follow Us</h4>
              <div className="flex space-x-4 mb-4">
                <a 
                  href={siteSettings.socialMedia.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors shadow-md hover:shadow-lg group"
                  title="Follow us on Instagram"
                >
                  <Instagram className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href={siteSettings.socialMedia.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors shadow-md hover:shadow-lg group"
                  title="Follow us on Facebook"
                >
                  <Facebook className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href={siteSettings.socialMedia.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors shadow-md hover:shadow-lg group"
                  title="Follow us on Twitter"
                >
                  <Twitter className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href={siteSettings.socialMedia.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors shadow-md hover:shadow-lg group"
                  title="Subscribe to our YouTube channel"
                >
                  <Youtube className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </a>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h5 className="font-medium mb-2" style={{ color: siteSettings.fontColor }}>Stay Connected</h5>
                <p className="text-sm mb-3" style={{ color: siteSettings.fontColor }}>
                  Follow us for behind-the-scenes content, baking tips, and special announcements!
                </p>
                <div className="flex items-center space-x-2 text-xs" style={{ color: siteSettings.fontColor }}>
                  <span>📸 Daily bread photos</span>
                  <span>•</span>
                  <span>🎥 Baking tutorials</span>
                  <span>•</span>
                  <span>📢 Special offers</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium mb-2" style={{ color: siteSettings.fontColor }}>Service Coverage</h5>
                <p className="text-sm mb-2" style={{ color: siteSettings.fontColor }}>
                  We deliver to {storeData.coverageZips.length} ZIP codes in the Atlanta metro area.
                </p>
                <div className="text-xs" style={{ color: siteSettings.fontColor }}>
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
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors" 
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors" 
                    aria-label="Increase quantity"
                  >
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

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl mx-4 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Shopping Cart ({cart.length} items)</h3>
              <button
                onClick={() => setShowCartModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <button
                    onClick={() => setShowCartModal(false)}
                    className="bg-[#5B6E02] hover:bg-[#4A5A01] text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-[#2C2C2C]">{item.name}</h4>
                        <p className="text-sm text-gray-600">${item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold" style={{ color: storeData.primaryColor }}>
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowCartModal(false);
                      setShowCheckoutModal(true);
                    }}
                    className="flex-1 bg-[#8B4513] hover:bg-[#A0522D] text-white py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => setShowCartModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl mx-4 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Checkout</h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div>
                  <h4 className="font-semibold text-[#2C2C2C] mb-4">Order Summary</h4>
                  <div className="space-y-3 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                          <div>
                            <h5 className="font-medium text-[#2C2C2C]">{item.name}</h5>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span>$5.99</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span style={{ color: storeData.primaryColor }}>
                        ${(getCartTotal() + 5.99).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Form */}
                <div>
                  <h4 className="font-semibold text-[#2C2C2C] mb-4">Delivery Information</h4>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions</label>
                      <textarea
                        rows={3}
                        placeholder="Any special delivery instructions..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5B6E02] focus:outline-none"
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setShowCartModal(true);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
                >
                  Back to Cart
                </button>
                <button
                  onClick={() => {
                    alert('Order placed successfully! You will receive a confirmation email shortly.');
                    setShowCheckoutModal(false);
                    setCart([]); // Clear cart after successful order
                  }}
                  className="flex-1 bg-[#8B4513] hover:bg-[#A0522D] text-white py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Place Order
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
             <p style={{ color: siteSettings.fontColor }}>&copy; 2024 {siteSettings.siteName}. All rights reserved.</p>
             <p className="mt-2" style={{ color: siteSettings.fontColor }}>{siteSettings.tagline}</p>
           </div>
         </div>
       </footer>

       {/* Simple Site Editor */}
       {showSiteEditor && (
         <SimpleSiteEditor
           onSave={handleSaveSiteSettings}
           onClose={() => setShowSiteEditor(false)}
           currentSettings={siteSettings}
         />
       )}
     </div>
   );
 };



// CoverageMap Component
const CoverageMap: React.FC<{
  coverageZips: string[];
  city: string;
  state: string;
  upcomingEvents: any[];
}> = ({ coverageZips, city, state, upcomingEvents }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Simple map placeholder for now
    // In a real implementation, you would integrate with a mapping library like Leaflet
    const mapContainer = mapRef.current;
    mapContainer.innerHTML = `
      <div class="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div class="text-center text-gray-500">
          <div class="text-2xl mb-2">🗺️</div>
          <div class="font-medium">Service Area Map</div>
          <div class="text-sm">Covering ${city}, ${state}</div>
          <div class="text-xs mt-1">${upcomingEvents.length} upcoming events</div>
        </div>
      </div>
    `;
  }, [coverageZips, city, state, upcomingEvents]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default DemoStorefrontPage;
