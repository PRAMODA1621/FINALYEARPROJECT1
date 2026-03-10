import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, token } = useAuth();

  // Fetch cart from server
  const fetchCart = async () => {
    if (!isAuthenticated || !token) {
      setCart({ items: [], subtotal: 0, total: 0, itemCount: 0 });
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCart(response.data.data);
      }
    } catch (error) {
      console.error('❌ Fetch cart error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load cart when authentication state changes
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, token]);

  // Add item to cart
  // Add item to cart
const addToCart = async (product, quantity = 1) => {
  console.log('🛒 addToCart called with:', { product, quantity });
  
  if (!isAuthenticated) {
    toast.error('Please login to add items to cart');
    throw new Error('Not authenticated');
  }

  if (!token) {
    toast.error('Authentication error. Please login again.');
    throw new Error('No token');
  }

  try {
    // FIXED: Handle both string and object formats
    let productName;
    
    if (typeof product === 'string') {
      productName = product;
    } else if (product.productName) {
      productName = product.productName;
    } else if (product.name) {
      productName = product.name;
    } else {
      toast.error('Invalid product format');
      throw new Error('Invalid product format');
    }

    const response = await axios.post(
      'http://localhost:5000/api/cart/add',
      { 
        productName: productName,
        quantity: quantity
      },
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    if (response.data.success) {
      if (response.data.data) {
        setCart(response.data.data);
      } else {
        await fetchCart();
      }
      toast.success(`Added to cart`);
      return response.data;
    }
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    toast.error(error.response?.data?.message || 'Failed to add to cart');
    throw error;
  }
};

  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/cart/items/${itemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        if (response.data.data) {
          setCart(response.data.data);
        } else {
          await fetchCart();
        }
        toast.success('Cart updated');
      }
    } catch (error) {
      console.error('❌ Update cart error:', error);
      toast.error(error.response?.data?.message || 'Failed to update cart');
      throw error;
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/cart/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        if (response.data.data) {
          setCart(response.data.data);
        } else {
          await fetchCart();
        }
        toast.success('Item removed from cart');
      }
    } catch (error) {
      console.error('❌ Remove from cart error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove item');
      throw error;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      await axios.delete('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCart({ items: [], subtotal: 0, total: 0, itemCount: 0 });
      toast.success('Cart cleared');
    } catch (error) {
      console.error('❌ Clear cart error:', error);
      toast.error('Failed to clear cart');
      throw error;
    }
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
    itemCount: cart.itemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};