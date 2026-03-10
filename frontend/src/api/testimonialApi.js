import axiosInstance from './axiosConfig';

const testimonialApi = {
  // Get all testimonials
  getTestimonials: async () => {
    const response = await axiosInstance.get('/testimonials');
    return response.data;
  },

  // Create testimonial (admin)
  createTestimonial: async (testimonialData) => {
    const response = await axiosInstance.post('/admin/testimonials', testimonialData);
    return response.data;
  },

  // Update testimonial (admin)
  updateTestimonial: async (id, testimonialData) => {
    const response = await axiosInstance.put(`/admin/testimonials/${id}`, testimonialData);
    return response.data;
  },

  // Delete testimonial (admin)
  deleteTestimonial: async (id) => {
    const response = await axiosInstance.delete(`/admin/testimonials/${id}`);
    return response.data;
  }
};

export default testimonialApi;