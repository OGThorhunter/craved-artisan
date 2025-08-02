# Vendor Products Page Test Guide

## 🧪 Testing the Vendor Products Page

### Prerequisites
- Backend server running on `http://localhost:3001` (mock mode)
- Frontend running on `http://localhost:5173`
- Vendor user credentials: `vendor@cravedartisan.com` / `vendor123`

### Test Steps

#### 1. Access the Products Page
1. Navigate to `http://localhost:5173`
2. Click "Login" and use vendor credentials
3. After login, click "Dashboard" or navigate to `/dashboard/vendor`
4. Click on the "Products" card or navigate to `/dashboard/vendor/products`

#### 2. Verify Page Loads
- ✅ Page should display "Products" header
- ✅ Should show "Add Product" button
- ✅ Should display existing products (3 mock products)
- ✅ Each product should show: name, price, stock, description, tags, availability status

#### 3. Test Product List Display
- ✅ Products should be listed with images (if available)
- ✅ Price should be formatted as currency
- ✅ Tags should be displayed as badges
- ✅ Availability status should be shown (Available/Unavailable)
- ✅ Creation and update dates should be displayed
- ✅ Action buttons should be visible (View, Edit, Delete)

#### 4. Test Add Product Form
1. Click "Add Product" button
2. Verify form appears with all fields:
   - ✅ Product Name (required)
   - ✅ Price (required, numeric)
   - ✅ Stock Quantity (optional, numeric)
   - ✅ Image URL (optional, URL validation)
   - ✅ Description (optional, textarea)
   - ✅ Tags (optional, comma-separated)
   - ✅ Available checkbox

#### 5. Test Form Validation
- ✅ Try submitting empty form - should show validation errors
- ✅ Try invalid price (negative) - should show error
- ✅ Try invalid URL - should show error
- ✅ Try very long product name - should show error

#### 6. Test Product Creation
1. Fill out form with valid data:
   - Name: "Test Handmade Vase"
   - Price: 75.99
   - Stock: 5
   - Image URL: https://placekitten.com/400/302
   - Description: "Beautiful handcrafted ceramic vase"
   - Tags: "ceramic, handmade, vase"
   - Available: checked
2. Click "Create Product"
3. Verify:
   - ✅ Success toast appears
   - ✅ Form closes
   - ✅ New product appears in list
   - ✅ Product count increases

#### 7. Test Error Handling
- ✅ Try creating product with invalid data
- ✅ Verify error toast appears
- ✅ Try refreshing page - products should persist (mock data)

#### 8. Test Responsive Design
- ✅ Test on different screen sizes
- ✅ Form should stack properly on mobile
- ✅ Product list should be readable on all devices

### Expected API Calls

#### GET /api/vendor/products
- Called on page load
- Should return 200 with products array

#### POST /api/vendor/products
- Called when creating new product
- Should return 201 with created product

### Mock Data
The page should display these mock products:
1. Handcrafted Wooden Bowl - $45.99
2. Ceramic Coffee Mug - $22.50
3. Test Artisan Product - $29.99 (if created during testing)

### Features Implemented
- ✅ React Query for data fetching and caching
- ✅ React Hook Form for form management
- ✅ Form validation with error messages
- ✅ Loading states and error handling
- ✅ Toast notifications for success/error
- ✅ Responsive design
- ✅ Product list with all required fields
- ✅ Add product functionality
- ✅ Clean, modern UI with Tailwind CSS

### Next Steps
- Implement edit product functionality
- Implement delete product functionality
- Add product image upload
- Add product search and filtering
- Add pagination for large product lists 