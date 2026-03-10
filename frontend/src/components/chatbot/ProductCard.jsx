import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/Cartcontext';
import { useAuth } from '../../contexts/AuthContext';
import { FaShoppingCart, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onViewProduct, onAddToCart }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleViewProduct = () => {
    if (onViewProduct) {
      onViewProduct(product);
    } else {
      navigate(`/product/${encodeURIComponent(product.name)}`);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart({ name: product.name, price: product.price });
      toast.success('Added to cart');
    }
  };

  const imageUrl = product.image_url || 
                  (product.image ? `/images/${product.category?.toLowerCase()}/${product.image}` : '/images/placeholder.jpg');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-3 flex items-center space-x-3">
      <img
        src={imageUrl}
        alt={product.name}
        className="w-16 h-16 object-cover rounded"
        onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-[#8B5A2B] truncate">{product.name}</h4>
        <p className="text-xs text-gray-500 mt-1">₹{product.price?.toLocaleString('en-IN')}</p>
      </div>
      <div className="flex space-x-1">
        <button
          onClick={handleViewProduct}
          className="p-2 text-[#8B5A2B] hover:bg-[#F5F0E8] rounded"
          title="View Product"
        >
          <FaEye size={14} />
        </button>
        <button
          onClick={handleAddToCart}
          className="p-2 text-[#8B5A2B] hover:bg-[#F5F0E8] rounded"
          title="Add to Cart"
        >
          <FaShoppingCart size={14} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;