import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags: string[];
  stock: number;
  isAvailable: boolean;
  targetMargin?: number;
  recipeId?: string;
  onWatchlist: boolean;
  lastAiSuggestion?: number;
  aiSuggestionNote?: string;
  createdAt: string;
  updatedAt: string;
  vendorProfileId: string;
}

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product, className = '' }) => {
  const { addItem, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const currentQuantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    if (!product.isAvailable) {
      toast.error('This product is currently unavailable');
      return;
    }

    if (product.stock < quantity) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    addItem(product, quantity);
    toast.success(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart`);
    setQuantity(1); // Reset quantity after adding
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  if (!product.isAvailable) {
    return (
      <button
        disabled
        className={`w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed ${className}`}
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Quantity Selector */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1}
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-12 text-center font-medium">{quantity}</span>
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={quantity >= product.stock}
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <ShoppingCart className="h-5 w-5" />
        {currentQuantity > 0 ? `Add ${quantity} More` : `Add ${quantity} to Cart`}
      </button>

      {/* Stock Info */}
      {product.stock > 0 && (
        <p className="text-sm text-gray-600 text-center">
          {product.stock} {product.stock === 1 ? 'item' : 'items'} in stock
        </p>
      )}
    </div>
  );
};

export default AddToCartButton; 