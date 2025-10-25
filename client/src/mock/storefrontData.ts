// Mock data for vendor storefront
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tags: string[];
  availability: 'In Stock' | 'Out of Stock' | 'Back Soon' | 'Limited';
  pickupDays: string[];
  stockLevel: string;
  rating: number;
  reviewCount: number;
  description: string;
  isVerified: boolean;
  orderWindows: string[];
  ingredients?: string[];
  allergens?: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  spotsLeft: number;
  totalSpots: number;
  eventUrl?: string;
  category: 'Market' | 'Workshop' | 'Tasting' | 'Pop-up';
  price?: number;
}

export interface StoreData {
  siteName: string;
  tagline: string;
  city: string;
  state: string;
  responseTime: string;
  coverageZips: string[];
  bannerImage?: string;
  logo?: string;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
    address: string;
  };
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
    tiktok: string;
  };
}

export const mockStoreData: StoreData = {
  siteName: "Artisan Bakes Atlanta",
  tagline: "Handcrafted sourdough and artisanal breads made with love and tradition",
  city: "Atlanta",
  state: "GA",
  responseTime: "< 2 hours",
  coverageZips: ["30301", "30302", "30303", "30304", "30305", "30306", "30307", "30308", "30309", "30310"],
  bannerImage: "/banner-artisan-bakes.jpg",
  logo: "/logo-artisan-bakes.png",
  contactInfo: {
    phone: "(404) 555-0123",
    email: "hello@artisanbakesatlanta.com",
    website: "https://artisanbakesatlanta.com",
    address: "123 Peachtree Street, Atlanta, GA 30303"
  },
  businessHours: {
    monday: "Closed",
    tuesday: "8:00 AM - 6:00 PM",
    wednesday: "8:00 AM - 6:00 PM",
    thursday: "8:00 AM - 6:00 PM",
    friday: "8:00 AM - 8:00 PM",
    saturday: "7:00 AM - 7:00 PM",
    sunday: "8:00 AM - 4:00 PM"
  },
  socialMedia: {
    instagram: "@artisanbakesatlanta",
    facebook: "ArtisanBakesAtlanta",
    twitter: "@ArtisanBakesATL",
    youtube: "ArtisanBakesAtlanta",
    tiktok: "@artisanbakesatlanta"
  }
};

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Classic Sourdough',
    price: 8.99,
    originalPrice: undefined,
    image: '/product-sourdough.jpg',
    category: 'Bread',
    tags: ['Sourdough', 'Traditional', 'Artisan'],
    availability: 'In Stock',
    pickupDays: ['Tuesday', 'Thursday', 'Saturday'],
    stockLevel: 'In Stock',
    rating: 4.9,
    reviewCount: 124,
    description: 'Our signature sourdough bread with a perfect crust and tangy flavor.',
    isVerified: true,
    orderWindows: ['farmers-market-sat', 'ponce-market-sun', 'home-delivery'],
    ingredients: ['Organic flour', 'Water', 'Salt', 'Sourdough starter'],
    allergens: ['Gluten'],
    nutritionInfo: {
      calories: 120,
      protein: 4,
      carbs: 25,
      fat: 1
    }
  },
  {
    id: '2',
    name: 'Cinnamon Raisin Swirl',
    price: 9.99,
    originalPrice: 11.99,
    image: '/product-cinnamon-raisin.jpg',
    category: 'Sweet Bread',
    tags: ['Cinnamon', 'Raisins', 'Sweet'],
    availability: 'Limited',
    pickupDays: ['Friday', 'Sunday'],
    stockLevel: 'Limited',
    rating: 4.8,
    reviewCount: 89,
    description: 'Sweet cinnamon bread with plump raisins and a buttery finish.',
    isVerified: true,
    orderWindows: ['ponce-market-sun', 'krog-market-first-sat'],
    ingredients: ['Flour', 'Cinnamon', 'Raisins', 'Butter', 'Sugar', 'Eggs'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    nutritionInfo: {
      calories: 180,
      protein: 5,
      carbs: 32,
      fat: 6
    }
  },
  {
    id: '3',
    name: 'Herb Focaccia',
    price: 6.99,
    originalPrice: undefined,
    image: '/product-focaccia.jpg',
    category: 'Bread',
    tags: ['Herbs', 'Olive Oil', 'Artisan'],
    availability: 'Out of Stock',
    pickupDays: ['Friday', 'Sunday'],
    stockLevel: 'Out of Stock',
    rating: 4.7,
    reviewCount: 76,
    description: 'Herb-infused focaccia with olive oil and sea salt.',
    isVerified: true,
    orderWindows: ['farmers-market-sat', 'ponce-market-sun', 'krog-market-first-sat'],
    ingredients: ['Flour', 'Olive oil', 'Fresh herbs', 'Sea salt', 'Yeast'],
    allergens: ['Gluten'],
    nutritionInfo: {
      calories: 140,
      protein: 3,
      carbs: 22,
      fat: 5
    }
  },
  {
    id: '4',
    name: 'Multigrain Seeded',
    price: 10.99,
    originalPrice: undefined,
    image: '/product-multigrain.jpg',
    category: 'Bread',
    tags: ['Multigrain', 'Seeds', 'Healthy'],
    availability: 'In Stock',
    pickupDays: ['Wednesday', 'Saturday'],
    stockLevel: 'In Stock',
    rating: 4.6,
    reviewCount: 67,
    description: 'Nutritious multigrain bread packed with seeds and whole grains.',
    isVerified: true,
    orderWindows: ['home-delivery', 'farmers-market-sat'],
    ingredients: ['Whole wheat flour', 'Rye flour', 'Oats', 'Sunflower seeds', 'Pumpkin seeds', 'Flax seeds'],
    allergens: ['Gluten', 'Nuts'],
    nutritionInfo: {
      calories: 160,
      protein: 8,
      carbs: 28,
      fat: 4
    }
  },
  {
    id: '5',
    name: 'Whole Wheat Loaf',
    price: 7.99,
    originalPrice: undefined,
    image: '/product-wholewheat.jpg',
    category: 'Bread',
    tags: ['Whole Grain', 'Healthy', 'Organic'],
    availability: 'Back Soon',
    pickupDays: ['Wednesday', 'Saturday'],
    stockLevel: 'Back Soon',
    rating: 4.5,
    reviewCount: 34,
    description: 'Nutritious whole wheat bread with a hearty texture.',
    isVerified: true,
    orderWindows: ['home-delivery'],
    ingredients: ['Organic whole wheat flour', 'Water', 'Salt', 'Yeast', 'Honey'],
    allergens: ['Gluten'],
    nutritionInfo: {
      calories: 110,
      protein: 4,
      carbs: 22,
      fat: 1
    }
  },
  {
    id: '6',
    name: 'Chocolate Croissant',
    price: 4.99,
    originalPrice: undefined,
    image: '/product-croissant.jpg',
    category: 'Pastry',
    tags: ['Chocolate', 'Buttery', 'French'],
    availability: 'In Stock',
    pickupDays: ['Tuesday', 'Thursday', 'Saturday'],
    stockLevel: 'In Stock',
    rating: 4.9,
    reviewCount: 156,
    description: 'Flaky, buttery croissant filled with rich dark chocolate.',
    isVerified: true,
    orderWindows: ['farmers-market-sat', 'ponce-market-sun', 'krog-market-first-sat'],
    ingredients: ['Flour', 'Butter', 'Dark chocolate', 'Yeast', 'Sugar', 'Eggs'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    nutritionInfo: {
      calories: 280,
      protein: 6,
      carbs: 32,
      fat: 16
    }
  },
  {
    id: '7',
    name: 'Baguette',
    price: 5.99,
    originalPrice: undefined,
    image: '/product-baguette.jpg',
    category: 'Bread',
    tags: ['French', 'Crusty', 'Traditional'],
    availability: 'In Stock',
    pickupDays: ['Daily'],
    stockLevel: 'In Stock',
    rating: 4.7,
    reviewCount: 203,
    description: 'Classic French baguette with a crisp crust and airy interior.',
    isVerified: true,
    orderWindows: ['farmers-market-sat', 'ponce-market-sun', 'krog-market-first-sat', 'home-delivery'],
    ingredients: ['Flour', 'Water', 'Salt', 'Yeast'],
    allergens: ['Gluten'],
    nutritionInfo: {
      calories: 130,
      protein: 4,
      carbs: 26,
      fat: 1
    }
  },
  {
    id: '8',
    name: 'Blueberry Muffin',
    price: 3.99,
    originalPrice: undefined,
    image: '/product-muffin.jpg',
    category: 'Pastry',
    tags: ['Blueberry', 'Sweet', 'Breakfast'],
    availability: 'Limited',
    pickupDays: ['Wednesday', 'Friday', 'Sunday'],
    stockLevel: 'Limited',
    rating: 4.4,
    reviewCount: 45,
    description: 'Moist blueberry muffin with a sweet crumb topping.',
    isVerified: true,
    orderWindows: ['ponce-market-sun', 'krog-market-first-sat'],
    ingredients: ['Flour', 'Blueberries', 'Sugar', 'Butter', 'Eggs', 'Milk'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    nutritionInfo: {
      calories: 220,
      protein: 4,
      carbs: 35,
      fat: 8
    }
  }
];

export const mockUpcomingEvents: Event[] = [
  {
    id: '1',
    name: 'Saturday Farmers Market',
    date: '2024-01-20',
    time: '8:00 AM - 2:00 PM',
    location: 'Grant Park Farmers Market',
    description: 'Join us for fresh bread and pastries at the Grant Park Farmers Market. Pre-orders available.',
    spotsLeft: 15,
    totalSpots: 20,
    eventUrl: 'https://grantparkmarket.com',
    category: 'Market',
    price: 0
  },
  {
    id: '2',
    name: 'Sourdough Workshop',
    date: '2024-01-25',
    time: '6:00 PM - 8:00 PM',
    location: 'Our Bakery Kitchen',
    description: 'Learn the art of sourdough bread making from our master baker. Includes starter and recipe.',
    spotsLeft: 0,
    totalSpots: 12,
    eventUrl: 'https://artisanbakesatlanta.com/workshops',
    category: 'Workshop',
    price: 75
  },
  {
    id: '3',
    name: 'Sunday Ponce Market',
    date: '2024-01-21',
    time: '9:00 AM - 3:00 PM',
    location: 'Ponce City Market',
    description: 'Visit our pop-up stand at Ponce City Market for fresh bread and pastries.',
    spotsLeft: 8,
    totalSpots: 10,
    eventUrl: 'https://poncecitymarket.com',
    category: 'Market',
    price: 0
  },
  {
    id: '4',
    name: 'Bread Tasting Event',
    date: '2024-01-28',
    time: '2:00 PM - 4:00 PM',
    location: 'Local Coffee Shop',
    description: 'Sample our latest bread varieties paired with local coffee and honey.',
    spotsLeft: 5,
    totalSpots: 15,
    eventUrl: 'https://artisanbakesatlanta.com/events',
    category: 'Tasting',
    price: 25
  },
  {
    id: '5',
    name: 'First Saturday Krog Market',
    date: '2024-02-03',
    time: '9:00 AM - 2:00 PM',
    location: 'Krog Street Market',
    description: 'Special appearance at Krog Street Market with exclusive bread varieties.',
    spotsLeft: 12,
    totalSpots: 15,
    eventUrl: 'https://krogstreetmarket.com',
    category: 'Market',
    price: 0
  }
];

export const mockOrderWindows = [
  {
    id: 'farmers-market-sat',
    name: 'Saturday Farmers Market',
    location: 'Grant Park',
    time: '8:00 AM - 2:00 PM',
    pickupTime: '8:00 AM - 1:00 PM',
    orderDeadline: 'Friday 6:00 PM'
  },
  {
    id: 'ponce-market-sun',
    name: 'Sunday Ponce Market',
    location: 'Ponce City Market',
    time: '9:00 AM - 3:00 PM',
    pickupTime: '9:00 AM - 2:30 PM',
    orderDeadline: 'Saturday 6:00 PM'
  },
  {
    id: 'krog-market-first-sat',
    name: 'First Saturday Krog Market',
    location: 'Krog Street Market',
    time: '9:00 AM - 2:00 PM',
    pickupTime: '9:00 AM - 1:30 PM',
    orderDeadline: 'Friday 6:00 PM'
  },
  {
    id: 'home-delivery',
    name: 'Home Delivery',
    location: 'Atlanta Metro Area',
    time: 'Tuesday - Saturday',
    pickupTime: '2:00 PM - 6:00 PM',
    orderDeadline: '24 hours in advance'
  }
];
