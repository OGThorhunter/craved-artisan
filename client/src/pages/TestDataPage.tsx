import React, { useState, useEffect } from 'react';
import { 
  allMockData, 
  mockApiResponses, 
  mockErrorResponses, 
  mockDataUtils 
} from '../mock';

const TestDataPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'storefront' | 'analytics' | 'api'>('storefront');
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(allMockData.storefront.products);

  // Test API calls
  const testApiCall = async (apiFunction: () => Promise<any>, name: string) => {
    setLoading(true);
    setApiResponse(null);
    
    try {
      const result = await apiFunction();
      setApiResponse({ name, result, timestamp: new Date().toISOString() });
    } catch (error) {
      if (error instanceof Error) {
        setApiResponse({ name, error: error.message, timestamp: new Date().toISOString() });
      } else {
        setApiResponse({ name, error: String(error), timestamp: new Date().toISOString() });
      }
    } finally {
      setLoading(false);
    }
  };

  // Test search functionality
  const testSearch = async () => {
    setLoading(true);
    const results = await mockDataUtils.mockSearch(searchQuery, allMockData.storefront.products);
    setFilteredProducts(results);
    setLoading(false);
  };

  // Test filtering
  const testFilter = async (category: string) => {
    setLoading(true);
    const results = await mockDataUtils.mockFilter({ category }, allMockData.storefront.products);
    setFilteredProducts(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Testing Data Dashboard</h1>
          <p className="text-lg text-gray-600">
            Interactive testing environment for all mock data and API simulations
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8">
          <button
            onClick={() => setActiveTab('storefront')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'storefront'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Storefront Data
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics Data
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'api'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            API Testing
          </button>
        </div>

        {/* Storefront Data Tab */}
        {activeTab === 'storefront' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Store Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Store Details</h3>
                  <p className="text-gray-600">{allMockData.storefront.storeData.siteName}</p>
                  <p className="text-gray-600">{allMockData.storefront.storeData.tagline}</p>
                  <p className="text-gray-600">{allMockData.storefront.storeData.city}, {allMockData.storefront.storeData.state}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Contact Info</h3>
                  <p className="text-gray-600">{allMockData.storefront.storeData.contactInfo.phone}</p>
                  <p className="text-gray-600">{allMockData.storefront.storeData.contactInfo.email}</p>
                  <p className="text-gray-600">{allMockData.storefront.storeData.contactInfo.address}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Products ({allMockData.storefront.products.length})</h2>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-wrap gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={testSearch}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
                <button
                  onClick={() => testFilter('all')}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  All
                </button>
                <button
                  onClick={() => testFilter('Bread')}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Bread
                </button>
                <button
                  onClick={() => testFilter('Pastry')}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Pastry
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-lg font-bold text-blue-600">${product.price}</p>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.availability === 'In Stock' ? 'bg-green-100 text-green-800' :
                        product.availability === 'Limited' ? 'bg-yellow-100 text-yellow-800' :
                        product.availability === 'Back Soon' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.availability}
                      </span>
                      <span className="text-gray-500">⭐ {product.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Events ({allMockData.storefront.events.length})</h2>
              <div className="space-y-4">
                {allMockData.storefront.events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{event.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.spotsLeft > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {event.spotsLeft > 0 ? `${event.spotsLeft} spots left` : 'Full'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{event.date} • {event.time}</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Data Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Key Performance Indicators</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allMockData.analytics.kpis.map((kpi, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{kpi.icon}</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        kpi.trend === 'up' ? 'bg-green-100 text-green-800' :
                        kpi.trend === 'down' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {kpi.trend === 'up' ? '+' : ''}{kpi.delta}%
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900">{kpi.label}</h3>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    <p className="text-sm text-gray-600">{kpi.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Best Sellers</h2>
              <div className="space-y-4">
                {allMockData.analytics.bestSellers.map((product, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.trend > 0 ? 'bg-green-100 text-green-800' :
                        product.trend < 0 ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.trend > 0 ? '+' : ''}{product.trend}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Revenue</p>
                        <p className="font-medium">${product.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Units Sold</p>
                        <p className="font-medium">{product.units}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Reorder Rate</p>
                        <p className="font-medium">{product.reorderRate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Rating</p>
                        <p className="font-medium">⭐ {product.rating}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
              <div className="space-y-4">
                {allMockData.analytics.aiInsights.map((insight, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    insight.type === 'positive' ? 'border-green-200 bg-green-50' :
                    insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    insight.type === 'opportunity' ? 'border-blue-200 bg-blue-50' :
                    'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{insight.title}</h3>
                      <span className="text-sm text-gray-500">{insight.confidence}% confidence</span>
                    </div>
                    <p className="text-gray-700 mb-2">{insight.description}</p>
                    <p className="text-sm text-gray-600">💡 {insight.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* API Testing Tab */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">API Testing</h2>
              <p className="text-gray-600 mb-4">
                Test various mock API endpoints and see their responses
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => testApiCall(mockApiResponses.getStoreData, 'Get Store Data')}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Get Store Data'}
                </button>
                
                <button
                  onClick={() => testApiCall(mockApiResponses.getProducts, 'Get Products')}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Get Products'}
                </button>
                
                <button
                  onClick={() => testApiCall(() => mockApiResponses.getAnalyticsSummary('vendor-123'), 'Get Analytics Summary')}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Get Analytics Summary'}
                </button>
                
                <button
                  onClick={() => testApiCall(mockApiResponses.getKpis, 'Get KPIs')}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Get KPIs'}
                </button>
              </div>

              {/* API Response Display */}
              {apiResponse && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {apiResponse.name} - {apiResponse.timestamp}
                  </h3>
                  <pre className="text-sm text-gray-700 overflow-auto max-h-64">
                    {JSON.stringify(apiResponse.result || apiResponse.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Error Testing</h2>
              <p className="text-gray-600 mb-4">
                Test how your app handles various error scenarios
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setApiResponse({ name: 'Network Error', result: mockErrorResponses.networkError, timestamp: new Date().toISOString() })}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Simulate Network Error
                </button>
                
                <button
                  onClick={() => setApiResponse({ name: 'Server Error', result: mockErrorResponses.serverError, timestamp: new Date().toISOString() })}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Simulate Server Error
                </button>
                
                <button
                  onClick={() => setApiResponse({ name: 'Rate Limit', result: mockErrorResponses.rateLimit, timestamp: new Date().toISOString() })}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Simulate Rate Limit
                </button>
                
                <button
                  onClick={() => setApiResponse({ name: 'Not Found', result: mockErrorResponses.notFound, timestamp: new Date().toISOString() })}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Simulate Not Found
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDataPage;
