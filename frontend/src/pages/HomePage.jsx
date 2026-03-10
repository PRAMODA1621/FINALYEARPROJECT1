import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import productApi from '../api/productApi';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  FaArrowRight, FaTruck, FaShieldAlt, FaRecycle, FaStar, 
  FaAward, FaGift, FaClock, FaUsers, 
  FaQuoteLeft, FaQuoteRight,
  FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPhone,
  FaGem, FaTree, FaSolarPanel, FaWind,
  FaMedal, FaTrophy, FaCrown
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [stats, setStats] = useState({
    yearsOfExperience: 0,
    happyClients: 0,
    productsDelivered: 0,
    awardsWon: 0
  });

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      setStats(prev => ({
        yearsOfExperience: prev.yearsOfExperience < 15 ? prev.yearsOfExperience + 1 : 15,
        happyClients: prev.happyClients < 500 ? prev.happyClients + 5 : 500,
        productsDelivered: prev.productsDelivered < 10000 ? prev.productsDelivered + 100 : 10000,
        awardsWon: prev.awardsWon < 25 ? prev.awardsWon + 1 : 25
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const allProducts = await productApi.getProducts();
      setProducts(allProducts);
      setFeaturedProducts(allProducts.slice(0, 8));
      setError(null);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Wooden', icon: '🪵', slug: 'Wooden', count: 12, bgColor: 'from-amber-100 to-amber-200', textColor: 'text-amber-800', borderColor: 'border-amber-300' },
    { name: 'Acrylic', icon: '✨', slug: 'Acrylic', count: 10, bgColor: 'from-blue-100 to-blue-200', textColor: 'text-blue-800', borderColor: 'border-blue-300' },
    { name: 'Metal', icon: '⚙️', slug: 'Metal', count: 8, bgColor: 'from-gray-100 to-gray-200', textColor: 'text-gray-800', borderColor: 'border-gray-300' },
    { name: 'Mementos', icon: '🏆', slug: 'Mementos', count: 5, bgColor: 'from-yellow-100 to-yellow-200', textColor: 'text-yellow-800', borderColor: 'border-yellow-300' },
    { name: 'Marble', icon: '🗿', slug: 'Marble', count: 4, bgColor: 'from-stone-100 to-stone-200', textColor: 'text-stone-800', borderColor: 'border-stone-300' }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      position: 'CEO, TechCorp India',
      rating: 5,
      text: 'The crystal awards we ordered were absolutely stunning. The engraving quality is exceptional!',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
      name: 'Priya Sharma',
      position: 'HR Director, Innovate Solutions',
      rating: 5,
      text: 'Excellent quality and timely delivery. The acrylic plaques were perfect for our employee recognition program.',
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    {
      name: 'Amit Patel',
      position: 'Managing Director, Patel Group',
      rating: 5,
      text: 'The custom engraved wooden name plates look fantastic in our new office. Top-notch craftsmanship!',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
    }
  ];

  return (
    <>
      <Helmet>
        <title>Venus Enterprises - Premium Corporate Gifts & Awards</title>
      </Helmet>

      {/* HERO SECTION - With Trophy Animations & Soothing Colors */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{
        background: 'linear-gradient(135deg, #F8F5F0 0%, #F0EAE0 50%, #E8DDD0 100%)'
      }}>
        {/* Animated Trophy Elements - KEPT! */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-[#8B5A2B]/10 text-5xl"
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

        {/* Soft Glowing Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#9CAF88]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#8B5A2B]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Floating Award Icons - KEPT! */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`award-${i}`}
              className="absolute text-[#8B5A2B]/5 text-7xl"
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

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm mb-8 text-[#8B5A2B] shadow-lg border border-[#9CAF88]/30">
              ✨ India's Most Trusted Since 2010
            </span>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="block text-[#8B5A2B]">Premium Corporate</span>
              <span className="block text-[#9CAF88]">Gifts & Awards</span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 text-gray-600 max-w-3xl mx-auto">
              Elevate your corporate gifting with our premium collection of customizable products. 
              Laser engraving, logo printing, and personalized designs available.
            </p>

            <div className="flex flex-wrap gap-6 justify-center mb-16">
              <Link
                to="/products"
                className="group bg-[#8B5A2B] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#9CAF88] transition-all transform hover:-translate-y-1 shadow-2xl flex items-center space-x-2"
              >
                <span>Explore Collection</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/custom-order"
                className="group bg-white text-[#8B5A2B] px-8 py-4 rounded-full font-semibold hover:bg-[#F8F5F0] transition-all transform hover:-translate-y-1 shadow-2xl border-2 border-[#8B5A2B]/20"
              >
                Custom Order
              </Link>
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: FaTruck, text: 'Free Shipping over ₹5000' },
                { icon: FaShieldAlt, text: 'Premium Quality' },
                { icon: FaRecycle, text: 'Eco-Friendly' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full flex items-center space-x-2 text-gray-600 shadow-md border border-[#9CAF88]/20"
                >
                  <feature.icon className="text-[#8B5A2B]" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-[#8B5A2B]/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-[#8B5A2B]/50 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section - Clean & Elegant */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: FaClock, value: stats.yearsOfExperience, label: 'Years of Excellence' },
              { icon: FaUsers, value: stats.happyClients, label: 'Happy Clients' },
              { icon: FaGift, value: stats.productsDelivered, label: 'Products Delivered' },
              { icon: FaAward, value: stats.awardsWon, label: 'Awards Won' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-[#F8F5F0] to-white shadow-lg hover:shadow-xl transition-all"
              >
                <stat.icon className="text-3xl text-[#8B5A2B] mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#8B5A2B]">{stat.value}+</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Soft & Inviting */}
      <section className="py-20 bg-[#F8F5F0]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#8B5A2B] mb-4">Shop by Category</h2>
            <p className="text-xl text-[#9CAF88]">Explore our premium collections</p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link
                  to={`/products?category=${encodeURIComponent(category.slug)}`}
                  className={`block bg-gradient-to-br ${category.bgColor} p-6 rounded-2xl text-center shadow-md hover:shadow-xl transition-all border ${category.borderColor}`}
                >
                  <div className="text-5xl mb-3">{category.icon}</div>
                  <h3 className={`font-bold ${category.textColor} mb-1`}>{category.name}</h3>
                  <p className="text-xs text-gray-500">{category.count} items</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#8B5A2B] mb-2">Featured Collection</h2>
              <p className="text-xl text-[#9CAF88]">Our most popular corporate gifts</p>
            </div>
            <Link 
              to="/products" 
              className="group text-[#8B5A2B] hover:text-[#9CAF88] flex items-center space-x-2 font-medium"
            >
              <span>View All</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials - Elegant */}
      <section className="py-20 bg-[#F8F5F0]">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center text-[#8B5A2B] mb-12"
          >
            Client Testimonials
          </motion.h2>
          
          <div className="max-w-4xl mx-auto">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-[#9CAF88]/20"
            >
              <FaQuoteLeft className="text-3xl text-[#9CAF88] mb-4" />
              <p className="text-xl md:text-2xl mb-8 italic text-gray-700 leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </p>
              
              <div className="flex items-center">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#8B5A2B]"
                />
                <div className="ml-4">
                  <h4 className="font-bold text-[#8B5A2B]">{testimonials[currentTestimonial].name}</h4>
                  <p className="text-sm text-gray-500">{testimonials[currentTestimonial].position}</p>
                </div>
                <div className="ml-auto flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentTestimonial ? 'w-8 bg-[#8B5A2B]' : 'w-2 bg-[#9CAF88]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Soft */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center text-[#8B5A2B] mb-12"
          >
            Why Choose Us
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🏆', title: 'Premium Quality', desc: 'Handcrafted excellence' },
              { icon: '✨', title: 'Custom Made', desc: 'Personalized designs' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Free shipping over ₹5000' },
              { icon: '🎨', title: 'Expert Design', desc: 'Professional team' },
              { icon: '💎', title: 'Lifetime Warranty', desc: 'Guaranteed quality' },
              { icon: '🤝', title: '24/7 Support', desc: 'Always here to help' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#F8F5F0] p-6 rounded-xl shadow-md hover:shadow-lg transition-all text-center"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-[#8B5A2B] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter - Soft Gradient */}
      <section className="py-20 bg-gradient-to-r from-[#F8F5F0] to-[#E8DDD0]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#8B5A2B] mb-4">Stay Updated</h2>
            <p className="text-xl text-gray-600 mb-8">
              Subscribe for exclusive offers and updates
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] shadow-md"
              />
              <button className="px-8 py-4 bg-[#8B5A2B] text-white rounded-full font-semibold hover:bg-[#9CAF88] transition-all shadow-lg">
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Contact Bar - Minimal */}
      <section className="bg-[#8B5A2B] py-4 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <FaPhone />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaEnvelope />
              <span>corporate@venus.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaMapMarkerAlt />
              <span>Bengaluru, India</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;