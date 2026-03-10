import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productApi from '../../api/productApi';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaEye } from 'react-icons/fa';

const RecommendedProducts = ({ category, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (category) {
      fetchRecommendedProducts();
    }
  }, [category, currentProductId]);

  const fetchRecommendedProducts = async () => {
    try {
      setLoading(true);
      // Fetch products from same category, exclude current product
      const response = await productApi.getProducts({ 
        category, 
        limit: 4 
      });
      
      // Filter out current product
      const filtered = response.filter(p => p.id !== currentProductId);
      setProducts(filtered.slice(0, 4));
    } catch (error) {
      console.error('Error fetching recommended products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (productName) => {
    navigate(`/product/${encodeURIComponent(productName)}`);
  };

  if (loading) {
    return (
      <div className="mt-12 text-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-[#8B5A2B] mb-6">Recommended Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleViewProduct(product.name)}
          >
            <div className="aspect-square bg-[#F5F0E8]">
              <img
                src={product.image_url || '/images/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-[#9CAF88] mb-1">{product.category}</p>
              <h3 className="text-base font-medium text-[#8B5A2B] mb-2 line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[#8B5A2B]">
                  ₹{parseFloat(product.price).toLocaleString('en-IN')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProduct(product.name);
                  }}
                  className="bg-[#9CAF88] text-white p-2 rounded-full hover:bg-[#8B5A2B] transition-colors"
                  title="View Product"
                >
                  <FaEye size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;