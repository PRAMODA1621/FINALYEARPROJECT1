import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaArrowRight, FaGoogle, FaTrophy, FaCrown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register - Venus Enterprises</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #F8F5F0 0%, #F0EAE0 50%, #E8DDD0 100%)'
      }}>
        {/* Animated Trophy Elements - Matching Homepage */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-[#8B5A2B]/10 text-4xl"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                rotate: 0,
                scale: 0.5
              }}
              animate={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                rotate: 360,
                scale: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {i % 3 === 0 ? '🏆' : i % 3 === 1 ? '🥇' : '🎖️'}
            </motion.div>
          ))}
        </div>

        {/* Floating Award Icons */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`award-${i}`}
              className="absolute text-[#8B5A2B]/5 text-6xl"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                rotate: 0
              }}
              animate={{ 
                y: [null, -50, 50, -50],
                rotate: 360
              }}
              transition={{ 
                duration: Math.random() * 15 + 15,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {i % 2 === 0 ? <FaTrophy /> : <FaCrown />}
            </motion.div>
          ))}
        </div>

        {/* Soft Glowing Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#9CAF88]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#8B5A2B]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 relative z-10 border border-[#9CAF88]/20"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#8B5A2B] to-[#9CAF88] rounded-full flex items-center justify-center"
            >
              <FaCrown className="text-white text-3xl" />
            </motion.div>
            <h2 className="text-3xl font-bold text-[#8B5A2B]">Create Account</h2>
            <p className="text-gray-500 mt-2">Join Venus Enterprises today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">First Name *</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-gray-50"
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-gray-50"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Email Address *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-gray-50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-gray-50"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Password *</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-gray-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-gray-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white py-3 rounded-lg font-semibold hover:from-[#9CAF88] hover:to-[#8B5A2B] transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <FaArrowRight />
            </motion.button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">Or sign up with</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full flex items-center justify-center space-x-2 border border-gray-200 py-3 rounded-lg hover:bg-gray-50 transition-all"
            >
              <FaGoogle className="text-red-500" />
              <span className="text-gray-600">Continue with Google</span>
            </motion.button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#8B5A2B] hover:text-[#9CAF88]">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;