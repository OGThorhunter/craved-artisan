import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Search,
  Package,
  DollarSign,
  Tag,
  Calendar,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  CheckSquare,
  Square,
  Settings,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Camera,
  FileText,
  Calculator,
  Users,
  Wrench,
  UtensilsCrossed,
  ShoppingBag,
  Printer,
  Share2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import { MOCK_INGREDIENTS, MOCK_UNITS, MOCK_TRADE_SUPPLIES, MOCK_TRADE_UNITS, calculateRecipeCost, calculateMarginAnalysis } from '../types/recipes';

// Enhanced Product Card interface
interface ProductCard {
  id: string;
  name: string;
  description?: string;
  category: 'food' | 'service' | 'non-food';
  subcategory: string;
  price: number;
  imageUrl?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Cost breakdown
  ingredients: ProductIngredient[];
  tradeSupplies?: ProductTradeSupply[];
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  profitMargin: number;
  
  // Recipe details (for food items)
  recipe?: {
    instructions: string[];
    prepTime: number;
    cookTime: number;
    servings: number;
    yield: number;
    yieldUnit: string;
  };
  
  // Service details (for service items)
  service?: {
    duration: number;
    skillLevel: 'beginner' | 'intermediate' | 'expert';
    requirements: string[];
  };
}

interface ProductIngredient {
  id: string;
  ingredientId: string;
  ingredient: any; // From MOCK_INGREDIENTS
  quantity: number;
  unit: string;
  cost: number;
  notes?: string;
}

interface ProductTradeSupply {
  id: string;
  supplyId: string;
  supply: any; // From MOCK_TRADE_SUPPLIES
  quantity: number;
  unit: string;
  cost: number;
  notes?: string;
}

interface CreateProductCardForm {
  name: string;
  description: string;
  category: 'food' | 'service' | 'non-food';
  subcategory: string;
  price: number;
  imageUrl: string;
  tags: string;
  ingredients: ProductIngredient[];
  tradeSupplies: ProductTradeSupply[];
  laborCost: number;
  overheadCost: number;
  profitMargin: number;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  subcategories: string[];
  description: string;
}

// Enhanced categories with icons and descriptions
const PRODUCT_CATEGORIES: Category[] = [
  {
         id: 'food',
     name: 'Food',
     icon: UtensilsCrossed,
     subcategories: ['Baked Goods', 'Preserved Foods', 'Fresh Produce', 'Beverages', 'Dairy', 'Meat & Seafood'],
     description: 'Food-based products with ingredient tracking and recipe management'
  },
  {
    id: 'service',
    name: 'Services',
    icon: Wrench,
    subcategories: ['Yard Work', 'Tattoo Services', 'Consulting', 'Maintenance', 'Creative Services', 'Other'],
    description: 'Service-based offerings with labor and material cost tracking'
  },
  {
    id: 'non-food',
    name: 'Non-Food Goods',
    icon: ShoppingBag,
    subcategories: ['Crafts', 'Textiles', 'Pottery', 'Jewelry', 'Home Decor', 'Other'],
    description: 'Handcrafted items with material and labor cost management'
  }
];

const EnhancedVendorProductsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State management

  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'totalCost' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Product card management
  const [showProductCard, setShowProductCard] = useState(false);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [editingCard, setEditingCard] = useState<ProductCard | null>(null);
  const [viewingCard, setViewingCard] = useState<ProductCard | null>(null);
  const [selectedCategoryForCard, setSelectedCategoryForCard] = useState<'food' | 'service' | 'non-food'>('food');
  
  // AI recipe parsing
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [parsingRecipe, setParsingRecipe] = useState(false);
  
  // Ingredient management
  const [ingredientLines, setIngredientLines] = useState<Array<{
    id: string;
    ingredientId: string;
    quantity: number;
    unit: string;
    cost: number;
  }>>([]);

  // Trade supply management
  const [tradeSupplyLines, setTradeSupplyLines] = useState<Array<{
    id: string;
    supplyId: string;
    quantity: number;
    unit: string;
    cost: number;
  }>>([]);
  
  // Unit conversion reference
  const [showUnitConverter, setShowUnitConverter] = useState(false);
  
  // Trade supplies modal
  const [showTradeSuppliesModal, setShowTradeSuppliesModal] = useState(false);
  
  // Mock product cards for development
  const [productCards, setProductCards] = useState<ProductCard[]>([
    {
      id: '1',
      name: 'Artisan Sourdough Bread',
      description: 'Traditional sourdough bread with crispy crust',
      category: 'food',
      subcategory: 'Baked Goods',
      price: 12.99,
      imageUrl: '',
      tags: ['bread', 'sourdough', 'artisan'],
      isActive: true,
      createdAt: '2025-08-30',
      updatedAt: '2025-08-30',
      ingredients: [
        {
          id: '1',
          ingredientId: '1',
          ingredient: MOCK_INGREDIENTS[0],
          quantity: 3.5,
          unit: 'kg',
          cost: 8.75,
          notes: 'High protein content'
        }
      ],
      laborCost: 15.00,
      overheadCost: 2.50,
      totalCost: 26.25,
      profitMargin: 30,
      recipe: {
        instructions: ['Mix ingredients', 'Knead dough', 'Let rise', 'Bake'],
        prepTime: 30,
        cookTime: 45,
        servings: 8,
        yield: 1,
        yieldUnit: 'loaf'
      }
    }
  ]);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CreateProductCardForm>({
    defaultValues: {
      name: '',
      description: '',
      category: 'food',
      subcategory: '',
      price: 0,
      imageUrl: '',
      tags: '',
      ingredients: [],
      tradeSupplies: [],
      laborCost: 0,
      overheadCost: 0,
      profitMargin: 30
    }
  });

  const watchedCategory = watch('category');

  // Computed values
  const filteredAndSortedCards = useMemo(() => {
    let filtered = productCards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !selectedCategory || card.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort cards
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'price' || sortBy === 'totalCost') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [productCards, searchTerm, selectedCategory, sortBy, sortOrder]);

  // View details handler
  const handleViewDetails = (card: ProductCard) => {
    setViewingCard(card);
    setShowViewDetails(true);
  };

  // Form handlers
  const onSubmit = (data: CreateProductCardForm) => {
    // Check for duplicates
    if (!editingCard && checkForDuplicate(data.name, data.category)) {
      toast.error('A product with this name already exists in this category. Please choose a different name.');
      return;
    }

    // Validate required fields
    if (!data.name.trim()) {
      toast.error('Product name is required.');
      return;
    }

    if (!data.subcategory.trim()) {
      toast.error('Subcategory is required.');
      return;
    }

    // Calculate suggested price if not provided
    const suggestedPrice = calculateSuggestedPrice();
    const finalPrice = Number(data.price) > 0 ? Number(data.price) : suggestedPrice;

    const newCard: ProductCard = {
      id: editingCard?.id || Date.now().toString(),
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.category,
      subcategory: data.subcategory.trim(),
      price: finalPrice,
      imageUrl: data.imageUrl,
      tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isActive: true,
      createdAt: editingCard?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ingredients: ingredientLines.map(line => ({
        id: line.id,
        ingredientId: line.ingredientId,
        ingredient: MOCK_INGREDIENTS.find(ing => ing.id === line.ingredientId),
        quantity: line.quantity,
        unit: line.unit,
        cost: line.cost,
        notes: ''
      })),
      laborCost: Number(data.laborCost) || 0,
      overheadCost: Number(data.overheadCost) || 0,
      totalCost: getTotalIngredientCost() + (Number(data.laborCost) || 0) + (Number(data.overheadCost) || 0),
      profitMargin: Number(data.profitMargin) || 30
    };

    if (editingCard) {
      setProductCards(cards => cards.map(card => card.id === editingCard.id ? newCard : card));
      toast.success('Product card updated successfully!');
    } else {
      setProductCards(cards => [...cards, newCard]);
      toast.success('Product card created successfully!');
    }

    setShowProductCard(false);
    setEditingCard(null);
    reset();
  };

  const handleEdit = (card: ProductCard) => {
    setEditingCard(card);
    setSelectedCategoryForCard(card.category);
    setIngredientLines(card.ingredients.map(ing => ({
      id: ing.id,
      ingredientId: ing.ingredientId,
      quantity: ing.quantity,
      unit: ing.unit,
      cost: ing.cost
    })));
    reset({
      name: card.name,
      description: card.description || '',
      category: card.category,
      subcategory: card.subcategory,
      price: card.price,
      imageUrl: card.imageUrl || '',
      tags: card.tags.join(', '),
      ingredients: card.ingredients,
      laborCost: card.laborCost,
      overheadCost: card.overheadCost,
      profitMargin: card.profitMargin
    });
    setShowProductCard(true);
  };

  const handleCancel = () => {
    setShowProductCard(false);
    setEditingCard(null);
    setIngredientLines([]);
    setTradeSupplyLines([]);
    reset();
  };

  // Ingredient management functions
  const addIngredientLine = () => {
    const newLine = {
      id: Date.now().toString(),
      ingredientId: '',
      quantity: 0,
      unit: 'grams',
      cost: 0
    };
    setIngredientLines([...ingredientLines, newLine]);
  };

  const removeIngredientLine = (id: string) => {
    setIngredientLines(ingredientLines.filter(line => line.id !== id));
  };

  const updateIngredientLine = (id: string, field: string, value: any) => {
    setIngredientLines(ingredientLines.map(line => {
      if (line.id === id) {
        const updated = { ...line, [field]: value };
        // Recalculate cost based on ingredient selection
        if (field === 'ingredientId' || field === 'quantity') {
          const ingredient = MOCK_INGREDIENTS.find(ing => ing.id === updated.ingredientId);
          if (ingredient) {
            updated.cost = ingredient.costPerUnit * updated.quantity;
          }
        }
        return updated;
      }
      return line;
    }));
  };

  // Trade supply management functions
  const addTradeSupplyLine = () => {
    const newLine = {
      id: Date.now().toString(),
      supplyId: '',
      quantity: 0,
      unit: 'piece',
      cost: 0
    };
    setTradeSupplyLines([...tradeSupplyLines, newLine]);
  };

  const removeTradeSupplyLine = (id: string) => {
    setTradeSupplyLines(tradeSupplyLines.filter(line => line.id !== id));
  };

  const updateTradeSupplyLine = (id: string, field: string, value: any) => {
    setTradeSupplyLines(tradeSupplyLines.map(line => {
      if (line.id === id) {
        const updated = { ...line, [field]: value };
        // Recalculate cost based on supply selection
        if (field === 'supplyId' || field === 'quantity') {
          const supply = MOCK_TRADE_SUPPLIES.find(sup => sup.id === updated.supplyId);
          if (supply) {
            updated.cost = supply.costPerUnit * updated.quantity;
          }
        }
        return updated;
      }
      return line;
    }));
  };

  const getTotalIngredientCost = () => {
    return ingredientLines.reduce((total, line) => total + line.cost, 0);
  };

  const getTotalTradeSuppliesCost = () => {
    return tradeSupplyLines.reduce((total, line) => total + line.cost, 0);
  };

  const getTotalCost = () => {
    const ingredientCost = getTotalIngredientCost();
    const tradeSuppliesCost = getTotalTradeSuppliesCost();
    const laborCost = Number(watch('laborCost')) || 0;
    const overheadCost = Number(watch('overheadCost')) || 0;
    return ingredientCost + tradeSuppliesCost + laborCost + overheadCost;
  };

  const calculateSuggestedPrice = () => {
    const totalCost = getTotalCost();
    const profitMargin = Number(watch('profitMargin')) || 30;
    const suggestedPrice = totalCost * (1 + profitMargin / 100);
    // Round to nearest penny (2 decimal places)
    return Math.round(suggestedPrice * 100) / 100;
  };

  // Safe price formatting helper
  const formatPrice = (price: any) => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? 0 : numPrice.toFixed(2);
  };

  // Duplicate prevention
  const checkForDuplicate = (name: string, category: string) => {
    return productCards.some(card => 
      card.name.toLowerCase() === name.toLowerCase() && 
      card.category === category
    );
  };

  // AI Recipe Parsing
  const handleImageUpload = async (file: File) => {
    setUploadedImage(file);
    setParsingRecipe(true);
    
    // Simulate AI parsing
    setTimeout(() => {
      // Mock parsed recipe data
      const parsedRecipe = {
        name: 'Parsed Recipe from Image',
        ingredients: [
          { name: 'Flour', quantity: 2, unit: 'cups' },
          { name: 'Sugar', quantity: 1, unit: 'cup' }
        ],
        instructions: ['Mix ingredients', 'Bake at 350°F']
      };
      
      // Auto-fill form with parsed data
      setValue('name', parsedRecipe.name);
      setValue('description', 'Recipe parsed from uploaded image');
      setValue('ingredients', parsedRecipe.ingredients.map((ing, index) => ({
        id: index.toString(),
        ingredientId: '',
        ingredient: null,
        quantity: ing.quantity,
        unit: ing.unit,
        cost: 0,
        notes: `Parsed from image`
      })));
      
      setParsingRecipe(false);
      setShowImageUpload(false);
      toast.success('Recipe parsed successfully!');
    }, 2000);
  };

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Name', 'Category', 'Subcategory', 'Price', 'Total Cost', 'Profit Margin', 'Tags'],
      ...filteredAndSortedCards.map(card => [
        card.name,
        card.category,
        card.subcategory,
        card.price.toString(),
        card.price.toString(),
        card.profitMargin.toString(),
        card.tags.join(', ')
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-cards-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Product cards exported successfully!');
  };

  // Print functionality
  const handlePrint = () => {
    if (!viewingCard) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${viewingCard.name} - Recipe Card</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .recipe-card { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .recipe-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .recipe-subtitle { color: #666; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
            .ingredient-list { list-style: none; padding: 0; }
            .ingredient-item { padding: 5px 0; border-bottom: 1px solid #eee; }
            .instructions { list-style: decimal; padding-left: 20px; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
            @media print { body { margin: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="recipe-card">
            <div class="header">
              <div class="recipe-title">${viewingCard.name}</div>
              <div class="recipe-subtitle">${viewingCard.description}</div>
              <div>${PRODUCT_CATEGORIES.find(c => c.id === viewingCard.category)?.name} • ${viewingCard.subcategory}</div>
            </div>
            
            ${viewingCard.category === 'food' && viewingCard.recipe ? `
              <div class="section">
                <div class="section-title">Recipe Details</div>
                <div>Prep Time: ${viewingCard.recipe.prepTime} minutes</div>
                <div>Cook Time: ${viewingCard.recipe.cookTime} minutes</div>
                <div>Servings: ${viewingCard.servings}</div>
                <div>Yield: ${viewingCard.recipe.yield} ${viewingCard.recipe.yieldUnit}</div>
              </div>
            ` : ''}
            
            <div class="section">
              <div class="section-title">Ingredients</div>
              <ul class="ingredient-list">
                ${viewingCard.ingredients.map(ing => `
                  <li class="ingredient-item">
                    <strong>${ing.quantity} ${ing.unit}</strong> ${ing.ingredient.name}
                    ${ing.notes ? ` - ${ing.notes}` : ''}
                  </li>
                `).join('')}
              </ul>
            </div>
            
            ${viewingCard.category === 'food' && viewingCard.recipe ? `
              <div class="section">
                <div class="section-title">Instructions</div>
                <ol class="instructions">
                  ${viewingCard.recipe.instructions.map(instruction => `
                    <li>${instruction}</li>
                  `).join('')}
                </ol>
              </div>
            ` : ''}
            
            <div class="section">
              <div class="section-title">Cost Breakdown</div>
              <div>Total Cost: $${viewingCard.totalCost.toFixed(2)}</div>
              <div>Price: $${viewingCard.price.toFixed(2)}</div>
              <div>Profit Margin: ${viewingCard.profitMargin}%</div>
            </div>
            
            <div class="footer">
              <div>Generated on ${new Date().toLocaleDateString()}</div>
              <div>Craved Artisan - Product Management System</div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (!viewingCard) return;
    
    const shareData = {
      title: viewingCard.name,
      text: viewingCard.description,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Product card shared successfully!');
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `${viewingCard.name}\n${viewingCard.description}\n\nView at: ${window.location.href}`;
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('Product details copied to clipboard!');
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  return (
    <VendorDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-2 text-gray-600">Create and manage product cards with ingredient tracking and cost management</p>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Product Cards</h2>
          <p className="text-gray-600">Manage your product inventory and recipes</p>
        </div>

        {/* Action Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setSelectedCategoryForCard('');
                      setShowProductCard(true);
                    }}
                    className="bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-brand-green/90 transition-colors flex items-center gap-2 text-lg font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Add Product
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowImageUpload(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    AI Recipe Parser
                  </button>
                  <button
                    onClick={handleExport}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  />
                </div>
                                 <div>
                   <label htmlFor="category-filter" className="sr-only">Filter by category</label>
                   <select
                     id="category-filter"
                     value={selectedCategory}
                     onChange={(e) => setSelectedCategory(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                     aria-label="Filter by category"
                   >
                     <option value="">All Categories</option>
                     {PRODUCT_CATEGORIES.map(category => (
                       <option key={category.id} value={category.id}>
                         {category.name}
                       </option>
                     ))}
                   </select>
                 </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 rounded-md ${viewMode === 'cards' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    aria-label="View as cards"
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    aria-label="View as list"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
                                 <div className="flex gap-2">
                   <label htmlFor="sort-select" className="sr-only">Sort by</label>
                   <select
                     id="sort-select"
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value as any)}
                     className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                     aria-label="Sort by"
                   >
                     <option value="name">Name</option>
                     <option value="price">Price</option>
                     <option value="totalCost">Cost</option>
                     <option value="createdAt">Date</option>
                   </select>
                                     <button
                     onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                     className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                     aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                   >
                     {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                   </button>
                </div>
              </div>
            </div>

            {/* Product Cards Display */}
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedCards.map((card) => (
                  <div key={card.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      {card.imageUrl ? (
                        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">{card.name}</h3>
                                                 <div className="flex gap-1">
                           <button
                             onClick={() => handleEdit(card)}
                             className="p-1 text-blue-600 hover:text-blue-800"
                             aria-label="Edit product card"
                           >
                             <Edit className="w-4 h-4" />
                           </button>
                           <button
                             onClick={() => {
                               setProductCards(cards => cards.filter(c => c.id !== card.id));
                             }}
                             className="p-1 text-red-600 hover:text-red-800"
                             aria-label="Delete product card"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 min-h-[3rem] line-clamp-2">{card.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                          card.category === 'food' ? 'bg-green-100 text-green-800' :
                          card.category === 'service' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {PRODUCT_CATEGORIES.find(c => c.id === card.category)?.name}
                        </span>
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          {card.subcategory}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                        <div>💰 Price: ${formatPrice(card.price)}</div>
                        <div>📦 Cost: ${formatPrice(card.totalCost)}</div>
                        <div>👷 Labor: ${formatPrice(card.laborCost)}</div>
                        <div>📊 Margin: {card.profitMargin}%</div>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <button 
                          onClick={() => handleViewDetails(card)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => handleEdit(card)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          Edit Recipe
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedCards.map((card) => (
                      <tr key={card.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{card.name}</div>
                              <div className="text-sm text-gray-500">{card.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                            card.category === 'food' ? 'bg-green-100 text-green-800' :
                            card.category === 'service' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {PRODUCT_CATEGORIES.find(c => c.id === card.category)?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${formatPrice(card.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${formatPrice(card.totalCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {card.profitMargin}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit(card)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => {
                                setProductCards(cards => cards.filter(c => c.id !== card.id));
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Empty State */}
            {filteredAndSortedCards.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No product cards found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedCategory ? 'Try adjusting your search terms or filters' : 'Get started by creating your first product card'}
                </p>
                {!searchTerm && !selectedCategory && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setSelectedCategoryForCard('');
                        setShowProductCard(true);
                      }}
                      className="bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-brand-green/90 transition-colors flex items-center gap-2 text-lg font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Add Product
                    </button>
                  </div>
                )}
              </div>
            )}

        {/* Product Card Modal */}
        {showProductCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingCard ? 'Edit Product Card' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Category Selection Indicator */}
                  {watch('category') && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-800 font-medium">
                          Creating: {PRODUCT_CATEGORIES.find(c => c.id === watch('category'))?.name}
                        </span>
                        {watch('category') === 'food' && (
                          <span className="text-blue-600 text-sm">• Ingredient management will be available</span>
                        )}
                        {watch('category') === 'service' && (
                          <span className="text-blue-600 text-sm">• Labor and overhead costs required</span>
                        )}
                        {watch('category') === 'non-food' && (
                          <span className="text-blue-600 text-sm">• Raw materials and labor costs</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        {...register('name', { required: 'Product name is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                        placeholder="Enter product name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        {...register('category')}
                        onChange={(e) => {
                          setValue('category', e.target.value);
                          setValue('subcategory', ''); // Reset subcategory when category changes
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        {PRODUCT_CATEGORIES.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subcategory
                      </label>
                      <select
                        {...register('subcategory')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                        disabled={!watch('category')}
                      >
                        <option value="">Select Subcategory</option>
                        {watch('category') && PRODUCT_CATEGORIES.find(cat => cat.id === watch('category'))?.subcategories.map(subcat => (
                          <option key={subcat} value={subcat}>
                            {subcat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Description
                     </label>
                     <textarea
                       {...register('description')}
                       rows={3}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                       placeholder="Enter product description"
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Tags (Optional)
                     </label>
                     <input
                       type="text"
                       {...register('tags')}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                       placeholder="Enter tags separated by commas (e.g., organic, gluten-free, seasonal)"
                     />
                     <p className="text-xs text-gray-500 mt-1">Add tags to help categorize and search for your products</p>
                   </div>

                   {/* Image Upload */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Product Image (Optional)
                     </label>
                     <div className="flex items-center gap-3">
                       <input
                         type="file"
                         accept="image/*"
                         onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                             const imageUrl = URL.createObjectURL(file);
                             setValue('imageUrl', imageUrl);
                           }
                         }}
                         className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                       />
                       {watch('imageUrl') && (
                         <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                           <img 
                             src={watch('imageUrl')} 
                             alt="Product preview" 
                             className="w-full h-full object-cover"
                           />
                         </div>
                       )}
                     </div>
                     <p className="text-xs text-gray-500 mt-1">Upload a product image to help customers visualize your product</p>
                   </div>

                                     {/* Ingredient Management - Only for Food Products */}
                   {watch('category') === 'food' && (
                     <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                       <div className="flex items-center justify-between mb-4">
                         <h3 className="text-lg font-medium text-green-900">Ingredient Management</h3>
                         <div className="flex items-center gap-2">
                           <button
                             type="button"
                             onClick={() => setShowUnitConverter(true)}
                             className="text-sm text-green-700 hover:text-green-900 underline"
                           >
                             Unit Converter
                           </button>
                           <button
                             type="button"
                             onClick={addIngredientLine}
                             className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                           >
                             <Plus className="w-4 h-4" />
                             Add Ingredient
                           </button>
                         </div>
                       </div>
                       
                       {ingredientLines.length === 0 ? (
                         <p className="text-green-700 text-sm">No ingredients added yet. Click "Add Ingredient" to get started.</p>
                       ) : (
                         <div className="space-y-3">
                           {ingredientLines.map((line, index) => (
                             <div key={line.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-white rounded-md border border-green-200">
                               <div className="col-span-5">
                                 <select
                                   value={line.ingredientId}
                                   onChange={(e) => updateIngredientLine(line.id, 'ingredientId', e.target.value)}
                                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                 >
                                   <option value="">Select Ingredient</option>
                                   {MOCK_INGREDIENTS.map(ingredient => (
                                     <option key={ingredient.id} value={ingredient.id}>
                                       {ingredient.name} (${ingredient.costPerUnit}/{ingredient.unit})
                                     </option>
                                   ))}
                                 </select>
                               </div>
                               <div className="col-span-2">
                                 <input
                                   type="number"
                                   value={line.quantity}
                                   onChange={(e) => updateIngredientLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                   placeholder="0"
                                   min="0"
                                   step="0.01"
                                 />
                               </div>
                               <div className="col-span-2">
                                 <select
                                   value={line.unit}
                                   onChange={(e) => updateIngredientLine(line.id, 'unit', e.target.value)}
                                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                 >
                                   {MOCK_UNITS.map(unit => (
                                     <option key={unit} value={unit}>{unit}</option>
                                   ))}
                                 </select>
                               </div>
                               <div className="col-span-2 text-sm text-gray-600">
                                 ${line.cost.toFixed(2)}
                               </div>
                               <div className="col-span-1">
                                 <button
                                   type="button"
                                   onClick={() => removeIngredientLine(line.id)}
                                   className="text-red-600 hover:text-red-800 p-1"
                                   aria-label="Remove ingredient line"
                                 >
                                   <X className="w-4 h-4" />
                                 </button>
                               </div>
                             </div>
                           ))}
                           
                           <div className="flex justify-between items-center pt-2 border-t border-green-200">
                             <span className="text-sm font-medium text-green-900">Total Ingredient Cost:</span>
                             <span className="text-lg font-semibold text-green-900">${getTotalIngredientCost().toFixed(2)}</span>
                           </div>
                         </div>
                       )}
                     </div>
                   )}

                   {/* Trade Supplies Management - Only for Service Products */}
                   {watch('category') === 'service' && (
                     <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                       <div className="flex items-center justify-between mb-4">
                         <h3 className="text-lg font-medium text-orange-900">Trade Supplies Management</h3>
                         <div className="flex items-center gap-2">
                           <button
                             type="button"
                             onClick={() => setShowTradeSuppliesModal(true)}
                             className="text-sm text-orange-700 hover:text-orange-900 underline"
                           >
                             View Available Supplies
                           </button>
                           <button
                             type="button"
                             onClick={addTradeSupplyLine}
                             className="bg-orange-600 text-white px-3 py-1 rounded-md hover:bg-orange-700 transition-colors text-sm flex items-center gap-1"
                           >
                             <Plus className="w-4 h-4" />
                             Add Trade Supply
                           </button>
                         </div>
                       </div>
                       
                       {tradeSupplyLines.length === 0 ? (
                         <p className="text-orange-700 text-sm">No trade supplies added yet. Click "Add Trade Supply" to get started.</p>
                       ) : (
                         <div className="space-y-3">
                           {tradeSupplyLines.map((line, index) => (
                             <div key={line.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-white rounded-md border border-orange-200">
                               <div className="col-span-5">
                                 <select
                                   value={line.supplyId}
                                   onChange={(e) => updateTradeSupplyLine(line.id, 'supplyId', e.target.value)}
                                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                 >
                                   <option value="">Select Trade Supply</option>
                                   {MOCK_TRADE_SUPPLIES.map(supply => (
                                     <option key={supply.id} value={supply.id}>
                                       {supply.name} (${supply.costPerUnit}/{supply.unit})
                                     </option>
                                   ))}
                                 </select>
                               </div>
                               <div className="col-span-2">
                                 <input
                                   type="number"
                                   value={line.quantity}
                                   onChange={(e) => updateTradeSupplyLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                   placeholder="0"
                                   min="0"
                                   step="0.01"
                                 />
                               </div>
                               <div className="col-span-2">
                                 <select
                                   value={line.unit}
                                   onChange={(e) => updateTradeSupplyLine(line.id, 'unit', e.target.value)}
                                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                 >
                                   {MOCK_TRADE_UNITS.map(unit => (
                                     <option key={unit} value={unit}>{unit}</option>
                                   ))}
                                 </select>
                               </div>
                               <div className="col-span-2 text-sm text-gray-600">
                                 ${line.cost.toFixed(2)}
                               </div>
                               <div className="col-span-1">
                                 <button
                                   type="button"
                                   onClick={() => removeTradeSupplyLine(line.id)}
                                   className="text-red-600 hover:text-red-800 p-1"
                                   aria-label="Remove trade supply line"
                                 >
                                   <X className="w-4 h-4" />
                                 </button>
                               </div>
                             </div>
                           ))}
                           
                           <div className="flex justify-between items-center pt-2 border-t border-orange-200">
                             <span className="text-sm font-medium text-orange-900">Total Trade Supplies Cost:</span>
                             <span className="text-lg font-semibold text-orange-900">${getTotalTradeSuppliesCost().toFixed(2)}</span>
                           </div>
                         </div>
                       )}
                     </div>
                   )}

                   {/* Cost Management */}
                   <div className="bg-gray-50 p-4 rounded-lg">
                     <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Management</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Labor Cost
                         </label>
                         <div className="relative">
                           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                           <input
                             type="number"
                             step="0.01"
                             min="0"
                             {...register('laborCost', { min: { value: 0, message: 'Labor cost must be positive' } })}
                             className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                             placeholder="0.00"
                           />
                         </div>
                       </div>

                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Overhead Cost
                         </label>
                         <div className="relative">
                           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                           <input
                             type="number"
                             step="0.01"
                             min="0"
                             {...register('overheadCost', { min: { value: 0, message: 'Overhead cost must be positive' } })}
                             className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                             placeholder="0.00"
                           />
                         </div>
                       </div>

                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Target Profit Margin (%)
                         </label>
                         <input
                           type="number"
                           min="0"
                           max="100"
                           {...register('profitMargin', { min: { value: 0, message: 'Margin must be positive' } })}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent"
                           placeholder="30"
                         />
                       </div>
                     </div>
                     
                     {/* Total Cost Display */}
                     <div className="mt-4 pt-4 border-t border-gray-200">
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                         <div>
                           <span className="text-gray-600">Ingredient Cost:</span>
                           <span className="ml-2 font-medium">${getTotalIngredientCost().toFixed(2)}</span>
                         </div>
                         {watch('category') === 'service' && (
                           <div>
                             <span className="text-gray-600">Trade Supplies:</span>
                             <span className="ml-2 font-medium">${getTotalTradeSuppliesCost().toFixed(2)}</span>
                           </div>
                         )}
                         <div>
                           <span className="text-gray-600">Labor Cost:</span>
                           <span className="ml-2 font-medium">${(Number(watch('laborCost')) || 0).toFixed(2)}</span>
                         </div>
                         <div>
                           <span className="text-gray-600">Overhead Cost:</span>
                           <span className="ml-2 font-medium">${(Number(watch('overheadCost')) || 0).toFixed(2)}</span>
                         </div>
                         <div className="lg:col-span-2">
                           <span className="text-gray-600 font-medium">Total Cost:</span>
                           <span className="ml-2 font-semibold text-lg">${getTotalCost().toFixed(2)}</span>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Price Calculation */}
                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                     <h3 className="text-lg font-medium text-blue-900 mb-3">Price Calculation</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                       <div>
                         <span className="text-blue-700 font-medium">Total Cost:</span>
                         <span className="ml-2 font-semibold">${getTotalCost().toFixed(2)}</span>
                       </div>
                       <div>
                         <span className="text-blue-700 font-medium">Profit Margin:</span>
                         <span className="ml-2 font-semibold">{watch('profitMargin') || 30}%</span>
                       </div>
                       <div>
                         <span className="text-blue-700 font-medium">Suggested Price:</span>
                         <span className="ml-2 font-semibold text-green-600">${calculateSuggestedPrice().toFixed(2)}</span>
                       </div>
                     </div>
                     <p className="text-xs text-blue-600 mt-2">Price is calculated as: Total Cost × (1 + Profit Margin %)</p>
                     
                     {/* Price Input Field */}
                     <div className="mt-4">
                       <label className="block text-sm font-medium text-blue-700 mb-2">
                         Product Price (USD)
                       </label>
                       <div className="flex items-center gap-3">
                         <div className="relative flex-1">
                           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">$</span>
                           <input
                             type="number"
                             step="0.01"
                             min="0"
                             {...register('price', { 
                               min: { value: 0, message: 'Price must be positive' },
                               required: 'Price is required'
                             })}
                             value={watch('price') || calculateSuggestedPrice()}
                             onChange={(e) => {
                               const value = parseFloat(e.target.value) || 0;
                               setValue('price', value);
                             }}
                             className="w-full pl-8 pr-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                             placeholder="0.00"
                           />
                         </div>
                         <button
                           type="button"
                           onClick={() => {
                             const suggestedPrice = calculateSuggestedPrice();
                             setValue('price', suggestedPrice);
                           }}
                           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                         >
                           Use Suggested
                         </button>
                       </div>
                       {errors.price && (
                         <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                       )}
                     </div>
                   </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-brand-green text-white px-4 py-2 rounded-md hover:bg-brand-green/90 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : (editingCard ? 'Update Product Card' : 'Create Product Card')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showViewDetails && viewingCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{viewingCard.name}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                    <button
                      onClick={handleShare}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button
                      onClick={() => setShowViewDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Recipe Card Layout */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 mb-6 border border-amber-200">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{viewingCard.name}</h3>
                    <p className="text-gray-600 mb-3">{viewingCard.description}</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {PRODUCT_CATEGORIES.find(c => c.id === viewingCard.category)?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {viewingCard.subcategory}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${viewingCard.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Recipe Details for Food Items */}
                  {viewingCard.category === 'food' && viewingCard.recipe && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <div className="text-2xl font-bold text-amber-600">{viewingCard.recipe.prepTime}</div>
                        <div className="text-sm text-gray-600">Prep (min)</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <div className="text-2xl font-bold text-amber-600">{viewingCard.recipe.cookTime}</div>
                        <div className="text-sm text-gray-600">Cook (min)</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <div className="text-2xl font-bold text-amber-600">{viewingCard.recipe.servings}</div>
                        <div className="text-sm text-gray-600">Servings</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <div className="text-2xl font-bold text-amber-600">{viewingCard.recipe.yield}</div>
                        <div className="text-sm text-gray-600">{viewingCard.recipe.yieldUnit}</div>
                      </div>
                    </div>
                  )}

                  {/* Ingredients Section */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b border-amber-200 pb-2">Ingredients</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {viewingCard.ingredients.map((ingredient, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-amber-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                              <span className="text-amber-600 font-semibold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{ingredient.ingredient.name}</div>
                              {ingredient.notes && (
                                <div className="text-sm text-gray-500">{ingredient.notes}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-amber-600">{ingredient.quantity} {ingredient.unit}</div>
                            <div className="text-sm text-gray-500">${ingredient.cost.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions for Food Items */}
                  {viewingCard.category === 'food' && viewingCard.recipe && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b border-amber-200 pb-2">Instructions</h4>
                      <div className="space-y-3">
                        {viewingCard.recipe.instructions.map((instruction, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-amber-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <p className="text-gray-700">{instruction}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cost Breakdown */}
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b border-amber-200 pb-2">Cost Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-sm text-gray-600">Total Cost</div>
                        <div className="text-lg font-bold text-red-600">${viewingCard.totalCost.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Labor Cost</div>
                        <div className="text-lg font-bold text-blue-600">${viewingCard.laborCost.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Profit Margin</div>
                        <div className="text-lg font-bold text-green-600">{viewingCard.profitMargin}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Final Price</div>
                        <div className="text-lg font-bold text-purple-600">${viewingCard.price.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Recipe Parser Modal */}
         {showImageUpload && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-lg max-w-md w-full p-6">
               <div className="text-center">
                 <Camera className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">AI Recipe Parser</h3>
                 <p className="text-gray-600 mb-4">Upload an image of a handwritten or printed recipe to automatically parse ingredients and instructions</p>
                 
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
                   <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                     className="hidden"
                     id="recipe-image-upload"
                   />
                   <label
                     htmlFor="recipe-image-upload"
                     className="cursor-pointer block"
                   >
                     <div className="text-center">
                       <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                       <p className="text-sm text-gray-600">
                         {parsingRecipe ? 'Parsing recipe...' : 'Click to upload recipe image'}
                       </p>
                     </div>
                   </label>
                 </div>

                 <div className="flex gap-3">
                   <button
                     onClick={() => setShowImageUpload(false)}
                     className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                   >
                     Cancel
                   </button>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Trade Supplies Modal */}
         {showTradeSuppliesModal && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-semibold text-gray-900">Available Trade Supplies</h3>
                 <button
                   onClick={() => setShowTradeSuppliesModal(false)}
                   className="text-gray-400 hover:text-gray-600"
                 >
                   <X className="w-6 h-6" />
                 </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {MOCK_TRADE_SUPPLIES.map(supply => (
                   <div key={supply.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                     <div className="flex items-center justify-between mb-2">
                       <h4 className="font-medium text-gray-900">{supply.name}</h4>
                       <span className="text-sm text-gray-500">{supply.unit}</span>
                     </div>
                     <div className="text-lg font-semibold text-orange-600">
                       ${supply.costPerUnit.toFixed(2)}/{supply.unit}
                     </div>
                     <div className="text-sm text-gray-600 mt-2">
                       <span className="font-medium">Category:</span> Trade Supplies
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="mt-6 pt-4 border-t border-gray-200">
                 <p className="text-sm text-gray-600 text-center">
                   💡 Tip: Add these trade supplies to your service products to accurately calculate costs
                 </p>
               </div>
             </div>
           </div>
         )}

         {/* Unit Converter Modal */}
         {showUnitConverter && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-lg max-w-2xl w-full p-6">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-semibold text-gray-900">Unit Converter</h3>
                 <button
                   onClick={() => setShowUnitConverter(false)}
                   className="text-gray-400 hover:text-gray-600"
                 >
                   <X className="w-6 h-6" />
                 </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <h4 className="font-medium text-gray-900 mb-3">Common Conversions</h4>
                   <div className="space-y-2 text-sm">
                     <div className="flex justify-between">
                       <span>1 cup = 8 fluid ounces</span>
                       <span>1 cup = 240 ml</span>
                     </div>
                     <div className="flex justify-between">
                       <span>1 tablespoon = 3 teaspoons</span>
                       <span>1 tbsp = 15 ml</span>
                     </div>
                     <div className="flex justify-between">
                       <span>1 pound = 16 ounces</span>
                       <span>1 lb = 453.6 grams</span>
                     </div>
                     <div className="flex justify-between">
                       <span>1 kilogram = 2.2 pounds</span>
                       <span>1 kg = 1000 grams</span>
                     </div>
                     <div className="flex justify-between">
                       <span>1 gallon = 4 quarts</span>
                       <span>1 gal = 3.785 liters</span>
                     </div>
                   </div>
                 </div>
                 
                 <div>
                   <h4 className="font-medium text-gray-900 mb-3">Baking Conversions</h4>
                   <div className="space-y-2 text-sm">
                     <div className="flex justify-between">
                       <span>1 cup flour = 120 grams</span>
                       <span>1 cup sugar = 200 grams</span>
                     </div>
                     <div className="flex justify-between">
                       <span>1 cup butter = 227 grams</span>
                       <span>1 cup milk = 240 ml</span>
                     </div>
                     <div className="flex justify-between">
                       <span>1 large egg = 50 grams</span>
                       <span>1 cup honey = 340 grams</span>
                     </div>
                     <div className="flex justify-between">
                       <span>1 cup oats = 80 grams</span>
                       <span>1 cup nuts = 120 grams</span>
                     </div>
                   </div>
                 </div>
               </div>
               
               <div className="mt-6 pt-4 border-t border-gray-200">
                 <p className="text-sm text-gray-600 text-center">
                   💡 Tip: Use these conversions to easily switch between units when creating recipes
                 </p>
               </div>
             </div>
           </div>
         )}
      </div>
    </VendorDashboardLayout>
  );
};

export default EnhancedVendorProductsPage;
