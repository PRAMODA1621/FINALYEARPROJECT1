import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import {
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaRupeeSign,
  FaEdit,
  FaTrash,
  FaSignOutAlt,
  FaPlus,
  FaSearch,
  FaSync,
  FaHome,
  FaEye
} from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboardPage = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (!isAdmin) {
      navigate("/");
    } else {
      fetchDashboardData();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [statsRes, usersRes, ordersRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/dashboard`, { headers }),
        axios.get(`${API_URL}/api/admin/users`, { headers }),
        axios.get(`${API_URL}/api/admin/orders`, { headers }),
        axios.get(`${API_URL}/api/admin/products`, { headers })
      ]);

      setStats(statsRes.data?.data || {});
      setUsers(usersRes.data?.data || []);
      setOrders(ordersRes.data?.data || []);
      setProducts(productsRes.data?.data || []);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {

      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("Order updated");
      fetchDashboardData();

    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {

      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/api/admin/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("User deleted");
      fetchDashboardData();

    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {

      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/api/admin/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("Product deleted");
      fetchDashboardData();

    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.total_amount || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Admin Dashboard
        </h1>

        <div className="flex gap-3">
          <button
            onClick={fetchDashboardData}
            className="px-3 py-2 bg-gray-200 rounded"
          >
            <FaSync />
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded flex items-center gap-2"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">

        <div className="p-4 bg-white shadow rounded">
          <FaUsers className="text-xl mb-2" />
          <h3>Total Users</h3>
          <p className="text-xl">{users.length}</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <FaBox className="text-xl mb-2" />
          <h3>Total Products</h3>
          <p className="text-xl">{products.length}</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <FaShoppingCart className="text-xl mb-2" />
          <h3>Total Orders</h3>
          <p className="text-xl">{orders.length}</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <FaRupeeSign className="text-xl mb-2" />
          <h3>Total Revenue</h3>
          <p className="text-xl">₹{totalRevenue}</p>
        </div>

      </div>

      <div className="bg-white p-6 shadow rounded">

        <h2 className="text-lg font-bold mb-4">
          Orders
        </h2>

        <table className="w-full border">

          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Order</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>

          <tbody>

            {orders.map((order) => (

              <tr key={order.id} className="border-t">

                <td className="p-2">{order.order_number}</td>

                <td className="p-2">
                  {order.first_name} {order.last_name}
                </td>

                <td className="p-2">
                  ₹{order.total_amount}
                </td>

                <td className="p-2">

                  <select
                    value={order.order_status}
                    onChange={(e) =>
                      handleUpdateOrderStatus(order.id, e.target.value)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                </td>

                <td className="p-2">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default AdminDashboardPage;