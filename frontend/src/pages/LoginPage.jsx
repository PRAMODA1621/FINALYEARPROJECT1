import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaEnvelope, FaLock, FaArrowRight, FaGoogle, FaTrophy, 
  FaCrown, FaUserShield, FaUserTie, FaShieldAlt 
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    navigate('/admin/login');
  };

  return (
    <>
      <Helmet>
        <title>Login - Venus Enterprises</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #F8F5F0 0%, #F0EAE0 50%, #E8DDD0 100%)'
      }}>
        {/* Animated Trophy Elements */}
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

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 relative z-10 border border-[#9CAF88]/20"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#8B5A2B] to-[#9CAF88] rounded-full flex items-center justify-center"
            >
              <FaTrophy className="text-white text-3xl" />
            </motion.div>
            <h2 className="text-3xl font-bold text-[#8B5A2B]">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-gray-50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-gray-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-[#8B5A2B] focus:ring-[#8B5A2B]" />
                <span className="ml-2 text-sm text-gray-500">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-[#8B5A2B] hover:text-[#9CAF88]">
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#8B5A2B] to-[#9CAF88] text-white py-3 rounded-lg font-semibold hover:from-[#9CAF88] hover:to-[#8B5A2B] transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <FaArrowRight />
            </motion.button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">Or continue with</span>
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

          {/* Regular Sign Up Link */}
          <p className="mt-4 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[#8B5A2B] hover:text-[#9CAF88]">
              Sign up
            </Link>
          </p>

          {/* Admin Login Link - NEW */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-sm">
              <FaUserShield className="text-[#8B5A2B]" />
              <span className="text-gray-500">Are you an admin?</span>
              <button
                onClick={handleAdminLogin}
                className="font-medium text-[#8B5A2B] hover:text-[#9CAF88] flex items-center gap-1 transition group"
              >
                <FaCrown className="text-yellow-500 group-hover:rotate-12 transition-transform" />
                Admin Login
              </button>
            </div>
          </div>

          {/* Decorative element */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F8F5F0] rounded-full">
              <FaShieldAlt className="text-[#9CAF88] text-xs" />
              <span className="text-xs text-gray-500">Secure login with 2FA</span>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;