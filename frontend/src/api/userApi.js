import axiosInstance from './axiosConfig';

const userApi = {
  // Get user profile
  getProfile: async () => {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put('/users/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await axiosInstance.put('/users/change-password', passwordData);
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/users/dashboard');
    return response.data;
  }
};

export default userApi;