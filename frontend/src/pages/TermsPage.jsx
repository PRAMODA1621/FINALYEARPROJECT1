import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions - Venus Enterprises</title>
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Last updated: March 2026
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-6">
                By accessing or using the Venus Enterprises website, you agree to be bound by these Terms and Conditions. 
                If you do not agree to all terms, please do not use our services.
              </p>

              <h2 className="text-2xl font-semibold mb-4">2. Products and Services</h2>
              <p className="text-gray-700 mb-4">All products are subject to availability. We reserve the right to:</p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Modify or discontinue products without notice</li>
                <li>Limit quantities of any product</li>
                <li>Refuse service to anyone at any time</li>
                <li>Make changes to product specifications and pricing</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">3. Customization and Engraving</h2>
              <p className="text-gray-700 mb-6">
                Customized products are non-refundable unless there is a manufacturing defect. 
                Please double-check all engraving text before confirming your order. 
                We are not responsible for spelling errors in customer-provided text.
              </p>

              <h2 className="text-2xl font-semibold mb-4">4. Pricing and Payment</h2>
              <p className="text-gray-700 mb-4">
                All prices are in Indian Rupees (₹) and inclusive of applicable taxes. 
                We accept payments via:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Credit/Debit Cards</li>
                <li>UPI (Unified Payments Interface)</li>
                <li>Net Banking</li>
                <li>Cash on Delivery (for eligible orders)</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">5. Shipping and Delivery</h2>
              <p className="text-gray-700 mb-4">
                We ship across India and internationally. Delivery times are estimates and not guaranteed. 
                We are not responsible for delays caused by:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Customs clearance</li>
                <li>Weather conditions</li>
                <li>Courier service disruptions</li>
                <li>Incorrect shipping information provided by customer</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">6. Returns and Refunds</h2>
              <p className="text-gray-700 mb-4">Please review our <Link to="/returns" className="text-indigo-600 hover:underline">Returns Policy</Link> for detailed information. In summary:</p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Non-customized items: 30-day return window</li>
                <li>Customized items: Non-returnable unless defective</li>
                <li>Refunds processed within 7-10 business days after approval</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 mb-6">
                All content on this website, including images, text, logos, and designs, is the property of Venus Enterprises 
                and protected by copyright laws. You may not reproduce, distribute, or use our content without written permission.
              </p>

              <h2 className="text-2xl font-semibold mb-4">8. User Accounts</h2>
              <p className="text-gray-700 mb-4">You are responsible for:</p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Maintaining the confidentiality of your account</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Notifying us of any unauthorized use</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-6">
                Venus Enterprises shall not be liable for any indirect, incidental, special, or consequential damages 
                arising from your use of our products or services.
              </p>

              <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
              <p className="text-gray-700 mb-6">
                These terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive 
                jurisdiction of courts in Mumbai, Maharashtra.
              </p>

              <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 mb-6">
                We reserve the right to modify these terms at any time. Continued use of our services after changes 
                constitutes acceptance of the revised terms.
              </p>

              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p className="text-gray-700 mb-6">
                For questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-800"><strong>Email:</strong> legal@venus.com</p>
                <p className="text-gray-800"><strong>Phone:</strong> +91 22 1234 5678</p>
                <p className="text-gray-800"><strong>Address:</strong> 123 Business Avenue, Corporate District, Mumbai - 400001, India</p>
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

export default TermsPage;