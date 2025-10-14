import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  vendorId: string;
  vendorName: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getSubtotal: () => number;
  getTax: (subtotal?: number) => number;
  getShipping: (subtotal?: number) => number;
  getTotal: () => number;
  checkout: (userId: string, prediction?: any) => Promise<any>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  state: { items: CartItem[] };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // Add new item
        return [...prevItems, { ...item, quantity }];
      }
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const getTax = useCallback((subtotal?: number) => {
    const baseAmount = subtotal ?? getSubtotal();
    const taxRate = 0.0875; // 8.75% tax rate - can be made configurable
    return baseAmount * taxRate;
  }, [getSubtotal]);

  const getShipping = useCallback((subtotal?: number) => {
    const baseAmount = subtotal ?? getSubtotal();
    if (baseAmount >= 50) return 0; // Free shipping over $50
    return 5.99; // Standard shipping rate
  }, [getSubtotal]);

  const getTotal = useCallback(() => {
    const subtotal = getSubtotal();
    const tax = getTax(subtotal);
    const shipping = getShipping(subtotal);
    return subtotal + tax + shipping;
  }, [getSubtotal, getTax, getShipping]);

  const checkout = useCallback(async (userId: string, prediction?: any) => {
    // Basic checkout implementation - can be extended
    const orderData = {
      userId,
      items,
      subtotal: getSubtotal(),
      tax: getTax(),
      shipping: getShipping(),
      total: getTotal(),
      prediction
    };
    
    // This would typically make an API call to create the order
    console.log('Checkout data:', orderData);
    return { id: 'temp-order-id', ...orderData };
  }, [items, getSubtotal, getTax, getShipping, getTotal]);

  const value: CartContextType = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getSubtotal,
    getTax,
    getShipping,
    getTotal,
    checkout,
    isOpen,
    setIsOpen,
    state: { items },
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};