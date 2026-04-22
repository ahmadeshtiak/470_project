import express from "express";
import Car from "../models/Car.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import { uploadCarImages } from "../middleware/upload.js";

const router = express.Router();

/**
 * GET /api/cars
 * Get all cars - accessible to everyone
 */
router.get("/", async (req, res) => {
  try {
    const cars = await Car.find().populate("seller", "name email").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    console.error("Get cars error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cars",
      error: error.message,
    });
  }
});

/**
 * GET /api/cars/latest
 * Get 5 most recently added cars - accessible to everyone
 */
router.get("/latest", async (req, res) => {
  try {
    const cars = await Car.find()
      .populate("seller", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    console.error("Get latest cars error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching latest cars",
      error: error.message,
    });
  }
});

/**
 * GET /api/cars/my-listings
 * Get all listings by the authenticated seller - seller only
 */
router.get("/my-listings", auth, async (req, res) => {
  try {
    // Only sellers can access their own listings
    if (req.role !== "seller" && req.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only sellers can view their listings.",
      });
    }

    const cars = await Car.find({ seller: req.userId })
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    console.error("Get my listings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your listings",
      error: error.message,
    });
  }
});

/**
 * GET /api/cars/:id
 * Get a single car by ID - accessible to everyone
 */
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate("seller", "name email");

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    console.error("Get car error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching car",
      error: error.message,
    });
  }
});

/**
 * POST /api/cars
 * Create a new car listing - any authenticated user
 * Auto-updates user role to "seller" on first listing
 */
router.post("/", auth, uploadCarImages, async (req, res) => {
  try {
    const { model, brand, year, price, condition } = req.body;

    // Validation
    if (!model || !brand || !year || !price || !condition) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!["new", "used"].includes(condition)) {
      return res.status(400).json({
        success: false,
        message: "Condition must be 'new' or 'used'",
      });
    }

    // Check if images were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    if (req.files.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 images allowed",
      });
    }

    // Get image paths
    const images = req.files.map((file) => `/uploads/cars/${file.filename}`);

    // Check if this is user's first listing
    const existingCars = await Car.countDocuments({ seller: req.userId });
    const isFirstListing = existingCars === 0;

    // Create car with seller set to current user
    const car = await Car.create({
      model,
      brand,
      year: Number(year),
      price: Number(price),
      condition,
      images,
      seller: req.userId,
      customizationOptions: {
        colors: req.body.colors ? JSON.parse(req.body.colors) : [],
        rims: req.body.rims ? JSON.parse(req.body.rims) : [],
        accessories: req.body.accessories ? JSON.parse(req.body.accessories) : [],
      }
    });

    // Auto-update user role to "seller" if this is their first listing
    if (isFirstListing) {
      await User.findByIdAndUpdate(req.userId, { role: "seller" });
    }

    const populatedCar = await Car.findById(car._id).populate("seller", "name email");

    res.status(201).json({
      success: true,
      message: "Car listing created successfully",
      data: populatedCar,
      roleUpdated: isFirstListing,
    });
  } catch (error) {
    console.error("Create car error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating car listing",
      error: error.message,
    });
  }
});

/**
 * PUT /api/cars/:id
 * Update a car listing
 * - Admin can edit any car
 * - Seller can edit only their own cars
 */
router.put("/:id", auth, uploadCarImages, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    // Check permissions: admin can edit any, seller can edit only their own
    if (req.role !== "admin" && car.seller.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only edit your own listings.",
      });
    }

    const { model, brand, year, price, condition } = req.body;

    // Update fields if provided
    if (model) car.model = model;
    if (brand) car.brand = brand;
    if (year) car.year = Number(year);
    if (price) car.price = Number(price);
    if (condition) {
      if (!["new", "used"].includes(condition)) {
        return res.status(400).json({
          success: false,
          message: "Condition must be 'new' or 'used'",
        });
      }
      car.condition = condition;
      car.condition = condition;
    }

    // Update customization options if provided
    if (req.body.colors) car.customizationOptions.colors = JSON.parse(req.body.colors);
    if (req.body.rims) car.customizationOptions.rims = JSON.parse(req.body.rims);
    if (req.body.accessories) car.customizationOptions.accessories = JSON.parse(req.body.accessories);

    // Handle image updates if files are uploaded
    if (req.files && req.files.length > 0) {
      if (req.files.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum 10 images allowed",
        });
      }
      // Replace existing images with new ones
      car.images = req.files.map((file) => `/uploads/cars/${file.filename}`);
    }

    await car.save();

    const populatedCar = await Car.findById(car._id).populate("seller", "name email");

    res.status(200).json({
      success: true,
      message: "Car listing updated successfully",
      data: populatedCar,
    });
  } catch (error) {
    console.error("Update car error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating car listing",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/cars/:id
 * Delete a car listing
 * - Admin can delete any car
 * - Seller can delete only their own cars
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    // Check permissions: admin can delete any, seller can delete only their own
    if (req.role !== "admin" && car.seller.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own listings.",
      });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Car listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete car error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting car listing",
      error: error.message,
    });
  }
});

export default router;

