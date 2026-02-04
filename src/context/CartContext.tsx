import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';

// Types
interface CartItem {
  _id: string;
  name: string;
  price: number;
  realPrice?: number;
  image: string;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  unit: string;
  stock: number;
  distributor: {
    _id: string;
    businessName: string;
    city?: string;
    state?: string;
  };
}

interface PendingCartItem {
  product: any;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  currentDistributor: { _id: string; businessName: string; city?: string; pincode?: string } | null;
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartConflictOpen: boolean;
  pendingItem: PendingCartItem | null;
  confirmReplaceCart: () => void;
  cancelReplaceCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to get cart from localStorage
const getStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save cart to localStorage
const saveCart = (cart: CartItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cart', JSON.stringify(cart));
  // Dispatch event to update header cart count
  window.dispatchEvent(new Event('storage'));
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartConflictOpen, setIsCartConflictOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<PendingCartItem | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    setCart(getStoredCart());
  }, []);

  // Get current distributor from cart
  const currentDistributor = cart.length > 0 ? cart[0].distributor : null;

  // Calculate cart count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Add to cart with distributor conflict check
  const addToCart = useCallback((product: any, quantity?: number) => {
    const currentCart = getStoredCart();
    const itemQuantity = quantity || product.minQuantity || 1;

    // Get distributor info from product
    const productDistributor = product.distributor?._id
      ? product.distributor
      : { _id: product.distributor, businessName: product.distributorName || 'Unknown' };

    // Check if cart has items from a different distributor
    if (currentCart.length > 0) {
      const cartDistributorId = currentCart[0].distributor?._id || currentCart[0].distributor;
      const productDistributorId = productDistributor._id;

      if (cartDistributorId !== productDistributorId) {
        // Show conflict modal
        setPendingItem({ product, quantity: itemQuantity });
        setIsCartConflictOpen(true);
        return;
      }
    }

    // Same distributor or empty cart - proceed to add
    addItemToCart(product, itemQuantity, currentCart);
  }, []);

  // Internal function to add item to cart
  const addItemToCart = (product: any, quantity: number, currentCart: CartItem[]) => {
    const existingItemIndex = currentCart.findIndex(item => item._id === product._id);

    let updatedCart: CartItem[];

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      updatedCart = currentCart.map((item, index) => {
        if (index === existingItemIndex) {
          const newQuantity = item.quantity + quantity;
          const maxQty = item.maxQuantity || Infinity;
          const finalQuantity = Math.min(newQuantity, maxQty, item.stock);
          return { ...item, quantity: finalQuantity };
        }
        return item;
      });
    } else {
      // Add new item
      const productDistributor = product.distributor?._id
        ? {
            _id: product.distributor._id,
            businessName: product.distributor.businessName || 'Unknown',
            city: product.distributor.city,
            state: product.distributor.state
          }
        : { _id: product.distributor, businessName: product.distributorName || 'Unknown' };

      const newItem: CartItem = {
        _id: product._id,
        name: product.name,
        price: product.price,
        realPrice: product.realPrice,
        image: product.image || product.images?.[0] || '/placeholder.jpg',
        quantity: Math.min(quantity, product.stock),
        minQuantity: product.minQuantity || 1,
        maxQuantity: product.maxQuantity,
        unit: product.unit || 'piece',
        stock: product.stock,
        distributor: productDistributor
      };
      updatedCart = [...currentCart, newItem];
    }

    setCart(updatedCart);
    saveCart(updatedCart);

    // Show success toast
    toast.success(`${product.name} added to cart`, {
      position: 'bottom-center',
      autoClose: 2000,
    });
  };

  // Confirm replacing cart with new distributor's product
  const confirmReplaceCart = useCallback(() => {
    if (!pendingItem) return;

    // Clear cart and add pending item
    const productDistributor = pendingItem.product.distributor?._id
      ? {
          _id: pendingItem.product.distributor._id,
          businessName: pendingItem.product.distributor.businessName || 'Unknown',
          city: pendingItem.product.distributor.city,
          state: pendingItem.product.distributor.state
        }
      : { _id: pendingItem.product.distributor, businessName: pendingItem.product.distributorName || 'Unknown' };

    const newItem: CartItem = {
      _id: pendingItem.product._id,
      name: pendingItem.product.name,
      price: pendingItem.product.price,
      realPrice: pendingItem.product.realPrice,
      image: pendingItem.product.image || pendingItem.product.images?.[0] || '/placeholder.jpg',
      quantity: Math.min(pendingItem.quantity, pendingItem.product.stock),
      minQuantity: pendingItem.product.minQuantity || 1,
      maxQuantity: pendingItem.product.maxQuantity,
      unit: pendingItem.product.unit || 'piece',
      stock: pendingItem.product.stock,
      distributor: productDistributor
    };

    const newCart = [newItem];
    setCart(newCart);
    saveCart(newCart);

    // Close modal and clear pending
    setIsCartConflictOpen(false);
    setPendingItem(null);

    // Show success toast
    toast.success(`Cart updated with ${pendingItem.product.name}`, {
      position: 'bottom-center',
      autoClose: 2000,
    });
  }, [pendingItem]);

  // Cancel replacing cart
  const cancelReplaceCart = useCallback(() => {
    setIsCartConflictOpen(false);
    setPendingItem(null);
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((productId: string) => {
    const updatedCart = cart.filter(item => item._id !== productId);
    setCart(updatedCart);
    saveCart(updatedCart);
  }, [cart]);

  // Update item quantity
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const updatedCart = cart.map(item => {
      if (item._id === productId) {
        const minQty = item.minQuantity || 1;
        const maxQty = item.maxQuantity || item.stock;
        const finalQuantity = Math.max(minQty, Math.min(quantity, maxQty));
        return { ...item, quantity: finalQuantity };
      }
      return item;
    });
    setCart(updatedCart);
    saveCart(updatedCart);
  }, [cart]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCart([]);
    saveCart([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        currentDistributor,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartConflictOpen,
        pendingItem,
        confirmReplaceCart,
        cancelReplaceCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
