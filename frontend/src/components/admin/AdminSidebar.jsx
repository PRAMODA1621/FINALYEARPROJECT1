import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingBag,
  FaUsers,
  FaTicketAlt,
  FaQuestionCircle,
  FaCog
} from 'react-icons/fa';

const AdminSidebar = () => {
  const menuItems = [
    { path: '/admin', icon: FaTachometerAlt, label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: FaBox, label: 'Products' },
    { path: '/admin/orders', icon: FaShoppingBag, label: 'Orders' },
    { path: '/admin/users', icon: FaUsers, label: 'Users' },
    { path: '/admin/tickets', icon: FaTicketAlt, label: 'Support Tickets' },
    { path: '/admin/faqs', icon: FaQuestionCircle, label: 'FAQs' },
    { path: '/admin/settings', icon: FaCog, label: 'Settings' }
  ];

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold text-indigo-600 mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="text-xl" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;