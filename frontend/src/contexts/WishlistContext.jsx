import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};

export const WishlistProvider = ({ children }) => {

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, token } = useAuth();

  const fetchTimeoutRef = useRef(null);

  const fetchWishlist = async () => {

    if (!token) return;

    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(async () => {

      try {

        setLoading(true);

        const response = await axios.get(
          `${API_URL}/api/wishlist`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          setWishlist(response.data.data || []);
        }

      } catch (error) {

        console.error("Fetch wishlist error:", error);

      } finally {

        setLoading(false);
        fetchTimeoutRef.current = null;

      }

    }, 200);

  };

  useEffect(() => {

    if (!isAuthenticated || !token) {
      setWishlist([]);
      return;
    }

    fetchWishlist();

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };

  }, [token]); // FIXED dependency (prevents flashing)

  const addToWishlist = async (product) => {

    if (!isAuthenticated) {
      toast.error("Please login to add to wishlist");
      return;
    }

    try {

      const productName =
        typeof product === "string"
          ? product
          : product.name;

      const response = await axios.post(
        `${API_URL}/api/wishlist`,
        { productName },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {

        await fetchWishlist();

        toast.success("Added to wishlist");

      }

    } catch (error) {

      console.error("Add to wishlist error:", error);

      toast.error(
        error.response?.data?.message || "Failed to add to wishlist"
      );

    }

  };

  const removeFromWishlist = async (itemId) => {

    try {

      const response = await axios.delete(
        `${API_URL}/api/wishlist/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {

        setWishlist(prev =>
          prev.filter(item => item.id !== itemId) // FIXED id field
        );

        toast.success("Removed from wishlist");

      }

    } catch (error) {

      console.error("Remove wishlist error:", error);

      toast.error(
        error.response?.data?.message || "Failed to remove wishlist"
      );

    }

  };

  const checkInWishlist = (productName) => {

    return wishlist.some(
      item => item.product_name === productName // FIXED field
    );

  };

  const getWishlistItemId = (productName) => {

    const item = wishlist.find(
      item => item.product_name === productName // FIXED field
    );

    return item?.id;

  };

  const value = {

    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    checkInWishlist,
    getWishlistItemId,
    refreshWishlist: fetchWishlist

  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );

};