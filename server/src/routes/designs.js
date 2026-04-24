import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import UserDesign from "../models/UserDesign.js";
import { auth } from "../middleware/auth.js";
import { verifyToken } from "../utils/auth.js";
import User from "../models/User.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for design uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const designUploadsDir = path.join(__dirname, "../../uploads/designs");
    cb(null, designUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `design-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.id).select("role");
        if (user) {
          req.userId = decoded.id;
          req.role = user.role;
        }
      }
    }
    next();
  } catch (error) {
    // Continue without auth if there's an error
    next();
  }
};

// Create a new design (no login required)
router.post("/", optionalAuth, upload.single("image"), async (req, res) => {
  try {
    console.log("Upload request received");
    console.log("File:", req.file);
    console.log("Body:", req.body);
    
    // Check if file was uploaded
    if (!req.file) {
      console.error("No file received in request");
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const { description, carInfo } = req.body;
    
    // Parse carInfo safely
    let parsedCarInfo = {};
    if (carInfo) {
      try {
        parsedCarInfo = typeof carInfo === 'string' ? JSON.parse(carInfo) : carInfo;
      } catch (parseError) {
        console.error("Error parsing carInfo:", parseError);
        parsedCarInfo = {};
      }
    }
    
    const design = new UserDesign({
      user: req.userId || null, // Can be null for guest uploads
      image: `/uploads/designs/${req.file.filename}`,
      description: description || "",
      carInfo: parsedCarInfo,
    });

    await design.save();
    console.log("Design saved successfully:", design._id);
    
    if (design.user) {
      await design.populate("user", "name email");
    }

    res.status(201).json({
      success: true,
      data: design,
    });
  } catch (error) {
    console.error("Error creating design:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create design",
    });
  }
});

// Get all designs for the authenticated user
router.get("/my-designs", auth, async (req, res) => {
  try {
    const designs = await UserDesign.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    res.json({
      success: true,
      data: designs,
    });
  } catch (error) {
    console.error("Error fetching designs:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch designs",
    });
  }
});

// Get a single design by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const design = await UserDesign.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!design) {
      return res.status(404).json({
        success: false,
        message: "Design not found",
      });
    }

    // Check if user owns the design
    if (design.user._id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this design",
      });
    }

    res.json({
      success: true,
      data: design,
    });
  } catch (error) {
    console.error("Error fetching design:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch design",
    });
  }
});

// Delete a design
router.delete("/:id", auth, async (req, res) => {
  try {
    const design = await UserDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({
        success: false,
        message: "Design not found",
      });
    }

    // Check if user owns the design
    if (design.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this design",
      });
    }

    await UserDesign.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Design deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting design:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete design",
    });
  }
});

export default router;

