
import { useRoute } from 'wouter';
import { Link } from 'wouter';

export const VendorPage = () => {
  const [, params] = useRoute('/vendor/:id');
  const vendorId = params?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Vendor Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Artisan {vendorId}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Handcrafted jewelry and accessories with a passion for quality
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>📍 Portland, OR</span>
                <span>⭐ 4.8 (127 reviews)</span>
                <span>🛍️ 342 sales</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="btn-primary">Follow</button>
              <button className="btn-secondary">Message</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Products</h2>
              <div className="flex space-x-2">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  Sort by
                </button>
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  Filter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Handcrafted Necklace {i}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Beautiful handcrafted necklace made with care and attention to detail
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">$45.00</span>
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
              <p className="text-gray-600 mb-4">
                I'm a passionate artisan who loves creating unique jewelry pieces. 
                Each item is handcrafted with attention to detail and quality materials.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div>🎨 Specializes in: Jewelry & Accessories</div>
                <div>📅 Member since: January 2023</div>
                <div>🌱 Sustainability: Eco-friendly materials</div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, star) => (
                          <svg key={star} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">2 days ago</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      "Beautiful craftsmanship! The necklace is exactly as described and arrived quickly."
                    </p>
                  </div>
                ))}
              </div>
              <Link href={`/vendor/${vendorId}/reviews`}>
                <button className="w-full mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all reviews →
                </button>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary">
                  Send Message
                </button>
                <button className="w-full btn-secondary">
                  Follow Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 