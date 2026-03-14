import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import ChatbotWidget from './components/chatbot/ChatbotWidget';

// Import keep-alive service
import keepAlive from './utils/keepAlive';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductPage from './pages/ProductPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HelpdeskPage from './pages/HelpDeskPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ShippingPage from './pages/ShippingPage';
import ReturnsPage from './pages/ReturnsPage';
import FAQPage from './pages/FAQPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import CustomOrderPage from './pages/CustomOrderPage';
// import OrdersPage from './pages/OrdersPage'; // COMMENT THIS OUT OR DELETE

function App() {
  // Initialize keep-alive service when app mounts
  useEffect(() => {
    // Start the keep-alive service to prevent chatbot from sleeping
    keepAlive.start();
    
    // Pre-warm the chatbot immediately
    keepAlive.warmUp();
    
    // Ping when user becomes active (returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        keepAlive.quickPing();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Ping when user shows intent to interact (mouse movement)
    let mouseTimeout;
    const handleMouseMove = () => {
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        // Ping after 3 seconds of mouse activity (user is active)
        keepAlive.quickPing();
      }, 3000);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Cleanup on unmount
    return () => {
      keepAlive.stop();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(mouseTimeout);
    };
  }, []);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
          {/* Toast notifications for cart, auth, etc. */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#9CAF88',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Navbar />

          <main className="flex-grow pt-20">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/product/:name" element={<ProductDetailsPage />} />

              {/* Information Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/helpdesk" element={<HelpdeskPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/shipping" element={<ShippingPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/faq" element={<FAQPage />} />

              {/* Protected Routes (Require Login) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/dashboard" element={<UserDashboardPage />} />
                <Route path="/orders" element={<UserDashboardPage />} /> {/* Points to stylish dashboard */}
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/products" element={<AdminDashboardPage />} />
                <Route path="/admin/orders" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminDashboardPage />} />
              </Route>

              {/* Custom Order Page - Public */}
              <Route path="/custom-order" element={<CustomOrderPage />} />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
        
        {/* Chatbot Widget - Available on all pages */}
        <ChatbotWidget />
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;