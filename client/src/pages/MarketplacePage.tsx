'use client';

import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Search, Filter, Star, MapPin, ShoppingCart, Heart } from 'lucide-react';
import { useZip } from '../contexts/ZipContext';

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: 'Fresh Sourdough Bread',
    vendor: 'Rustic Bakes',
    price: 6.50,
    rating: 4.9,
    reviews: 89,
    image: '/images/bread-placeholder.jpg',
    category: 'Bakery',
    distance: '2.3 miles',
    inStock: true
  },
  {
    id: 2,
    name: 'Local Raw Honey',
    vendor: 'Sweet Georgia Apiary',
    price: 8.00,
    rating: 4.8,
    reviews: 156,
    image: '/images/honey-placeholder.jpg',
    category: 'Pantry',
    distance: '1.8 miles',
    inStock: true
  },
  {
    id: 3,
    name: 'Artisan Cheese Selection',
    vendor: 'Dairy Delights',
    price: 12.00,
    rating: 4.7,
    reviews: 234,
    image: '/images/cheese-placeholder.jpg',
    category: 'Dairy',
    distance: '3.2 miles',
    inStock: true
  },
  {
    id: 4,
    name: 'Handcrafted Soap Bars',
    vendor: 'Elderberry & Sage',
    price: 5.50,
    rating: 4.9,
    reviews: 67,
    image: '/images/soap-placeholder.jpg',
    category: 'Wellness',
    distance: '4.1 miles',
    inStock: false
  },
  {
    id: 5,
    name: 'Organic Vegetables',
    vendor: 'Green Thumb Farm',
    price: 15.00,
    rating: 4.6,
    reviews: 123,
    image: '/images/vegetables-placeholder.jpg',
    category: 'Produce',
    distance: '2.7 miles',
    inStock: true
  },
  {
    id: 6,
    name: 'Fresh Eggs',
    vendor: 'Happy Hens Coop',
    price: 4.50,
    rating: 4.8,
    reviews: 89,
    image: '/images/eggs-placeholder.jpg',
    category: 'Dairy',
    distance: '1.5 miles',
    inStock: true
  }
];

const categories = [
  { name: 'All', count: mockProducts.length },
  { name: 'Bakery', count: 1 },
  { name: 'Pantry', count: 1 },
  { name: 'Dairy', count: 2 },
  { name: 'Wellness', count: 1 },
  { name: 'Produce', count: 1 }
];

export default function MarketplacePage() {
  const { zip } = useZip();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-brand-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-brand-charcoal mb-4">Marketplace</h1>
            <p className="text-brand-grey text-lg mb-6">
              Discover fresh, local goods from artisans near {zip}
            </p>
            
            {/* Search and Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-grey h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products, vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-brand-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-brand-charcoal"
                />
              </div>
              
              <div className="flex gap-2">
                                 <select
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="px-4 py-3 border border-brand-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-brand-charcoal bg-white"
                   title="Sort products"
                 >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="distance">Nearest First</option>
                </select>
                
                                 <button 
                   className="px-4 py-3 border border-brand-beige rounded-lg hover:bg-brand-beige/50 transition-colors"
                   title="Filter products"
                 >
                   <Filter className="h-5 w-5 text-brand-charcoal" />
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.name
                  ? 'bg-brand-maroon text-white'
                  : 'bg-white text-brand-charcoal border border-brand-beige hover:bg-brand-beige/50'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-brand-beige">
                  <div className="absolute inset-0 flex items-center justify-center text-brand-grey">
                    <span className="text-2xl">🖼️</span>
                  </div>
                  
                  {/* Stock Status */}
                  {!product.inStock && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Out of Stock
                    </div>
                  )}
                  
                  {/* Wishlist Button */}
                                     <button 
                     className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white transition-colors"
                     title="Add to wishlist"
                   >
                     <Heart className="h-4 w-4 text-brand-grey" />
                   </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-brand-charcoal text-sm line-clamp-2">
                      {product.name}
                    </h3>
                    <span className="font-bold text-brand-maroon text-lg">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-brand-grey text-xs mb-2">{product.vendor}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-brand-charcoal">{product.rating}</span>
                    </div>
                    <span className="text-xs text-brand-grey">({product.reviews})</span>
                  </div>

                  {/* Distance */}
                  <div className="flex items-center gap-1 mb-4">
                    <MapPin className="h-3 w-3 text-brand-grey" />
                    <span className="text-xs text-brand-grey">{product.distance}</span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    disabled={!product.inStock}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      product.inStock
                        ? 'bg-brand-maroon text-white hover:bg-[#681b24]'
                        : 'bg-brand-grey text-white cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-brand-charcoal mb-2">No products found</h3>
            <p className="text-brand-grey">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Become a Vendor CTA */}
      <div className="bg-brand-maroon text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Sell Your Goods?</h2>
          <p className="text-lg mb-6 opacity-90">
            Join our community of local artisans and start selling to customers in your area.
          </p>
          <Link
            href="/join?vendor=true"
            className="bg-white text-brand-maroon px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Become a Vendor
          </Link>
        </div>
      </div>
    </div>
  );
} 