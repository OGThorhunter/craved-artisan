import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MotivationalQuote from '@/components/dashboard/MotivationalQuote';
import { getQuoteByCategory } from '@/data/motivationalQuotes';
import EnhancedProductModal from '@/components/products/EnhancedProductModal';
import AddProductWizard from '@/components/products/AddProductWizard';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
  X,
  Loader2,
  FileText,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type ProductType = 'FOOD' | 'NON_FOOD' | 'SERVICE' | 'CLASSES';

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
  // Classes/Training specific fields
  availableSeats?: number;
  costPerSeat?: number;
  duration?: string; // e.g., "3 hours", "2 days"
  // Additional product fields
  batchSize?: number;
  creationTimeMinutes?: number;
  leadTimeDays?: number;
  instructions?: string;
  sops?: string;
  allergenFlags?: string[];
  categoryId?: string;
  vendorProfileId?: string;
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

interface EnhancedProductData {
  id?: string;
  name: string;
  description: string;
  type: ProductType;
  price: number;
  baseCost: number;
  laborCost: number;
  sku?: string;
  batchSize?: number;
  creationTimeMinutes?: number;
  leadTimeDays?: number;
  instructions?: string;
  sops?: string;
  categoryId?: string;
  tags?: string[];
  allergenFlags?: string[];
  active?: boolean;
  images?: Array<{ imageUrl: string }>;
  availableSeats?: number;
  costPerSeat?: number;
  duration?: string;
  ingredients?: Array<{
    name: string;
    amount: number;
    unit: string;
    cost: number;
    inventoryItemId?: string;
    quantity?: number;
    notes?: string;
    isOptional?: boolean;
    inventoryItem?: {
      avg_cost?: number;
    };
  }>;
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
  {
    id: '3',
    name: 'Artisan Sourdough Bread Making Class',
    slug: 'artisan-sourdough-bread-making-class',
    type: 'CLASSES',
    description: 'Learn the art of traditional sourdough bread making in this hands-on 3-hour workshop. Perfect for beginners and those looking to improve their technique.',
    price: 75.00,
    baseCost: 25.00,
    laborCost: 50.00,
    imageUrl: '/images/sourdough-class.jpg',
    active: true,
    sku: 'CLASS-001',
    category: { name: 'Classes / Training' },
    subcategory: { name: 'Bread Making' },
    tags: ['sourdough', 'bread-making', 'hands-on', 'workshop'],
    availableSeats: 25,
    costPerSeat: 75.00,
    duration: '3 hours',
    costRollup: {
      materialsCost: 15.00,
      laborCost: 50.00,
      baseCost: 25.00,
      totalCost: 25.00,
      marginAtPrice: 50.00,
      marginPct: 66.7,
    },
    materials: [
      {
        qty: 25,
        unit: 'portion',
        inventoryItem: { name: 'Flour', currentQty: 100, reorderPoint: 20 },
      },
      {
        qty: 25,
        unit: 'portion',
        inventoryItem: { name: 'Salt', currentQty: 50, reorderPoint: 10 },
      },
    ],
    variants: [],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '4',
    name: 'Advanced Pastry Techniques Workshop',
    slug: 'advanced-pastry-techniques-workshop',
    type: 'CLASSES',
    description: 'Master advanced pastry techniques including laminated doughs, chocolate work, and decorative piping. This intensive 2-day workshop is designed for experienced bakers.',
    price: 250.00,
    baseCost: 75.00,
    laborCost: 175.00,
    imageUrl: '/images/pastry-workshop.jpg',
    active: true,
    sku: 'CLASS-002',
    category: { name: 'Classes / Training' },
    subcategory: { name: 'Pastry Techniques' },
    tags: ['pastry', 'advanced', 'chocolate', 'decorating', 'workshop'],
    availableSeats: 12,
    costPerSeat: 250.00,
    duration: '2 days',
    costRollup: {
      materialsCost: 45.00,
      laborCost: 175.00,
      baseCost: 75.00,
      totalCost: 75.00,
      marginAtPrice: 175.00,
      marginPct: 70.0,
    },
    materials: [
      {
        qty: 12,
        unit: 'kit',
        inventoryItem: { name: 'Premium Chocolate', currentQty: 30, reorderPoint: 5 },
      },
      {
        qty: 12,
        unit: 'kit',
        inventoryItem: { name: 'Butter', currentQty: 80, reorderPoint: 15 },
      },
    ],
    variants: [],
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z',
  },
  {
    id: '5',
    name: 'Cake Decorating Fundamentals',
    slug: 'cake-decorating-fundamentals',
    type: 'CLASSES',
    description: 'Learn the basics of cake decorating including buttercream techniques, fondant work, and simple piping designs. Great for beginners and hobbyists.',
    price: 95.00,
    baseCost: 35.00,
    laborCost: 60.00,
    imageUrl: '/images/cake-decorating-class.jpg',
    active: true,
    sku: 'CLASS-003',
    category: { name: 'Classes / Training' },
    subcategory: { name: 'Cake Decorating' },
    tags: ['cake-decorating', 'buttercream', 'fondant', 'beginner', 'fundamentals'],
    availableSeats: 20,
    costPerSeat: 95.00,
    duration: '4 hours',
    costRollup: {
      materialsCost: 20.00,
      laborCost: 60.00,
      baseCost: 35.00,
      totalCost: 35.00,
      marginAtPrice: 60.00,
      marginPct: 63.2,
    },
    materials: [
      {
        qty: 20,
        unit: 'kit',
        inventoryItem: { name: 'Fondant', currentQty: 25, reorderPoint: 8 },
      },
      {
        qty: 20,
        unit: 'kit',
        inventoryItem: { name: 'Food Coloring', currentQty: 40, reorderPoint: 10 },
      },
    ],
    variants: [],
    createdAt: '2024-01-30T10:00:00Z',
    updatedAt: '2024-01-30T10:00:00Z',
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
    _count: { products: 1 },
  },
  {
    id: '3',
    name: 'Classes / Training',
    children: [],
    subcategories: [
      { id: '3-1', name: 'Bread Making' },
      { id: '3-2', name: 'Pastry Techniques' },
      { id: '3-3', name: 'Cake Decorating' },
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
  // Query client
  const queryClient = useQueryClient();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<ProductType | ''>('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'updatedAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showEnhancedModal, setShowEnhancedModal] = useState(false);
  const [showDocumentImportModal, setShowDocumentImportModal] = useState(false);
  const [isDocumentUploading, setIsDocumentUploading] = useState(false);
  const [showParseReview, setShowParseReview] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [editingParsedProduct, setEditingParsedProduct] = useState<Product | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProductWizard, setShowProductWizard] = useState(false);
  
  // Mock inventory items for ingredient selection
  const mockInventoryItems = [
    { id: '1', name: 'Organic Flour', category: 'FOOD_GRADE', unit: 'kg', current_qty: 50, reorder_point: 10, avg_cost: 2.50 },
    { id: '2', name: 'Sea Salt', category: 'FOOD_GRADE', unit: 'g', current_qty: 1000, reorder_point: 200, avg_cost: 0.05 },
    { id: '3', name: 'Active Yeast', category: 'FOOD_GRADE', unit: 'g', current_qty: 500, reorder_point: 100, avg_cost: 0.15 },
    { id: '4', name: 'Olive Oil', category: 'FOOD_GRADE', unit: 'ml', current_qty: 2000, reorder_point: 500, avg_cost: 0.08 },
    { id: '5', name: 'Sugar', category: 'FOOD_GRADE', unit: 'kg', current_qty: 25, reorder_point: 5, avg_cost: 1.20 },
  ];
  
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
      case 'CLASSES': return Users; // Using Users icon for classes/training
      case 'NON_FOOD': return Package;
      default: return Package;
    }
  };

  const getTypeColor = (type: ProductType) => {
    switch (type) {
      case 'FOOD': return 'bg-green-100 text-green-800';
      case 'SERVICE': return 'bg-blue-100 text-blue-800';
      case 'CLASSES': return 'bg-purple-100 text-purple-800';
      case 'NON_FOOD': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMarginColor = (marginPct: number) => {
    if (marginPct < 20) return 'text-red-600';
    if (marginPct < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockStatus = (materials: Product['materials']) => {
    if (!materials || materials.length === 0) {
      return { status: 'ok', count: 0 };
    }
    
    const lowStockItems = materials.filter(material => 
      material?.inventoryItem?.currentQty <= material?.inventoryItem?.reorderPoint
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

  // Product creation handlers
  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setShowEnhancedModal(true);
  };

  const handleSaveEnhancedProduct = async (productData: EnhancedProductData) => {
    try {
    // In a real app, you would make an API call here
      console.log('Creating/updating product:', productData);
      
      // For now, add to the products list (mock save)
      const newProduct: Product = {
        id: productData.id || `product-${Date.now()}`,
        name: productData.name,
        slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
        description: productData.description || '',
        type: productData.type,
        price: productData.price,
        baseCost: productData.baseCost || 0,
        laborCost: productData.laborCost || 0,
        sku: productData.sku,
        batchSize: productData.batchSize,
        creationTimeMinutes: productData.creationTimeMinutes,
        leadTimeDays: productData.leadTimeDays,
        instructions: productData.instructions || '',
        sops: productData.sops || '',
        categoryId: productData.categoryId,
        tags: productData.tags || [],
        allergenFlags: productData.allergenFlags || [],
        active: productData.active !== false,
        imageUrl: productData.images?.[0]?.imageUrl || '',
        materials: productData.ingredients?.map((ing) => ({
          qty: ing.quantity || ing.amount,
          unit: ing.unit,
          inventoryItem: {
            name: ing.name,
            currentQty: 100,
            reorderPoint: 20
          }
        })) || [],
        costRollup: {
          materialsCost: productData.ingredients?.reduce((sum: number, ing) => 
            sum + (ing.cost || 0), 0) || 0,
          laborCost: productData.laborCost || 0,
          baseCost: productData.baseCost || 0,
          totalCost: (productData.ingredients?.reduce((sum: number, ing) => 
            sum + (ing.cost || 0), 0) || 0) + (productData.laborCost || 0),
          marginAtPrice: productData.price || 0,
          marginPct: productData.price > 0 ? 
            (((productData.price - ((productData.ingredients?.reduce((sum: number, ing) => 
              sum + (ing.cost || 0), 0) || 0) + (productData.laborCost || 0))) / productData.price) * 100) : 0
        },
        variants: [],
        availableSeats: productData.availableSeats,
        costPerSeat: productData.costPerSeat,
        duration: productData.duration,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        vendorProfileId: 'vendor-1'
      };

      // Update products list in cache
      queryClient.setQueryData(['products', { searchQuery, selectedCategory, selectedType, sortBy, sortOrder }], (oldData: Product[] = []) => {
        if (productData.id) {
          // Update existing product
          return oldData.map(p => p.id === productData.id ? newProduct : p);
        } else {
          // Add new product
          return [...oldData, newProduct];
        }
      });

      alert('Product saved successfully!');
      setShowEnhancedModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  // Document import handlers - removed as replaced by wizard

  const handleWizardComplete = (productData: {
    name?: string;
    description?: string;
    type?: string;
    price?: number;
    baseCost?: number;
    laborCost?: number;
    sku?: string;
    autoGenerateSku?: boolean;
    batchSize?: number;
    creationTimeMinutes?: number;
    leadTimeDays?: number;
    instructions?: string;
    sops?: string;
    categoryId?: string;
    tags?: string[];
    allergenFlags?: string[];
    active?: boolean;
    ingredients?: Array<{
      inventoryItemId: string;
      quantity: number;
      unit: string;
      notes?: string;
      isOptional: boolean;
    }>;
    images?: Array<{
      imageUrl: string;
      altText?: string;
      isPrimary: boolean;
      sortOrder: number;
    }>;
    documents?: Array<{
      title: string;
      documentUrl: string;
      type: 'SOP' | 'INSTRUCTION' | 'NUTRITION' | 'ALLERGEN';
      description?: string;
    }>;
    availableSeats?: number;
    costPerSeat?: number;
    duration?: string;
  }) => {
    // Convert wizard data to product format
    const totalCost = (productData.baseCost || 0) + (productData.laborCost || 0);
    const marginPct = productData.price && productData.price > 0 && totalCost > 0
      ? parseFloat((((productData.price - totalCost) / productData.price) * 100).toFixed(1))
      : 0;

    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: productData.name || 'New Product',
      slug: (productData.name || 'new-product').toLowerCase().replace(/\s+/g, '-'),
      type: (productData.type as ProductType) || 'FOOD',
      description: productData.description || '',
      price: productData.price || 0,
      baseCost: productData.baseCost || 0,
      laborCost: productData.laborCost || 0,
      imageUrl: productData.images?.[0]?.imageUrl || '',
      active: productData.active !== undefined ? productData.active : true,
      sku: productData.sku || `WIZ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      category: { name: 'General' },
      subcategory: { name: 'General' },
      tags: productData.tags || [],
      allergenFlags: productData.allergenFlags || [],
      batchSize: productData.batchSize,
      creationTimeMinutes: productData.creationTimeMinutes,
      leadTimeDays: productData.leadTimeDays,
      instructions: productData.instructions || '',
      sops: productData.sops || '',
      materials: productData.ingredients?.map((ing) => {
        const invItem = mockInventoryItems.find(item => item.id === ing.inventoryItemId);
        return {
          qty: ing.quantity,
          unit: ing.unit,
          inventoryItem: {
            name: invItem?.name || 'Unknown',
            currentQty: invItem?.current_qty || 0,
            reorderPoint: invItem?.reorder_point || 0
          }
        };
      }) || [],
      variants: [],
      costRollup: {
        materialsCost: productData.ingredients?.reduce((sum, ing) => {
          const invItem = mockInventoryItems.find(item => item.id === ing.inventoryItemId);
          return sum + (ing.quantity * (invItem?.avg_cost || 0));
        }, 0) || 0,
        laborCost: productData.laborCost || 0,
        baseCost: productData.baseCost || 0,
        totalCost: totalCost,
        marginAtPrice: productData.price || 0,
        marginPct: marginPct
      },
      availableSeats: productData.availableSeats,
      costPerSeat: productData.availableSeats && productData.price 
        ? productData.price / productData.availableSeats 
        : undefined,
      duration: productData.duration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      vendorProfileId: 'vendor-1'
    };

    // Add to products list
    queryClient.setQueryData(['products', { searchQuery, selectedCategory, selectedType, sortBy, sortOrder }], (oldData: Product[] = []) => {
      return [...oldData, newProduct];
    });

    // Show success message
    alert('Product created successfully with all details!');
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsDocumentUploading(true);
    
    try {
      // Simulate document parsing with AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock parsed products from document - these will be shown for review
      const mockParsedProducts: Product[] = [
        {
          id: `parsed-product-${Date.now()}-1`,
          name: 'Artisan Sourdough Bread',
          slug: 'artisan-sourdough-bread',
          description: 'Traditional sourdough bread made with organic flour and natural fermentation',
        type: 'FOOD',
          price: 8.50,
          baseCost: 3.20,
          laborCost: 2.50,
          sku: `FD-ARTS-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          batchSize: 4,
          creationTimeMinutes: 480,
          leadTimeDays: 1,
          instructions: 'Mix starter, flour, water, and salt. Ferment overnight. Shape and proof. Bake at 450°F for 30 minutes.',
          sops: 'Standard sourdough bread making procedure',
          categoryId: 'cat-1',
          tags: ['sourdough', 'artisan', 'organic'],
          allergenFlags: ['gluten', 'wheat'],
          active: true,
          imageUrl: '',
          materials: [],
          variants: [],
          costRollup: {
            materialsCost: 3.20,
            laborCost: 2.50,
            baseCost: 3.20,
            totalCost: 5.70,
            marginAtPrice: 8.50,
            marginPct: 32.9
          },
          availableSeats: undefined,
          costPerSeat: undefined,
          duration: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          vendorProfileId: 'vendor-1'
        },
        {
          id: `parsed-product-${Date.now()}-2`,
          name: 'Chocolate Chip Cookies',
          slug: 'chocolate-chip-cookies',
          description: 'Soft and chewy chocolate chip cookies with premium dark chocolate',
          type: 'FOOD',
          price: 3.75,
          baseCost: 1.80,
          laborCost: 1.20,
          sku: `FD-COOK-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          batchSize: 24,
          creationTimeMinutes: 45,
          leadTimeDays: 0,
          instructions: 'Mix butter, sugars, eggs, and vanilla. Add flour and chocolate chips. Bake at 375°F for 10-12 minutes.',
          sops: 'Cookie production standard operating procedure',
          categoryId: 'cat-1',
          tags: ['cookies', 'chocolate', 'dessert'],
          allergenFlags: ['gluten', 'wheat', 'eggs', 'dairy'],
          active: true,
          imageUrl: '',
          materials: [],
          variants: [],
          costRollup: {
            materialsCost: 1.80,
            laborCost: 1.20,
            baseCost: 1.80,
            totalCost: 3.00,
            marginAtPrice: 3.75,
            marginPct: 20.0
          },
          availableSeats: undefined,
          costPerSeat: undefined,
          duration: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          vendorProfileId: 'vendor-1'
        },
        {
          id: `parsed-product-${Date.now()}-3`,
          name: 'Sourdough Baking Class',
          slug: 'sourdough-baking-class',
          description: 'Learn the art of sourdough bread making in this hands-on workshop',
          type: 'CLASSES',
          price: 85.00,
          baseCost: 15.00,
          laborCost: 45.00,
          sku: `CL-SOUR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          batchSize: undefined,
          creationTimeMinutes: undefined,
          leadTimeDays: 0,
          instructions: '3-hour hands-on class covering starter maintenance, mixing, shaping, and baking techniques',
          sops: 'Class instruction and safety procedures',
          categoryId: 'cat-2',
          tags: ['class', 'education', 'sourdough', 'baking'],
          allergenFlags: [],
          active: true,
          imageUrl: '',
          materials: [],
          variants: [],
          costRollup: {
            materialsCost: 15.00,
            laborCost: 45.00,
            baseCost: 15.00,
            totalCost: 60.00,
            marginAtPrice: 85.00,
            marginPct: 29.4
          },
          availableSeats: 8,
          costPerSeat: 10.63,
          duration: '3 hours',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          vendorProfileId: 'vendor-1'
        }
      ];

      setParsedProducts(mockParsedProducts);
      setShowDocumentImportModal(false);
      setShowParseReview(true);
    } catch (error) {
      console.error('Document parsing error:', error);
      alert('Failed to parse document. Please try again.');
    } finally {
      setIsDocumentUploading(false);
    }
  };

  // Parse review handlers
  const handleSaveParsedProducts = () => {
    // Add parsed products to the products list
    queryClient.setQueryData(['products', { searchQuery, selectedCategory, selectedType, sortBy, sortOrder }], (oldData: Product[] = []) => {
      return [...oldData, ...parsedProducts];
    });

    alert(`Successfully created ${parsedProducts.length} products from document!`);
    setShowParseReview(false);
    setParsedProducts([]);
    setUploadedFile(null);
  };

  const handleEditParsedProduct = (product: Product) => {
    setEditingParsedProduct(product);
  };

  const handleUpdateParsedProduct = (updatedProduct: Product) => {
    setParsedProducts(prev => 
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
    setEditingParsedProduct(null);
  };

  const handleRemoveParsedProduct = (productId: string) => {
    setParsedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleCancelParseReview = () => {
    setShowParseReview(false);
    setParsedProducts([]);
    setUploadedFile(null);
    setEditingParsedProduct(null);
  };

  // Export handlers
  const handleIndividualExport = (product: Product, format: 'json' | 'csv' = 'csv') => {
    if (format === 'json') {
      const exportData = {
        ...product,
        exportedAt: new Date().toISOString(),
        exportType: 'individual'
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${product.name.replace(/[^a-zA-Z0-9]/g, '_')}_product.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else {
      // CSV export
      const csvData = {
        'Product Name': product.name,
        'SKU': product.sku || '',
        'Type': product.type,
        'Price': product.price,
        'Base Cost': product.baseCost,
        'Labor Cost': product.laborCost,
        'Total Cost': product.costRollup.totalCost,
        'Margin %': product.costRollup.marginPct,
        'Description': product.description,
        'Instructions': product.instructions,
        'SOPs': product.sops,
        'Batch Size': product.batchSize || '',
        'Creation Time (minutes)': product.creationTimeMinutes || '',
        'Lead Time (days)': product.leadTimeDays || '',
        'Tags': product.tags.join(', '),
        'Allergens': product.allergenFlags?.join(', ') ?? '',
        'Active': product.active,
        'Created': product.createdAt,
        'Updated': product.updatedAt
      };
      
      const headers = Object.keys(csvData);
      const values = Object.values(csvData);
      
      const csvContent = [
        headers.join(','),
        values.map(val => typeof val === 'string' && val.includes(',') ? `"${val}"` : val).join(',')
      ].join('\n');
      
      const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
      const exportFileDefaultName = `${product.name.replace(/[^a-zA-Z0-9]/g, '_')}_product.csv`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const handleBulkExport = () => {
    setShowExportModal(true);
  };

  const handleExportCSV = () => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    
    // Create CSV header
    const headers = ['Name', 'Type', 'SKU', 'Category', 'Price', 'Cost', 'Margin %', 'Status', 'Tags'];
    
    // Create CSV rows
    const rows = selectedProductsData.map(product => [
      product.name,
      product.type,
      product.sku || '',
      product.category?.name || '',
      `$${product.price.toFixed(2)}`,
      `$${product.costRollup?.totalCost?.toFixed(2) || '0.00'}`,
      `${product.costRollup?.marginPct?.toFixed(1) || '0.0'}%`,
      product.active ? 'Active' : 'Inactive',
      product.tags.join(', ')
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const handleExportPDF = () => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add header with logo/branding
    doc.setFillColor(91, 110, 2); // #5B6E02
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Product Catalog', 14, 20);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exported on ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 14, 30);
    
    // Summary stats
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Total Products: ${selectedProductsData.length}`, pageWidth - 14, 20, { align: 'right' });
    
    const totalValue = selectedProductsData.reduce((sum, p) => sum + p.price, 0);
    doc.text(`Total Value: $${totalValue.toFixed(2)}`, pageWidth - 14, 26, { align: 'right' });
    
    const avgMargin = selectedProductsData.reduce((sum, p) => sum + (p.costRollup?.marginPct || 0), 0) / selectedProductsData.length;
    doc.text(`Avg Margin: ${avgMargin.toFixed(1)}%`, pageWidth - 14, 32, { align: 'right' });
    
    // Add table
    const tableData = selectedProductsData.map(product => [
      product.name,
      product.type,
      product.category?.name || '',
      `$${product.price.toFixed(2)}`,
      `$${product.costRollup?.totalCost?.toFixed(2) || '0.00'}`,
      `${product.costRollup?.marginPct?.toFixed(1) || '0.0'}%`,
      product.active ? '✓' : '✗'
    ]);
    
    (doc as any).autoTable({
      startY: 50,
      head: [['Product Name', 'Type', 'Category', 'Price', 'Cost', 'Margin', 'Active']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [91, 110, 2],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [247, 242, 236] // #F7F2EC
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 30 },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 20, halign: 'right' },
        6: { cellWidth: 15, halign: 'center' }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: function(data: any) {
        // Footer
        const pageCount = doc.getNumberOfPages();
        const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${currentPage} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
        doc.text(
          'CravedArtisan - Product Management',
          pageWidth - 14,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'right' }
        );
      }
    });
    
    // Save the PDF
    doc.save(`products_catalog_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportModal(false);
  };


  // Product view and edit handlers
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEditProduct = (product: Product) => {
    // Convert Product to EnhancedProduct format
    const enhancedProduct = {
      ...product,
      autoGenerateSku: false,
      allergenFlags: [],
      ingredients: [],
      images: [],
      documents: []
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSelectedProduct(enhancedProduct as any);
    setShowEnhancedModal(true);
  };

  // Product Card Component
  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const TypeIcon = getTypeIcon(product.type);
    const stockStatus = getStockStatus(product.materials);

  return (
      <Card className="bg-[#F7F2EC] shadow-sm border border-gray-200 hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="p-4 flex flex-col h-full">
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
              <div className="relative group">
                <button 
                  className="p-1 hover:bg-gray-100 rounded" 
                  aria-label="Export product"
                  title="Export product"
                >
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
                <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[120px]">
                  <button
                    className="w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIndividualExport(product, 'csv');
                    }}
                  >
                    Export as CSV
                  </button>
                  <button
                    className="w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIndividualExport(product, 'json');
                    }}
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
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
          <div className="flex flex-col h-full">
            <div className="space-y-2 flex-1">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
            )}
            
            {/* Price and Margin */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  {product.type === 'CLASSES' 
                    ? `$${product.costPerSeat?.toFixed(2) || '0.00'}/seat`
                    : `$${product.price.toFixed(2)}`
                  }
                </span>
              <span className={`text-sm font-medium ${getMarginColor(product.costRollup.marginPct)}`}>
                {product.costRollup.marginPct.toFixed(1)}% margin
              </span>
            </div>

              {/* Classes-specific information */}
              {product.type === 'CLASSES' && (
                <div className="text-xs text-gray-500 space-y-1 bg-purple-50 p-2 rounded">
                  <div className="flex justify-between">
                    <span>Available Seats:</span>
                    <span className="font-medium text-purple-700">{product.availableSeats || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium text-purple-700">{product.duration || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between font-medium text-purple-800">
                    <span>Total Revenue:</span>
                    <span>${product.price.toFixed(2)}</span>
                  </div>
                </div>
              )}

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
            </div>

            {/* Actions - Always at bottom */}
            <div className="flex gap-2 pt-4 mt-auto">
              <Button 
                variant="secondary" 
                className="flex-1 text-sm"
                onClick={() => handleViewProduct(product)}
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1 text-sm"
                onClick={() => handleEditProduct(product)}
              >
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
                  onClick={() => setShowProductWizard(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                  Add Product Wizard
                </Button>
                
                {selectedProducts.length > 0 && !showEnhancedModal && (
                <Button
                  variant="secondary"
                  className="flex items-center gap-2"
                    onClick={handleBulkExport}
                  >
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
              <Button onClick={handleCreateProduct}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
               </div>
          </Card>
         )}

        {/* Enhanced Product Modal */}
        <EnhancedProductModal
          isOpen={showEnhancedModal}
          onClose={() => setShowEnhancedModal(false)}
          onSave={(product) => handleSaveEnhancedProduct(product as unknown as EnhancedProductData)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          product={selectedProduct as any}
          categories={categories}
          inventoryItems={mockInventoryItems}
        />

        {/* Document Import Modal */}
        {showDocumentImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Import Products from Document
                </h2>
                <button
                  onClick={() => setShowDocumentImportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Product Document</h3>
                  <p className="text-gray-600">
                    Upload a document with product information and our AI will parse it for your review before creating products.
                  </p>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
                    <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.csv"
                    onChange={handleDocumentUpload}
                    disabled={isDocumentUploading}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className={`cursor-pointer ${isDocumentUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-center">
                      {isDocumentUploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                          <span className="text-sm text-gray-600">Parsing document...</span>
                  </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Click to upload document</span>
                          <span className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT, CSV up to 10MB</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                
                <div className="text-xs text-gray-500 mb-4">
                  Supported formats: PDF, DOC, DOCX, TXT, CSV. Max file size: 10MB
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg text-left">
                  <h4 className="font-medium text-blue-900 mb-2">What gets extracted:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Product names and descriptions</li>
                    <li>• Pricing and cost information</li>
                    <li>• Product types and categories</li>
                    <li>• Creation instructions and SOPs</li>
                    <li>• Batch sizes and timing</li>
                    <li>• Class details (seats, duration)</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowDocumentImportModal(false)}
                  disabled={isDocumentUploading}
                >
                  Cancel
                </Button>
                  </div>
            </div>
          </div>
        )}

        {/* AI Parse Review Modal */}
        {showParseReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI Parse Review - {uploadedFile?.name}
                </h2>
                <button
                  onClick={handleCancelParseReview}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left side - Uploaded Document */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Uploaded Document</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {uploadedFile && (
                      <div className="space-y-2">
                        <FileText className="w-12 h-12 text-blue-600 mx-auto" />
                        <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-sm text-gray-500">
                          Type: {uploadedFile.type || 'Unknown'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">AI Analysis Summary:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Found {parsedProducts.length} products</li>
                      <li>• Extracted pricing, ingredients, and instructions</li>
                      <li>• Identified product types and categories</li>
                      <li>• Calculated cost breakdowns</li>
                    </ul>
                  </div>
                </div>

                {/* Right side - Parsed Products */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Parsed Products</h3>
                    <span className="text-sm text-gray-500">{parsedProducts.length} products found</span>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {parsedProducts.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditParsedProduct(product)}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemoveParsedProduct(product.id)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                            <span className="font-medium text-gray-700">Type:</span>
                            <span className="ml-2 text-gray-900">{product.type}</span>
                  </div>
                  <div>
                            <span className="font-medium text-gray-700">Price:</span>
                            <span className="ml-2 text-gray-900">${product.price}</span>
                  </div>
                          <div>
                            <span className="font-medium text-gray-700">Base Cost:</span>
                            <span className="ml-2 text-gray-900">${product.baseCost}</span>
                </div>
                  <div>
                            <span className="font-medium text-gray-700">Margin:</span>
                            <span className="ml-2 text-gray-900">{product.costRollup.marginPct.toFixed(1)}%</span>
                  </div>
                          {product.type === 'CLASSES' && (
                            <>
                  <div>
                                <span className="font-medium text-gray-700">Seats:</span>
                                <span className="ml-2 text-gray-900">{product.availableSeats}</span>
                  </div>
                              <div>
                                <span className="font-medium text-gray-700">Duration:</span>
                                <span className="ml-2 text-gray-900">{product.duration}</span>
                              </div>
                            </>
                          )}
                </div>
                
                        <div className="mt-3">
                          <span className="font-medium text-gray-700">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Review and edit the parsed data before creating products
                </div>
                <div className="flex gap-3">
                <Button
                  variant="secondary"
                    onClick={handleCancelParseReview}
                >
                  Cancel
                </Button>
                <Button
                    onClick={handleSaveParsedProducts}
                    disabled={parsedProducts.length === 0}
                    className="flex items-center gap-2"
                >
                    <CheckCircle className="w-4 h-4" />
                    Create {parsedProducts.length} Products
                </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Parsed Product Modal */}
        {editingParsedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Edit Parsed Product</h2>
                <button
                  onClick={() => setEditingParsedProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editingParsedProduct.name}
                    onChange={(e) => setEditingParsedProduct({...editingParsedProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingParsedProduct.description || ''}
                    onChange={(e) => setEditingParsedProduct({...editingParsedProduct, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                      type="number"
                      step="0.01"
                      value={editingParsedProduct.price}
                      onChange={(e) => setEditingParsedProduct({...editingParsedProduct, price: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                        </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingParsedProduct.baseCost}
                      onChange={(e) => setEditingParsedProduct({...editingParsedProduct, baseCost: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                        </div>
                    </div>

                {editingParsedProduct.type === 'CLASSES' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Available Seats</label>
                      <input
                        type="number"
                        value={editingParsedProduct.availableSeats || ''}
                        onChange={(e) => setEditingParsedProduct({...editingParsedProduct, availableSeats: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={editingParsedProduct.duration || ''}
                        onChange={(e) => setEditingParsedProduct({...editingParsedProduct, duration: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 3 hours"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <textarea
                    value={editingParsedProduct.instructions || ''}
                    onChange={(e) => setEditingParsedProduct({...editingParsedProduct, instructions: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setEditingParsedProduct(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateParsedProduct(editingParsedProduct)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Update Product
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View Product Modal */}
        {showViewModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedProduct.name}</h3>
                    {selectedProduct.imageUrl && (
                      <img 
                        src={selectedProduct.imageUrl} 
                        alt={selectedProduct.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedProduct.type)}`}>
                        {selectedProduct.type}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {selectedProduct.type === 'CLASSES' ? 'Cost per Seat' : 'Price'}
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedProduct.type === 'CLASSES' 
                          ? `$${selectedProduct.costPerSeat?.toFixed(2) || '0.00'}/seat`
                          : `$${selectedProduct.price.toFixed(2)}`
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Margin</label>
                      <p className="text-sm text-gray-900">{selectedProduct.costRollup.marginPct.toFixed(1)}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedProduct.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedProduct.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedProduct.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <p className="text-gray-900">{selectedProduct.description}</p>
                  </div>
                )}
                
                {/* Classes-specific information */}
                {selectedProduct.type === 'CLASSES' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-purple-900 mb-3">Class Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-700 mb-1">Available Seats</label>
                        <p className="text-lg font-semibold text-purple-900">{selectedProduct.availableSeats || 0}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-purple-700 mb-1">Duration</label>
                        <p className="text-lg font-semibold text-purple-900">{selectedProduct.duration || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-purple-700 mb-1">Total Revenue</label>
                        <p className="text-lg font-semibold text-purple-900">${selectedProduct.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Materials Cost</label>
                    <p className="text-gray-900">${selectedProduct.costRollup.materialsCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost</label>
                    <p className="text-gray-900">${selectedProduct.costRollup.laborCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
                    <p className="text-gray-900">${selectedProduct.costRollup.totalCost.toFixed(2)}</p>
                  </div>
                </div>
                
                {selectedProduct.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditProduct(selectedProduct);
                  }}
                >
                  Edit Product
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Wizard */}
        <AddProductWizard
          isOpen={showProductWizard}
          onClose={() => setShowProductWizard(false)}
          onComplete={handleWizardComplete}
          categories={mockCategories}
        />

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Export Products</h3>
                <button
                    onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                    title="Close"
                    aria-label="Close export modal"
                >
                    <X className="w-5 h-5" />
                </button>
              </div>
              
                <p className="text-gray-600 mb-6">
                  Choose your export format for {selectedProducts.length} selected product{selectedProducts.length !== 1 ? 's' : ''}:
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#5B6E02] hover:bg-[#F7F2EC] transition-all group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                      <FileText className="w-6 h-6 text-green-600" />
                  </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900">Export as CSV</div>
                      <div className="text-sm text-gray-600">Spreadsheet format for Excel, Google Sheets</div>
                  </div>
                  </button>
                  
                  <button
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#5B6E02] hover:bg-[#F7F2EC] transition-all group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200">
                      <FileText className="w-6 h-6 text-red-600" />
                  </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900">Export as PDF</div>
                      <div className="text-sm text-gray-600">Professional catalog with branding</div>
                  </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

          </div>
    </VendorDashboardLayout>
  );
};

export default VendorProductsPage; 
