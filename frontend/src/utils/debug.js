// Add this to your browser console to check the API response
export const debugAPI = async () => {
  try {
    const response = await fetch('/api/products/featured');
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.data && data.data.length > 0) {
      console.log('First product:', data.data[0]);
      console.log('Price type:', typeof data.data[0].price);
      console.log('Price value:', data.data[0].price);
    }
  } catch (error) {
    console.error('Debug error:', error);
  }
};