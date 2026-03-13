import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL;

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

  const fetchCart = async () => {
    if (!isAuthenticated || !token) {
      setCart({ items: [], subtotal: 0, total: 0, itemCount: 0 });
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setCart(response.data.data);
      }
    } catch (error) {
      console.error('❌ Fetch cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, token]);

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      throw new Error('Not authenticated');
    }

    if (!token) {
      toast.error('Authentication error. Please login again.');
      throw new Error('Token missing');
    }

    try {
      let productName;

      if (typeof product === 'string') {
        productName = product;
      } else if (product?.productName) {
        productName = product.productName;
      } else if (product?.name) {
        productName = product.name;
      } else {
        throw new Error('Invalid product format');
      }

      const response = await axios.post(
        `${API_URL}/api/cart/add`,
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

      if (response.data?.success) {
        if (response.data.data) {
          setCart(response.data.data);
        } else {
          await fetchCart();
        }

        toast.success('Added to cart');
      }
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/cart/items/${itemId}`,
        { quantity },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data?.success) {
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
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/cart/items/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data?.success) {
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
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCart({ items: [], subtotal: 0, total: 0, itemCount: 0 });

      toast.success('Cart cleared');
    } catch (error) {
      console.error('❌ Clear cart error:', error);
      toast.error('Failed to clear cart');
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