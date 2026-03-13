import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import WishlistItem from '../components/wishlist/WishlistItem';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaHeart } from 'react-icons/fa';

const WishlistPage = () => {
  const { wishlist, loading, removeFromWishlist, refreshWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
  if (isAuthenticated) {
    refreshWishlist();
  }
}, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-[#8B5A2B] mb-3">Please Login</h2>
          <p className="text-sm text-gray-600 mb-4">You need to be logged in to view your wishlist.</p>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <>
        <Helmet>
          <title>My Wishlist - Venus Enterprises</title>
        </Helmet>
        
        <div className="min-h-screen bg-[#F5F0E8] py-16">
          <div className="container-custom text-center">
            <div className="bg-white rounded-lg shadow-sm p-12 max-w-md mx-auto border border-[#E8E0D5]">
              <FaHeart className="text-5xl text-[#9CAF88] mx-auto mb-4" />
              <h1 className="text-xl font-medium text-[#8B5A2B] mb-3">Your Wishlist is Empty</h1>
              <p className="text-sm text-gray-600 mb-6">Save items you love to your wishlist and shop them later.</p>
              <Link to="/products" className="btn-primary inline-block">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Wishlist - Venus Enterprises</title>
      </Helmet>

      <div className="bg-[#F5F0E8] min-h-screen py-8">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-medium text-[#8B5A2B]">My Wishlist</h1>
            <p className="text-sm text-[#9CAF88]">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-6">
            {wishlist.map((item) => (
              <WishlistItem
                key={item.id}
                item={item}
                onRemove={removeFromWishlist}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default WishlistPage;