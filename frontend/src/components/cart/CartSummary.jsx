import React from 'react';
import { useNavigate } from 'react-router-dom';

const CartSummary = ({ subtotal, itemCount }) => {
  const navigate = useNavigate();
  
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal ({itemCount} items)</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-semibold">
            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (8%)</span>
          <span className="font-semibold">${tax.toFixed(2)}</span>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-indigo-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {subtotal < 100 && (
        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-4 text-sm">
          Add ${(100 - subtotal).toFixed(2)} more to get free shipping!
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={itemCount === 0}
        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Proceed to Checkout
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Secure checkout powered by Venus Enterprises
      </p>
    </div>
  );
};

export default CartSummary;