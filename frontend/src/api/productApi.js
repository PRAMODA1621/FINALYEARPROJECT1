import axios from 'axios';

const API_URL = "https://finalyearproject1-pvex.onrender.com/api";
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

// Add request interceptor for logging
apiClient.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
  return request;
});

// Get all products with filters - NAMED EXPORT
export const getProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice && filters.minPrice > 0) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice && filters.maxPrice > 0) params.append('maxPrice', filters.maxPrice);
    if (filters.inStock) params.append('inStock', 'true');
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const url = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Get product by ID - NAMED EXPORT
export const getProductById = async (id) => {
  try {
    const response = await apiClient.get(`/products/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};

// Get product by name - NAMED EXPORT
export const getProductByName = async (name) => {
  try {
    const response = await apiClient.get(`/products/name/${encodeURIComponent(name)}`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product by name:', error);
    throw error;
  }
};

// Get featured products - NAMED EXPORT
export const getFeaturedProducts = async () => {
  try {
    const response = await apiClient.get('/products/featured');
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

// Get categories - NAMED EXPORT
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/products/categories');
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Also keep default export for backward compatibility
export default {
  getProducts,
  getProductById,
  getProductByName,
  getFeaturedProducts,
  getCategories
};