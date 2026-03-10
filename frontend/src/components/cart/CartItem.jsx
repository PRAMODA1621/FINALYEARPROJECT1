import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!item || !item.product) return null;

  const product = item.product;
  const productName = product.name || 'Product';
  const productImage = product.image_url || '/images/placeholder.jpg';
  const productStock = product.stock || 0;

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > productStock) {
      alert(`Only ${productStock} items available`);
      return;
    }
    
    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  // Format customization if present
  const customizationText = item.customization_data ? 
    Object.entries(item.customization_data)
      .filter(([key, value]) => value && key !== 'logo')
      .map(([key, value]) => `${key}: ${value}`)
      .join(' • ') : null;

  return (
    <div className="flex items-start space-x-4 py-4 border-b border-[#E8E0D5] last:border-0">
      {/* Product Image */}
      <Link to={`/product/${encodeURIComponent(productName)}`} className="flex-shrink-0">
        <img
          src={productImage}
          alt={productName}
          className="w-16 h-16 object-cover rounded border border-[#E8E0D5]"
          onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1">
        <Link to={`/product/${encodeURIComponent(productName)}`}>
          <h3 className="text-sm font-medium text-[#8B5A2B] hover:text-[#9CAF88] transition-colors">
            {productName}
          </h3>
        </Link>
        
        {customizationText && (
          <p className="text-xs text-gray-500 mt-1">{customizationText}</p>
        )}
        
        <p className="text-xs text-gray-500 mt-1">Unit Price: ₹{item.unit_price}</p>
        
        {/* Quantity Controls - Improved UI */}
        <div className="flex items-center mt-3">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
            className={`w-8 h-8 border border-[#9CAF88] rounded-l-lg flex items-center justify-center transition-all ${
              isUpdating || item.quantity <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'hover:bg-[#9CAF88] hover:text-white'
            }`}
          >
            <FaMinus size={12} />
          </button>
          <div className="relative">
            <span className="w-12 h-8 border-t border-b border-[#9CAF88] flex items-center justify-center text-sm font-medium text-[#8B5A2B]">
              {item.quantity}
            </span>
            {isUpdating && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-[#9CAF88] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating || item.quantity >= productStock}
            className={`w-8 h-8 border border-[#9CAF88] rounded-r-lg flex items-center justify-center transition-all ${
              isUpdating || item.quantity >= productStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'hover:bg-[#9CAF88] hover:text-white'
            }`}
          >
            <FaPlus size={12} />
          </button>
          {productStock > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              {productStock} available
            </span>
          )}
        </div>
      </div>

      {/* Price and Remove */}
      <div className="text-right">
        <p className="text-sm font-medium text-[#8B5A2B]">
          ₹{(item.quantity * item.unit_price).toFixed(2)}
        </p>
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700 text-xs mt-2 flex items-center"
          disabled={isUpdating}
        >
          <FaTrash className="mr-1" size={12} />
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;