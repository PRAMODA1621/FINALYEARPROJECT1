import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { FaUsers, FaBox, FaShoppingBag, FaDollarSign } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardStats = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FaUsers,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: FaBox,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: FaShoppingBag,
      color: 'bg-purple-500',
      change: '+8%'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue?.toFixed(2)}`,
      icon: FaDollarSign,
      color: 'bg-yellow-500',
      change: '+15%'
    }
  ];

  // Orders by Status Chart
  const ordersByStatusData = {
    labels: Object.keys(stats.ordersByStatus || {}),
    datasets: [
      {
        label: 'Orders by Status',
        data: Object.values(stats.ordersByStatus || {}),
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Monthly Revenue Chart
  const monthlyRevenueData = {
    labels: stats.monthlyRevenue?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: stats.monthlyRevenue?.map(item => item.revenue) || [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} text-white p-3 rounded-lg`}>
                <card.icon size={24} />
              </div>
              <span className="text-green-500 text-sm font-semibold">{card.change}</span>
            </div>
            <h3 className="text-gray-500 text-sm mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
          {Object.keys(stats.ordersByStatus || {}).length > 0 ? (
            <Pie data={ordersByStatusData} />
          ) : (
            <p className="text-gray-500 text-center py-8">No order data available</p>
          )}
        </div>

        {/* Monthly Revenue Line Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
          {stats.monthlyRevenue?.length > 0 ? (
            <Line data={monthlyRevenueData} />
          ) : (
            <p className="text-gray-500 text-center py-8">No revenue data available</p>
          )}
        </div>
      </div>

      {/* Recent Orders and Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {stats.recentOrders?.map(order => (
              <div key={order.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">#{order.order_number}</p>
                  <p className="text-sm text-gray-500">
                    ${order.total_amount} • {order.User?.first_name} {order.User?.last_name}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.order_status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Support Tickets</h3>
          <div className="space-y-3">
            {stats.recentTickets?.map(ticket => (
              <div key={ticket.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{ticket.subject}</p>
                  <p className="text-sm text-gray-500">
                    {ticket.customer?.first_name} {ticket.customer?.last_name}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {ticket.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;