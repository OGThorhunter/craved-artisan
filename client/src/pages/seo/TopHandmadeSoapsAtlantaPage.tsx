'use client';

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { MapPin, Star, Clock, Truck, Package, Heart, Share2, Filter, Search, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface SoapVendor {
  id: string;
  name: string;
  logo: string;
  description: string;
  rating: number;
  reviewCount: number;
  location: string;
  distance: number;
  specialties: string[];
  pickupLocations: string[];
  deliveryZones: string[];
  isVerified: boolean;
  featured: boolean;
  awards: string[];
}

interface SoapProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  vendorId: string;
  vendorName: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  nextBatchDate?: string;
  ingredients: string[];
  skinType: string[];
  scent: string;
}

export default function TopHandmadeSoapsAtlantaPage() {
  const [vendors, setVendors] = useState<SoapVendor[]>([]);
  const [products, setProducts] = useState<SoapProduct[]>([]);
  const [userZip, setUserZip] = useState('30301');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price'>('rating');
  const [filterVerified, setFilterVerified] = useState(false);
  const [skinTypeFilter, setSkinTypeFilter] = useState<string>('');

  useEffect(() => {
    // Mock data for SEO-optimized handmade soaps page
    const mockVendors: SoapVendor[] = [
      {
        id: 'atlanta-soap-co',
        name: 'Atlanta Soap Company',
        logo: '/images/atlanta-soap-logo.jpg',
        description: 'Handcrafted natural soaps made with organic ingredients and essential oils. Each bar is carefully formulated for different skin types and preferences.',
        rating: 4.9,
        reviewCount: 234,
        location: 'Atlanta, GA',
        distance: 3.2,
        specialties: ['Natural Soaps', 'Organic Ingredients', 'Essential Oils'],
        pickupLocations: ['Piedmont Market', 'Atlanta Soap Store'],
        deliveryZones: ['30301', '30302', '30303', '30304'],
        isVerified: true,
        featured: true,
        awards: ['Best of Atlanta 2024', 'Organic Certification']
      },
      {
        id: 'georgia-naturals',
        name: 'Georgia Naturals',
        logo: '/images/georgia-naturals-logo.jpg',
        description: 'Artisan soaps made with Georgia-grown herbs and botanicals. Our soaps are gentle, moisturizing, and perfect for sensitive skin.',
        rating: 4.7,
        reviewCount: 156,
        location: 'Decatur, GA',
        distance: 8.5,
        specialties: ['Botanical Soaps', 'Sensitive Skin', 'Herbal Infusions'],
        pickupLocations: ['Decatur Market', 'Georgia Naturals Store'],
        deliveryZones: ['30030', '30031', '30032'],
        isVerified: true,
        featured: false,
        awards: ['Local Business Award 2023']
      },
      {
        id: 'pure-essence-soaps',
        name: 'Pure Essence Soaps',
        logo: '/images/pure-essence-logo.jpg',
        description: 'Luxury handmade soaps with premium ingredients and unique fragrances. Each soap is a work of art that nourishes your skin.',
        rating: 4.8,
        reviewCount: 189,
        location: 'Buckhead, GA',
        distance: 5.1,
        specialties: ['Luxury Soaps', 'Premium Ingredients', 'Unique Fragrances'],
        pickupLocations: ['Buckhead Market', 'Pure Essence Store'],
        deliveryZones: ['30305', '30306', '30307'],
        isVerified: true,
        featured: false,
        awards: ['Luxury Product Award 2024']
      }
    ];

    const mockProducts: SoapProduct[] = [
      {
        id: 'soap-1',
        name: 'Lavender & Honey Soap',
        description: 'Calming lavender essential oil combined with raw honey for moisturizing properties. Perfect for dry and sensitive skin.',
        price: 8.50,
        image: '/images/lavender-honey-soap.jpg',
        vendorId: 'atlanta-soap-co',
        vendorName: 'Atlanta Soap Company',
        rating: 4.9,
        reviewCount: 67,
        isAvailable: true,
        ingredients: ['Organic Olive Oil', 'Coconut Oil', 'Lavender Essential Oil', 'Raw Honey'],
        skinType: ['Dry', 'Sensitive', 'Normal'],
        scent: 'Lavender'
      },
      {
        id: 'soap-2',
        name: 'Tea Tree & Mint Soap',
        description: 'Refreshing tea tree oil with peppermint for a cooling, antibacterial soap. Great for oily and acne-prone skin.',
        price: 7.50,
        image: '/images/tea-tree-mint-soap.jpg',
        vendorId: 'atlanta-soap-co',
        vendorName: 'Atlanta Soap Company',
        rating: 4.7,
        reviewCount: 45,
        isAvailable: true,
        ingredients: ['Organic Olive Oil', 'Tea Tree Essential Oil', 'Peppermint Essential Oil', 'Activated Charcoal'],
        skinType: ['Oily', 'Acne-prone', 'Combination'],
        scent: 'Mint'
      },
      {
        id: 'soap-3',
        name: 'Oatmeal & Honey Soap',
        description: 'Gentle exfoliating soap with colloidal oatmeal and honey. Soothes irritated skin and provides deep hydration.',
        price: 9.00,
        image: '/images/oatmeal-honey-soap.jpg',
        vendorId: 'georgia-naturals',
        vendorName: 'Georgia Naturals',
        rating: 4.8,
        reviewCount: 52,
        isAvailable: true,
        ingredients: ['Organic Oats', 'Raw Honey', 'Shea Butter', 'Almond Oil'],
        skinType: ['Sensitive', 'Dry', 'Eczema-prone'],
        scent: 'Natural'
      }
    ];

    setVendors(mockVendors);
    setProducts(mockProducts);
  }, []);

  const filteredVendors = vendors
    .filter(vendor => !filterVerified || vendor.isVerified)
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return a.distance - b.distance;
        case 'price':
          return 0;
        default:
          return 0;
      }
    });

  const filteredProducts = products.filter(product => 
    !skinTypeFilter || product.skinType.includes(skinTypeFilter)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO-optimized header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Top Handmade Soaps in Atlanta
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Discover premium handmade soaps from Atlanta's finest artisans. Made with natural ingredients, 
              essential oils, and care for your skin. Organic, cruelty-free, and locally crafted.
            </p>
            
            {/* ZIP code input */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Find soaps near:</span>
              </div>
              <input
                type="text"
                value={userZip}
                onChange={(e) => setUserZip(e.target.value)}
                placeholder="Enter ZIP code"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                maxLength={5}
              />
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-green">100%</div>
                <div className="text-sm text-gray-600">Natural Ingredients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-green">4.8★</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-green">50+</div>
                <div className="text-sm text-gray-600">Unique Scents</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilterVerified(!filterVerified)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  filterVerified 
                    ? 'bg-brand-green text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Verified Only
              </button>
              
              <select
                value={skinTypeFilter}
                onChange={(e) => setSkinTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
                aria-label="Filter by skin type"
              >
                <option value="">All Skin Types</option>
                <option value="Dry">Dry Skin</option>
                <option value="Oily">Oily Skin</option>
                <option value="Sensitive">Sensitive Skin</option>
                <option value="Normal">Normal Skin</option>
                <option value="Combination">Combination Skin</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
                aria-label="Sort vendors by"
              >
                <option value="rating">Highest Rated</option>
                <option value="distance">Nearest</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Vendors */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Best Handmade Soap Makers in Atlanta
            </h2>
            
            <div className="space-y-6">
              {filteredVendors.map((vendor) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={vendor.logo}
                        alt={`${vendor.name} logo`}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {vendor.name}
                              {vendor.isVerified && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Verified
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {vendor.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                {vendor.rating} ({vendor.reviewCount} reviews)
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {vendor.distance} miles away
                              </div>
                            </div>
                          </div>
                          {vendor.featured && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4">{vendor.description}</p>
                        
                        {vendor.awards.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Awards & Recognition:</h4>
                            <div className="flex flex-wrap gap-2">
                              {vendor.awards.map((award, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                                >
                                  <Award className="w-3 h-3" />
                                  {award}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Specialties:</h4>
                          <div className="flex flex-wrap gap-2">
                            {vendor.specialties.map((specialty, index) => (
                              <span
                                key={index}
                                className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {vendor.pickupLocations.length} pickup locations
                            </div>
                            <div className="flex items-center gap-1">
                              <Truck className="w-4 h-4" />
                              {vendor.deliveryZones.length} delivery zones
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                              <Heart className="w-4 h-4" />
                              Save
                            </button>
                            <Link href={`/vendors/${vendor.id}`}>
                              <button className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90">
                                View Store
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Products sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Popular Handmade Soaps</h3>
              
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{product.vendorName}</p>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{product.rating}</span>
                        <span className="text-gray-500">({product.reviewCount})</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {product.skinType.map((type, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">${product.price}</span>
                        <button className="text-sm text-brand-green hover:text-brand-green/80">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Why Choose Atlanta Handmade Soaps?</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>100% natural ingredients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>Essential oil fragrances</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>No harsh chemicals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>Locally crafted</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO content section */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            The Art of Handmade Soap in Atlanta
          </h2>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Atlanta's handmade soap scene is flourishing, with skilled artisans creating 
              exceptional soaps using traditional methods and premium natural ingredients. 
              Our soaps are crafted with care, using only the finest oils, butters, and 
              essential oils to nourish and protect your skin.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              What Makes Atlanta Handmade Soaps Special?
            </h3>
            
            <ul className="space-y-3 text-gray-600 mb-6">
              <li><strong>Natural Ingredients:</strong> Our soaps are made with organic oils, butters, and essential oils, free from harsh chemicals and synthetic fragrances.</li>
              <li><strong>Traditional Methods:</strong> Each soap is handcrafted using time-honored cold process techniques, ensuring quality and care in every bar.</li>
              <li><strong>Skin-Specific Formulations:</strong> Our artisans create soaps tailored to different skin types - dry, oily, sensitive, and combination skin.</li>
              <li><strong>Local Craftsmanship:</strong> Supporting Atlanta's artisan community while getting premium quality products made with local pride.</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Benefits of Handmade Soap
            </h3>
            
            <p className="text-gray-600 mb-6">
              Handmade soaps offer numerous benefits over commercial alternatives. They retain 
              natural glycerin, which moisturizes your skin, and contain no harsh detergents 
              that can strip your skin of its natural oils. The essential oils provide both 
              fragrance and therapeutic properties, making each shower a luxurious experience.
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Discover Your Perfect Soap</h4>
              <p className="text-gray-600 mb-4">
                Browse our selection of handmade soaps from Atlanta's finest artisans. 
                Find the perfect soap for your skin type and preferences.
              </p>
              <Link href="/marketplace">
                <button className="px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green/90">
                  Browse All Soaps
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
