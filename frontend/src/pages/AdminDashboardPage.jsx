import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  FaUsers, FaBox, FaShoppingCart, FaRupeeSign, FaEdit, FaTrash, 
  FaSignOutAlt, FaPlus, FaChartLine, FaChartBar, FaChartPie,
  FaFilter, FaEye, FaCheckCircle,
  FaClock, FaTruck, FaBoxOpen, FaExclamationTriangle,
  FaStar, FaGem, FaAward, FaCrown, FaMedal, FaFire,
  FaArrowUp, FaArrowDown, FaUserCheck, FaUserTimes,
  FaCreditCard, FaWallet, FaPercentage, FaCalendarAlt,
  FaBell, FaSearch, FaSync, FaHome, FaArrowRight // Added FaArrowRight here
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
const API_URL = import.meta.env.VITE_API_URL;
const AdminDashboardPage = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tickets, setTickets] = useState([]);
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!isAdmin) {
      navigate('/');
    } else {
      fetchDashboardData();
    }
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    if (products.length > 0 || orders.length > 0 || users.length > 0) {
      generateNotifications();
    }
  }, [products, orders, users]);

  const fetchDashboardData = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    const headers = {
      Authorization: `Bearer ${token}`
    };

    const [statsRes, usersRes, ordersRes, productsRes, ticketsRes] = await Promise.all([
  axios.get(`${API_URL}/api/admin/dashboard`, { headers }).catch(() => ({ data: { data: {} } })),
  axios.get(`${API_URL}/api/admin/users`, { headers }).catch(() => ({ data: { data: [] } })),
  axios.get(`${API_URL}/api/admin/orders`, { headers }).catch(() => ({ data: { data: [] } })),
  axios.get(`${API_URL}/api/admin/products`, { headers }).catch(() => ({ data: { data: [] } })),
  axios.get(`${API_URL}/api/admin/helpdesk/tickets`, { headers }).catch(() => ({ data: { data: [] } }))
]);

    setStats(statsRes.data.data || {});
    setUsers(usersRes.data.data || []);
    setOrders(ordersRes.data.data || []);
    setProducts(productsRes.data.data || []);
    setTickets(ticketsRes.data.data || []);

  } catch (error) {
    console.error(error);
    toast.error("Failed to load dashboard data");
  } finally {
    setLoading(false);
  }
};

  const generateNotifications = () => {
    // Low stock alerts
    const lowStockProducts = products.filter(p => p.stock < 10);
    // Pending orders
    const pendingOrders = orders.filter(o => o.order_status === 'pending');
    // New users today
    const today = new Date().toDateString();
    const newUsersToday = users.filter(u => new Date(u.created_at).toDateString() === today);

    const alerts = [
      ...lowStockProducts.map(p => ({
        id: `stock-${p.id}`,
        type: 'warning',
        message: `Low stock: ${p.name} (${p.stock} left)`,
        time: new Date()
      })),
      ...pendingOrders.map(o => ({
        id: `order-${o.id}`,
        type: 'info',
        message: `Order #${o.order_number} is pending`,
        time: new Date()
      })),
      ...(newUsersToday.length > 0 ? [{
        id: 'users-today',
        type: 'success',
        message: `${newUsersToday.length} new user(s) joined today`,
        time: new Date()
      }] : [])
    ];
    setNotifications(alerts);
  };

  const handleUpdateUser = async (userId, userData) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${API_URL}/api/admin/users/${userId}`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
      toast.success('User updated successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
await axios.delete(`${API_URL}/api/admin/users/${userId}`, {        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, { status }, {        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order status updated successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
await axios.delete(`${API_URL}/api/admin/products/${productId}`, {        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredUsers = users.filter(user => 
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order => 
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = orders
  .filter(o => o.order_status === "delivered" || o.payment_status === "completed")
  .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => o.order_status === 'pending').length;
  const processingOrders = orders.filter(o => o.order_status === 'processing').length;
  const completedOrders = orders.filter(o => o.order_status === 'delivered').length;

  const lowStockProducts = products.filter(p => p.stock < 10).length;
  const activeUsers = users.filter(u => u.is_active).length;
  const inactiveUsers = users.filter(u => !u.is_active).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DDD0] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#9CAF88] border-t-[#8B5A2B] rounded-full animate-spin mx-auto mb-4"></div>
            <FaCrown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#8B5A2B] text-2xl animate-pulse" />
          </div>
          <p className="text-[#8B5A2B] font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] via-[#F0EAE0] to-[#E8DDD0]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B5A2B] to-[#5D7A5D] text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FaCrown className="text-yellow-300 text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  Admin Dashboard
                  <span className="text-sm bg-yellow-400 text-[#8B5A2B] px-2 py-1 rounded-full">Super Admin</span>
                </h1>
                <p className="text-white/80 mt-1 flex items-center gap-2">
                  <FaUserCheck /> Welcome back, {user?.first_name} {user?.last_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                >
                  <FaBell className="text-xl" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="font-semibold text-[#8B5A2B]">Notifications</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-500">No new notifications</p>
                      ) : (
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map(notif => (
                            <div key={notif.id} className="px-4 py-3 hover:bg-[#F8F5F0] transition border-b border-gray-50 last:border-0">
                              <div className="flex items-start gap-2">
                                <div className={`mt-1 w-2 h-2 rounded-full ${
                                  notif.type === 'warning' ? 'bg-yellow-400' :
                                  notif.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                                }`} />
                                <div>
                                  <p className="text-sm text-gray-700">{notif.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notif.time).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchDashboardData}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                title="Refresh Data"
              >
                <FaSync className="text-lg" />
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mt-6">
            {[
              { id: 'dashboard', icon: FaHome, label: 'Dashboard' },
              { id: 'users', icon: FaUsers, label: 'Users' },
              { id: 'orders', icon: FaShoppingCart, label: 'Orders' },
              { id: 'products', icon: FaBox, label: 'Products' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-[#8B5A2B] shadow-lg transform scale-105'
                    : 'text-white hover:bg-[#9CAF88] hover:scale-105'
                }`}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Global Search Bar */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] shadow-lg"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white transition flex items-center gap-2 shadow-lg"
          >
            <FaFilter />
            <span>Filters</span>
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<FaUsers className="text-blue-500" />}
                title="Total Users"
                value={stats?.totalUsers || 0}
                bgColor="from-blue-500 to-blue-600"
              />
              <StatCard
                icon={<FaBox className="text-green-500" />}
                title="Total Products"
                value={stats?.totalProducts || 0}
                bgColor="from-green-500 to-green-600"
              />
              <StatCard
                icon={<FaShoppingCart className="text-purple-500" />}
                title="Total Orders"
                value={stats?.totalOrders || 0}
                bgColor="from-purple-500 to-purple-600"
              />
              <StatCard
                icon={<FaRupeeSign className="text-yellow-500" />}
                title="Total Revenue"
                value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
                bgColor="from-yellow-500 to-yellow-600"
              />
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-[#8B5A2B] mb-4 flex items-center gap-2">
                  <FaChartLine /> Order Status
                </h3>
                <div className="space-y-3">
                  <StatBar label="Pending" value={pendingOrders} total={orders.length} color="yellow" />
                  <StatBar label="Processing" value={processingOrders} total={orders.length} color="blue" />
                  <StatBar label="Completed" value={completedOrders} total={orders.length} color="green" />
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-[#8B5A2B] mb-4 flex items-center gap-2">
                  <FaChartPie /> Quick Insights
                </h3>
                <div className="space-y-4">
                  <InsightItem
                    icon={<FaUsers />}
                    label="Active Users"
                    value={activeUsers}
                    total={users.length}
                    color="green"
                  />
                  <InsightItem
                    icon={<FaUserTimes />}
                    label="Inactive Users"
                    value={inactiveUsers}
                    total={users.length}
                    color="red"
                  />
                  <InsightItem
                    icon={<FaExclamationTriangle />}
                    label="Low Stock Products"
                    value={lowStockProducts}
                    total={products.length}
                    color="yellow"
                  />
                </div>
              </div>
            </div>

            {/* Recent Orders */}
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F8F5F0]">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[#8B5A2B]">Order #</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[#8B5A2B]">Customer</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[#8B5A2B]">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[#8B5A2B]">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[#8B5A2B]">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="hover:bg-[#F8F5F0] transition">
                        <td className="px-4 py-3 font-mono text-sm text-[#8B5A2B]">{order.order_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{order.first_name} {order.last_name}</td>
                        <td className="px-4 py-3 text-sm font-medium text-[#8B5A2B]">₹{order.total_amount?.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-semibold text-[#8B5A2B] mb-4 flex items-center gap-2">
              <FaUsers /> User Management
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8F5F0]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-[#F8F5F0] transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#8B5A2B] to-[#9CAF88] rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-[#8B5A2B]">{user.first_name} {user.last_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                          className="border border-[#9CAF88] rounded px-2 py-1 text-sm text-[#8B5A2B] bg-white focus:outline-none focus:ring-1 focus:ring-[#8B5A2B]"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleUpdateUser(user.id, { is_active: !user.is_active })}
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.is_active ? 'active' : 'inactive')}`}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 transition p-1 hover:bg-red-50 rounded"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-semibold text-[#8B5A2B] mb-4 flex items-center gap-2">
              <FaShoppingCart /> Order Management
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8F5F0]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Order #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-[#F8F5F0] transition">
                      <td className="px-4 py-3 font-mono text-sm text-[#8B5A2B]">{order.order_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.first_name} {order.last_name}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#8B5A2B]">₹{order.total_amount?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.order_status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(order.order_status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.payment_status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-[#9CAF88] hover:text-[#8B5A2B] transition p-1 hover:bg-[#F8F5F0] rounded">
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mt-6">
  <h3 className="text-lg font-semibold text-[#8B5A2B] mb-4">
    Support Tickets
  </h3>

  {tickets.length === 0 ? (
    <p className="text-sm text-gray-500">No support tickets found.</p>
  ) : (
    <div className="space-y-3">
      {tickets.slice(0,5).map(ticket => (
        <div key={ticket.id} className="border border-[#E8E0D5] rounded-md p-4">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-[#8B5A2B]">
              {ticket.subject}
            </span>
            <span className="text-xs text-gray-500">
              {ticket.status}
            </span>
          </div>

          <p className="text-xs text-gray-500">
            {ticket.first_name} {ticket.last_name}
          </p>

          <p className="text-sm text-gray-600 mt-1">
            {ticket.message}
          </p>
        </div>
      ))}
    </div>
  )}
</div>
        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#8B5A2B] flex items-center gap-2">
                <FaBox /> Product Management
              </h3>
              <Link
                to="/admin/products/new"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm"
              >
                <FaPlus /> Add Product
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8F5F0]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8B5A2B]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-[#F8F5F0] transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={product.image_url || '/images/placeholder.jpg'}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                            onError={(e) => e.target.src = '/images/placeholder.jpg'}
                          />
                          <span className="text-sm font-medium text-[#8B5A2B]">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#8B5A2B]">₹{product.price?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.stock > 10 
                            ? 'bg-green-100 text-green-800' 
                            : product.stock > 0 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock} left
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="text-[#9CAF88] hover:text-[#8B5A2B] transition p-1 hover:bg-[#F8F5F0] rounded"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800 transition p-1 hover:bg-red-50 rounded"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
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
      <div className="flex items-center justify-between">
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
      <p className="text-sm opacity-90 mt-4">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  </motion.div>
);

// Stat Bar Component
const StatBar = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colors = {
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-400',
    green: 'bg-green-400',
    red: 'bg-red-400',
    purple: 'bg-purple-400'
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
const InsightItem = ({ icon, label, value, total, color }) => {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  const colors = {
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600'
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`${colors[color]} text-lg`}>{icon}</div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[#8B5A2B]">{value}</span>
        <span className="text-xs text-gray-400">({percentage}%)</span>
      </div>
    </div>
  );
};

export default AdminDashboardPage;