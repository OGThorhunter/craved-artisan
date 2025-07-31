import { useState } from 'react';

import { Heart, Star, ShoppingCart, Share2, Truck, Shield } from 'lucide-react';
import { Link } from 'wouter';

export const ProductPage = () => {

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock product data - in real app, this would come from API
  const product = {
    id: '1',
    name: 'Handcrafted Ceramic Mug Set',
    price: 45.99,
    comparePrice: 59.99,
    description: 'Beautiful handcrafted ceramic mugs made by local artisan Sarah Johnson. Each mug is unique with subtle variations in color and texture. Perfect for your morning coffee or tea.',
    images: [
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
      '/api/placeholder/400/400'
    ],
    vendor: {
      id: '1',
      name: 'Sarah\'s Ceramics',
      rating: 4.8,
      reviewCount: 127,
      location: 'Portland, OR'
    },
    category: 'Home & Garden',
    tags: ['ceramic', 'handmade', 'coffee', 'tea', 'kitchen'],
    inStock: true,
    stockQuantity: 15,
    weight: 2.5,
    dimensions: { length: 8, width: 8, height: 4 },
    features: [
      'Handcrafted from premium clay',
      'Microwave and dishwasher safe',
      'Food-safe glazes',
      'Unique variations in each piece',
      'Made in small batches'
    ],
    shipping: {
      free: true,
      estimatedDays: '3-5 business days',
      returnPolicy: '30-day returns'
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', { product: product.id, quantity });
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">
                      {product.vendor.rating} ({product.vendor.reviewCount} reviews)
                    </span>
                  </div>
                  <Link href={`/vendor/${product.vendor.id}`} className="text-primary-600 hover:text-primary-700">
                    {product.vendor.name}
                  </Link>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                  {product.comparePrice && (
                    <span className="text-lg text-gray-500 line-through">${product.comparePrice}</span>
                  )}
                  {product.comparePrice && (
                    <span className="text-sm text-green-600 font-medium">
                      {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% off
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-lg border ${
                    isFavorite
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-red-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {product.inStock ? `${product.stockQuantity} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                <ul className="space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shipping Info */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 mr-2" />
                    {product.shipping.free ? 'Free shipping' : 'Shipping calculated'}
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    {product.shipping.returnPolicy}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Estimated delivery: {product.shipping.estimatedDays}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 