/**
 * Parse ingredients from text input and normalize to structured format
 * Supports various input formats and normalizes to singular nouns with units
 */

export interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

export interface IngredientCategory {
  name: string;
  keywords: string[];
  color: string;
}

// Define ingredient categories with keywords for auto-categorization
export const INGREDIENT_CATEGORIES: Record<string, IngredientCategory> = {
  spices: {
    name: 'Spices & Herbs',
    keywords: ['salt', 'pepper', 'cinnamon', 'nutmeg', 'oregano', 'basil', 'thyme', 'rosemary', 'garlic', 'onion', 'paprika', 'cumin', 'turmeric', 'ginger', 'vanilla', 'mint', 'sage', 'bay', 'clove', 'cardamom'],
    color: 'text-orange-600'
  },
  vegetables: {
    name: 'Vegetables',
    keywords: ['carrot', 'onion', 'tomato', 'lettuce', 'spinach', 'kale', 'broccoli', 'cauliflower', 'pepper', 'cucumber', 'celery', 'mushroom', 'potato', 'sweet potato', 'zucchini', 'eggplant', 'asparagus', 'green bean', 'pea', 'corn'],
    color: 'text-green-600'
  },
  grains: {
    name: 'Grains & Flour',
    keywords: ['flour', 'rice', 'pasta', 'bread', 'oat', 'quinoa', 'barley', 'wheat', 'cornmeal', 'semolina', 'couscous', 'bulgur', 'millet', 'buckwheat', 'rye', 'spelt'],
    color: 'text-amber-600'
  },
  dairy: {
    name: 'Dairy & Eggs',
    keywords: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'sour cream', 'heavy cream', 'half and half', 'buttermilk', 'cottage cheese', 'cream cheese', 'parmesan', 'cheddar', 'mozzarella'],
    color: 'text-blue-600'
  },
  pantry: {
    name: 'Pantry Staples',
    keywords: ['oil', 'vinegar', 'sugar', 'honey', 'syrup', 'sauce', 'stock', 'broth', 'bean', 'lentil', 'chickpea', 'nut', 'seed', 'raisin', 'dried fruit', 'jam', 'jelly', 'mustard', 'ketchup', 'mayonnaise'],
    color: 'text-gray-600'
  },
  proteins: {
    name: 'Proteins',
    keywords: ['chicken', 'beef', 'pork', 'fish', 'shrimp', 'salmon', 'tuna', 'turkey', 'lamb', 'bacon', 'sausage', 'ham', 'tofu', 'tempeh', 'seitan', 'bean', 'lentil', 'chickpea'],
    color: 'text-red-600'
  }
};

/**
 * Parse ingredients from text input
 * @param text - Raw text input (can be multiline)
 * @returns Array of parsed ingredients
 */
export function parseIngredients(text: string): ParsedIngredient[] {
  const lines = text.split('\n').filter(line => line.trim());
  
  return lines.map(line => {
    // Enhanced regex to handle various formats
    const patterns = [
      // "2 tsp cinnamon" or "2 teaspoons cinnamon"
      /^(\d+(?:\.\d+)?)\s*(tsp|teaspoon|tbsp|tablespoon|cup|cups|oz|ounce|ounces|lb|pound|pounds|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|pinch|dash|handful|bunch|clove|cloves|slice|slices|can|cans|jar|jars|packet|packets|bag|bags|box|boxes|count|piece|pieces|whole|halves|quarter|quarters)\s+(.+)$/i,
      // "cinnamon 2 tsp" (reversed order)
      /^(.+?)\s+(\d+(?:\.\d+)?)\s*(tsp|teaspoon|tbsp|tablespoon|cup|cups|oz|ounce|ounces|lb|pound|pounds|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|pinch|dash|handful|bunch|clove|cloves|slice|slices|can|cans|jar|jars|packet|packets|bag|bags|box|boxes|count|piece|pieces|whole|halves|quarter|quarters)$/i,
      // "cinnamon" (no quantity/unit)
      /^(.+)$/i
    ];

    for (const pattern of patterns) {
      const match = line.trim().match(pattern);
      if (match) {
        let name, quantity, unit;

        if (match[1] && match[2] && match[3]) {
          // Pattern 1: "2 tsp cinnamon"
          quantity = parseFloat(match[1]);
          unit = normalizeUnit(match[2]);
          name = match[3].trim();
        } else if (match[1] && match[2] && match[3]) {
          // Pattern 2: "cinnamon 2 tsp"
          name = match[1].trim();
          quantity = parseFloat(match[2]);
          unit = normalizeUnit(match[3]);
        } else {
          // Pattern 3: "cinnamon"
          name = match[1]?.trim() || '';
          quantity = 1;
          unit = 'count';
        }

        return {
          name: normalizeIngredientName(name),
          quantity,
          unit,
          category: categorizeIngredient(name)
        };
      }
    }

    // Fallback for unmatched lines
    return {
      name: normalizeIngredientName(line.trim()),
      quantity: 1,
      unit: 'count',
      category: categorizeIngredient(line.trim())
    };
  });
}

/**
 * Normalize ingredient name (convert to singular, lowercase)
 */
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/s$/, '') // Remove trailing 's' to make singular
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Normalize unit abbreviations
 */
function normalizeUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    'tsp': 'tsp',
    'teaspoon': 'tsp',
    'teaspoons': 'tsp',
    'tbsp': 'tbsp',
    'tablespoon': 'tbsp',
    'tablespoons': 'tbsp',
    'cup': 'cup',
    'cups': 'cup',
    'oz': 'oz',
    'ounce': 'oz',
    'ounces': 'oz',
    'lb': 'lb',
    'pound': 'lb',
    'pounds': 'lb',
    'g': 'g',
    'gram': 'g',
    'grams': 'g',
    'kg': 'kg',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'ml': 'ml',
    'milliliter': 'ml',
    'milliliters': 'ml',
    'l': 'l',
    'liter': 'l',
    'liters': 'l',
    'pinch': 'pinch',
    'dash': 'dash',
    'handful': 'handful',
    'bunch': 'bunch',
    'clove': 'clove',
    'cloves': 'clove',
    'slice': 'slice',
    'slices': 'slice',
    'can': 'can',
    'cans': 'can',
    'jar': 'jar',
    'jars': 'jar',
    'packet': 'packet',
    'packets': 'packet',
    'bag': 'bag',
    'bags': 'bag',
    'box': 'box',
    'boxes': 'box',
    'count': 'count',
    'piece': 'piece',
    'pieces': 'piece',
    'whole': 'whole',
    'halves': 'half',
    'quarter': 'quarter',
    'quarters': 'quarter'
  };

  return unitMap[unit.toLowerCase()] || unit.toLowerCase();
}

/**
 * Categorize ingredient based on keywords
 */
function categorizeIngredient(name: string): string {
  const normalizedName = normalizeIngredientName(name);
  
  for (const [category, config] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (config.keywords.some(keyword => normalizedName.includes(keyword))) {
      return category;
    }
  }
  
  return 'pantry'; // Default category
}

/**
 * Validate parsed ingredients
 */
export function validateIngredients(ingredients: ParsedIngredient[]): { valid: ParsedIngredient[], invalid: string[] } {
  const valid: ParsedIngredient[] = [];
  const invalid: string[] = [];

  ingredients.forEach((ingredient, index) => {
    if (ingredient.name && ingredient.name.length > 0 && ingredient.quantity > 0) {
      valid.push(ingredient);
    } else {
      invalid.push(`Line ${index + 1}: Invalid ingredient format`);
    }
  });

  return { valid, invalid };
}

/**
 * Format ingredient for display
 */
export function formatIngredient(ingredient: ParsedIngredient): string {
  if (ingredient.quantity === 1) {
    return `${ingredient.name} (1 ${ingredient.unit})`;
  }
  return `${ingredient.name} (${ingredient.quantity} ${ingredient.unit})`;
}

/**
 * Get category info for an ingredient
 */
export function getCategoryInfo(category: string): IngredientCategory | null {
  return INGREDIENT_CATEGORIES[category] || null;
}

/**
 * Get all available categories
 */
export function getAvailableCategories(): Record<string, IngredientCategory> {
  return INGREDIENT_CATEGORIES;
} 