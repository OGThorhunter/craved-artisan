import { useCart } from '../contexts/CartContext';
import { useLocation } from 'wouter';
import { ShoppingCart } from 'lucide-react';

const CartIcon = () => {
  const { getTotalItems, toggleCart } = useCart();
  const [, setLocation] = useLocation();
  const totalItems = getTotalItems();

  const handleCartClick = () => {
    if (totalItems > 0) {
      setLocation('/checkout');
    } else {
      toggleCart();
    }
  };

  return (
    <button
      onClick={handleCartClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      title="Shopping cart"
    >
      <ShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
};

export default CartIcon; 