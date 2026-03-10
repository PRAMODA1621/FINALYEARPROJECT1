import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import ChatbotWidget from './components/chatbot/ChatbotWidget';

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
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col bg-[#F5F5F0]">

          <Navbar />

          <main className="flex-grow pt-20">
            <Routes>

              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/product/:name" element={<ProductDetailsPage />} />

              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/helpdesk" element={<HelpdeskPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/shipping" element={<ShippingPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/faq" element={<FAQPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/dashboard" element={<UserDashboardPage />} />
                <Route path="/orders" element={<UserDashboardPage />} /> {/* CHANGED: Now points to stylish dashboard */}
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/products" element={<AdminDashboardPage />} />
                <Route path="/admin/orders" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminDashboardPage />} />
              </Route>

              <Route path="/custom-order" element={<CustomOrderPage />} />

              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </main>

          <Footer />
        </div>
        
        <ChatbotWidget />
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;