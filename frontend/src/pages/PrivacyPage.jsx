import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Venus Enterprises</title>
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Last updated: March 2026
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-6">
                Venus Enterprises ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website or make purchases from our store.
              </p>

              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-gray-700 mb-4">We may collect personal information that you voluntarily provide to us when you:</p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Register for an account</li>
                <li>Make a purchase</li>
                <li>Sign up for our newsletter</li>
                <li>Contact customer support</li>
                <li>Participate in promotions or surveys</li>
              </ul>

              <p className="text-gray-700 mb-4">This information may include:</p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Name and contact information (email, phone number, billing/shipping address)</li>
                <li>Payment information (credit card details are processed securely by our payment partners)</li>
                <li>Order history and preferences</li>
                <li>Communications with us</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and account</li>
                <li>Send you promotional offers and newsletters (you can opt out at any time)</li>
                <li>Improve our website and services</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">4. Sharing Your Information</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information with:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Service providers who assist in operating our website and conducting our business</li>
                <li>Payment processors to complete transactions</li>
                <li>Shipping partners to deliver your orders</li>
                <li>Law enforcement when required by law</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-6">
                We implement appropriate technical and organizational measures to protect your personal information. 
                However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>

              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
              <p className="text-gray-700 mb-6">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                You can control cookies through your browser settings.
              </p>

              <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
              <p className="text-gray-700 mb-6">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new policy on this page with an updated effective date.
              </p>

              <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
              <p className="text-gray-700 mb-6">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-800"><strong>Email:</strong> privacy@venus.com</p>
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

export default PrivacyPage;