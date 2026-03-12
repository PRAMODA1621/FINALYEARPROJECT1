import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductByName } from '../api/productApi';
import { useCart } from '../contexts/CartContext';
import { addToWishlist } from '../api/wishlistApi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import RecommendedProducts from '../components/product/RecommendedProducts';
import './ProductDetailsPage.css';
import ProductReviews from '../components/product/ProductReviews';
import { 
  FaHeart, FaShoppingCart, FaArrowLeft, FaTruck, FaShieldAlt, 
  FaRecycle, FaClock, FaAward, FaCheck, FaPlus, FaMinus,
  FaStar, FaRegStar, FaStarHalfAlt, FaMedal, FaTrophy, FaCrown,
  FaUsers, FaEye, FaShare, FaWhatsapp, FaEnvelope, FaTwitter,
  FaFacebook, FaFire, FaLeaf, FaGem, FaMapMarkerAlt, FaBox
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetailsPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [logo, setLogo] = useState(null);
  const [engravingColor, setEngravingColor] = useState("#000000");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryChecked, setDeliveryChecked] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    fetchProduct();
    
    // Load recently viewed from localStorage
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      setRecentlyViewed(JSON.parse(saved));
    }
  }, [name]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const decodedName = decodeURIComponent(name);
      const data = await getProductByName(decodedName);

      if (!data) {
        toast.error('Product not found');
        setProduct(null);
      } else {
        setProduct(data);
        
        // Save to recently viewed
        const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const updated = [data, ...recent.filter(p => p.id !== data.id)].slice(0, 4);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
        setRecentlyViewed(updated);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error(error.response?.data?.message || 'Failed to load product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder.jpg";
    return imagePath;
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login', { state: { from: `/product/${name}` } });
      return;
    }

    try {
      await addToCart({
        productName: product.name,
        quantity
      });
      toast.success(`${quantity} item(s) added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to buy items');
      navigate('/login', { state: { from: `/product/${name}` } });
      return;
    }

    try {
      await addToCart({
        productName: product.name,
        quantity
      });

      toast.success('Product added! Redirecting to checkout...');
      navigate('/checkout');
    } catch (error) {
      console.error('Error buying now:', error);
      toast.error('Failed to process purchase');
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      navigate('/login', { state: { from: `/product/${name}` } });
      return;
    }

    try {
      await addToWishlist(product.name);
      toast.success('Product added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryChecked(true);
      toast.success('Delivery available in 5-7 days');
    } else {
      toast.error('Please enter a valid 6-digit pincode');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F5F0] to-[#E8DDD0]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[#9CAF88] border-t-[#8B5A2B] rounded-full animate-spin"></div>
          <FaTrophy className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#8B5A2B] text-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F5F0] to-[#E8DDD0]">
        <div className="text-center bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl">
          <FaCrown className="text-6xl text-[#8B5A2B]/30 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-[#8B5A2B] mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/products')} 
            className="bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white px-8 py-3 rounded-xl hover:from-[#9CAF88] hover:to-[#8B5A2B] transition shadow-lg"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const productImages = [
    product.image_url,
    ...(product.additionalImages || [])
  ].filter(Boolean);

  // Mock data for UI enhancements
  const rating = 4.5;
  const reviewCount = 24;
  const isBestseller = true;
  const isNew = false;
  const discount = 10;

  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#F8F5F0] via-[#F0EAE0] to-[#E8DDD0] py-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-[#8B5A2B]/10 text-3xl"
              initial={{ 
                x: Math.random() * 2000, 
                y: Math.random() * 2000,
                rotate: 0,
              }}
              animate={{ 
                x: Math.random() * 2000,
                y: Math.random() * 2000,
                rotate: 360,
              }}
              transition={{ 
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {i % 3 === 0 ? '🏆' : i % 3 === 1 ? '🥇' : '🎖️'}
            </motion.div>
          ))}
        </div>

        {/* Floating Award Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`award-${i}`}
              className="absolute text-[#8B5A2B]/5 text-5xl"
              initial={{ 
                x: Math.random() * 2000, 
                y: Math.random() * 2000,
                rotate: 0
              }}
              animate={{ 
                y: [null, -40, 40, -40],
                rotate: 360
              }}
              transition={{ 
                duration: Math.random() * 15 + 15,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {i % 2 === 0 ? <FaTrophy /> : <FaCrown />}
            </motion.div>
          ))}
        </div>

        {/* Decorative Orbs */}
        <div className="absolute top-40 left-20 w-96 h-96 bg-[#9CAF88]/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-[#8B5A2B]/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#8B5A2B] hover:text-[#9CAF88] mb-6 transition group bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Products</span>
          </motion.button>

          {/* Main Product Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-8 mb-8 border border-white/20">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image Gallery with Zoom */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] rounded-2xl opacity-20 group-hover:opacity-30 transition duration-300 blur"></div>
                  <div className="relative aspect-square bg-gradient-to-br from-[#F8F5F0] to-white rounded-2xl overflow-hidden shadow-xl">
                    {/* Image with Zoom Effect */}
                    <img
                      src={productImages[selectedImage] || '/images/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                    />
                    
                    {/* Zoom Lens Effect */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-[#8B5A2B] opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaEye className="inline mr-1" /> Hover to zoom
                      </div>
                    </div>
                    
                    {/* Product Highlights Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {isBestseller && (
                        <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
                          <FaCrown /> Bestseller
                        </span>
                      )}
                      {isNew && (
                        <span className="bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
                          <FaStar /> New Arrival
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="bg-gradient-to-r from-red-400 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
                          <FaFire /> {discount}% OFF
                        </span>
                      )}
                      {product.is_featured && (
                        <span className="bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                          <FaMedal /> Featured
                        </span>
                      )}
                      {product.stock <= 0 && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Share Button */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition relative"
                      >
                        <FaShare className="text-[#8B5A2B]" />
                      </button>

                      {/* Share Menu */}
                      {showShareMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-12 right-0 bg-white rounded-xl shadow-xl p-2 min-w-[150px] z-20 border border-gray-100"
                        >
                          {[
                            { icon: FaWhatsapp, name: 'WhatsApp', color: 'text-green-500' },
                            { icon: FaEnvelope, name: 'Email', color: 'text-blue-500' },
                            { icon: FaTwitter, name: 'Twitter', color: 'text-sky-500' },
                            { icon: FaFacebook, name: 'Facebook', color: 'text-blue-600' }
                          ].map((platform) => (
                            <button
                              key={platform.name}
                              className="w-full text-left px-3 py-2 hover:bg-[#F8F5F0] rounded-lg text-sm text-gray-700 transition flex items-center gap-2"
                            >
                              <platform.icon className={platform.color} />
                              {platform.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thumbnails */}
                {productImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {productImages.map((img, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedImage(index)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                          selectedImage === index 
                            ? 'border-[#8B5A2B] shadow-lg' 
                            : 'border-transparent hover:border-[#9CAF88]'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                        />
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                {/* Category & Title */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-[#9CAF88] mb-2">
                    <FaAward />
                    <span className="uppercase tracking-wider">{product.category}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#8B5A2B] mb-3">{product.name}</h1>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        star <= Math.floor(rating) ? (
                          <FaStar key={star} className="text-yellow-400" />
                        ) : star === Math.ceil(rating) && rating % 1 !== 0 ? (
                          <FaStarHalfAlt key={star} className="text-yellow-400" />
                        ) : (
                          <FaRegStar key={star} className="text-yellow-400" />
                        )
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{rating} ({reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-[#8B5A2B]">₹{product.price}</span>
                  {product.original_price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">₹{product.original_price}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                        Save ₹{product.original_price - product.price}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="text-gray-600 leading-relaxed border-l-4 border-[#9CAF88] pl-4 py-2 bg-white/50 rounded-r-lg">
                    {product.description}
                  </div>
                )}

                {/* Specifications */}
                {product.specifications && (
                  <div className="bg-[#F8F5F0] rounded-xl p-4">
                    <h3 className="font-semibold text-[#8B5A2B] mb-3 flex items-center gap-2">
                      <FaCheck className="text-[#9CAF88]" /> Specifications
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(product.specifications).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="bg-white p-3 rounded-lg shadow-sm">
                          <span className="text-xs text-gray-500">{key}</span>
                          <p className="font-medium text-[#8B5A2B] text-sm">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Availability Progress Bar */}
                {product.stock > 0 && product.stock < 20 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-orange-700 flex items-center gap-1">
                        <FaFire className="text-orange-500" /> Hurry! Only {product.stock} left in stock
                      </span>
                      <span className="text-xs text-orange-700 font-medium">
                        {Math.round((20 - product.stock) / 20 * 100)}% sold
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-orange-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
                        style={{ width: `${Math.min(100, (20 - product.stock) / 20 * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 bg-[#F8F5F0] p-3 rounded-xl">
                  <span className="text-sm font-medium text-gray-600">Quantity:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <FaMinus className="text-gray-500 text-xs" />
                    </button>
                    <span className="w-10 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <FaPlus className="text-gray-500 text-xs" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">{product.stock} available</span>
                </div>

                {/* Customization Section */}
                <div className="bg-gradient-to-r from-[#F8F5F0] to-white rounded-xl p-4 border border-[#9CAF88]/20">
                  <h3 className="font-semibold text-[#8B5A2B] mb-3">Customize Your Product</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <label className="block text-xs text-gray-500 mb-1">Upload Logo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogo(e.target.files[0])}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-[#8B5A2B] file:text-white hover:file:bg-[#9CAF88]"
                      />
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <label className="block text-xs text-gray-500 mb-1">Engraving Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={engravingColor}
                          onChange={(e) => setEngravingColor(e.target.value)}
                          className="w-8 h-8 rounded border border-gray-200"
                        />
                        <span className="text-sm text-gray-600">{engravingColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="flex-1 bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#9CAF88] hover:to-[#8B5A2B] transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className="flex-1 bg-white border-2 border-[#8B5A2B] text-[#8B5A2B] px-6 py-3 rounded-xl font-semibold hover:bg-[#8B5A2B] hover:text-white transition disabled:opacity-50 shadow-lg"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={handleAddToWishlist}
                    className="w-12 h-12 bg-white border border-gray-200 rounded-xl hover:bg-[#F8F5F0] transition flex items-center justify-center shadow-lg"
                  >
                    <FaHeart className="text-[#8B5A2B]" />
                  </button>
                </div>

                {/* Delivery Info */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FaTruck className="text-[#8B5A2B]" />
                    <span>Free Shipping over ₹5000</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FaShieldAlt className="text-[#8B5A2B]" />
                    <span>Premium Quality</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FaRecycle className="text-[#8B5A2B]" />
                    <span>Eco-Friendly</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FaClock className="text-[#8B5A2B]" />
                    <span>5-7 Days Delivery</span>
                  </div>
                </div>

                {/* Delivery Estimate Calculator */}
                <div className="bg-gradient-to-r from-[#F8F5F0] to-white rounded-xl p-4 border border-[#9CAF88]/20">
                  <h3 className="font-semibold text-[#8B5A2B] mb-2 text-sm flex items-center gap-2">
                    <FaTruck /> Delivery Estimate
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                      <input
                        type="text"
                        placeholder="Enter pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5A2B]"
                        maxLength="6"
                      />
                    </div>
                    <button
                      onClick={checkDelivery}
                      className="bg-[#8B5A2B] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#9CAF88] transition whitespace-nowrap"
                    >
                      Check
                    </button>
                  </div>
                  {deliveryChecked && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-green-600 mt-2 flex items-center gap-1"
                    >
                      <FaCheck /> Available in 5-7 business days
                    </motion.p>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCheck className="text-green-600 text-sm" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">Secure Payment</p>
                        <p className="text-[10px] text-gray-500">100% Protected</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaRecycle className="text-blue-600 text-sm" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">Easy Returns</p>
                        <p className="text-[10px] text-gray-500">30 Days Policy</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <FaAward className="text-purple-600 text-sm" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">Quality Check</p>
                        <p className="text-[10px] text-gray-500">Certified</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Social Proof Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-6 border border-white/20">
            <h3 className="text-lg font-semibold text-[#8B5A2B] mb-4 flex items-center gap-2">
              <FaUsers className="text-[#9CAF88]" /> What others are saying
            </h3>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-[#8B5A2B] to-[#9CAF88] flex items-center justify-center text-white text-xs font-bold shadow-md"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold shadow-md">
                  +24
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
                <p className="text-sm text-gray-600">Rated 4.8 by 50+ customers</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaBox />
                <span>500+ units sold this month</span>
              </div>
            </div>
          </div>

          {/* Reviews Section - Your original component */}
          <ProductReviews productId={product.id} productName={product.name} />
          
          {/* Recommended Products - Your original component */}
          <RecommendedProducts 
            category={product.category} 
            currentProductId={product.id} 
          />

          {/* Recently Viewed Products */}
          {recentlyViewed.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-[#8B5A2B] mb-4 flex items-center gap-2">
                <FaClock className="text-[#9CAF88]" /> Recently Viewed
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {recentlyViewed.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    onClick={() => navigate(`/product/${encodeURIComponent(item.name)}`)}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-md hover:shadow-lg transition cursor-pointer group"
                  >
                    <div className="aspect-square bg-gradient-to-br from-[#F8F5F0] to-white rounded-lg overflow-hidden mb-2">
                      <img
                        src={item.image_url || '/images/placeholder.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 truncate">{item.category}</p>
                    <p className="text-sm font-medium text-[#8B5A2B] truncate">{item.name}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailsPage;