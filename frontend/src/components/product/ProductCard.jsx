import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { checkInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  if (!product) return null;

  const productName = product.name || 'Product Name';
  const productCategory = product.category || 'Category';

  // FIXED IMAGE LOGIC
  const productImage = product.image_url || "/images/placeholder.jpg";

  const productStock = product.stock || 0;

  const productPrice =
    typeof product.price === 'number'
      ? product.price
      : parseFloat(product.price) || 0;

  const isInWishlist = checkInWishlist(productName);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(productName);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        name: productName,
        category: productCategory,
        price: productPrice
      });
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (!isAuthenticated) {
    toast.error('Please login to add to cart');
    navigate('/login');
    return;
  }

  // FIXED: Pass product name as string
  addToCart(product.name, 1);
  toast.success('Added to cart');
};

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${encodeURIComponent(productName)}`);
  };

  return (
    <div
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer border border-[#E8E0D5]"
      onClick={handleQuickView}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden aspect-square bg-[#F5F0E8]">

        <img
          src={productImage}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = "/images/placeholder.jpg";
          }}
        />

        {/* Wishlist */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 ${
            isInWishlist
              ? 'bg-red-500 text-white'
              : 'bg-white text-[#8B5A2B] hover:bg-[#9CAF88] hover:text-white'
          }`}
        >
          <FaHeart size={16} />
        </button>

        {/* Stock badge */}
        {productStock <= 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
            Out of Stock
          </div>
        )}

        {/* Hover buttons */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={handleQuickView}
            className="bg-white text-[#8B5A2B] p-2 rounded-full hover:bg-[#9CAF88] hover:text-white transition-colors"
          >
            <FaEye size={16} />
          </button>

          <button
            onClick={handleAddToCart}
            disabled={productStock <= 0}
            className="bg-white text-[#8B5A2B] p-2 rounded-full hover:bg-[#9CAF88] hover:text-white transition-colors disabled:opacity-50"
          >
            <FaShoppingCart size={16} />
          </button>
        </div>

      </div>

      <div className="p-4">

        <p className="text-sm text-[#9CAF88] mb-1">
          {productCategory}
        </p>

        <h3 className="text-base font-medium text-[#8B5A2B] mb-2 line-clamp-2">
          {productName}
        </h3>

        <div className="flex items-center justify-between">

          <span className="text-lg font-semibold text-[#8B5A2B]">
            ₹{productPrice.toLocaleString('en-IN')}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={productStock <= 0}
            className="bg-[#9CAF88] text-white px-3 py-1.5 rounded text-xs hover:bg-[#7E8E6D] transition-colors disabled:opacity-50"
          >
            Add to Cart
          </button>

        </div>

      </div>
    </div>
  );
};

export default ProductCard;