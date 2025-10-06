const express = require('express');
const router = express.Router();
const verifyAuth = require('../middlewareUser/middleware');
const { Review, User } = require('../schema/schema');

// Get reviews for an agent store
router.get('/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { page = 1, limit = 10, rating, sort = 'newest' } = req.query;

    const query = { agentId };
    if (rating) {
      query.rating = parseInt(rating);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'highest') {
      sortOption = { rating: -1 };
    } else if (sort === 'lowest') {
      sortOption = { rating: 1 };
    }

    const reviews = await Review.find(query)
      .populate('customerId', 'name email')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalReviews = await Review.countDocuments(query);

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { agentId } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { agentId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review._id,
        customer: {
          name: review.customerId?.name || 'Anonymous',
          email: review.customerId?.email
        },
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
        verified: review.verified,
        helpful: review.helpful,
        response: review.response,
        createdAt: review.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews
      },
      analytics: {
        averageRating: avgRating[0]?.average || 0,
        totalReviews: avgRating[0]?.count || 0,
        ratingDistribution: ratingDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get reviews for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ productId })
      .populate('customerId', 'name email')
      .populate('agentId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalReviews = await Review.countDocuments({ productId });

    const avgRating = await Review.aggregate([
      { $match: { productId } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review._id,
        customer: {
          name: review.customerId?.name || 'Anonymous',
          email: review.customerId?.email
        },
        agent: {
          name: review.agentId?.name
        },
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
        verified: review.verified,
        helpful: review.helpful,
        response: review.response,
        createdAt: review.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews
      },
      analytics: {
        averageRating: avgRating[0]?.average || 0,
        totalReviews: avgRating[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit a review
router.post('/', verifyAuth, async (req, res) => {
  try {
    const customerId = req.user._id;
    const { agentId, orderId, productId, rating, title, comment, images } = req.body;

    // Validate required fields
    if (!agentId || !orderId || !productId || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Agent ID, Order ID, Product ID, and rating are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({ 
      customerId, 
      agentId, 
      orderId 
    });

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'Review already exists for this order' 
      });
    }

    // Create new review
    const review = new Review({
      customerId,
      agentId,
      orderId,
      productId,
      rating,
      title: title || '',
      comment: comment || '',
      images: images || [],
      verified: true // Auto-verify for now
    });

    await review.save();

    // Populate customer info for response
    await review.populate('customerId', 'name email');

    res.json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        id: review._id,
        customer: {
          name: review.customerId?.name || 'Anonymous',
          email: review.customerId?.email
        },
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
        verified: review.verified,
        createdAt: review.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a review
router.put('/:reviewId', verifyAuth, async (req, res) => {
  try {
    const customerId = req.user._id;
    const { reviewId } = req.params;
    const { rating, title, comment, images } = req.body;

    const review = await Review.findOne({ 
      _id: reviewId, 
      customerId 
    });

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    // Update review
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;
    
    review.updatedAt = new Date();
    await review.save();

    await review.populate('customerId', 'name email');

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: {
        id: review._id,
        customer: {
          name: review.customerId?.name || 'Anonymous',
          email: review.customerId?.email
        },
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
        verified: review.verified,
        updatedAt: review.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a review
router.delete('/:reviewId', verifyAuth, async (req, res) => {
  try {
    const customerId = req.user._id;
    const { reviewId } = req.params;

    const review = await Review.findOne({ 
      _id: reviewId, 
      customerId 
    });

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', verifyAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body; // true or false

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    if (helpful) {
      review.helpful += 1;
    } else if (review.helpful > 0) {
      review.helpful -= 1;
    }

    await review.save();

    res.json({
      success: true,
      message: 'Review helpfulness updated',
      helpful: review.helpful
    });
  } catch (error) {
    console.error('Error updating review helpfulness:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Agent response to review
router.post('/:reviewId/response', verifyAuth, async (req, res) => {
  try {
    const agentId = req.user._id;
    const { reviewId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Response comment is required' 
      });
    }

    const review = await Review.findOne({ 
      _id: reviewId, 
      agentId 
    });

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    review.response = {
      agentId,
      comment,
      respondedAt: new Date()
    };

    await review.save();

    res.json({
      success: true,
      message: 'Response added successfully',
      response: review.response
    });
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Report a review
router.post('/:reviewId/report', verifyAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    review.reported = true;
    await review.save();

    res.json({
      success: true,
      message: 'Review reported successfully'
    });
  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
