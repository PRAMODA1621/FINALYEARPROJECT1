import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FaArrowLeft, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';
const API_URL = import.meta.env.VITE_API_URL;
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'cod'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check for Buy Now item
    const stored = localStorage.getItem('buyNowItem');
    if (stored) {
      try {
        const item = JSON.parse(stored);
        setBuyNowItem(item);
        localStorage.removeItem('buyNowItem');
        console.log('Buy Now item loaded:', item);
      } catch (e) {
        console.error('Error parsing buyNowItem:', e);
      }
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        phone: user.phone || ''
      }));
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // If no Buy Now item and cart is empty, redirect
    if (!buyNowItem && cart.items.length === 0 && !loading) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [buyNowItem, cart.items, navigate, loading]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.zipCode}`;
      const token = localStorage.getItem('token');

      let orderData = {
        shippingAddress,
        phone: formData.phone,
        email: user?.email,
        paymentMethod: formData.paymentMethod,
        notes: ''
      };

      // Handle Buy Now
      if (buyNowItem) {
        orderData.items = [{
          productName: buyNowItem.productName,
          quantity: buyNowItem.quantity,
          price: buyNowItem.price
        }];
        console.log('Creating Buy Now order:', orderData);
      }

      const response = await axios.post(`${API_URL}/api/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        navigate('/order-success', {
          state: {
            orderNumber: response.data.data.orderNumber,
            total: response.data.data.total
          }
        });
        toast.success('Order placed successfully!');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (buyNowItem) {
      return buyNowItem.price * buyNowItem.quantity;
    }
    return cart.total;
  };

  const total = calculateTotal();
  const shipping = total > 5000 ? 0 : 100;
  const grandTotal = total + shipping;

  return (
    <>
      <Helmet>
        <title>Checkout - Venus Enterprises</title>
      </Helmet>

      <div className="bg-[#F5F5F0] min-h-screen py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#8B5A2B] hover:text-[#9CAF88] mb-6"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>

          <h1 className="text-3xl font-bold text-[#8B5A2B] mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-xl font-bold text-[#8B5A2B] mb-6">Shipping Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8B5A2B] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-[#9CAF88] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8B5A2B] mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-[#9CAF88] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8B5A2B] mb-2">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="w-full px-4 py-3 border border-[#9CAF88] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#8B5A2B] mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-[#9CAF88] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8B5A2B] mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-[#9CAF88] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8B5A2B] mb-2">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-[#9CAF88] rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8B5A2B] mb-2">
                      Payment Method *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center p-4 border border-[#9CAF88] rounded-lg cursor-pointer hover:bg-[#F5F5F0]">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={handleChange}
                          className="mr-3"
                        />
                        <span className="text-[#8B5A2B]">Cash on Delivery</span>
                      </label>
                      <label className="flex items-center p-4 border border-[#9CAF88] rounded-lg cursor-pointer hover:bg-[#F5F5F0]">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={formData.paymentMethod === 'upi'}
                          onChange={handleChange}
                          className="mr-3"
                        />
                        <span className="text-[#8B5A2B]">UPI Payment</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#9CAF88] text-white py-4 rounded-lg hover:bg-[#8B5A2B] transition-colors mt-8 font-semibold text-lg disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Place Order • ₹${grandTotal.toFixed(2)}`}
                </button>
              </form>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold text-[#8B5A2B] mb-4">Order Summary</h2>

                {buyNowItem ? (
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-[#8B5A2B]">
                      <span>{buyNowItem.productName} x {buyNowItem.quantity}</span>
                      <span>₹{(buyNowItem.price * buyNowItem.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {cart.items.map(item => (
                      <div key={item.id} className="flex justify-between text-[#8B5A2B]">
                        <span>{item.name} x {item.quantity}</span>
                        <span>₹{(item.quantity * item.unit_price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-[#9CAF88] pt-4 space-y-2">
                  <div className="flex justify-between text-[#8B5A2B]">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#8B5A2B]">
                    <span>Shipping</span>
                    <span className="font-medium">{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t border-[#9CAF88] pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg text-[#8B5A2B]">
                      <span>Total</span>
                      <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {total < 5000 && (
                  <div className="mt-4 p-3 bg-[#F5F5F0] text-[#8B5A2B] rounded-lg text-sm">
                    Add ₹{(5000 - total).toFixed(2)} more for free shipping!
                  </div>
                )}

                <div className="mt-4 text-xs text-[#9CAF88] flex items-center justify-center gap-1">
                  <FaLock className="text-[#8B5A2B]" /> Secure SSL Encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;