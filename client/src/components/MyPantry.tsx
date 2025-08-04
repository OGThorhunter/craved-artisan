import { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import {
  Search,
  Filter,
  Plus,
  Camera,
  ChefHat,
  Package,
  Leaf,
  Wheat,
  Droplets,
  Sparkles,
  X,
  Edit3,
  Trash2,
  BookOpen,
  Clock,
  Star
} from 'lucide-react';
import { 
  parseIngredients, 
  validateIngredients, 
  formatIngredient, 
  getCategoryInfo, 
  getAvailableCategories,
  type ParsedIngredient 
} from '../lib/parseIngredients';

// Get ingredient categories from utility
const INGREDIENT_CATEGORIES = getAvailableCategories();

interface Ingredient {
  id: string;
  name: string;
  category: keyof typeof INGREDIENT_CATEGORIES;
  quantity: number;
  unit: string;
  expiryDate?: string;
  source: 'purchase' | 'manual' | 'ai_parse';
  productId?: string;
  vendorId?: string;
  addedDate: string;
  isExpiring?: boolean;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  time: string;
  rating: number;
  image: string;
  vendor: string;
}

interface MyPantryProps {
  className?: string;
  onIngredientAdd?: (ingredient: Omit<Ingredient, 'id' | 'addedDate'>) => void;
  onIngredientRemove?: (ingredientId: string) => void;
  onIngredientEdit?: (ingredientId: string, updates: Partial<Ingredient>) => void;
}

export const MyPantry: React.FC<MyPantryProps> = ({
  className = '',
  onIngredientAdd,
  onIngredientRemove,
  onIngredientEdit
}) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof INGREDIENT_CATEGORIES | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [matchingRecipes, setMatchingRecipes] = useState<Recipe[]>([]);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockIngredients: Ingredient[] = [
      {
        id: '1',
        name: 'cinnamon',
        category: 'spices',
        quantity: 2,
        unit: 'tsp',
        source: 'purchase',
        productId: 'prod1',
        vendorId: 'vendor1',
        addedDate: '2024-01-15',
        expiryDate: '2024-12-31'
      },
      {
        id: '2',
        name: 'flour',
        category: 'grains',
        quantity: 5,
        unit: 'cups',
        source: 'purchase',
        productId: 'prod2',
        vendorId: 'vendor1',
        addedDate: '2024-01-10',
        expiryDate: '2024-06-30'
      },
      {
        id: '3',
        name: 'eggs',
        category: 'dairy',
        quantity: 12,
        unit: 'count',
        source: 'purchase',
        productId: 'prod3',
        vendorId: 'vendor2',
        addedDate: '2024-01-20',
        expiryDate: '2024-02-03',
        isExpiring: true
      },
      {
        id: '4',
        name: 'carrots',
        category: 'vegetables',
        quantity: 1,
        unit: 'lb',
        source: 'purchase',
        productId: 'prod4',
        vendorId: 'vendor3',
        addedDate: '2024-01-18',
        expiryDate: '2024-01-25'
      }
    ];
    setIngredients(mockIngredients);
  }, []);

  // Filter ingredients based on search and category
  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ingredient => {
      const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [ingredients, searchTerm, selectedCategory]);

  // Group ingredients by category
  const groupedIngredients = useMemo(() => {
    const grouped = filteredIngredients.reduce((acc, ingredient) => {
      if (!acc[ingredient.category]) {
        acc[ingredient.category] = [];
      }
      acc[ingredient.category].push(ingredient);
      return acc;
    }, {} as Record<string, Ingredient[]>);

    return Object.entries(grouped).sort(([a], [b]) => 
      Object.keys(INGREDIENT_CATEGORIES).indexOf(a) - Object.keys(INGREDIENT_CATEGORIES).indexOf(b)
    );
  }, [filteredIngredients]);

           // Parse ingredients from text using utility function
         const parseIngredientsFromText = (text: string): Partial<Ingredient>[] => {
           const parsed = parseIngredients(text);
           return parsed.map(ingredient => ({
             name: ingredient.name,
             quantity: ingredient.quantity,
             unit: ingredient.unit,
             category: ingredient.category as keyof typeof INGREDIENT_CATEGORIES
           }));
         };

  // Find recipes that use a specific ingredient
  const findMatchingRecipes = (ingredientName: string): Recipe[] => {
    // Mock recipe data - in real app, this would query the API
    const mockRecipes: Recipe[] = [
      {
        id: '1',
        name: 'Cinnamon Rolls',
        ingredients: ['flour', 'cinnamon', 'sugar', 'butter', 'eggs'],
        difficulty: 'medium',
        time: '2 hours',
        rating: 4.8,
        image: '/api/placeholder/200/200',
        vendor: 'Rose Creek Bakery'
      },
      {
        id: '2',
        name: 'Carrot Cake',
        ingredients: ['carrots', 'flour', 'eggs', 'sugar', 'cinnamon'],
        difficulty: 'easy',
        time: '1.5 hours',
        rating: 4.6,
        image: '/api/placeholder/200/200',
        vendor: 'Sweet Dreams Bakery'
      }
    ];

    return mockRecipes.filter(recipe => 
      recipe.ingredients.some(ing => ing.toLowerCase().includes(ingredientName.toLowerCase()))
    );
  };

  const handleUseInRecipe = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    const recipes = findMatchingRecipes(ingredient.name);
    setMatchingRecipes(recipes);
    setShowRecipeModal(true);
  };

  const handleAddIngredient = (ingredientData: Partial<Ingredient>) => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: ingredientData.name || '',
      category: ingredientData.category || 'pantry',
      quantity: ingredientData.quantity || 1,
      unit: ingredientData.unit || 'count',
      source: 'manual',
      addedDate: new Date().toISOString(),
      ...ingredientData
    };
    
    setIngredients(prev => [...prev, newIngredient]);
    onIngredientAdd?.(newIngredient);
    setShowAddModal(false);
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== ingredientId));
    onIngredientRemove?.(ingredientId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            My Pantry
          </h2>
          <p className="text-sm text-brand-grey">Ingredients from your past purchases</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Scan ingredients with camera"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
          />
        </div>
                 <select
           value={selectedCategory}
           onChange={(e) => setSelectedCategory(e.target.value as keyof typeof INGREDIENT_CATEGORIES | 'all')}
           className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
           aria-label="Filter by ingredient category"
         >
          <option value="all">All Categories</option>
          {Object.entries(INGREDIENT_CATEGORIES).map(([key, category]) => (
            <option key={key} value={key}>{category.name}</option>
          ))}
        </select>
      </div>

      {/* Ingredients List */}
      <div className="space-y-6">
        {groupedIngredients.length > 0 ? (
          groupedIngredients.map(([category, categoryIngredients]) => {
            const categoryInfo = INGREDIENT_CATEGORIES[category as keyof typeof INGREDIENT_CATEGORIES];
            
            return (
              <div key={category}>
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Package className={`w-4 h-4 ${categoryInfo.color}`} />
                  {categoryInfo.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryIngredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className={`border rounded-lg p-3 hover:shadow-md transition-shadow ${
                        ingredient.isExpiring ? 'border-red-200 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 capitalize">
                            {ingredient.name}
                          </h4>
                          <p className="text-sm text-brand-grey">
                            {ingredient.quantity} {ingredient.unit}
                          </p>
                          {ingredient.expiryDate && (
                            <p className={`text-xs mt-1 ${
                              ingredient.isExpiring ? 'text-red-600' : 'text-brand-grey'
                            }`}>
                              Expires: {formatDate(ingredient.expiryDate)}
                              {ingredient.isExpiring && (
                                <span className="ml-1">
                                  ({getDaysUntilExpiry(ingredient.expiryDate)} days)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUseInRecipe(ingredient)}
                            className="p-1 text-brand-green hover:bg-brand-green/10 rounded"
                            title="Find recipes using this ingredient"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveIngredient(ingredient.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Remove ingredient"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No ingredients found</p>
            <p className="text-sm text-gray-400">Add ingredients from your purchases or manually</p>
          </div>
        )}
      </div>

      {/* Add Ingredient Modal */}
      {showAddModal && (
        <AddIngredientModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddIngredient}
          parseIngredients={parseIngredients}
        />
      )}

      {/* Recipe Modal */}
      {showRecipeModal && selectedIngredient && (
        <RecipeModal
          ingredient={selectedIngredient}
          recipes={matchingRecipes}
          onClose={() => setShowRecipeModal(false)}
        />
      )}
    </div>
  );
};

// Add Ingredient Modal Component
interface AddIngredientModalProps {
  onClose: () => void;
  onAdd: (ingredient: Partial<Ingredient>) => void;
  parseIngredients: (text: string) => Partial<Ingredient>[];
}

const AddIngredientModal: React.FC<AddIngredientModalProps> = ({ onClose, onAdd, parseIngredients }) => {
  const [mode, setMode] = useState<'manual' | 'parse'>('manual');
  const [parseText, setParseText] = useState('');
  const [parsedIngredients, setParsedIngredients] = useState<Partial<Ingredient>[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    category: 'pantry' as keyof typeof INGREDIENT_CATEGORIES,
    quantity: 1,
    unit: 'count',
    expiryDate: ''
  });

           const handleParse = () => {
                       const parsed = parseIngredients(parseText);
           setParsedIngredients(parsed);
         };

  const handleAddParsed = (ingredient: Partial<Ingredient>) => {
    onAdd(ingredient);
  };

  const handleManualAdd = () => {
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Ingredient</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden mb-4">
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 px-4 py-2 text-sm transition-colors ${
              mode === 'manual'
                ? 'bg-brand-green text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setMode('parse')}
            className={`flex-1 px-4 py-2 text-sm transition-colors ${
              mode === 'parse'
                ? 'bg-brand-green text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Parse Text
          </button>
        </div>

        {mode === 'manual' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                placeholder="e.g., cinnamon"
              />
            </div>
                         <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
               <select
                 value={formData.category}
                 onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as keyof typeof INGREDIENT_CATEGORIES }))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                 aria-label="Select ingredient category"
               >
                {Object.entries(INGREDIENT_CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                 <input
                   type="number"
                   value={formData.quantity}
                   onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                   placeholder="Enter quantity"
                   aria-label="Ingredient quantity"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                 <input
                   type="text"
                   value={formData.unit}
                   onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                   placeholder="e.g., tsp, cups"
                   aria-label="Ingredient unit"
                 />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (optional)</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>
            <button
              onClick={handleManualAdd}
              disabled={!formData.name}
              className="w-full bg-brand-green text-white py-2 rounded-lg hover:bg-brand-green/80 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Ingredient
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paste ingredient list</label>
              <textarea
                value={parseText}
                onChange={(e) => setParseText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent h-32"
                placeholder="2 tsp cinnamon&#10;1 cup flour&#10;3 eggs&#10;1 lb carrots"
              />
            </div>
            <button
              onClick={handleParse}
              disabled={!parseText.trim()}
              className="w-full bg-brand-green text-white py-2 rounded-lg hover:bg-brand-green/80 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Parse Ingredients
            </button>
            
            {parsedIngredients.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Parsed Ingredients:</h4>
                {parsedIngredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                    <span className="capitalize">{ingredient.name} ({ingredient.quantity} {ingredient.unit})</span>
                    <button
                      onClick={() => handleAddParsed(ingredient)}
                      className="text-brand-green hover:text-brand-green/80"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Recipe Modal Component
interface RecipeModalProps {
  ingredient: Ingredient;
  recipes: Recipe[];
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ ingredient, recipes, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Recipes using {ingredient.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                    <p className="text-sm text-brand-grey">{recipe.vendor}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-brand-grey">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        {recipe.rating}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Link href={`/recipe/${recipe.id}`}>
                    <button className="w-full bg-brand-green text-white py-2 rounded-lg hover:bg-brand-green/80 text-sm">
                      View Recipe
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No recipes found using {ingredient.name}</p>
            <p className="text-sm text-gray-400">Try searching for different ingredients</p>
          </div>
        )}
      </div>
    </div>
  );
}; 