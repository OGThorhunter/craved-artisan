# Prisma Schema Update Summary

## 🗄️ New Models Added

### **Ingredient Model**
- **Purpose**: Store ingredients that vendors use in their recipes
- **Key Fields**:
  - `name`: Ingredient name (e.g., "Flour", "Sugar", "Vanilla Extract")
  - `description`: Optional description
  - `unit`: Unit of measurement (e.g., "grams", "ounces", "cups")
  - `costPerUnit`: Cost per unit for cost calculations
  - `supplier`: Optional supplier information
  - `isAvailable`: Whether the ingredient is currently available
- **Relations**:
  - Belongs to a `VendorProfile` (vendor-specific ingredients)
  - Has many `RecipeIngredient` (used in multiple recipes)

### **Recipe Model**
- **Purpose**: Store recipes that vendors use to create products
- **Key Fields**:
  - `name`: Recipe name
  - `description`: Optional description
  - `instructions`: Step-by-step instructions
  - `yield`: Number of units produced
  - `yieldUnit`: Unit of yield (e.g., "pieces", "servings", "batches")
  - `prepTime`: Preparation time in minutes
  - `cookTime`: Cooking time in minutes
  - `difficulty`: Difficulty level (e.g., "Easy", "Medium", "Hard")
  - `isActive`: Whether the recipe is currently active
- **Relations**:
  - Belongs to a `VendorProfile` (vendor-specific recipes)
  - Optional link to a `Product` (recipe can produce a product)
  - Has many `RecipeIngredient` (ingredients used in the recipe)

### **RecipeIngredient Model (Join Table)**
- **Purpose**: Many-to-many relationship between recipes and ingredients
- **Key Fields**:
  - `quantity`: Amount of ingredient needed
  - `unit`: Unit of measurement for this recipe
  - `notes`: Optional notes about this ingredient in the recipe
- **Relations**:
  - Belongs to a `Recipe`
  - Belongs to an `Ingredient`
  - Unique constraint prevents duplicate ingredients in same recipe

## 🔗 Updated Relations

### **VendorProfile Model**
- Added `ingredients` relation (one-to-many)
- Added `recipes` relation (one-to-many)

### **Product Model**
- Added `recipes` relation (one-to-many, optional)

## 📊 Database Schema

### **Tables Created**
1. `ingredients` - Stores vendor ingredients
2. `recipes` - Stores vendor recipes
3. `recipe_ingredients` - Join table for recipe-ingredient relationships

### **Foreign Keys**
- `ingredients.vendorProfileId` → `vendor_profiles.id` (CASCADE)
- `recipes.vendorProfileId` → `vendor_profiles.id` (CASCADE)
- `recipes.productId` → `products.id` (SET NULL)
- `recipe_ingredients.recipeId` → `recipes.id` (CASCADE)
- `recipe_ingredients.ingredientId` → `ingredients.id` (CASCADE)

### **Constraints**
- `recipe_ingredients` has unique constraint on `(recipeId, ingredientId)`

## 🎯 Use Cases

### **Ingredient Management**
- Vendors can manage their ingredient inventory
- Track cost per unit for cost calculations
- Monitor ingredient availability
- Store supplier information

### **Recipe Management**
- Vendors can create detailed recipes
- Link recipes to products they produce
- Track preparation and cooking times
- Set difficulty levels for staff reference

### **Recipe-Ingredient Relationships**
- Many-to-many relationship allows flexible recipe creation
- Track specific quantities and units for each ingredient
- Add notes for special instructions
- Prevent duplicate ingredients in same recipe

### **Cost Calculations**
- Calculate recipe costs based on ingredient costs
- Track cost per unit of finished product
- Monitor ingredient cost changes over time

## 🚀 Migration Details

- **Migration Name**: `20250802035650_add_ingredients_recipes`
- **Status**: ✅ Successfully applied
- **Prisma Client**: ✅ Regenerated and up to date

## 📝 Example Usage

### **Creating an Ingredient**
```typescript
const ingredient = await prisma.ingredient.create({
  data: {
    name: "All-Purpose Flour",
    description: "High-quality all-purpose flour",
    unit: "grams",
    costPerUnit: 0.02, // $0.02 per gram
    supplier: "Local Mill Co.",
    vendorProfileId: "vendor-profile-id"
  }
});
```

### **Creating a Recipe**
```typescript
const recipe = await prisma.recipe.create({
  data: {
    name: "Classic Chocolate Chip Cookies",
    description: "Traditional chocolate chip cookie recipe",
    instructions: "1. Mix dry ingredients...",
    yield: 24,
    yieldUnit: "cookies",
    prepTime: 15,
    cookTime: 12,
    difficulty: "Easy",
    vendorProfileId: "vendor-profile-id",
    productId: "product-id" // Optional link to product
  }
});
```

### **Adding Ingredients to Recipe**
```typescript
const recipeIngredient = await prisma.recipeIngredient.create({
  data: {
    quantity: 250,
    unit: "grams",
    notes: "Sifted",
    recipeId: "recipe-id",
    ingredientId: "ingredient-id"
  }
});
```

### **Querying Recipe with Ingredients**
```typescript
const recipeWithIngredients = await prisma.recipe.findUnique({
  where: { id: "recipe-id" },
  include: {
    recipeIngredients: {
      include: {
        ingredient: true
      }
    },
    product: true
  }
});
```

## 🔮 Future Enhancements

- **Recipe Categories**: Add categories for better organization
- **Recipe Versions**: Track recipe changes over time
- **Ingredient Substitutions**: Allow ingredient alternatives
- **Recipe Scaling**: Automatically scale ingredient quantities
- **Cost Analysis**: Calculate total recipe costs and margins
- **Inventory Integration**: Link ingredients to inventory management 