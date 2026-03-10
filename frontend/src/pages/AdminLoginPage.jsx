import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { FaLock, FaEnvelope, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import toast from 'react-hot-toast';

const AdminLoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await login(data.email, data.password);
      
      if (response.user.role === 'admin') {
        toast.success('Welcome back, Admin!');
        navigate('/admin/dashboard');
      } else {
        toast.error('Access denied. Admin credentials required.');
      }
    } catch (error) {
      toast.error('Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - Venus Enterprises</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Back to Main Site */}
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to Main Site
          </Link>

          {/* Admin Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl mb-4 border border-white/20">
              <MdAdminPanelSettings className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white">Admin Portal</h2>
            <p className="mt-2 text-sm text-indigo-200">
              Secure access for administrators only
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-white/60" />
                  </div>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="pl-10 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-white placeholder-white/50"
                    placeholder="admin@venus.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-300">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Admin Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-white/60" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required' })}
                    className="pl-10 pr-10 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-white placeholder-white/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-white/60 hover:text-white" />
                    ) : (
                      <FaEye className="h-5 w-5 text-white/60 hover:text-white" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-300">{errors.password.message}</p>
                )}
              </div>

              {/* Demo Credentials */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <p className="text-sm text-yellow-300 font-medium mb-2">Demo Admin Access:</p>
                <p className="text-xs text-white/80">Email: admin@venus.com</p>
                <p className="text-xs text-white/80">Password: Admin@123</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-gray-900 rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <FaLock />
                    <span>Access Admin Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security Note */}
          <p className="mt-4 text-center text-xs text-indigo-300">
            This area is restricted to authorized personnel only.
            All access attempts are logged and monitored.
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;