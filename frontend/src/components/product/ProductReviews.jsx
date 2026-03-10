import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt, FaThumbsUp, FaThumbsDown, FaTrash, FaEdit } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import reviewApi from '../../api/reviewApi';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const ProductReviews = ({ productId, productName }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [userVotes, setUserVotes] = useState({});

  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [productId, pagination.page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewApi.getProductReviews(productId, pagination.page);
      setReviews(response.data.reviews);
      setSummary(response.data.summary);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      return;
    }

    if (formData.comment.length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    try {
      if (editingReview) {
        await reviewApi.updateReview(editingReview.id, formData);
        toast.success('Review updated successfully');
      } else {
        await reviewApi.addReview(productId, formData);
        toast.success('Review added successfully! It will appear after moderation.');
      }

      setShowReviewForm(false);
      setEditingReview(null);
      setFormData({ rating: 5, title: '', comment: '' });
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await reviewApi.deleteReview(reviewId);
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment
    });
    setShowReviewForm(true);
  };

  const handleHelpfulClick = async (reviewId, isHelpful) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }

    try {
      const response = await reviewApi.markHelpful(reviewId, isHelpful);
      setUserVotes({ ...userVotes, [reviewId]: isHelpful });
      fetchReviews(); // Refresh to update counts
    } catch (error) {
      toast.error('Failed to record vote');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  const getRatingDistribution = () => {
    if (!summary) return [];
    const total = summary.total_reviews || 1;
    return [
      { stars: 5, count: summary.rating_5 || 0, percentage: ((summary.rating_5 || 0) / total) * 100 },
      { stars: 4, count: summary.rating_4 || 0, percentage: ((summary.rating_4 || 0) / total) * 100 },
      { stars: 3, count: summary.rating_3 || 0, percentage: ((summary.rating_3 || 0) / total) * 100 },
      { stars: 2, count: summary.rating_2 || 0, percentage: ((summary.rating_2 || 0) / total) * 100 },
      { stars: 1, count: summary.rating_1 || 0, percentage: ((summary.rating_1 || 0) / total) * 100 }
    ];
  };

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold text-[#8B5A2B] mb-6">Customer Reviews</h2>

      {/* Rating Summary */}
      {summary && summary.total_reviews > 0 && (
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#F5F0E8] p-6 rounded-lg">
            <div className="text-center">
              <span className="text-5xl font-bold text-[#8B5A2B]">{summary.average_rating}</span>
              <div className="flex justify-center my-2">
                {renderStars(parseFloat(summary.average_rating))}
              </div>
              <p className="text-gray-600">Based on {summary.total_reviews} reviews</p>
            </div>
          </div>

          <div className="space-y-2">
            {getRatingDistribution().map((item) => (
              <div key={item.stars} className="flex items-center space-x-2">
                <span className="text-sm w-12">{item.stars} stars</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#9CAF88] rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm w-12">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {isAuthenticated && !showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="mb-6 bg-[#9CAF88] text-white px-6 py-2 rounded-lg hover:bg-[#8B5A2B] transition-colors"
        >
          Write a Review
        </button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-[#8B5A2B] mb-4">
            {editingReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating *
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className="focus:outline-none"
                  >
                    {star <= formData.rating ? (
                      <FaStar className="text-yellow-400 text-2xl" />
                    ) : (
                      <FaRegStar className="text-yellow-400 text-2xl" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Summarize your experience"
                className="w-full px-3 py-2 border border-[#9CAF88] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5A2B]"
                maxLength="100"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                rows="4"
                placeholder="What did you like or dislike? What did you use this product for?"
                className="w-full px-3 py-2 border border-[#9CAF88] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5A2B]"
                minLength="10"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.comment.length} characters (minimum 10)
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-6 py-2 bg-[#8B5A2B] text-white rounded-lg hover:bg-[#9CAF88] transition-colors"
              >
                {editingReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setFormData({ rating: 5, title: '', comment: '' });
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#9CAF88] border-t-transparent"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-[#F5F0E8] rounded-lg">
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border border-[#E8E0D5] rounded-lg p-6 bg-white">
              {/* Review Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-[#8B5A2B]">
                      {review.first_name} {review.last_name}
                    </span>
                    {review.is_verified_purchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    {review.title && (
                      <span className="font-medium text-gray-700">- {review.title}</span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>

              {/* Review Comment */}
              <p className="text-gray-700 mb-4">{review.comment}</p>

              {/* Review Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleHelpfulClick(review.id, true)}
                    className={`flex items-center space-x-1 text-sm ${
                      userVotes[review.id] === true ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                    }`}
                  >
                    <FaThumbsUp size={14} />
                    <span>Helpful ({review.helpful_count || 0})</span>
                  </button>
                  <button
                    onClick={() => handleHelpfulClick(review.id, false)}
                    className={`flex items-center space-x-1 text-sm ${
                      userVotes[review.id] === false ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                    }`}
                  >
                    <FaThumbsDown size={14} />
                    <span>Not Helpful ({review.not_helpful_count || 0})</span>
                  </button>
                </div>

                {/* Edit/Delete for review owner or admin */}
                {isAuthenticated && (user?.id === review.user_id || user?.role === 'admin') && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Review"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Review"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-[#9CAF88] rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-[#9CAF88] rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;