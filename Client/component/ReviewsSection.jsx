'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Star, ThumbsUp, MessageCircle, Flag, CheckCircle,
  AlertCircle, Loader2, Send, Edit3, Trash2, X,
  User, Calendar, Shield, Heart, Share2, Filter,
  ChevronDown, ChevronUp, Camera, Image as ImageIcon
} from 'lucide-react';

const ReviewsSection = ({ agentId, productId, showAddReview = true }) => {
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [notification, setNotification] = useState(null);

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: []
  });

  useEffect(() => {
    loadReviews();
  }, [agentId, productId, sortBy, filterRating]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      const endpoint = agentId 
        ? `/api/reviews/agent/${agentId}?sort=${sortBy}&rating=${filterRating}`
        : `/api/reviews/product/${productId}?sort=${sortBy}&rating=${filterRating}`;

      const response = await fetch(`${API_URL}${endpoint}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews);
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmitReview = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        showNotification('Please login to submit a review', 'error');
        return;
      }

      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      const reviewData = {
        agentId,
        productId,
        orderId: 'temp_order_id', // In real implementation, get from order context
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        images: reviewForm.images
      };

      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Review submitted successfully!', 'success');
        setShowReviewForm(false);
        setReviewForm({ rating: 5, title: '', comment: '', images: [] });
        loadReviews();
      } else {
        showNotification(data.message || 'Failed to submit review', 'error');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showNotification('Error submitting review', 'error');
    }
  };

  const handleMarkHelpful = async (reviewId, helpful) => {
    try {
      const token = localStorage.getItem('authToken');
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      await fetch(`${API_URL}/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ helpful })
      });

      loadReviews(); // Reload to update helpful count
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const handleReportReview = async (reviewId) => {
    if (!confirm('Are you sure you want to report this review?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001'
        : 'https://unlimitedata.onrender.com';

      const response = await fetch(`${API_URL}/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Inappropriate content' })
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Review reported successfully', 'success');
      } else {
        showNotification('Failed to report review', 'error');
      }
    } catch (error) {
      console.error('Error reporting review:', error);
      showNotification('Error reporting review', 'error');
    }
  };

  const StarRating = ({ rating, interactive = false, onRatingChange }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRatingChange(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const ReviewCard = ({ review }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFCC08] to-yellow-500 flex items-center justify-center">
            <User className="w-5 h-5 text-black" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {review.customer.name}
            </h4>
            <div className="flex items-center space-x-2">
              <StarRating rating={review.rating} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
              </span>
            </div>
          </div>
        </div>
        
        {review.verified && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {review.title && (
        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
          {review.title}
        </h5>
      )}

      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        {review.comment}
      </p>

      {review.images && review.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {review.response && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-[#FFCC08]" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Store Response
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {review.response.comment}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleMarkHelpful(review.id, true)}
            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-[#FFCC08] transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Helpful ({review.helpful})</span>
          </button>
          
          <button className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-[#FFCC08] transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        <button
          onClick={() => handleReportReview(review.id)}
          className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          <Flag className="w-4 h-4" />
          <span>Report</span>
        </button>
      </div>
    </div>
  );

  const ReviewForm = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Write a Review
        </h3>
        <button
          onClick={() => setShowReviewForm(false)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rating
          </label>
          <StarRating
            rating={reviewForm.rating}
            interactive={true}
            onRatingChange={(rating) => setReviewForm({...reviewForm, rating})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title (Optional)
          </label>
          <input
            type="text"
            value={reviewForm.title}
            onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
            placeholder="Summarize your experience"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Review
          </label>
          <textarea
            value={reviewForm.comment}
            onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent text-gray-900 dark:text-white"
            placeholder="Tell others about your experience..."
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSubmitReview}
            className="flex-1 px-6 py-3 bg-[#FFCC08] text-black rounded-xl font-semibold hover:bg-yellow-500 transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Review</span>
          </button>
          <button
            onClick={() => setShowReviewForm(false)}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border ${
            notification.type === 'success' ? 'bg-green-500/90 border-green-400' :
            notification.type === 'error' ? 'bg-red-500/90 border-red-400' :
            'bg-blue-500/90 border-blue-400'
          } text-white flex items-center space-x-3`}>
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Analytics Summary */}
      {analytics && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Customer Reviews
            </h3>
            {showAddReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-[#FFCC08] text-black rounded-xl font-semibold hover:bg-yellow-500 transition-all shadow-lg"
              >
                Write Review
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {analytics.averageRating?.toFixed(1) || '0.0'}
              </div>
              <div className="flex items-center justify-center mb-2">
                <StarRating rating={Math.round(analytics.averageRating || 0)} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Based on {analytics.totalReviews || 0} reviews
              </p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = analytics.ratingDistribution?.[rating] || 0;
                const percentage = analytics.totalReviews > 0 
                  ? (count / analytics.totalReviews) * 100 
                  : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                      {rating}★
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[#FFCC08] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalReviews || 0}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Reviews
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>

          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && <ReviewForm />}

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFCC08]" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading reviews...</span>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Be the first to share your experience!
          </p>
          {showAddReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-3 bg-[#FFCC08] text-black rounded-xl font-semibold hover:bg-yellow-500 transition-all shadow-lg"
            >
              Write First Review
            </button>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReviewsSection;
