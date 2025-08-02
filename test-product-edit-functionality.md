# Product Management Functionality Test Guide

## 🧪 Testing the Product CRUD Functionality

### Prerequisites
- Backend server running on `http://localhost:3001` (mock mode)
- Frontend running on `http://localhost:5173`
- Vendor user credentials: `vendor@cravedartisan.com` / `vendor123`
- At least one product created for testing

### Test Steps

#### 1. Login and Navigate to Products Page
1. Navigate to `http://localhost:5173`
2. Login as vendor: `vendor@cravedartisan.com` / `vendor123`
3. Go to `/dashboard/vendor/products`

#### 2. Test Edit Button Functionality
1. **Find Edit Button**: Look for the green edit icon (pencil) next to any product OR the blue "Edit" button below the product details
2. **Click Edit**: Click either edit button on a product
3. **Verify Form Opens**: Form should appear with "Edit Product" header
4. **Verify Pre-filled Data**: Form should be populated with existing product data:
   - Product name
   - Price
   - Stock quantity
   - Image URL
   - Description
   - Tags (comma-separated)
   - Available checkbox

#### 3. Test Form Pre-filling
- ✅ **Product Name**: Should show existing name
- ✅ **Price**: Should show existing price
- ✅ **Stock**: Should show existing stock quantity
- ✅ **Image URL**: Should show existing image URL
- ✅ **Description**: Should show existing description
- ✅ **Tags**: Should show tags as comma-separated string
- ✅ **Available**: Checkbox should reflect current availability

#### 4. Test Edit Form Validation
1. **Try Empty Required Fields**:
   - Clear product name → should show validation error
   - Clear price → should show validation error
   - Try negative price → should show validation error

2. **Try Invalid Data**:
   - Invalid URL format → should show validation error
   - Very long product name → should show validation error

#### 5. Test Update Submission
1. **Make Changes**: Modify some fields:
   - Change product name
   - Update price
   - Modify description
   - Add/remove tags
   - Toggle availability

2. **Submit Form**: Click "Update Product" button
3. **Verify Success**:
   - ✅ Success toast appears: "Product updated successfully!"
   - ✅ Form closes
   - ✅ Product list refreshes
   - ✅ Updated data appears in the list
   - ✅ Edit state is cleared

#### 6. Test Cancel Edit Functionality
1. **Start Editing**: Click edit button on a product
2. **Make Changes**: Modify some fields
3. **Cancel Edit**: Click "Cancel Edit" button
4. **Verify**:
   - ✅ Form resets to original values
   - ✅ Edit state is cleared
   - ✅ Form remains open for new product creation

#### 7. Test Cancel Form Functionality
1. **Start Editing**: Click edit button on a product
2. **Cancel Form**: Click "Cancel" button
3. **Verify**:
   - ✅ Form closes
   - ✅ Edit state is cleared
   - ✅ Form resets

#### 8. Test Add Product After Edit
1. **Start Editing**: Click edit button on a product
2. **Cancel**: Cancel the edit
3. **Add New**: Click "Add Product" button
4. **Verify**:
   - ✅ Form opens with "Add New Product" header
   - ✅ Form is empty (not pre-filled)
   - ✅ Edit state is cleared

#### 9. Test Error Handling
1. **Simulate Network Error**: (if possible)
2. **Verify Error Toast**: Should show "Failed to update product"
3. **Verify Form Stays Open**: Form should remain open with data intact

#### 10. Test Loading States
1. **Start Edit**: Click edit button
2. **Submit Update**: Click "Update Product"
3. **Verify Loading**:
   - ✅ Button shows "Updating..." text
   - ✅ Spinner appears
   - ✅ Button is disabled

#### 11. Test Delete Functionality
1. **Find Delete Button**: Look for the red trash icon next to any product OR the red "Delete" button below the product details
2. **Click Delete**: Click either delete button on a product
3. **Confirm Deletion**: 
   - ✅ Confirmation dialog appears with product name
   - ✅ Dialog asks "Are you sure you want to delete [product name]?"
4. **Cancel Deletion**: Click "Cancel" in dialog
   - ✅ Product remains in list
   - ✅ No API call made
5. **Confirm Deletion**: Click "OK" in dialog
   - ✅ Loading spinner appears on delete button
   - ✅ Button becomes disabled
   - ✅ Success toast appears: "Product deleted successfully!"
   - ✅ Product disappears from list
   - ✅ Product count updates

#### 12. Test Action Buttons
1. **Find Action Buttons**: Look for the blue "Edit" and red "Delete" buttons below each product
2. **Test Edit Button**:
   - ✅ Button has Edit icon and "Edit" text
   - ✅ Button is blue with hover effect
   - ✅ Clicking opens edit form with pre-filled data
   - ✅ Button becomes disabled during update operation
3. **Test Delete Button**:
   - ✅ Button has Trash2 icon and "Delete" text
   - ✅ Button is red with hover effect
   - ✅ Clicking shows confirmation dialog
   - ✅ Button becomes disabled during delete operation
4. **Test Button States**:
   - ✅ Buttons are enabled when no operations are pending
   - ✅ Buttons become disabled during their respective operations
   - ✅ Visual feedback shows operation is in progress

#### 13. Test Delete Error Handling
1. **Simulate Network Error**: (if possible)
2. **Verify Error Toast**: Should show "Failed to delete product"
3. **Verify Product Remains**: Product should still be in the list

### Expected API Calls

#### PUT /api/vendor/products/:id
- Called when updating a product
- Should include all product data
- Should return 200 with updated product

#### DELETE /api/vendor/products/:id
- Called when deleting a product
- Should return 200 with success message
- Product should be removed from database

### Form Behavior

#### Edit Mode Indicators
- **Header**: Shows "Edit Product" instead of "Add New Product"
- **Button Text**: Shows "Update Product" instead of "Create Product"
- **Loading Text**: Shows "Updating..." instead of "Creating..."

#### State Management
- **Edit State**: `editing` state holds the product being edited
- **Form Reset**: Form resets when edit is cancelled or completed
- **Query Invalidation**: Product list refreshes after successful update

### Features Implemented

#### ✅ Edit State Management
- `editing` state tracks current product being edited
- Form pre-fills with existing product data
- Tags converted from array to comma-separated string

#### ✅ Update Mutation
- `updateProductMutation` handles PUT requests
- Success/error handling with toast notifications
- Query invalidation for list refresh

#### ✅ Form Logic
- `onSubmit` handles both create and update
- Data transformation for API compatibility
- Loading states for both operations

#### ✅ UI Updates
- Dynamic form header and button text
- Cancel edit button (only shown when editing)
- Proper form reset and state clearing

#### ✅ User Experience
- Seamless transition between create and edit modes
- Clear visual indicators for current mode
- Proper error handling and feedback

#### ✅ Delete Functionality
- `deleteProductMutation` handles DELETE requests
- Confirmation dialog with product name
- Loading states with spinner
- Success/error handling with toast notifications
- Query invalidation for list refresh

#### ✅ Action Buttons
- Blue "Edit" button with Edit icon below each product
- Red "Delete" button with Trash2 icon below each product
- Buttons become disabled during operations
- Hover effects and proper styling
- Consistent with existing icon buttons in header

### Test Data Examples

#### Sample Product for Testing
```json
{
  "id": "mock-product-1",
  "name": "Handcrafted Wooden Bowl",
  "description": "Beautiful hand-carved wooden bowl made from sustainable oak",
  "price": 45.99,
  "imageUrl": "https://placekitten.com/400/300",
  "tags": ["handmade", "wooden", "artisan"],
  "stock": 5,
  "isAvailable": true
}
```

#### Expected Form Pre-fill
- **Name**: "Handcrafted Wooden Bowl"
- **Price**: 45.99
- **Stock**: 5
- **Image URL**: "https://placekitten.com/400/300"
- **Description**: "Beautiful hand-carved wooden bowl made from sustainable oak"
- **Tags**: "handmade, wooden, artisan"
- **Available**: checked

### Next Steps
- ✅ Implement delete functionality
- ✅ Add confirmation dialogs for destructive actions
- Add bulk edit capabilities
- Implement product image upload
- Add product duplication feature 