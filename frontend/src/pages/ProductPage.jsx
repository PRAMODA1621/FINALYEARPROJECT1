import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import productApi from '../api/productApi';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  FaFilter, FaTimes, FaSearch, FaTrophy, FaCrown, 
  FaGem, FaTree, FaSolarPanel, FaWind, FaAward,
  FaChevronDown, FaStar, FaMedal, FaGift, FaPalette,
  FaArrowRight, FaThLarge, FaList, FaSort,
  FaFire, FaLeaf, FaShieldAlt, FaTruck, FaRegGem
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ProductPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('featured');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    search: searchParams.get('search') || ''
  });

  const getFallbackImageUrl = (productName) => {
    return `https://via.placeholder.com/400x400/9CAF88/8B5A2B?text=${encodeURIComponent(productName.substring(0, 20))}`;
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters, sortBy, pagination.page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        sort: sortBy,
        page: pagination.page,
        limit: 12
      };
      
      const data = await productApi.getProducts(params);
      
      const processedProducts = data.map(product => {
        if (!product.image_url || product.image_url === '/images/placeholder.jpg') {
          product.image_url = getFallbackImageUrl(product.name);
        }
        return product;
      });
      
      setProducts(processedProducts);
      
      const urlParams = new URLSearchParams();
      if (filters.category) urlParams.set('category', filters.category);
      if (filters.minPrice) urlParams.set('minPrice', filters.minPrice);
      if (filters.maxPrice) urlParams.set('maxPrice', filters.maxPrice);
      if (filters.inStock) urlParams.set('inStock', 'true');
      if (filters.search) urlParams.set('search', filters.search);
      if (sortBy !== 'featured') urlParams.set('sort', sortBy);
      setSearchParams(urlParams);
      
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePriceFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStockFilterChange = (e) => {
    setFilters(prev => ({ ...prev, inStock: e.target.checked }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryClick = (category) => {
    setFilters(prev => ({ ...prev, category }));
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      search: ''
    });
    setSearchParams({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const categoryIcons = {
    'Wooden': <FaTree className="text-amber-600" />,
    'Acrylic': <FaSolarPanel className="text-blue-400" />,
    'Metal': <FaWind className="text-gray-500" />,
    'Mementos': <FaAward className="text-yellow-500" />,
    'Marble': <FaGem className="text-stone-500" />,
    'Corporate Gifts': <FaGift className="text-purple-500" />,
    'Crystal': <FaStar className="text-indigo-400" />,
    'Eco-Friendly': <FaLeaf className="text-green-500" />
  };

  const sortOptions = [
    { value: 'featured', label: 'Featured', icon: FaStar },
    { value: 'price-low', label: 'Price: Low to High', icon: FaArrowRight },
    { value: 'price-high', label: 'Price: High to Low', icon: FaArrowRight },
    { value: 'newest', label: 'Newest First', icon: FaFire },
    { value: 'popular', label: 'Most Popular', icon: FaCrown }
  ];

  return (
    <>
      <Helmet>
        <title>Products - Venus Enterprises</title>
      </Helmet>

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#F8F5F0] via-[#F0EAE0] to-[#E8DDD0]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-[#8B5A2B]/10 text-3xl"
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                rotate: 0,
                scale: 0.5
              }}
              animate={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                rotate: 360,
                scale: [0.5, 1, 0.5]
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
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`award-${i}`}
              className="absolute text-[#8B5A2B]/5 text-5xl"
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
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
        <div className="absolute top-40 left-20 w-96 h-96 bg-[#9CAF88]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-[#8B5A2B]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Hero Header - Premium Banner */}
        <div className="relative z-10 pt-16 pb-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Animated Trophy Line */}
              <motion.div 
                className="flex items-center justify-center gap-3 mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#8B5A2B] to-transparent"></div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <FaMedal className="text-[#8B5A2B] text-2xl" />
                </motion.div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#8B5A2B] to-transparent"></div>
              </motion.div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] bg-clip-text text-transparent">
                  Premium Collection
                </span>
              </h1>
              
              {/* Subtitle with Stats */}
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                Discover our curated selection of award-winning corporate gifts and mementos
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <FaShieldAlt className="text-[#8B5A2B]" />
                  <span>100% Premium Quality</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <FaTruck className="text-[#8B5A2B]" />
                  <span>Free Shipping over ₹5000</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <FaStar className="text-[#8B5A2B]" />
                  <span>500+ Happy Clients</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Search & Controls Bar */}
        <div className="relative z-10 container mx-auto px-4 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/20">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="flex-1 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] rounded-full opacity-0 group-hover:opacity-20 transition duration-300 blur"></div>
                <div className="relative flex items-center">
                  <FaSearch className="absolute left-4 text-gray-400 group-hover:text-[#8B5A2B] transition-colors" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search for awards, trophies, gifts..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] text-gray-700"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] text-gray-700 cursor-pointer"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-full p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-full transition ${
                      viewMode === 'grid' 
                        ? 'bg-[#8B5A2B] text-white' 
                        : 'text-gray-500 hover:text-[#8B5A2B]'
                    }`}
                  >
                    <FaThLarge />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-full transition ${
                      viewMode === 'list' 
                        ? 'bg-[#8B5A2B] text-white' 
                        : 'text-gray-500 hover:text-[#8B5A2B]'
                    }`}
                  >
                    <FaList />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 pb-20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Premium Design */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}
            >
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 sticky top-24 border border-[#9CAF88]/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#8B5A2B] flex items-center gap-2">
                    <FaFilter className="text-sm" />
                    Refine Results
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                {/* Active Filters */}
                {(filters.category || filters.minPrice || filters.maxPrice || filters.inStock) && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Active Filters</h4>
                    <div className="flex flex-wrap gap-2">
                      {filters.category && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#8B5A2B]/10 text-[#8B5A2B] rounded-full text-xs">
                          {filters.category}
                          <button onClick={() => setFilters({...filters, category: ''})}>×</button>
                        </span>
                      )}
                      {filters.minPrice && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#8B5A2B]/10 text-[#8B5A2B] rounded-full text-xs">
                          Min: ₹{filters.minPrice}
                          <button onClick={() => setFilters({...filters, minPrice: ''})}>×</button>
                        </span>
                      )}
                      {filters.maxPrice && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#8B5A2B]/10 text-[#8B5A2B] rounded-full text-xs">
                          Max: ₹{filters.maxPrice}
                          <button onClick={() => setFilters({...filters, maxPrice: ''})}>×</button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Categories - With Icons & Counts */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center justify-between">
                    <span>Categories</span>
                    <span className="text-xs text-gray-400">{categories.length} available</span>
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    <button
                      onClick={() => handleCategoryClick('')}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center gap-3 ${
                        filters.category === ''
                          ? 'bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white shadow-lg'
                          : 'hover:bg-[#F8F5F0] text-gray-700'
                      }`}
                    >
                      <span className="w-6 text-center">📦</span>
                      <span className="flex-1">All Products</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">12</span>
                    </button>
                    
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center gap-3 ${
                          filters.category === cat
                            ? 'bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white shadow-lg'
                            : 'hover:bg-[#F8F5F0] text-gray-700'
                        }`}
                      >
                        <span className="w-6 text-center">
                          {categoryIcons[cat] || <FaGift className="text-gray-500" />}
                        </span>
                        <span className="flex-1">{cat}</span>
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">8</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range - With Slider Feel */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Price Range (₹)</h4>
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">Min</span>
                      <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handlePriceFilterChange}
                        placeholder="0"
                        className="w-full pl-12 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-gray-50"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">Max</span>
                      <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handlePriceFilterChange}
                        placeholder="Any"
                        className="w-full pl-12 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Availability - Toggle Switch */}
                <div className="mb-6">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium text-gray-600">In Stock Only</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={handleStockFilterChange}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 rounded-full transition-colors ${
                        filters.inStock ? 'bg-[#8B5A2B]' : 'bg-gray-300'
                      }`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                          filters.inStock ? 'translate-x-5' : 'translate-x-1'
                        }`}></div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={clearFilters}
                    className="flex-1 bg-gray-100 text-gray-600 px-4 py-3 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white px-4 py-3 rounded-xl hover:from-[#9CAF88] hover:to-[#8B5A2B] transition text-sm font-medium shadow-lg"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Products Grid Area */}
            <div className="flex-1">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden w-full bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 mb-6 shadow-lg"
              >
                <FaFilter />
                <span>Show Filters</span>
              </button>

              {/* Products Header */}
              {!loading && !error && (
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-[#8B5A2B]">{products.length}</span> products
                  </div>
                  <div className="text-sm text-gray-500">
                    Page <span className="font-semibold text-[#8B5A2B]">{pagination.page}</span> of {pagination.totalPages}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-[#9CAF88] border-t-[#8B5A2B] rounded-full animate-spin"></div>
                    <FaTrophy className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#8B5A2B] text-2xl animate-pulse" />
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                  <FaCrown className="text-6xl text-[#8B5A2B]/30 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-[#8B5A2B] mb-2">Oops! Something went wrong</h3>
                  <p className="text-gray-500 mb-6">{error}</p>
                  <button
                    onClick={fetchProducts}
                    className="bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white px-8 py-3 rounded-xl hover:from-[#9CAF88] hover:to-[#8B5A2B] transition shadow-lg"
                  >
                    Try Again
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                  <FaSearch className="text-6xl text-[#8B5A2B]/30 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-[#8B5A2B] mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
                  <button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white px-8 py-3 rounded-xl hover:from-[#9CAF88] hover:to-[#8B5A2B] transition shadow-lg"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}
                >
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard product={product} viewMode={viewMode} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Pagination */}
              {!loading && !error && products.length > 0 && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                      disabled={pagination.page === 1}
                      className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-[#8B5A2B] hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition"
                    >
                      ←
                    </button>
                    
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPagination({...pagination, page: i + 1})}
                        className={`w-10 h-10 rounded-xl transition ${
                          pagination.page === i + 1
                            ? 'bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white shadow-lg'
                            : 'border border-gray-200 hover:bg-[#F8F5F0]'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                      disabled={pagination.page === pagination.totalPages}
                      className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-[#8B5A2B] hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;