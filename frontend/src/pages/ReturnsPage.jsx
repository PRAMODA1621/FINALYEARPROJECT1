import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaUndo, FaMoneyBillWave } from 'react-icons/fa';

const ReturnsPage = () => {
  return (
    <>
      <Helmet>
        <title>Returns Policy - Venus Enterprises</title>
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Refunds Policy</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hassle-free returns for non-customized items
            </p>
          </div>

          {/* Policy Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-start">
                <FaCheckCircle className="text-green-500 text-2xl mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Eligible for Return</h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Non-customized items in original condition</li>
                    <li>• Return within 30 days of delivery</li>
                    <li>• Original packaging intact</li>
                    <li>• Manufacturing defects (any product)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-start">
                <FaTimesCircle className="text-red-500 text-2xl mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Not Eligible for Return</h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Customized/engraved items</li>
                    <li>• Items after 30 days</li>
                    <li>• Damaged due to customer misuse</li>
                    <li>• Opened or used items</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold mb-4">Return Process</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-indigo-600 font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Initiate Return</h4>
                  <p className="text-sm text-gray-600">Log into your account and submit return request</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-indigo-600 font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Pack Item</h4>
                  <p className="text-sm text-gray-600">Securely pack item with original packaging</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-indigo-600 font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Ship Back</h4>
                  <p className="text-sm text-gray-600">Ship to our returns address with tracking</p>
                </div>
              </div>

              <h2 className="text-2xl font-semibold mb-4">Refund Timeline</h2>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-3 text-left">Step</th>
                      <th className="border p-3 text-left">Timeframe</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3">Return request approval</td>
                      <td className="border p-3">24-48 hours</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Item received and inspected</td>
                      <td className="border p-3">2-3 days after delivery</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Refund processing</td>
                      <td className="border p-3">3-5 business days after approval</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Total estimated time</td>
                      <td className="border p-3">7-10 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-semibold mb-4">Refund Methods</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <FaUndo className="text-2xl text-indigo-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Original Payment</h4>
                  <p className="text-xs text-gray-600">Refund to original payment method (5-7 days)</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <FaMoneyBillWave className="text-2xl text-indigo-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Store Credit</h4>
                  <p className="text-xs text-gray-600">Instant credit for future purchases</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <FaCheckCircle className="text-2xl text-indigo-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Exchange</h4>
                  <p className="text-xs text-gray-600">Replace with different item</p>
                </div>
              </div>

              <h2 className="text-2xl font-semibold mb-4">Important Notes</h2>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Customized items cannot be returned unless defective</li>
                <li>Shipping costs are non-refundable</li>
                <li>Customer pays return shipping unless item is defective</li>
                <li>Items must be unused and in original packaging</li>
                <li>Refunds are processed after quality inspection</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">Returns Address</h2>
              <div className="bg-gray-50 p-6 rounded-xl mb-8">
                <p className="text-gray-800">
                  Venus Enterprises Returns<br />
                  123 Business Avenue<br />
                  Corporate District<br />
                  Mumbai - 400001, India
                </p>
              </div>

              <div className="bg-indigo-50 p-6 rounded-xl">
                <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
                <p className="text-gray-700 mb-4">
                  Contact our customer service team for return assistance:
                </p>
                <p className="text-gray-800"><strong>Email:</strong> returns@venus.com</p>
                <p className="text-gray-800"><strong>Phone:</strong> +91 22 1234 5678</p>
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

export default ReturnsPage;