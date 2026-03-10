import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Add item to cart - NAMED EXPORT
export const addToCart = async (item) => {
  try {
    const token = getToken();
    const response = await axios.post(
      `${API_URL}/cart/items`,
      item,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Get user cart - NAMED EXPORT
export const getCart = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// Remove item from cart - NAMED EXPORT
export const removeFromCart = async (itemId) => {
  try {
    const token = getToken();
    const response = await axios.delete(`${API_URL}/cart/items/${itemId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Update cart item quantity - NAMED EXPORT
export const updateCartQuantity = async (itemId, quantity) => {
  try {
    const token = getToken();
    const response = await axios.put(
      `${API_URL}/cart/items/${itemId}`,
      { quantity },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
};

// Clear entire cart - NAMED EXPORT
export const clearCart = async () => {
  try {
    const token = getToken();
    const response = await axios.delete(`${API_URL}/cart/clear`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Also keep default export for backward compatibility
export default {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart
};