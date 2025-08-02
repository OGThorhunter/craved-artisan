# API Endpoints Documentation

## 🍽️ Ingredients API

### **Base URL**: `/api/ingredients`

All endpoints require authentication and VENDOR role.

---

### **GET /api/ingredients**
Get all ingredients for the authenticated vendor.

**Response:**
```json
{
  "ingredients": [
    {
      "id": "uuid",
      "name": "All-Purpose Flour",
      "description": "High-quality all-purpose flour",
      "unit": "grams",
      "costPerUnit": 0.02,
      "supplier": "Local Mill Co.",
      "isAvailable": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### **GET /api/ingredients/:id**
Get a specific ingredient by ID.

**Response:**
```json
{
  "ingredient": {
    "id": "uuid",
    "name": "All-Purpose Flour",
    "description": "High-quality all-purpose flour",
    "unit": "grams",
    "costPerUnit": 0.02,
    "supplier": "Local Mill Co.",
    "isAvailable": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### **POST /api/ingredients**
Create a new ingredient.

**Request Body:**
```json
{
  "name": "All-Purpose Flour",
  "description": "High-quality all-purpose flour",
  "unit": "grams",
  "costPerUnit": 0.02,
  "supplier": "Local Mill Co.",
  "isAvailable": true
}
```

**Validation Rules:**
- `name`: Required, 1-100 characters
- `description`: Optional
- `unit`: Required, 1-20 characters
- `costPerUnit`: Required, non-negative number
- `supplier`: Optional
- `isAvailable`: Optional, defaults to true

**Response:**
```json
{
  "message": "Ingredient created successfully",
  "ingredient": {
    "id": "uuid",
    "name": "All-Purpose Flour",
    "description": "High-quality all-purpose flour",
    "unit": "grams",
    "costPerUnit": 0.02,
    "supplier": "Local Mill Co.",
    "isAvailable": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### **PUT /api/ingredients/:id**
Update an existing ingredient.

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Flour Name",
  "costPerUnit": 0.025
}
```

**Response:**
```json
{
  "message": "Ingredient updated successfully",
  "ingredient": {
    "id": "uuid",
    "name": "Updated Flour Name",
    "description": "High-quality all-purpose flour",
    "unit": "grams",
    "costPerUnit": 0.025,
    "supplier": "Local Mill Co.",
    "isAvailable": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### **DELETE /api/ingredients/:id**
Delete an ingredient (only if not used in any recipes).

**Response:**
```json
{
  "message": "Ingredient deleted successfully"
}
```

**Error Response (if used in recipes):**
```json
{
  "message": "Cannot delete ingredient that is used in recipes. Remove it from all recipes first."
}
```

---

## 📝 Recipes API

### **Base URL**: `/api/recipes`

All endpoints require authentication and VENDOR role.

---

### **GET /api/recipes**
Get all recipes for the authenticated vendor.

**Response:**
```json
{
  "recipes": [
    {
      "id": "uuid",
      "name": "Classic Chocolate Chip Cookies",
      "description": "Traditional chocolate chip cookie recipe",
      "instructions": "1. Mix dry ingredients...",
      "yield": 24,
      "yieldUnit": "cookies",
      "prepTime": 15,
      "cookTime": 12,
      "difficulty": "Easy",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "product": {
        "id": "uuid",
        "name": "Chocolate Chip Cookies",
        "price": 12.99
      },
      "_count": {
        "recipeIngredients": 5
      }
    }
  ],
  "count": 1
}
```

---

### **GET /api/recipes/:id**
Get a specific recipe by ID.

**Response:**
```json
{
  "recipe": {
    "id": "uuid",
    "name": "Classic Chocolate Chip Cookies",
    "description": "Traditional chocolate chip cookie recipe",
    "instructions": "1. Mix dry ingredients...",
    "yield": 24,
    "yieldUnit": "cookies",
    "prepTime": 15,
    "cookTime": 12,
    "difficulty": "Easy",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "product": {
      "id": "uuid",
      "name": "Chocolate Chip Cookies",
      "price": 12.99
    }
  }
}
```

---

### **GET /api/recipes/:id/ingredients**
Get all ingredients for a specific recipe.

**Response:**
```json
{
  "recipeIngredients": [
    {
      "id": "uuid",
      "quantity": 250,
      "unit": "grams",
      "notes": "Sifted",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "ingredient": {
        "id": "uuid",
        "name": "All-Purpose Flour",
        "description": "High-quality all-purpose flour",
        "unit": "grams",
        "costPerUnit": 0.02,
        "supplier": "Local Mill Co.",
        "isAvailable": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "count": 1
}
```

---

### **POST /api/recipes**
Create a new recipe.

**Request Body:**
```json
{
  "name": "Classic Chocolate Chip Cookies",
  "description": "Traditional chocolate chip cookie recipe",
  "instructions": "1. Mix dry ingredients...",
  "yield": 24,
  "yieldUnit": "cookies",
  "prepTime": 15,
  "cookTime": 12,
  "difficulty": "Easy",
  "isActive": true,
  "productId": "uuid" // Optional: link to a product
}
```

**Validation Rules:**
- `name`: Required, 1-100 characters
- `description`: Optional
- `instructions`: Optional
- `yield`: Required, positive integer
- `yieldUnit`: Required, 1-20 characters
- `prepTime`: Optional, non-negative integer (minutes)
- `cookTime`: Optional, non-negative integer (minutes)
- `difficulty`: Optional
- `isActive`: Optional, defaults to true
- `productId`: Optional, must belong to vendor

**Response:**
```json
{
  "message": "Recipe created successfully",
  "recipe": {
    "id": "uuid",
    "name": "Classic Chocolate Chip Cookies",
    "description": "Traditional chocolate chip cookie recipe",
    "instructions": "1. Mix dry ingredients...",
    "yield": 24,
    "yieldUnit": "cookies",
    "prepTime": 15,
    "cookTime": 12,
    "difficulty": "Easy",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "product": {
      "id": "uuid",
      "name": "Chocolate Chip Cookies",
      "price": 12.99
    }
  }
}
```

---

### **PUT /api/recipes/:id**
Update an existing recipe.

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Recipe Name",
  "yield": 30,
  "difficulty": "Medium"
}
```

**Response:**
```json
{
  "message": "Recipe updated successfully",
  "recipe": {
    "id": "uuid",
    "name": "Updated Recipe Name",
    "description": "Traditional chocolate chip cookie recipe",
    "instructions": "1. Mix dry ingredients...",
    "yield": 30,
    "yieldUnit": "cookies",
    "prepTime": 15,
    "cookTime": 12,
    "difficulty": "Medium",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "product": {
      "id": "uuid",
      "name": "Chocolate Chip Cookies",
      "price": 12.99
    }
  }
}
```

---

### **DELETE /api/recipes/:id**
Delete a recipe (includes all recipe ingredients).

**Response:**
```json
{
  "message": "Recipe deleted successfully"
}
```

---

### **POST /api/recipes/:id/ingredients**
Batch add ingredients to a recipe.

**Request Body:**
```json
{
  "ingredients": [
    {
      "ingredientId": "uuid",
      "quantity": 250,
      "unit": "grams",
      "notes": "Sifted"
    },
    {
      "ingredientId": "uuid",
      "quantity": 200,
      "unit": "grams",
      "notes": "Room temperature"
    }
  ]
}
```

**Validation Rules:**
- `ingredients`: Required array with at least one ingredient
- `ingredientId`: Required, must belong to vendor
- `quantity`: Required, positive number
- `unit`: Required, 1-20 characters
- `notes`: Optional

**Features:**
- If ingredient already exists in recipe, it will be updated
- If ingredient doesn't exist, it will be created
- All operations are performed in a transaction
- Validates that all ingredients belong to the vendor

**Response:**
```json
{
  "message": "Ingredients added to recipe successfully",
  "recipeIngredients": [
    {
      "id": "uuid",
      "quantity": 250,
      "unit": "grams",
      "notes": "Sifted",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "ingredient": {
        "id": "uuid",
        "name": "All-Purpose Flour",
        "description": "High-quality all-purpose flour",
        "unit": "grams",
        "costPerUnit": 0.02,
        "supplier": "Local Mill Co.",
        "isAvailable": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "count": 1
}
```

---

### **DELETE /api/recipes/:id/ingredients/:ingredientId**
Remove a specific ingredient from a recipe.

**Response:**
```json
{
  "message": "Ingredient removed from recipe successfully"
}
```

---

## 🔐 Authentication & Authorization

### **Required Headers:**
```
Cookie: connect.sid=<session-id>
```

### **Session Management:**
- All endpoints require a valid session
- Session is created via `/api/auth/login`
- Session includes `userId` for vendor identification

### **Role Requirements:**
- All endpoints require `VENDOR` role
- Users must have a `VendorProfile` to access these endpoints

---

## 📊 Error Responses

### **Validation Error (400):**
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### **Not Found (404):**
```json
{
  "message": "Ingredient not found"
}
```

### **Unauthorized (401):**
```json
{
  "message": "Unauthorized"
}
```

### **Forbidden (403):**
```json
{
  "message": "Access denied"
}
```

### **Server Error (500):**
```json
{
  "message": "Failed to fetch ingredients"
}
```

---

## 🧪 Example Usage

### **Complete Recipe Creation Workflow:**

1. **Create Ingredients:**
```bash
POST /api/ingredients
{
  "name": "All-Purpose Flour",
  "unit": "grams",
  "costPerUnit": 0.02
}

POST /api/ingredients
{
  "name": "Granulated Sugar",
  "unit": "grams",
  "costPerUnit": 0.01
}
```

2. **Create Recipe:**
```bash
POST /api/recipes
{
  "name": "Classic Chocolate Chip Cookies",
  "yield": 24,
  "yieldUnit": "cookies",
  "prepTime": 15,
  "cookTime": 12
}
```

3. **Add Ingredients to Recipe:**
```bash
POST /api/recipes/{recipe-id}/ingredients
{
  "ingredients": [
    {
      "ingredientId": "{flour-id}",
      "quantity": 250,
      "unit": "grams"
    },
    {
      "ingredientId": "{sugar-id}",
      "quantity": 200,
      "unit": "grams"
    }
  ]
}
```

4. **Get Recipe with Ingredients:**
```bash
GET /api/recipes/{recipe-id}/ingredients
```

---

## 🔮 Future Enhancements

- **Recipe Categories**: Add categories for better organization
- **Recipe Versions**: Track recipe changes over time
- **Ingredient Substitutions**: Allow ingredient alternatives
- **Recipe Scaling**: Automatically scale ingredient quantities
- **Cost Analysis**: Calculate total recipe costs and margins
- **Inventory Integration**: Link ingredients to inventory management
- **Recipe Search**: Search recipes by name, ingredients, or tags
- **Recipe Import/Export**: Import/export recipes in various formats 