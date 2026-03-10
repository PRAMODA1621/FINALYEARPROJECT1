import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import productApi from '../api/productApi';
import { FaShoppingCart, FaHeart, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const { checkInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productApi.getProductById(id);
      if (response.success) {
        setProduct(response.data);
      } else {
        toast.error('Product not found');
      }
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  // Safe check - return loading state if product not loaded
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#9CAF88] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8B5A2B]">Loading product...</p>
        </div>
      </div>
    );
  }

  // Safe check - return not found if product is null
  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#8B5A2B] mb-4">Product Not Found</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-[#9CAF88] text-white px-6 py-3 rounded-lg hover:bg-[#8B5A2B] transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // Safe destructuring with defaults
  const {
    name = '',
    description = '',
    category = '',
    price = 0,
    stock = 0,
    image_url = '/images/placeholder.jpg'
  } = product;

  const isInWishlist = checkInWishlist(product.id);
  const productImage = imageError ? '/images/placeholder.jpg' : image_url;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    addToCart(product, quantity);
    toast.success('Added to cart');
  };

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }
    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  return (
    <>
      <Helmet>
        <title>{name} - Venus Enterprises</title>
      </Helmet>

      <div className="bg-[#F5F5F0] min-h-screen py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#8B5A2B] hover:text-[#9CAF88] mb-6 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Product Image */}
              <div className="bg-[#F5F5F0] rounded-lg p-8 flex items-center justify-center">
                <img
                  src={productImage}
                  alt={name}
                  className="max-w-full max-h-96 object-contain"
                  onError={() => setImageError(true)}
                />
              </div>

              {/* Product Details */}
              <div>
                <p className="text-[#9CAF88] text-sm mb-2">{category}</p>
                <h1 className="text-3xl font-bold text-[#8B5A2B] mb-4">{name}</h1>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold text-[#8B5A2B]">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  {stock > 0 ? (
                    <span className="ml-4 text-[#9CAF88]">In Stock ({stock} available)</span>
                  ) : (
                    <span className="ml-4 text-red-600">Out of Stock</span>
                  )}
                </div>

                <div className="prose max-w-none mb-8">
                  <h3 className="text-lg font-semibold text-[#8B5A2B] mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
                </div>

                {/* Quantity Selector */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-[#8B5A2B] mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-[#9CAF88] rounded-lg flex items-center justify-center hover:bg-[#9CAF88] hover:text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="w-16 text-center text-lg font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      className="w-10 h-10 border border-[#9CAF88] rounded-lg flex items-center justify-center hover:bg-[#9CAF88] hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={stock <= 0}
                    className="flex-1 bg-[#9CAF88] text-white px-6 py-3 rounded-lg hover:bg-[#8B5A2B] transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <FaShoppingCart />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleWishlistClick}
                    className={`px-6 py-3 rounded-lg border-2 transition-colors flex items-center justify-center space-x-2 ${
                      isInWishlist
                        ? 'bg-red-500 text-white border-red-500'
                        : 'border-[#9CAF88] text-[#8B5A2B] hover:bg-[#9CAF88] hover:text-white'
                    }`}
                  >
                    <FaHeart />
                    <span>{isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailsPage;