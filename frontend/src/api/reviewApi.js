import axios from 'axios';

const API_URL = "/api";
const getToken = () => localStorage.getItem('token');

const reviewApi = {
  // Get reviews for a product
  getProductReviews: async (productId, page = 1, limit = 10) => {
    const response = await axios.get(
      `${API_URL}/reviews/product/${productId}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Add a review
  addReview: async (productId, reviewData) => {
    const token = getToken();
    const response = await axios.post(
      `${API_URL}/reviews/product/${productId}`,
      reviewData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    const token = getToken();
    const response = await axios.put(
      `${API_URL}/reviews/${reviewId}`,
      reviewData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    const token = getToken();
    const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Mark review as helpful/not helpful
  markHelpful: async (reviewId, isHelpful) => {
    const token = getToken();
    const response = await axios.post(
      `${API_URL}/reviews/${reviewId}/helpful`,
      { isHelpful },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};

export default reviewApi;