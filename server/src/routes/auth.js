import express from "express";
import User from "../models/User.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
} from "../utils/auth.js";
import {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
} from "../utils/email.js";

const router = express.Router();

/**
 * Helper: return user document for a bearer token
 */
const getUserFromToken = async (token) => {
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  const user = await User.findById(decoded.id);
  return user || null;
};

/**
 * POST /api/auth/signup
 * Register a new user - generates OTP for email verification
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, address, about } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword || !phone || !address || !about) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if user already exists and is verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Generate OTP (6 digits)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Hash password
    const hashedPassword = await hashPassword(password);

    // If user exists but not verified, update the user
    if (existingUser) {
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.phone = phone;
      existingUser.address = address;
      existingUser.about = about;
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      existingUser.isEmailVerified = false;
      await existingUser.save();
    } else {
      // Create new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        about,
        otp,
        otpExpiry,
        isEmailVerified: false,
      });
      await newUser.save();
    }

    // Send OTP to email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again.",
        error: emailError.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "User registered. OTP sent to your email.",
      email: email,
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user and select password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned",
      });
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        about: user.about,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (handled client-side, but included for completeness)
 */
router.post("/logout", (req, res) => {
  try {
    // Logout is typically handled on the client by removing the token
    // This endpoint can be used for server-side cleanup if needed
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message,
    });
  }
});

/**
 * GET /api/auth/profile
 * Get user profile (for testing)
 */
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        about: user.about,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put("/profile", async (req, res) => {
  try {
    const { name, email, phone, address, about } = req.body;
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Validation
    if (!name || !email || !phone || !address || !about) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if email is being changed and if it's already taken
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }
    }

    // Update user
    user.name = name;
    user.email = email;
    user.phone = phone;
    user.address = address;
    user.about = about;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        about: user.about,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
});

// Debug: Log all registered routes
console.log("✅ Auth routes registered:");
console.log("  POST /api/auth/signup");
console.log("  POST /api/auth/login");
console.log("  POST /api/auth/logout");
console.log("  GET /api/auth/profile");
console.log("  PUT /api/auth/profile");

/**
 * GET /api/auth/users
 * Admin-only: list users
 */
router.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const requestingUser = await getUserFromToken(token);
    if (!requestingUser) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (requestingUser.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    const users = await User.find().select('-password');
    const safe = users.map(u => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, address: u.address, about: u.about, role: u.role }));
    res.status(200).json({ success: true, users: safe });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ success: false, message: 'Error listing users', error: error.message });
  }
});

/**
 * PUT /api/auth/users/:id/role
 * Admin-only: change a user's role
 */
router.put('/users/:id/role', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const requestingUser = await getUserFromToken(token);
    if (!requestingUser) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (requestingUser.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    const { id } = req.params;
    const { role } = req.body;
    if (!['buyer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, message: 'User role updated', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ success: false, message: 'Error updating role', error: error.message });
  }
});

/**
 * PUT /api/auth/users/:id/ban
 * Admin-only: ban or unban a user
 */
router.put('/users/:id/ban', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const requestingUser = await getUserFromToken(token);
    if (!requestingUser) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (requestingUser.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    const { id } = req.params;
    const { isBanned } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBanned = isBanned === true;
    await user.save();

    res.status(200).json({ success: true, message: `User ${isBanned ? 'banned' : 'unbanned'}`, user: { id: user._id, name: user.name, email: user.email, isBanned: user.isBanned } });
  } catch (error) {
    console.error('Update ban status error:', error);
    res.status(500).json({ success: false, message: 'Error updating ban status', error: error.message });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP and complete registration
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please signup again.",
      });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error("Welcome email error:", emailError);
      // Don't fail the verification if welcome email fails
    }

    // Generate auth token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        about: user.about,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/resend-otp
 * Resend OTP to email
 */
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again.",
        error: emailError.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      email: email,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Error resending OTP",
      error: error.message,
    });
  }
});

export default router;
