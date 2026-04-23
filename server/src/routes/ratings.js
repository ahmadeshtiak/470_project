import express from "express";
import Rating from "../models/Rating.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/ratings
 * Create a new rating for a user after order completion
 * Body: { orderId, ratedUserId, rating, review }
 */
router.post("/", auth, async (req, res) => {
  try {
    const { orderId, ratedUserId, rating, review } = req.body;

    // Validate rating value
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    // Validate order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify user is the buyer of the order
    if (order.buyer.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Only the buyer can rate this order",
      });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({
      order: orderId,
      ratedBy: req.userId,
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this order",
      });
    }

    // Verify rated user is actually a seller in this order
    const isSeller = order.items.some((item) =>
      item.seller.toString() === ratedUserId
    );

    if (!isSeller) {
      return res.status(400).json({
        success: false,
        message: "This user was not a seller in this order",
      });
    }

    // Create rating
    const newRating = new Rating({
      ratedBy: req.userId,
      ratedUser: ratedUserId,
      rating,
      review: review || "",
      order: orderId,
      transactionType: "purchase",
    });

    await newRating.save();

    // Update user's average rating
    const userRatings = await Rating.find({
      ratedUser: ratedUserId,
    });

    const averageRating =
      userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length;

    await User.findByIdAndUpdate(ratedUserId, {
      averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
      totalRatings: userRatings.length,
    });

    // Mark order as rated
    await Order.findByIdAndUpdate(orderId, {
      isRatedByBuyer: true,
    });

    // Populate and return the rating
    const populatedRating = await Rating.findById(newRating._id).populate(
      "ratedBy",
      "name"
    );

    res.status(201).json({
      success: true,
      message: "Rating created successfully",
      data: populatedRating,
    });
  } catch (error) {
    console.error("Error creating rating:", error);
    res.status(500).json({
      success: false,
      message: "Error creating rating",
      error: error.message,
    });
  }
});

/**
 * GET /api/ratings/:userId
 * Get all ratings for a user
 * Query: ?limit=10&skip=0
 */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    const ratings = await Rating.find({ ratedUser: userId })
      .populate("ratedBy", "name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalCount = await Rating.countDocuments({ ratedUser: userId });

    res.status(200).json({
      success: true,
      data: ratings,
      pagination: {
        total: totalCount,
        count: ratings.length,
        skip,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ratings",
      error: error.message,
    });
  }
});

/**
 * GET /api/ratings/order/:orderId
 * Check if an order has been rated by the current user
 */
router.get("/check/:orderId", auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const rating = await Rating.findOne({
      order: orderId,
      ratedBy: req.userId,
    });

    res.status(200).json({
      success: true,
      isRated: !!rating,
      data: rating || null,
    });
  } catch (error) {
    console.error("Error checking rating:", error);
    res.status(500).json({
      success: false,
      message: "Error checking rating status",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/ratings/:ratingId
 * Delete a rating (admin or the person who gave the rating)
 */
router.delete("/:ratingId", auth, async (req, res) => {
  try {
    const { ratingId } = req.params;

    const rating = await Rating.findById(ratingId);

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    // Check authorization
    const user = await User.findById(req.userId);
    if (rating.ratedBy.toString() !== req.userId && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this rating",
      });
    }

    await Rating.findByIdAndDelete(ratingId);

    // Update user's average rating
    const userRatings = await Rating.find({
      ratedUser: rating.ratedUser,
    });

    if (userRatings.length === 0) {
      await User.findByIdAndUpdate(rating.ratedUser, {
        averageRating: 0,
        totalRatings: 0,
      });
    } else {
      const averageRating =
        userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length;

      await User.findByIdAndUpdate(rating.ratedUser, {
        averageRating: Math.round(averageRating * 100) / 100,
        totalRatings: userRatings.length,
      });
    }

    res.status(200).json({
      success: true,
      message: "Rating deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting rating",
      error: error.message,
    });
  }
});

export default router;
