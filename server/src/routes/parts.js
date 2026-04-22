import express from "express";
import Part from "../models/Part.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import { uploadPartImages } from "../middleware/upload.js";

const router = express.Router();

/**
 * GET /api/parts
 * Public: list all parts
 */
router.get("/", async (req, res) => {
  try {
    const parts = await Part.find()
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: parts.length,
      data: parts,
    });
  } catch (error) {
    console.error("Get parts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching parts",
      error: error.message,
    });
  }
});

/**
 * GET /api/parts/latest
 * Public: latest 5 parts
 */
router.get("/latest", async (req, res) => {
  try {
    const parts = await Part.find()
      .populate("seller", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      count: parts.length,
      data: parts,
    });
  } catch (error) {
    console.error("Get latest parts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching latest parts",
      error: error.message,
    });
  }
});

/**
 * GET /api/parts/my-listings
 * Auth: seller/admin
 */
router.get("/my-listings", auth, async (req, res) => {
  try {
    if (req.role !== "seller" && req.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only sellers can view their part listings.",
      });
    }

    const parts = await Part.find({ seller: req.userId })
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: parts.length,
      data: parts,
    });
  } catch (error) {
    console.error("Get my part listings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your part listings",
      error: error.message,
    });
  }
});

/**
 * GET /api/parts/:id
 * Public: get part by id
 */
router.get("/:id", async (req, res) => {
  try {
    const part = await Part.findById(req.params.id).populate("seller", "name email");

    if (!part) {
      return res.status(404).json({
        success: false,
        message: "Part not found",
      });
    }

    res.status(200).json({
      success: true,
      data: part,
    });
  } catch (error) {
    console.error("Get part error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching part",
      error: error.message,
    });
  }
});

/**
 * POST /api/parts
 * Auth: any user (auto-promote to seller on first part listing)
 */
router.post("/", auth, uploadPartImages, async (req, res) => {
  try {
    const { name, category, compatibleMake, compatibleModel, condition, price, quantity, description } = req.body;

    if (!name || !category || !condition || !price || !description || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, category, condition, price, quantity, and description are required",
      });
    }

    if (!["new", "used"].includes(condition)) {
      return res.status(400).json({
        success: false,
        message: "Condition must be 'new' or 'used'",
      });
    }

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

    const images = req.files.map((file) => `/uploads/parts/${file.filename}`);

    const existingParts = await Part.countDocuments({ seller: req.userId });
    const isFirstPartListing = existingParts === 0;

    const part = await Part.create({
      name,
      category,
      compatibleMake,
      compatibleModel,
      condition,
      price: Number(price),
      quantity: Number(quantity),
      description,
      images,
      seller: req.userId,
    });

    if (isFirstPartListing) {
      await User.findByIdAndUpdate(req.userId, { role: "seller" });
    }

    const populatedPart = await Part.findById(part._id).populate("seller", "name email");

    res.status(201).json({
      success: true,
      message: "Part listing created successfully",
      data: populatedPart,
      roleUpdated: isFirstPartListing,
    });
  } catch (error) {
    console.error("Create part error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating part listing",
      error: error.message,
    });
  }
});

/**
 * PUT /api/parts/:id
 * Auth: seller owns or admin
 */
router.put("/:id", auth, uploadPartImages, async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);

    if (!part) {
      return res.status(404).json({
        success: false,
        message: "Part not found",
      });
    }

    if (req.role !== "admin" && part.seller.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only edit your own part listings.",
      });
    }

    const { name, category, compatibleMake, compatibleModel, condition, price, quantity, description } = req.body;

    if (condition && !["new", "used"].includes(condition)) {
      return res.status(400).json({
        success: false,
        message: "Condition must be 'new' or 'used'",
      });
    }

    if (name !== undefined) part.name = name;
    if (category !== undefined) part.category = category;
    if (compatibleMake !== undefined) part.compatibleMake = compatibleMake;
    if (compatibleModel !== undefined) part.compatibleModel = compatibleModel;
    if (condition !== undefined) part.condition = condition;
    if (price !== undefined) part.price = Number(price);
    if (quantity !== undefined) part.quantity = Number(quantity);
    if (description !== undefined) part.description = description;

    if (req.files && req.files.length > 0) {
      if (req.files.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum 10 images allowed",
        });
      }
      part.images = req.files.map((file) => `/uploads/parts/${file.filename}`);
    }

    await part.save();

    const populatedPart = await Part.findById(part._id).populate("seller", "name email");

    res.status(200).json({
      success: true,
      message: "Part listing updated successfully",
      data: populatedPart,
    });
  } catch (error) {
    console.error("Update part error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating part listing",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/parts/:id
 * Auth: seller owns or admin
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);

    if (!part) {
      return res.status(404).json({
        success: false,
        message: "Part not found",
      });
    }

    if (req.role !== "admin" && part.seller.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own part listings.",
      });
    }

    await Part.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Part listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete part error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting part listing",
      error: error.message,
    });
  }
});

export default router;

