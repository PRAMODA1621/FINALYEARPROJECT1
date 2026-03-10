import axiosInstance from './axiosConfig';

const recommendationApi = {
  // Get product recommendations
  getProductRecommendations: async (productId, limit = 5) => {
    const response = await axiosInstance.get(`/recommendations/product/${productId}`, {
      params: { limit }
    });
    return response.data;
  },

  // Get personalized recommendations
  getPersonalizedRecommendations: async (limit = 10) => {
    const response = await axiosInstance.get('/recommendations/personalized', {
      params: { limit }
    });
    return response.data;
  }
};

export default recommendationApi;