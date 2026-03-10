import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaTruck, FaBox, FaClock, FaGlobeAsia } from 'react-icons/fa';

const ShippingPage = () => {
  return (
    <>
      <Helmet>
        <title>Shipping Policy - Venus Enterprises</title>
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping Policy</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Fast, reliable delivery for all your corporate gifting needs
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <FaTruck className="text-4xl text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-sm text-gray-600">On orders above ₹5000</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <FaClock className="text-4xl text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Express Delivery</h3>
              <p className="text-sm text-gray-600">2-3 business days</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <FaGlobeAsia className="text-4xl text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">International Shipping</h3>
              <p className="text-sm text-gray-600">Worldwide delivery</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <FaBox className="text-4xl text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Secure Packaging</h3>
              <p className="text-sm text-gray-600">Double-boxed with care</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold mb-4">Domestic Shipping (India)</h2>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-3 text-left">Shipping Method</th>
                      <th className="border p-3 text-left">Delivery Time</th>
                      <th className="border p-3 text-left">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3">Standard Shipping</td>
                      <td className="border p-3">5-7 business days</td>
                      <td className="border p-3">₹100 or FREE on orders above ₹5000</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Express Shipping</td>
                      <td className="border p-3">2-3 business days</td>
                      <td className="border p-3">₹250</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Same-Day Delivery (Mumbai only)</td>
                      <td className="border p-3">Within 6 hours</td>
                      <td className="border p-3">₹500</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-semibold mb-4">International Shipping</h2>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-3 text-left">Region</th>
                      <th className="border p-3 text-left">Delivery Time</th>
                      <th className="border p-3 text-left">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3">USA & Canada</td>
                      <td className="border p-3">7-10 business days</td>
                      <td className="border p-3">₹1,500 - ₹2,500</td>
                    </tr>
                    <tr>
                      <td className="border p-3">UK & Europe</td>
                      <td className="border p-3">7-10 business days</td>
                      <td className="border p-3">₹1,500 - ₹2,500</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Middle East</td>
                      <td className="border p-3">5-7 business days</td>
                      <td className="border p-3">₹1,200 - ₹2,000</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Asia Pacific</td>
                      <td className="border p-3">5-7 business days</td>
                      <td className="border p-3">₹1,000 - ₹1,800</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Rest of World</td>
                      <td className="border p-3">10-14 business days</td>
                      <td className="border p-3">₹2,000 - ₹3,500</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-semibold mb-4">Order Processing Time</h2>
              <p className="text-gray-700 mb-6">
                Orders are processed within 24-48 hours of placement. Customized items require additional processing time:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Standard engraving: 2-3 business days</li>
                <li>Complex designs: 4-5 business days</li>
                <li>Bulk orders (10+ items): 5-7 business days</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">Tracking Your Order</h2>
              <p className="text-gray-700 mb-6">
                Once your order ships, you will receive a confirmation email with tracking information. 
                You can also track your order by logging into your account.
              </p>

              <h2 className="text-2xl font-semibold mb-4">Shipping Restrictions</h2>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>We currently do not ship to PO boxes</li>
                <li>Some remote locations may incur additional delivery charges</li>
                <li>International customers are responsible for customs duties and taxes</li>
              </ul>

              <div className="bg-indigo-50 p-6 rounded-xl mt-8">
                <p className="text-indigo-800">
                  <strong>Note:</strong> Delivery times are estimates and not guaranteed. 
                  Venus Enterprises is not responsible for delays caused by customs, weather, or courier services.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShippingPage;