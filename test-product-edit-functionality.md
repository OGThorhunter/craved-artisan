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
- ✅ **Image Preview**: Should display image preview below URL field
- ✅ **Description**: Should show existing description
- ✅ **Tags**: Should show tags as interactive chips with remove buttons
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
   - ✅ Confirmation modal appears with product name
   - ✅ Modal shows "Are you sure you want to delete [product name]?"
   - ✅ Modal has Cancel and Delete buttons
4. **Cancel Deletion**: Click "Cancel" in modal
   - ✅ Modal closes
   - ✅ Product remains in list
   - ✅ No API call made
5. **Confirm Deletion**: Click "Delete" in modal
   - ✅ Loading spinner appears on delete button
   - ✅ Button becomes disabled and shows "Deleting..."
   - ✅ Success toast appears: "Product deleted successfully!"
   - ✅ Product disappears from list
   - ✅ Product count updates
   - ✅ Modal closes automatically

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

#### 13. Test Image Preview Functionality
1. **Add Image URL**: Enter a valid image URL in the Image URL field
2. **Verify Preview**: 
   - ✅ Image preview appears below the URL field
   - ✅ Preview shows 128x128 thumbnail
   - ✅ Image loads correctly
3. **Test Invalid URL**: 
   - ✅ Enter invalid URL
   - ✅ Preview shows placeholder icon
4. **Test Edit Mode**: 
   - ✅ Edit existing product with image
   - ✅ Preview shows existing image
   - ✅ Update URL updates preview

#### 14. Test Tag Chips Functionality
1. **Add Tags**: 
   - ✅ Type tag name and press Enter
   - ✅ Type tag name and click "Add" button
   - ✅ Tag appears as blue chip with Tag icon
2. **Remove Tags**: 
   - ✅ Click X button on tag chip
   - ✅ Tag disappears from list
3. **Duplicate Prevention**: 
   - ✅ Try to add same tag twice
   - ✅ Only one instance appears
4. **Edit Mode**: 
   - ✅ Edit existing product
   - ✅ Existing tags appear as chips
   - ✅ Can add/remove tags
5. **Form Submission**: 
   - ✅ Tags are saved correctly
   - ✅ Tags appear in product list

#### 15. Test Toast Notifications
1. **Create Product**: 
   - ✅ Success toast: "Product created successfully!"
2. **Update Product**: 
   - ✅ Success toast: "Product updated successfully!"
3. **Delete Product**: 
   - ✅ Success toast: "Product deleted successfully!"
4. **Error Handling**: 
   - ✅ Error toasts for failed operations

#### 16. Test Delete Error Handling
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

#### ✅ Toast Notifications
- Success toasts for create, update, and delete operations
- Error toasts for failed operations
- Consistent messaging across all operations

#### ✅ Confirmation Modal
- Professional modal dialog for delete confirmation
- Shows product name in confirmation message
- Cancel and Delete buttons with proper styling
- Loading states during deletion
- Backdrop overlay for focus management

#### ✅ Image Preview
- Real-time image preview when URL is entered
- 128x128 thumbnail display
- Fallback placeholder for invalid images
- Updates dynamically when URL changes
- Works in both create and edit modes

#### ✅ Tag Chips
- Interactive tag chips with Tag icons
- Add tags via Enter key or Add button
- Remove tags with X button
- Duplicate prevention
- Blue styling with hover effects
- Proper accessibility with title attributes

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