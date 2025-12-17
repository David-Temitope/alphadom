
import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  sustainabilityScore: number;
  shipping_fee?: number;
  shipping_type?: 'per_product' | 'one_time';
  vendor_id?: string | null; // For multi-vendor checkout
}


interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number, stockCount?: number) => void;
  clearCart: () => void;
  total: number;
  totalPrice: number;
  totalSustainabilityImpact: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart_items');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  // Calculate total price
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalPrice = total;
  
  // Calculate total item count
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total sustainability impact
  const totalSustainabilityImpact = items.length > 0 
    ? items.reduce((sum, item) => sum + (item.sustainabilityScore * item.quantity), 0) / itemCount
    : 0;

  const addToCart = (product: any, requestedQuantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const totalRequested = currentQuantity + requestedQuantity;
      
      // Check stock availability
      if (product.stock_count < totalRequested) {
        const maxAvailable = Math.max(0, product.stock_count - currentQuantity);
        if (maxAvailable === 0) {
          return prevItems; // Cannot add any more
        }
        requestedQuantity = maxAvailable;
      }
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + requestedQuantity }
            : item
        );
      }
      return [...prevItems, { 
        ...product, 
        quantity: requestedQuantity,
        category: product.category || 'General',
        sustainabilityScore: product.sustainability_score || 0,
        vendor_id: product.vendor_id || null,
        shipping_fee: product.shipping_fee || 0,
        shipping_type: product.shipping_type || 'one_time'
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number, stockCount?: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    // Enforce stock limits
    const finalQuantity = stockCount ? Math.min(quantity, stockCount) : quantity;
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: finalQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      totalPrice,
      totalSustainabilityImpact,
      itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
