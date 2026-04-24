import express from "express";
import ListingAnalytics from "../models/ListingAnalytics.js";
import Car from "../models/Car.js";
import Part from "../models/Part.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/analytics/view
 * Record a view on a listing
 * Body: { listingType, listingId }
 */
router.post("/view", auth, async (req, res) => {
  try {
    const { listingType, listingId } = req.body;

    if (!["Car", "Part"].includes(listingType)) {
      return res.status(400).json({ success: false, message: "Invalid listing type" });
    }

    // Get the listing to find seller
    let listing;
    if (listingType === "Car") {
      listing = await Car.findById(listingId);
    } else {
      listing = await Part.findById(listingId);
    }

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // Get or create analytics record
    let analytics = await ListingAnalytics.findOne({
      listing: listingId,
      listingType
    });

    if (!analytics) {
      analytics = await ListingAnalytics.create({
        listing: listingId,
        listingType,
        seller: listing.seller,
        title: listingType === "Car" ? `${listing.make} ${listing.model}` : listing.name,
        viewCount: 1,
        viewers: [{ userId: req.userId }]
      });
    } else {
      // Check if user already viewed
      const hasViewed = analytics.viewers.some(
        (v) => v.userId.toString() === req.userId
      );

      if (!hasViewed) {
        analytics.viewCount += 1;
        analytics.viewers.push({ userId: req.userId });
        await analytics.save();
      }
    }

    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    console.error("Record view error:", error);
    res.status(500).json({ success: false, message: "Error recording view", error: error.message });
  }
});

/**
 * POST /api/analytics/save
 * Save or unsave a listing
 * Body: { listingType, listingId }
 */
router.post("/save", auth, async (req, res) => {
  try {
    const { listingType, listingId } = req.body;

    if (!["Car", "Part"].includes(listingType)) {
      return res.status(400).json({ success: false, message: "Invalid listing type" });
    }

    // Get the listing to find seller
    let listing;
    if (listingType === "Car") {
      listing = await Car.findById(listingId);
    } else {
      listing = await Part.findById(listingId);
    }

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // Get or create analytics record
    let analytics = await ListingAnalytics.findOne({
      listing: listingId,
      listingType
    });

    if (!analytics) {
      analytics = await ListingAnalytics.create({
        listing: listingId,
        listingType,
        seller: listing.seller,
        title: listingType === "Car" ? `${listing.make} ${listing.model}` : listing.name,
        saveCount: 1,
        savers: [{ userId: req.userId }]
      });
    } else {
      // Check if user already saved
      const savedIndex = analytics.savers.findIndex(
        (s) => s.userId.toString() === req.userId
      );

      if (savedIndex !== -1) {
        // Already saved, remove it (unsave)
        analytics.savers.splice(savedIndex, 1);
        analytics.saveCount = Math.max(0, analytics.saveCount - 1);
      } else {
        // Not saved, add it
        analytics.saveCount += 1;
        analytics.savers.push({ userId: req.userId });
      }
      await analytics.save();
    }

    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    console.error("Save listing error:", error);
    res.status(500).json({ success: false, message: "Error saving listing", error: error.message });
  }
});

/**
 * GET /api/analytics/check-save
 * Check if user has saved a listing
 * Query: { listingType, listingId }
 */
router.get("/check-save", auth, async (req, res) => {
  try {
    const { listingType, listingId } = req.query;

    if (!["Car", "Part"].includes(listingType)) {
      return res.status(400).json({ success: false, message: "Invalid listing type" });
    }

    const analytics = await ListingAnalytics.findOne({
      listing: listingId,
      listingType
    });

    if (!analytics) {
      return res.status(200).json({ success: true, isSaved: false });
    }

    const isSaved = analytics.savers.some(
      (s) => s.userId.toString() === req.userId
    );

    res.status(200).json({ success: true, isSaved });
  } catch (error) {
    console.error("Check save error:", error);
    res.status(500).json({ success: false, message: "Error checking save", error: error.message });
  }
});

/**
 * GET /api/analytics/seller-dashboard
 * Get seller analytics dashboard
 */
router.get("/seller-dashboard", auth, async (req, res) => {
  try {
    // Get all analytics for current seller
    const analytics = await ListingAnalytics.find({ seller: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate summary stats
    const totalViews = analytics.reduce((sum, a) => sum + a.viewCount, 0);
    const totalSaves = analytics.reduce((sum, a) => sum + a.saveCount, 0);
    const avgViewsPerListing = analytics.length > 0 ? Math.round(totalViews / analytics.length) : 0;
    const avgSavesPerListing = analytics.length > 0 ? Math.round(totalSaves / analytics.length) : 0;

    // Get top performing listings
    const topByViews = [...analytics].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
    const topBySaves = [...analytics].sort((a, b) => b.saveCount - a.saveCount).slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalListings: analytics.length,
          totalViews,
          totalSaves,
          avgViewsPerListing,
          avgSavesPerListing
        },
        topByViews,
        topBySaves,
        allListings: analytics
      }
    });
  } catch (error) {
    console.error("Get seller dashboard error:", error);
    res.status(500).json({ success: false, message: "Error fetching dashboard", error: error.message });
  }
});

export default router;
