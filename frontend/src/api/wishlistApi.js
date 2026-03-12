import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://finalyearproject1-pvex.onrender.com/api';

// Get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Get user's wishlist - NAMED EXPORT
export const getWishlist = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/wishlist`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

// Add item to wishlist - NAMED EXPORT
export const addToWishlist = async (productName) => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_URL}/wishlist`,
    { productName },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
};

// CHANGED: Remove item from wishlist - now accepts wishlistId not productId
export const removeFromWishlist = async (wishlistId) => {
  try {
    const token = getToken();
    // Changed from /items/${productId} to /${wishlistId}
    const response = await axios.delete(`${API_URL}/wishlist/${wishlistId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

// Check if product is in wishlist - NAMED EXPORT
export const isInWishlist = async (productId) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/wishlist/check/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.isInWishlist;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};

// Clear wishlist - NAMED EXPORT
export const clearWishlist = async () => {
  try {
    const token = getToken();
    const response = await axios.delete(`${API_URL}/wishlist/clear`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
};

// Also keep default export for backward compatibility
export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  clearWishlist
};