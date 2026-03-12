import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://finalyearproject1-pvex.onrender.com/api';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, token } = useAuth();
  const fetchTimeoutRef = useRef(null);

  const fetchWishlist = async () => {
    if (!isAuthenticated || !token) return;
    
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setWishlist(response.data.data || []);
        }
      } catch (error) {
        console.error('Fetch wishlist error:', error);
      } finally {
        setLoading(false);
        fetchTimeoutRef.current = null;
      }
    }, 300);
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [isAuthenticated, token]);

  // In your WishlistContext.jsx, update the addToWishlist function:
const addToWishlist = async (product) => {
  if (!isAuthenticated) {
    toast.error('Please login to add to wishlist');
    return;
  }

  try {
    // If product is passed as an object with name
    const productName = typeof product === 'string' ? product : product.name;
    
    const response = await axios.post(
      `${API_URL}/wishlist`,
      { productName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.data.success) {
      if (response.data.data) {
        setWishlist(prev => [...prev, response.data.data]);
      } else {
        await fetchWishlist();
      }
      toast.success('Added to wishlist');
    }
  } catch (error) {
    console.error('Add to wishlist error:', error);
    toast.error(error.response?.data?.message || 'Failed to add to wishlist');
  }
};

  const removeFromWishlist = async (itemId) => {
    try {
      const response = await axios.delete(`${API_URL}/wishlist/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setWishlist(prev => prev.filter(item => item.id !== itemId));
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  };

  const checkInWishlist = (productName) => {
    return wishlist.some(item => item.product?.name === productName);
  };

  const getWishlistItemId = (productName) => {
    const item = wishlist.find(item => item.product?.name === productName);
    return item?.id;
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    checkInWishlist,
    getWishlistItemId,
    refreshWishlist: fetchWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};