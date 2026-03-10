import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import CartItem from '../components/cart/CartItem';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaShoppingCart } from 'react-icons/fa';

const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  console.log('Cart data:', cart); // Debug log

  if (!cart.items || cart.items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart - Venus Enterprises</title>
        </Helmet>
        
        <div className="min-h-screen bg-[#F5F0E8] py-16">
          <div className="container-custom text-center">
            <div className="bg-white rounded-lg shadow-sm p-12 max-w-md mx-auto border border-[#E8E0D5]">
              <FaShoppingCart className="text-5xl text-[#9CAF88] mx-auto mb-4" />
              <h1 className="text-xl font-medium text-[#8B5A2B] mb-3">Your Cart is Empty</h1>
              <p className="text-sm text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
              <Link to="/products" className="btn-primary inline-block">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const subtotal = cart.subtotal || 0;
  const shipping = subtotal > 5000 ? 0 : 100;
  const total = subtotal + shipping;

  return (
    <>
      <Helmet>
        <title>Shopping Cart - Venus Enterprises</title>
      </Helmet>

      <div className="bg-[#F5F0E8] min-h-screen py-8">
        <div className="container-custom">
          <h1 className="text-2xl font-medium text-[#8B5A2B] mb-6">Shopping Cart ({cart.itemCount} items)</h1>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart Items */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-6">
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:w-80">
              <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-6 sticky top-24">
                <h2 className="text-lg font-medium text-[#8B5A2B] mb-4">Order Summary</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cart.itemCount} items)</span>
                    <span className="font-medium text-[#8B5A2B]">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-[#8B5A2B]">
                      {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="border-t border-[#E8E0D5] pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-[#8B5A2B]">Total</span>
                      <span className="text-[#8B5A2B]">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {subtotal < 5000 && (
                  <div className="bg-[#F5F0E8] text-[#8B5A2B] p-3 rounded-md mb-4 text-xs">
                    Add ₹{(5000 - subtotal).toFixed(2)} more for free shipping!
                  </div>
                )}

                <Link
                  to="/checkout"
                  className="block w-full btn-primary text-center"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  to="/products"
                  className="block w-full text-center text-[#9CAF88] hover:text-[#8B5A2B] transition-colors mt-3 text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;