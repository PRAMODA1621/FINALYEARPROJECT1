import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import orderApi from '../api/orderApi';
import wishlistApi from '../api/wishlistApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  FaBox, FaShoppingBag, FaUser, FaHeart, FaClock, FaCheckCircle,
  FaTruck, FaTimesCircle, FaEye, FaStar, FaRegStar,
  FaArrowRight, FaCrown, FaMedal, FaTrophy, FaGift,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt,
  FaRupeeSign, FaChartLine, FaShoppingCart, FaTag,
  FaWallet, FaCreditCard, FaDownload, FaPrint,
  FaBell, FaCog, FaSignOutAlt, FaEdit, FaTrash,
  FaChevronRight, FaChevronLeft, FaUserCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

const UserDashboardPage = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    totalSaved: 0,
    wishlistCount: 0,
    memberSince: null,
    lastOrder: null
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersResponse = await orderApi.getUserOrders();
      const ordersData = ordersResponse.success ? ordersResponse.data || [] : [];
      setOrders(ordersData);

      // Fetch wishlist
      const wishlistResponse = await wishlistApi.getWishlist();
      const wishlistData = wishlistResponse.success ? wishlistResponse.data || [] : [];
      setWishlist(wishlistData);

      // Calculate stats
      const totalOrders = ordersData.length;
      const pendingOrders = ordersData.filter(o => o.order_status === 'pending' || o.order_status === 'processing').length;
      const completedOrders = ordersData.filter(o => o.order_status === 'delivered').length;
      
      const totalSpent = ordersData.reduce((sum, order) => {
        const amount = typeof order.total_amount === 'number' 
          ? order.total_amount 
          : parseFloat(order.total_amount) || 0;
        return sum + amount;
      }, 0);

      // Find last order
      const lastOrder = ordersData.length > 0 
        ? ordersData.reduce((latest, order) => 
            new Date(order.created_at) > new Date(latest.created_at) ? order : latest
          ) 
        : null;

      setStats({
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent,
        totalSaved: Math.round(totalSpent * 0.1), // Estimated savings (10%)
        wishlistCount: wishlistData.length,
        memberSince: user?.created_at,
        lastOrder
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await wishlistApi.removeFromWishlist(itemId);
      toast.success('Removed from wishlist');
      fetchUserData();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'processing': return <FaBox className="text-blue-500" />;
      case 'shipped': return <FaTruck className="text-purple-500" />;
      case 'delivered': return <FaCheckCircle className="text-green-500" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500" />;
      default: return <FaBox className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DDD0] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#9CAF88] border-t-[#8B5A2B] rounded-full animate-spin mx-auto mb-4"></div>
            <FaCrown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#8B5A2B] text-2xl animate-pulse" />
          </div>
          <p className="text-[#8B5A2B] font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Dashboard - Venus Enterprises</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] via-[#F0EAE0] to-[#E8DDD0]">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#8B5A2B] to-[#5D7A5D] text-white shadow-xl">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <FaUserCircle className="text-white text-4xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    Welcome back, {user?.first_name}!
                    <FaMedal className="text-yellow-300 text-2xl" />
                  </h1>
                  <p className="text-white/80 mt-1 flex items-center gap-2">
                    <FaEnvelope /> {user?.email}
                    <span className="mx-2">•</span>
                    <FaPhone /> {user?.phone || 'Not provided'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm flex items-center gap-2">
                <FaCalendarAlt />
                <span>Member since {stats.memberSince ? format(new Date(stats.memberSince), 'MMM yyyy') : 'N/A'}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm flex items-center gap-2">
                <FaShoppingBag />
                <span>{stats.totalOrders} orders placed</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm flex items-center gap-2">
                <FaHeart />
                <span>{stats.wishlistCount} items in wishlist</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="container mx-auto px-4 mt-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'overview', icon: FaChartLine, label: 'Overview' },
              { id: 'orders', icon: FaShoppingBag, label: 'My Orders' },
              { id: 'wishlist', icon: FaHeart, label: 'Wishlist' },
              { id: 'profile', icon: FaUser, label: 'Profile' },
              { id: 'reviews', icon: FaStar, label: 'Reviews' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium capitalize transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#8B5A2B] text-white shadow-lg transform scale-105'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-[#9CAF88] hover:text-white'
                }`}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    icon={<FaShoppingBag className="text-purple-500" />}
                    title="Total Orders"
                    value={stats.totalOrders}
                    bgColor="from-purple-500 to-purple-600"
                  />
                  <StatCard
                    icon={<FaClock className="text-yellow-500" />}
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    bgColor="from-yellow-500 to-yellow-600"
                  />
                  <StatCard
                    icon={<FaCheckCircle className="text-green-500" />}
                    title="Completed"
                    value={stats.completedOrders}
                    bgColor="from-green-500 to-green-600"
                  />
                  <StatCard
                    icon={<FaRupeeSign className="text-blue-500" />}
                    title="Total Spent"
                    value={`₹${stats.totalSpent.toLocaleString('en-IN')}`}
                    bgColor="from-blue-500 to-blue-600"
                  />
                </div>

                {/* Charts & Insights */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Order Status Breakdown */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-[#8B5A2B] mb-4 flex items-center gap-2">
                      <FaChartLine /> Order Status
                    </h3>
                    <div className="space-y-4">
                      <StatusBar 
                        label="Pending" 
                        value={stats.pendingOrders} 
                        total={stats.totalOrders} 
                        color="yellow" 
                      />
                      <StatusBar 
                        label="Processing" 
                        value={orders.filter(o => o.order_status === 'processing').length} 
                        total={stats.totalOrders} 
                        color="blue" 
                      />
                      <StatusBar 
                        label="Shipped" 
                        value={orders.filter(o => o.order_status === 'shipped').length} 
                        total={stats.totalOrders} 
                        color="purple" 
                      />
                      <StatusBar 
                        label="Delivered" 
                        value={stats.completedOrders} 
                        total={stats.totalOrders} 
                        color="green" 
                      />
                    </div>
                  </div>

                  {/* Quick Insights */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-[#8B5A2B] mb-4 flex items-center gap-2">
                      <FaGift /> Quick Insights
                    </h3>
                    <div className="space-y-4">
                      <InsightItem
                        icon={<FaWallet />}
                        label="Total Savings"
                        value={`₹${stats.totalSaved.toLocaleString('en-IN')}`}
                        subtext="Estimated from deals"
                        color="green"
                      />
                      <InsightItem
                        icon={<FaHeart />}
                        label="Wishlist Items"
                        value={stats.wishlistCount}
                        subtext="items saved"
                        color="red"
                      />
                      <InsightItem
                        icon={<FaStar />}
                        label="Average Rating"
                        value="4.8"
                        subtext="from 24 reviews"
                        color="yellow"
                      />
                      {stats.lastOrder && (
                        <InsightItem
                          icon={<FaClock />}
                          label="Last Order"
                          value={formatDistanceToNow(new Date(stats.lastOrder.created_at), { addSuffix: true })}
                          subtext={`₹${stats.lastOrder.total_amount}`}
                          color="blue"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                {orders.length > 0 && (
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-[#8B5A2B] flex items-center gap-2">
                        <FaClock /> Recent Orders
                      </h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-sm text-[#8B5A2B] hover:text-[#9CAF88] flex items-center gap-1"
                      >
                        View All <FaArrowRight />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {orders.slice(0, 3).map(order => (
                        <RecentOrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                  <h3 className="text-xl font-semibold text-[#8B5A2B] mb-6 flex items-center gap-2">
                    <FaShoppingBag /> My Orders
                  </h3>

                  {orders.length === 0 ? (
                    <EmptyState
                      icon={<FaShoppingBag className="text-6xl" />}
                      title="No orders yet"
                      message="Start shopping to see your orders here"
                      buttonText="Shop Now"
                      buttonLink="/products"
                    />
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <OrderCard 
                          key={order.id} 
                          order={order} 
                          getStatusIcon={getStatusIcon}
                          getStatusColor={getStatusColor}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                  <h3 className="text-xl font-semibold text-[#8B5A2B] mb-6 flex items-center gap-2">
                    <FaHeart /> My Wishlist
                  </h3>

                  {wishlist.length === 0 ? (
                    <EmptyState
                      icon={<FaHeart className="text-6xl" />}
                      title="Your wishlist is empty"
                      message="Save your favorite items here"
                      buttonText="Browse Products"
                      buttonLink="/products"
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlist.map(item => (
                        <WishlistCard 
                          key={item.id} 
                          item={item} 
                          onRemove={handleRemoveFromWishlist}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Profile Info */}
                  <div className="md:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold text-[#8B5A2B] mb-6 flex items-center gap-2">
                      <FaUser /> Profile Information
                    </h3>
                    
                    <div className="space-y-4">
                      <ProfileField
                        icon={<FaUser />}
                        label="Full Name"
                        value={`${user?.first_name || ''} ${user?.last_name || ''}`}
                      />
                      <ProfileField
                        icon={<FaEnvelope />}
                        label="Email Address"
                        value={user?.email}
                      />
                      <ProfileField
                        icon={<FaPhone />}
                        label="Phone Number"
                        value={user?.phone || 'Not provided'}
                      />
                      <ProfileField
                        icon={<FaCalendarAlt />}
                        label="Member Since"
                        value={user?.created_at ? format(new Date(user.created_at), 'MMMM dd, yyyy') : 'N/A'}
                      />
                    </div>

                    <button className="mt-6 flex items-center gap-2 text-[#8B5A2B] hover:text-[#9CAF88] transition">
                      <FaEdit /> Edit Profile
                    </button>
                  </div>

                  {/* Account Stats */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-[#8B5A2B] mb-4">Account Stats</h3>
                    <div className="space-y-4">
                      <StatPill
                        icon={<FaShoppingBag />}
                        label="Orders Placed"
                        value={stats.totalOrders}
                      />
                      <StatPill
                        icon={<FaHeart />}
                        label="Wishlist Items"
                        value={stats.wishlistCount}
                      />
                      <StatPill
                        icon={<FaStar />}
                        label="Reviews Given"
                        value="8"
                      />
                      <StatPill
                        icon={<FaRupeeSign />}
                        label="Lifetime Spend"
                        value={`₹${stats.totalSpent.toLocaleString('en-IN')}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                  <h3 className="text-xl font-semibold text-[#8B5A2B] mb-6 flex items-center gap-2">
                    <FaStar /> My Reviews
                  </h3>

                  <EmptyState
                    icon={<FaStar className="text-6xl" />}
                    title="No reviews yet"
                    message="Share your experience with products you've purchased"
                    buttonText="Browse Products"
                    buttonLink="/products"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, bgColor }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    className={`bg-gradient-to-br ${bgColor} rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform"></div>
    <div className="relative z-10">
      <div className="text-4xl opacity-80 mb-3">{icon}</div>
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  </motion.div>
);

// Status Bar Component
const StatusBar = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colors = {
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    green: 'bg-green-400',
    red: 'bg-red-400'
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-[#8B5A2B]">{value}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1 }}
          className={`h-full ${colors[color]}`}
        />
      </div>
    </div>
  );
};

// Insight Item Component
const InsightItem = ({ icon, label, value, subtext, color }) => {
  const colors = {
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`${colors[color]} text-lg`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-xs text-gray-500">{subtext}</p>
        </div>
      </div>
      <span className="text-lg font-bold text-[#8B5A2B]">{value}</span>
    </div>
  );
};

// Recent Order Card
const RecentOrderCard = ({ order }) => (
  <Link
    to={`/orders/${order.id}`}
    className="block bg-[#F8F5F0] rounded-xl p-4 hover:shadow-md transition group"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-mono text-[#8B5A2B]">#{order.order_number}</p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-[#8B5A2B]">₹{order.total_amount?.toLocaleString('en-IN')}</p>
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
          order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
          order.order_status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {order.order_status}
        </span>
      </div>
      <FaChevronRight className="text-gray-400 group-hover:text-[#8B5A2B] group-hover:translate-x-1 transition" />
    </div>
  </Link>
);

// Order Card Component
const OrderCard = ({ order, getStatusIcon, getStatusColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#F8F5F0] rounded-xl p-5 hover:shadow-lg transition border border-[#E8DDD0]"
  >
    <div className="flex flex-wrap justify-between items-start gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg font-bold text-[#8B5A2B]">#{order.order_number}</span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(order.order_status)}`}>
            {getStatusIcon(order.order_status)}
            <span>{order.order_status}</span>
          </span>
        </div>
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <FaCalendarAlt className="text-[#9CAF88]" />
          {format(new Date(order.created_at), 'MMMM dd, yyyy')}
        </p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-[#8B5A2B]">₹{order.total_amount?.toLocaleString('en-IN')}</p>
        <p className="text-xs text-gray-500">{order.items_count || 0} items</p>
      </div>
    </div>

    {/* Order Items Preview */}
    {order.items && order.items.length > 0 && (
      <div className="mt-4 pt-4 border-t border-[#E8DDD0]">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {order.items.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
              <div className="w-10 h-10 bg-[#F8F5F0] rounded overflow-hidden">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[#8B5A2B]">{item.name}</p>
                <p className="text-xs text-gray-500">x{item.quantity}</p>
              </div>
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <p className="text-sm text-gray-500">+{order.items.length - 3} more</p>
            </div>
          )}
        </div>
      </div>
    )}

    <div className="mt-4 flex justify-end">
      <Link
        to={`/orders/${order.id}`}
        className="text-sm text-[#8B5A2B] hover:text-[#9CAF88] flex items-center gap-1"
      >
        View Details <FaEye />
      </Link>
    </div>
  </motion.div>
);

// Wishlist Card Component
const WishlistCard = ({ item, onRemove }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    whileHover={{ y: -5 }}
    className="bg-[#F8F5F0] rounded-xl p-4 shadow-md hover:shadow-lg transition group"
  >
    <Link to={`/product/${encodeURIComponent(item.product?.name)}`} className="block">
      <div className="aspect-square bg-white rounded-lg overflow-hidden mb-3">
        <img
          src={item.product?.image_url || '/images/placeholder.jpg'}
          alt={item.product?.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => e.target.src = '/images/placeholder.jpg'}
        />
      </div>
      <h4 className="font-medium text-[#8B5A2B] mb-1 line-clamp-1">{item.product?.name}</h4>
      <p className="text-sm text-gray-500 mb-2">{item.product?.category}</p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-[#8B5A2B]">₹{item.product?.price?.toLocaleString('en-IN')}</span>
        <button
          onClick={(e) => {
            e.preventDefault();
            onRemove(item.id);
          }}
          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
        >
          <FaTrash />
        </button>
      </div>
    </Link>
  </motion.div>
);

// Profile Field Component
const ProfileField = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
    <div className="text-[#9CAF88] mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-[#8B5A2B]">{value}</p>
    </div>
  </div>
);

// Stat Pill Component
const StatPill = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      <div className="text-[#9CAF88]">{icon}</div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-bold text-[#8B5A2B]">{value}</span>
  </div>
);

// Empty State Component
const EmptyState = ({ icon, title, message, buttonText, buttonLink }) => (
  <div className="text-center py-12">
    <div className="text-[#9CAF88] mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-[#8B5A2B] mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{message}</p>
    <Link
      to={buttonLink}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white px-6 py-3 rounded-xl hover:from-[#9CAF88] hover:to-[#8B5A2B] transition shadow-lg"
    >
      {buttonText} <FaArrowRight />
    </Link>
  </div>
);

export default UserDashboardPage;