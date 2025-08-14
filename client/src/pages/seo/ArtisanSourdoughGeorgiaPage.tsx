'use client';

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { MapPin, Star, Clock, Truck, Package, Heart, Share2, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface SourdoughVendor {
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
}

interface SourdoughProduct {
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
  dietaryFlags: string[];
}

export default function ArtisanSourdoughGeorgiaPage() {
  const [vendors, setVendors] = useState<SourdoughVendor[]>([]);
  const [products, setProducts] = useState<SourdoughProduct[]>([]);
  const [userZip, setUserZip] = useState('30248');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price'>('rating');
  const [filterVerified, setFilterVerified] = useState(false);

  useEffect(() => {
    // Mock data for SEO-optimized sourdough page
    const mockVendors: SourdoughVendor[] = [
      {
        id: 'rosecreek-bakery',
        name: 'Rose Creek Bakery',
        logo: '/images/rosecreek-logo.jpg',
        description: 'Artisan sourdough bread made with traditional methods and local Georgia flour. Our sourdough starter has been lovingly maintained for over 15 years.',
        rating: 4.8,
        reviewCount: 127,
        location: 'McDonough, GA',
        distance: 2.3,
        specialties: ['Traditional Sourdough', 'Whole Wheat Sourdough', 'Rosemary Sourdough'],
        pickupLocations: ['Downtown Market', 'Rose Creek Store'],
        deliveryZones: ['30248', '30249', '30250'],
        isVerified: true,
        featured: true
      },
      {
        id: 'atlanta-artisan-bread',
        name: 'Atlanta Artisan Bread Co.',
        logo: '/images/atlanta-artisan-logo.jpg',
        description: 'Handcrafted sourdough bread using organic ingredients and time-honored techniques. Perfect for sandwiches, toast, or simply enjoying with butter.',
        rating: 4.6,
        reviewCount: 89,
        location: 'Atlanta, GA',
        distance: 15.2,
        specialties: ['Classic Sourdough', 'Seeded Sourdough', 'Olive Sourdough'],
        pickupLocations: ['Piedmont Market', 'Atlanta Artisan Store'],
        deliveryZones: ['30301', '30302', '30303'],
        isVerified: true,
        featured: false
      },
      {
        id: 'georgia-grain-bakery',
        name: 'Georgia Grain Bakery',
        logo: '/images/georgia-grain-logo.jpg',
        description: 'Sourdough bread made with 100% Georgia-grown wheat and our signature sourdough culture. Each loaf is shaped by hand and baked in stone ovens.',
        rating: 4.7,
        reviewCount: 156,
        location: 'Marietta, GA',
        distance: 22.1,
        specialties: ['Georgia Wheat Sourdough', 'Rye Sourdough', 'Multigrain Sourdough'],
        pickupLocations: ['Marietta Square Market', 'Georgia Grain Store'],
        deliveryZones: ['30060', '30061', '30062'],
        isVerified: true,
        featured: false
      }
    ];

    const mockProducts: SourdoughProduct[] = [
      {
        id: 'sourdough-1',
        name: 'Traditional Artisan Sourdough',
        description: 'Classic sourdough bread with a crisp crust and tangy, chewy interior. Made with our 15-year-old starter.',
        price: 8.50,
        image: '/images/traditional-sourdough.jpg',
        vendorId: 'rosecreek-bakery',
        vendorName: 'Rose Creek Bakery',
        rating: 4.9,
        reviewCount: 45,
        isAvailable: true,
        dietaryFlags: ['Vegan', 'No Preservatives']
      },
      {
        id: 'sourdough-2',
        name: 'Whole Wheat Sourdough',
        description: 'Nutritious whole wheat sourdough with a hearty texture and rich flavor. Perfect for healthy sandwiches.',
        price: 9.00,
        image: '/images/whole-wheat-sourdough.jpg',
        vendorId: 'rosecreek-bakery',
        vendorName: 'Rose Creek Bakery',
        rating: 4.7,
        reviewCount: 32,
        isAvailable: true,
        dietaryFlags: ['Vegan', 'Whole Grain', 'No Preservatives']
      },
      {
        id: 'sourdough-3',
        name: 'Rosemary Sourdough',
        description: 'Aromatic sourdough infused with fresh rosemary and sea salt. Ideal for dipping in olive oil.',
        price: 9.50,
        image: '/images/rosemary-sourdough.jpg',
        vendorId: 'rosecreek-bakery',
        vendorName: 'Rose Creek Bakery',
        rating: 4.8,
        reviewCount: 28,
        isAvailable: true,
        dietaryFlags: ['Vegan', 'No Preservatives']
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
          return 0; // Would need price data for vendors
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO-optimized header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Best Artisan Sourdough Bread in Georgia
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Discover handcrafted sourdough bread from local Georgia bakeries. Made with traditional methods, 
              organic ingredients, and time-honored techniques. Fresh daily delivery and pickup available.
            </p>
            
            {/* ZIP code input */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Find sourdough near:</span>
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
                <div className="text-2xl font-bold text-brand-green">15+</div>
                <div className="text-sm text-gray-600">Years of Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-green">4.8★</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-green">500+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
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
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
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
              Top Sourdough Bakeries in Georgia
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
              <h3 className="text-lg font-semibold mb-4">Popular Sourdough Products</h3>
              
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{product.vendorName}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{product.rating}</span>
                        <span className="text-gray-500">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
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
                <h4 className="font-medium text-gray-900 mb-3">Why Choose Georgia Sourdough?</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>Made with local Georgia wheat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>Traditional sourdough starter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>No preservatives or additives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>Fresh baked daily</span>
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
            The Art of Sourdough Bread in Georgia
          </h2>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Georgia's artisan sourdough bread scene is thriving, with passionate bakers creating 
              exceptional loaves using traditional methods and local ingredients. Our sourdough 
              bread is made with a natural starter that has been carefully maintained for years, 
              resulting in bread with complex flavors and perfect texture.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              What Makes Georgia Sourdough Special?
            </h3>
            
            <ul className="space-y-3 text-gray-600 mb-6">
              <li><strong>Local Ingredients:</strong> Many of our bakers use Georgia-grown wheat and flour, supporting local farmers and ensuring freshness.</li>
              <li><strong>Traditional Methods:</strong> Our sourdough is made using time-honored techniques, including long fermentation times for optimal flavor development.</li>
              <li><strong>Natural Starter:</strong> Each bakery maintains its own sourdough starter, some dating back decades, creating unique flavor profiles.</li>
              <li><strong>No Preservatives:</strong> Our sourdough bread contains only natural ingredients - flour, water, salt, and the sourdough starter.</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Perfect for Every Occasion
            </h3>
            
            <p className="text-gray-600 mb-6">
              Whether you're making the perfect sandwich, enjoying toast with butter, or simply 
              savoring a slice with olive oil, our artisan sourdough bread elevates any meal. 
              The tangy flavor and chewy texture make it a favorite among bread lovers throughout Georgia.
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Order Your Fresh Sourdough Today</h4>
              <p className="text-gray-600 mb-4">
                Browse our selection of artisan sourdough bread from Georgia's finest bakeries. 
                Order online for convenient pickup or delivery to your doorstep.
              </p>
              <Link href="/marketplace">
                <button className="px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green/90">
                  Browse All Sourdough
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
