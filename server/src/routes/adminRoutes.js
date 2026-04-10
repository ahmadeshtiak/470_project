import express from "express";
import * as adminController from "../../model/admin.js";

const router = express.Router();

/**
 * GET /admin/users - Get all users
 */
router.get("/users", async (req, res) => {
  try {
    const users = await adminController.getAllUsers();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /admin/stats - Get admin statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await adminController.getAdminStats();
    res.status(200).json({
      success: true,
      message: "Admin statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /admin/users/:role - Get users by role (buyer, seller, admin)
 */
router.get("/users/:role", async (req, res) => {
  try {
    const { role } = req.params;
    const users = await adminController.getUsersByRole(role);
    res.status(200).json({
      success: true,
      message: `${role}s fetched successfully`,
      data: users,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /admin/users/:userId/role - Update user role
 * Body: { newRole: "buyer" | "seller" | "admin" }
 */
router.put("/users/:userId/role", async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    if (!newRole) {
      return res.status(400).json({
        success: false,
        message: "newRole is required",
      });
    }

    const updatedUser = await adminController.updateUserRole(userId, newRole);
    res.status(200).json({
      success: true,
      message: `User role updated to ${newRole} successfully`,
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /admin/users/:userId/promote-to-admin - Promote user to admin
 */
router.put("/users/:userId/promote-to-admin", async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await adminController.promoteToAdmin(userId);
    res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /admin/users/:userId/promote-to-seller - Promote user to seller
 */
router.put("/users/:userId/promote-to-seller", async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await adminController.promoteToSeller(userId);
    res.status(200).json({
      success: true,
      message: "User promoted to seller successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /admin/users/:userId/demote-to-buyer - Demote user to buyer
 */
router.put("/users/:userId/demote-to-buyer", async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await adminController.demoteToBuyer(userId);
    res.status(200).json({
      success: true,
      message: "User demoted to buyer successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /admin/users/:userId/disable - Disable user account
 */
router.put("/users/:userId/disable", async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await adminController.disableUser(userId);
    res.status(200).json({
      success: true,
      message: "User account disabled successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /admin/users/:userId/enable - Enable user account
 */
router.put("/users/:userId/enable", async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await adminController.enableUser(userId);
    res.status(200).json({
      success: true,
      message: "User account enabled successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * DELETE /admin/users/:userId - Delete user
 */
router.delete("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await adminController.deleteUser(userId);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
