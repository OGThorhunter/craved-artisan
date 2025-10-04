import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MotivationalQuote from '@/components/dashboard/MotivationalQuote';
import { getQuoteByCategory } from '@/data/motivationalQuotes';
import { 
  Plus, 
  Search,
  Grid3X3,
  List,
  Download,
  Upload,
  MoreVertical,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Package,
  Users,
  Brain,
  ChevronDown,
  X,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type ProductType = 'FOOD' | 'NON_FOOD' | 'SERVICE';

// Types
interface Product {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  description?: string;
  price: number;
  baseCost: number;
  laborCost: number;
  imageUrl?: string;
  active: boolean;
  sku?: string;
  category?: { name: string };
  subcategory?: { name: string };
  tags: string[];
  costRollup: {
    materialsCost: number;
  laborCost: number;
    baseCost: number;
  totalCost: number;
    marginAtPrice: number;
    marginPct: number;
  };
  materials: Array<{
    qty: number;
  unit: string;
    inventoryItem: { name: string; currentQty: number; reorderPoint: number };
  }>;
  variants: Array<{
  id: string;
  name: string;
    priceDelta: number;
    isDefault: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  children: Category[];
  subcategories: Array<{ id: string; name: string }>;
  _count: { products: number };
}

interface AIInsight {
  productId: string;
  productName: string;
  currentPrice: number;
  recommendedPrice: number;
  recommendation: 'increase' | 'decrease' | 'maintain';
  confidence: number;
  reasoning: string;
  currentMargin: number;
  projectedMargin: number;
  imageUrl?: string;
  type: ProductType;
}

// Mock data for development
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Artisan Sourdough Bread',
    slug: 'artisan-sourdough-bread',
    type: 'FOOD',
    description: 'Traditional sourdough bread made with organic flour',
    price: 8.99,
    baseCost: 2.50,
    laborCost: 1.50,
    imageUrl: '/images/bread.jpg',
    active: true,
    sku: 'BREAD-001',
    category: { name: 'Baked Goods' },
    tags: ['organic', 'sourdough', 'artisan'],
    costRollup: {
      materialsCost: 2.50,
      laborCost: 1.50,
      baseCost: 2.50,
      totalCost: 6.50,
      marginAtPrice: 2.49,
      marginPct: 27.7,
    },
    materials: [
      {
        qty: 3,
        unit: 'cups',
        inventoryItem: { name: 'Organic Flour', currentQty: 50, reorderPoint: 10 },
      },
    ],
    variants: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    name: 'Custom Cake Decorating',
    slug: 'custom-cake-decorating',
    type: 'SERVICE',
    description: 'Professional cake decorating service',
    price: 75.00,
    baseCost: 0,
    laborCost: 25.00,
    active: true,
    sku: 'SERVICE-001',
    category: { name: 'Services' },
    tags: ['custom', 'decorating', 'cakes'],
    costRollup: {
      materialsCost: 0,
      laborCost: 25.00,
      baseCost: 0,
      totalCost: 25.00,
      marginAtPrice: 50.00,
      marginPct: 66.7,
    },
    materials: [],
    variants: [],
    // Service-specific fields would be added here in the real implementation
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
];

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Baked Goods',
    children: [],
    subcategories: [
      { id: '1-1', name: 'Bread' },
      { id: '1-2', name: 'Pastries' },
    ],
    _count: { products: 5 },
  },
  {
    id: '2',
    name: 'Services',
    children: [],
    subcategories: [
      { id: '2-1', name: 'Decorating' },
      { id: '2-2', name: 'Consultation' },
    ],
    _count: { products: 3 },
  },
];

const mockAIInsights: AIInsight[] = [
  {
    productId: '1',
    productName: 'Artisan Sourdough Bread',
    currentPrice: 8.99,
    recommendedPrice: 9.50,
    recommendation: 'increase',
    confidence: 0.85,
    reasoning: 'Current margin (27.7%) is below target (30%). Competitor average: $9.25',
    currentMargin: 27.7,
    projectedMargin: 31.6,
    imageUrl: '/images/bread.jpg',
    type: 'FOOD',
  },
];

const VendorProductsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<ProductType | ''>('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'updatedAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showAIInsights, setShowAIInsights] = useState(false);
  
  // Mock queries - replace with actual API calls
  const { data: products = mockProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['products', { searchQuery, selectedCategory, selectedType, sortBy, sortOrder }],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockProducts;
    },
  });

  const { data: categories = mockCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockCategories;
    },
  });

  const { data: aiInsights = mockAIInsights, isLoading: aiInsightsLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockAIInsights;
    },
    enabled: showAIInsights,
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category?.name === selectedCategory);
    }

    if (selectedType) {
      filtered = filtered.filter(product => product.type === selectedType);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedType, sortBy, sortOrder]);

  // Helper functions
  const getTypeIcon = (type: ProductType) => {
    switch (type) {
      case 'FOOD': return Package;
      case 'SERVICE': return Users;
      case 'NON_FOOD': return Package;
      default: return Package;
    }
  };

  const getTypeColor = (type: ProductType) => {
    switch (type) {
      case 'FOOD': return 'bg-green-100 text-green-800';
      case 'SERVICE': return 'bg-blue-100 text-blue-800';
      case 'NON_FOOD': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMarginColor = (marginPct: number) => {
    if (marginPct < 20) return 'text-red-600';
    if (marginPct < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockStatus = (materials: Product['materials']) => {
    const lowStockItems = materials.filter(material => 
      material.inventoryItem.currentQty <= material.inventoryItem.reorderPoint
    );
    
    if (lowStockItems.length > 0) {
      return { status: 'low', count: lowStockItems.length };
    }
    return { status: 'ok', count: 0 };
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  // Product Card Component
  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const TypeIcon = getTypeIcon(product.type);
    const stockStatus = getStockStatus(product.materials);

  return (
      <Card className="bg-[#F7F2EC] shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <TypeIcon className="w-4 h-4 text-gray-600" />
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(product.type)}`}>
                {product.type.replace('_', ' ')}
              </span>
              </div>
            <div className="flex items-center gap-1">
              {stockStatus.status === 'low' && (
                <div title={`${stockStatus.count} items low stock`}>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
              )}
              <button className="p-1 hover:bg-gray-100 rounded" aria-label="More actions">
                <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

          {/* Image */}
          <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Package className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
            )}
            
            {/* Price and Margin */}
              <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
              <span className={`text-sm font-medium ${getMarginColor(product.costRollup.marginPct)}`}>
                {product.costRollup.marginPct.toFixed(1)}% margin
              </span>
            </div>

            {/* Cost Breakdown */}
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Materials:</span>
                <span>${product.costRollup.materialsCost.toFixed(2)}</span>
                      </div>
              <div className="flex justify-between">
                <span>Labor:</span>
                <span>${product.costRollup.laborCost.toFixed(2)}</span>
                  </div>
              <div className="flex justify-between font-medium">
                <span>Total Cost:</span>
                <span>${product.costRollup.totalCost.toFixed(2)}</span>
            </div>
          </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {product.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{product.tags.length - 3}
                  </span>
                )}
                 </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1 text-sm">
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button variant="secondary" className="flex-1 text-sm">
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
                </div>
              </div>
            </div>
      </Card>
    );
  };

  // Product List Row Component
  const ProductRow: React.FC<{ product: Product }> = ({ product }) => {
    const TypeIcon = getTypeIcon(product.type);
    const stockStatus = getStockStatus(product.materials);

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedProducts.includes(product.id)}
              onChange={() => handleProductSelect(product.id)}
              className="rounded border-gray-300"
              aria-label={`Select ${product.name}`}
            />
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded" />
              ) : (
                <TypeIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                         </div>
        </td>
        <td className="px-4 py-3">
          <div>
            <div className="font-medium text-gray-900">{product.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(product.type)}`}>
                {product.type.replace('_', ' ')}
                        </span>
              {product.sku && (
                <span className="text-xs text-gray-500">SKU: {product.sku}</span>
              )}
                      </div>
                      </div>
        </td>
        <td className="px-4 py-3 text-gray-900 font-medium">
          ${product.price.toFixed(2)}
        </td>
        <td className="px-4 py-3 text-gray-600">
          ${product.costRollup.totalCost.toFixed(2)}
        </td>
        <td className="px-4 py-3">
          <span className={`font-medium ${getMarginColor(product.costRollup.marginPct)}`}>
            {product.costRollup.marginPct.toFixed(1)}%
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {stockStatus.status === 'low' ? (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Low ({stockStatus.count})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">OK</span>
                              </div>
            )}
                          </div>
                        </td>
        <td className="px-4 py-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {new Date(product.updatedAt).toLocaleDateString()}
                        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="p-1">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" className="p-1">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" className="p-1">
              <MoreVertical className="w-4 h-4" />
            </Button>
                          </div>
                        </td>
                      </tr>
    );
  };

  return (
    <VendorDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader
          title="Product Cards"
          description="Manage your product inventory and recipes"
          currentView="Products"
          icon={Package}
          iconColor="text-[#5B6E02]"
          iconBg="bg-[#5B6E02]/10"
        />

        {/* Motivational Quote */}
        <MotivationalQuote
          quote={getQuoteByCategory('success').quote}
          author={getQuoteByCategory('success').author}
          icon={getQuoteByCategory('success').icon}
          variant={getQuoteByCategory('success').variant}
        />

        {/* Toolbar */}
        <Card className="bg-[#F7F2EC] shadow-sm border border-gray-200">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left side - Actions */}
              <div className="flex items-center gap-3">
                <Button
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                        Add Product
                        <ChevronDown className="w-4 h-4" />
                </Button>
                
                <Button variant="secondary" className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Import CSV
                </Button>

                {selectedProducts.length > 0 && (
                  <Button variant="secondary" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export ({selectedProducts.length})
                  </Button>
                      )}
                    </div>

              {/* Right side - AI Insights */}
                      <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowAIInsights(!showAIInsights)}
                  className="flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  AI Insights
                  {aiInsights.length > 0 && (
                    <span className="px-2 py-1 bg-[#5B6E02] text-white text-xs rounded-full">
                      {aiInsights.length}
                        </span>
                  )}
                </Button>
                      </div>
                    </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 mt-4 pt-4 border-t border-gray-200">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                />
                  </div>

              {/* Category Filter */}
                    <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name} ({category._count.products})
                          </option>
                        ))}
                    </select>

              {/* Type Filter */}
                      <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ProductType | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                aria-label="Filter by product type"
              >
                <option value="">All Types</option>
                <option value="FOOD">Food</option>
                <option value="NON_FOOD">Non-Food</option>
                <option value="SERVICE">Service</option>
                      </select>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                         onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as 'name' | 'price' | 'updatedAt');
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6E02] focus:border-transparent"
                aria-label="Sort products"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low-High</option>
                <option value="price-desc">Price High-Low</option>
                <option value="updatedAt-desc">Recently Updated</option>
                <option value="updatedAt-asc">Oldest Updated</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                    </button>
                          <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                          </button>
                             </div>
                           </div>
                    </div>
        </Card>

        {/* AI Insights Drawer */}
        {showAIInsights && (
          <Card className="bg-[#F7F2EC] shadow-sm border border-gray-200">
            <div className="p-4">
                       <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#5B6E02]/10 rounded-lg">
                    <Brain className="w-5 h-5 text-[#5B6E02]" />
                          </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Pricing Insights</h3>
                    <p className="text-sm text-gray-600">Smart pricing recommendations based on costs and market data</p>
                          </div>
                        </div>
                <Button variant="ghost" onClick={() => setShowAIInsights(false)}>
                                    <X className="w-4 h-4" />
                </Button>
                              </div>

              {aiInsightsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#5B6E02]" />
                  <span className="ml-2 text-gray-600">Analyzing pricing...</span>
                        </div>
                       ) : (
                         <div className="space-y-3">
                  {aiInsights.map(insight => (
                    <div key={insight.productId} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {insight.imageUrl ? (
                            <img src={insight.imageUrl} alt={insight.productName} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                       <div>
                          <div className="font-medium text-gray-900">{insight.productName}</div>
                          <div className="text-sm text-gray-600">{insight.reasoning}</div>
                         </div>
                       </div>
                      <div className="flex items-center gap-4">
                          <div className="text-right">
                          <div className="text-sm text-gray-500">Current: ${insight.currentPrice.toFixed(2)}</div>
                          <div className="font-medium text-gray-900">${insight.recommendedPrice.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">
                            {insight.recommendation === 'increase' ? '↑' : insight.recommendation === 'decrease' ? '↓' : '→'} 
                            {insight.projectedMargin.toFixed(1)}% margin
                          </div>
                        </div>
                        <Button className="bg-[#5B6E02] text-white hover:bg-[#5B6E02]/90 text-sm px-3 py-1">
                          Apply
                        </Button>
            </div>
                          </div>
                        ))}
                    </div>
                  )}
                      </div>
          </Card>
        )}

        {/* Products Content */}
        {productsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#5B6E02]" />
            <span className="ml-3 text-gray-600">Loading products...</span>
                </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
                 ))}
               </div>
        ) : (
          <Card className="bg-[#F7F2EC] shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                         <input
              type="checkbox"
              checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
              aria-label="Select all products"
            />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Cost</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Margin</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Updated</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map(product => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                       </tbody>
                     </table>
                   </div>
          </Card>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && !productsLoading && (
          <Card className="bg-[#F7F2EC] shadow-sm border border-gray-200">
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory || selectedType
                  ? 'Try adjusting your filters to see more products.'
                  : 'Get started by creating your first product.'}
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
               </div>
          </Card>
         )}
          </div>
    </VendorDashboardLayout>
  );
};

export default VendorProductsPage; 
