import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaCheckCircle, FaPrint } from 'react-icons/fa';

const OrderSuccessPage = () => {
  const location = useLocation();
  const { orderNumber, total } = location.state || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Helmet>
        <title>Order Confirmed - Venus Enterprises</title>
      </Helmet>

      <div className="container-custom py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <FaCheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You for Your Order!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your order has been successfully placed and is being processed.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            
            <div className="space-y-2">
              <p className="text-gray-600">
                Order Number: <span className="font-semibold text-gray-900">{orderNumber}</span>
              </p>
              <p className="text-gray-600">
                Total Amount: <span className="font-semibold text-gray-900">${total?.toFixed(2)}</span>
              </p>
              <p className="text-gray-600">
                A confirmation email has been sent to your email address.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button
              onClick={handlePrint}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <FaPrint />
              <span>Print Receipt</span>
            </button>
            
            <Link to="/dashboard" className="btn-primary">
              View Order Status
            </Link>
          </div>

          {/* Continue Shopping */}
          <Link to="/products" className="text-indigo-600 hover:text-indigo-700">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
};

export default OrderSuccessPage;