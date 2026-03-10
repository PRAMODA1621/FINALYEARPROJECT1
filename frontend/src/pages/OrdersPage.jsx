import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import orderApi from '../api/orderApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { FaBox, FaClock, FaCheckCircle, FaTruck, FaTimesCircle } from 'react-icons/fa';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getUserOrders();
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock className="text-yellow-600" />;
      case 'processing': return <FaBox className="text-blue-600" />;
      case 'shipped': return <FaTruck className="text-purple-600" />;
      case 'delivered': return <FaCheckCircle className="text-green-600" />;
      case 'cancelled': return <FaTimesCircle className="text-red-600" />;
      default: return <FaBox className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.order_status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Orders - Venus Enterprises</title>
      </Helmet>

      <div className="bg-[#F5F0E8] min-h-screen py-8">
        <div className="container-custom">
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-[#8B5A2B] mb-2">My Orders</h1>
            <p className="text-sm text-gray-600">Track and manage your orders</p>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-[#8B5A2B] text-white'
                    : 'bg-[#F5F0E8] text-[#8B5A2B] hover:bg-[#9CAF88] hover:text-white'
                }`}
              >
                All Orders
              </button>
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    filter === status
                      ? 'bg-[#8B5A2B] text-white'
                      : 'bg-[#F5F0E8] text-[#8B5A2B] hover:bg-[#9CAF88] hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block bg-white rounded-lg shadow-sm border border-[#E8E0D5] hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg font-medium text-[#8B5A2B]">
                            {order.order_number}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize flex items-center space-x-1 ${getStatusColor(order.order_status)}`}>
                            {getStatusIcon(order.order_status)}
                            <span>{order.order_status}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Placed {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-[#8B5A2B]">
                          ₹{typeof order.total_amount === 'number'
                            ? order.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                            : parseFloat(order.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items_count || 0} items
                        </p>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="border-t border-[#E8E0D5] pt-4 mt-2">
                        <div className="flex items-center space-x-4">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-10 h-10 bg-[#F5F0E8] rounded overflow-hidden">
                                {item.image && (
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="text-sm">
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-gray-500">x{item.quantity}</p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-sm text-gray-500">
                              +{order.items.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-12 text-center">
              <FaBox className="text-5xl text-[#9CAF88] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#8B5A2B] mb-2">No orders found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {filter === 'all' 
                  ? "You haven't placed any orders yet."
                  : `You don't have any ${filter} orders.`}
              </p>
              <Link to="/products" className="btn-primary inline-block">
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrdersPage;