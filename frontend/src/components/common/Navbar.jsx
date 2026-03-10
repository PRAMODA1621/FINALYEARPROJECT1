import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/Cartcontext';
import { useWishlist } from '../../contexts/WishlistContext';
import { 
  FaShoppingCart, FaHeart, FaUser, FaSearch, FaBars, FaTimes, 
  FaSignOutAlt, FaCrown, FaGem, FaGift, FaAward, FaTree,
  FaSolarPanel, FaWind, FaWater, FaLeaf, FaChevronDown,
  FaStore, FaInfoCircle, FaEnvelope,
  FaTruck, FaShieldAlt, FaRecycle, FaStar
} from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsOpen(false);
    setShowUserMenu(false);
    setShowCategories(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const categories = [
    { name: 'Wooden', icon: FaTree, color: 'from-amber-600 to-amber-800', slug: 'Wooden', desc: 'Elegant & timeless' },
    { name: 'Acrylic', icon: FaSolarPanel, color: 'from-blue-400 to-blue-600', slug: 'Acrylic', desc: 'Modern & sleek' },
    { name: 'Metal', icon: FaWind, color: 'from-gray-500 to-gray-700', slug: 'Metal', desc: 'Premium & durable' },
    { name: 'Mementos', icon: FaAward, color: 'from-yellow-500 to-yellow-700', slug: 'Mementos', desc: 'Cherished memories' },
    { name: 'Marble', icon: FaGem, color: 'from-stone-400 to-stone-600', slug: 'Marble', desc: 'Luxury & elegance' }
  ];

  // REMOVED: Custom Order and Help from navLinks
  const navLinks = [
    { name: 'Home', path: '/', icon: FaStore },
    { name: 'Products', path: '/products', icon: FaGift },
    { name: 'About', path: '/about', icon: FaInfoCircle },
    { name: 'Contact', path: '/contact', icon: FaEnvelope }
  ];

  return (
    <>
      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(139, 90, 43, 0.5); }
          50% { box-shadow: 0 0 20px rgba(156, 175, 136, 0.8); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .nav-item-hover {
          position: relative;
          overflow: hidden;
        }
        .nav-item-hover::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #8B5A2B, #9CAF88, #8B5A2B);
          transform: scaleX(0);
          transition: transform 0.3s ease;
          transform-origin: center;
        }
        .nav-item-hover:hover::after {
          transform: scaleX(1);
        }
        .nav-item-hover:hover {
          transform: translateY(-2px);
        }
        .cart-badge {
          animation: float 3s ease-in-out infinite;
        }
        .glow-effect {
          animation: glow 2s ease-in-out infinite;
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        .dropdown-enter {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-gradient-to-r from-[#8B5A2B] via-[#9CAF88] to-[#5D7A5D] shadow-2xl backdrop-blur-lg bg-opacity-95' 
          : 'bg-gradient-to-r from-[#8B5A2B] to-[#5D7A5D]'
      }`}>
        
        {/* Animated background line */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent shimmer"></div>

        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo with 3D effect */}
            <Link 
              to="/" 
              className="group relative flex items-center space-x-2"
              onMouseEnter={() => setHoveredItem('logo')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={`relative transform transition-all duration-500 ${
                hoveredItem === 'logo' ? 'rotate-12 scale-110' : ''
              }`}>
                <FaCrown className="text-3xl text-[#F5F5F0] absolute -top-2 -left-2 opacity-50" />
                <span className="text-3xl font-bold text-white relative z-10 tracking-wider">
                  VENUS
                </span>
              </div>
              <span className={`text-xl font-light text-white/90 hidden sm:block transition-all duration-500 ${
                hoveredItem === 'logo' ? 'translate-x-2 opacity-100' : 'opacity-70'
              }`}>
                Enterprises
              </span>
              
              {/* Glowing effect on hover */}
              {hoveredItem === 'logo' && (
                <div className="absolute -inset-2 bg-white/20 rounded-full filter blur-xl animate-pulse"></div>
              )}
            </Link>

            {/* Desktop Navigation - Custom Order and Help removed */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`nav-item-hover group px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 flex items-center space-x-2 ${
                    location.pathname === link.path 
                      ? 'bg-white/20 shadow-lg scale-105' 
                      : 'hover:bg-white/10'
                  }`}
                  onMouseEnter={() => setHoveredItem(link.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <link.icon className={`text-sm transition-all duration-300 ${
                    hoveredItem === link.name ? 'rotate-12 scale-110' : ''
                  }`} />
                  <span>{link.name}</span>
                  
                  {/* Tooltip on hover */}
                  {hoveredItem === link.name && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[#8B5A2B] text-white text-xs py-1 px-2 rounded whitespace-nowrap shadow-lg">
                      {link.name}
                    </div>
                  )}
                </Link>
              ))}

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowCategories(true)}
                  onMouseLeave={() => setShowCategories(false)}
                  className="nav-item-hover group px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 flex items-center space-x-2 hover:bg-white/10"
                >
                  <FaGift className="text-sm" />
                  <span>Categories</span>
                  <FaChevronDown className={`text-xs transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`} />
                </button>

                {showCategories && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 dropdown-enter"
                    onMouseEnter={() => setShowCategories(true)}
                    onMouseLeave={() => setShowCategories(false)}
                  >
                    {categories.map((cat, index) => (
                      <Link
                        key={cat.name}
                        to={`/products?category=${encodeURIComponent(cat.slug)}`}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-[#F5F5F0] hover:to-white transition-all group"
                        style={{ animation: `slideDown 0.3s ${index * 0.1}s both` }}
                      >
                        <div className={`w-8 h-8 bg-gradient-to-br ${cat.color} rounded-lg flex items-center justify-center text-white transform group-hover:scale-110 transition-transform`}>
                          <cat.icon size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-[#8B5A2B]">{cat.name}</p>
                          <p className="text-xs text-gray-500">{cat.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden lg:block flex-1 max-w-md mx-8">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-2.5 pr-12 rounded-full bg-white/10 backdrop-blur-md text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all group-hover:bg-white/20"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-all hover:scale-110"
                >
                  <FaSearch />
                </button>
                
                {/* Search suggestions */}
                {searchTerm && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl p-2 dropdown-enter">
                    <p className="text-xs text-gray-500 px-3 py-2">Search for "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </form>

            {/* Icons Section */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="group relative p-2 rounded-full hover:bg-white/10 transition-all transform hover:scale-110"
              >
                <FaHeart className="text-white text-xl group-hover:rotate-12 transition-transform" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center cart-badge">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="group relative p-2 rounded-full hover:bg-white/10 transition-all transform hover:scale-110"
              >
                <FaShoppingCart className="text-white text-xl group-hover:rotate-12 transition-transform" />
                {cart.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center cart-badge">
                    {cart.itemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="group flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition-all"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#9CAF88] to-[#8B5A2B] rounded-full flex items-center justify-center text-white font-bold transform group-hover:scale-110 transition-transform">
                      {user?.first_name?.charAt(0) || 'U'}
                    </div>
                    <FaChevronDown className={`text-white text-xs transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 dropdown-enter">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-[#8B5A2B]">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-[#F5F5F0] transition-all group"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaUser className="text-[#8B5A2B] group-hover:scale-110 transition-transform" />
                        <span>Profile</span>
                      </Link>
                      
                      <Link
                        to="/orders"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-[#F5F5F0] transition-all group"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaTruck className="text-[#8B5A2B] group-hover:scale-110 transition-transform" />
                        <span>Orders</span>
                      </Link>
                      
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-[#F5F5F0] transition-all group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <MdAdminPanelSettings className="text-[#8B5A2B] group-hover:scale-110 transition-transform" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      
                      <hr className="my-2 border-gray-100" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all group"
                      >
                        <FaSignOutAlt className="group-hover:scale-110 transition-transform" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-5 py-2 rounded-full text-white font-medium hover:bg-white/10 transition-all transform hover:scale-105"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 rounded-full bg-white text-[#8B5A2B] font-medium hover:bg-[#F5F5F0] transition-all transform hover:scale-105 shadow-lg glow-effect"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-all transform hover:scale-110"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="lg:hidden py-4 border-t border-white/20 mt-2 dropdown-enter">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-white/10 backdrop-blur-md text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    <FaSearch />
                  </button>
                </div>
              </form>

              {/* Mobile Links - Custom Order and Help removed */}
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-white transition-all ${
                      location.pathname === link.path 
                        ? 'bg-white/20' 
                        : 'hover:bg-white/10'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <link.icon className="text-lg" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                ))}

                {/* Mobile Categories */}
                <div className="px-4 py-2">
                  <p className="text-white/70 text-sm mb-2">Categories</p>
                  {categories.map((cat) => (
                    <Link
                      key={cat.name}
                      to={`/products?category=${encodeURIComponent(cat.slug)}`}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className={`w-6 h-6 bg-gradient-to-br ${cat.color} rounded flex items-center justify-center text-white text-xs`}>
                        <cat.icon size={12} />
                      </div>
                      <span className="text-white">{cat.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Mobile User Actions */}
                <div className="border-t border-white/20 pt-4 mt-4">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center space-x-3 px-4 py-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#9CAF88] to-[#8B5A2B] rounded-full flex items-center justify-center text-white font-bold">
                          {user?.first_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user?.first_name} {user?.last_name}</p>
                          <p className="text-white/70 text-sm">{user?.email}</p>
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaUser className="text-white" />
                        <span className="text-white">Profile</span>
                      </Link>

                      <Link
                        to="/orders"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaTruck className="text-white" />
                        <span className="text-white">Orders</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaHeart className="text-white" />
                        <span className="text-white">Wishlist</span>
                        {wishlist.length > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                            {wishlist.length}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/cart"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaShoppingCart className="text-white" />
                        <span className="text-white">Cart</span>
                        {cart.itemCount > 0 && (
                          <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                            {cart.itemCount}
                          </span>
                        )}
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
                          onClick={() => setIsOpen(false)}
                        >
                          <MdAdminPanelSettings className="text-white" />
                          <span className="text-white">Admin</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-300 hover:bg-white/10 rounded-lg transition-all mt-2"
                      >
                        <FaSignOutAlt />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2 px-4">
                      <Link
                        to="/login"
                        className="block w-full text-center px-4 py-3 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block w-full text-center px-4 py-3 rounded-lg bg-white text-[#8B5A2B] font-medium hover:bg-[#F5F5F0] transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Progress Bar */}
        <div 
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#F5F5F0] via-white to-[#F5F5F0]"
          style={{ width: `${(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%` }}
        ></div>
      </nav>

      {/* Spacer for fixed navbar */}
      
    </>
  );
};

export default Navbar;