import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

const WishlistItem = ({ item, onRemove }) => {
  const { addToCart } = useCart();
  
  const product = item.product || item;
  const productName = product.name || 'Product';
  const productPrice = product.price || 0;
  const productImage = product.image_url || '/images/placeholder.jpg';
  const productCategory = product.category || 'Category';
  const productStock = product.stock || 0;

  const handleAddToCart = () => {
    addToCart({ name: productName, price: productPrice });
    toast.success('Added to cart');
  };

  if (!product) return null;

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
        
        <p className="text-xs text-gray-500 mt-1">{productCategory}</p>
        
        <p className="text-sm font-medium text-[#8B5A2B] mt-1">
          ₹{productPrice.toLocaleString('en-IN')}
        </p>

        {productStock <= 0 ? (
          <p className="text-xs text-red-600 mt-1">Out of Stock</p>
        ) : productStock < 10 ? (
          <p className="text-xs text-orange-600 mt-1">Only {productStock} left!</p>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={handleAddToCart}
          disabled={productStock <= 0}
          className="bg-[#9CAF88] text-white px-3 py-1.5 rounded text-xs hover:bg-[#7E8E6D] transition-colors disabled:opacity-50 flex items-center space-x-1"
        >
          <FaShoppingCart size={12} />
          <span>Add to Cart</span>
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700 text-xs flex items-center justify-center"
        >
          <FaTrash className="mr-1" size={12} />
          Remove
        </button>
      </div>
    </div>
  );
};

export default WishlistItem;