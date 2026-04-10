import User from "./user.js";

// Admin utilities for managing user roles

/**
 * Get all users with their current roles
 * @returns {Promise<Array>} Array of users with basic info
 */
export const getAllUsers = async () => {
  try {
    const users = await User.find(
      {},
      { password: 0 } // Exclude password field
    ).sort({ createdAt: -1 });
    return users;
  } catch (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
};

/**
 * Update a user's role
 * @param {String} userId - The user ID to update
 * @param {String} newRole - The new role (buyer, seller, admin)
 * @returns {Promise<Object>} Updated user object
 */
export const updateUserRole = async (userId, newRole) => {
  const validRoles = ["buyer", "seller", "admin"];

  if (!validRoles.includes(newRole)) {
    throw new Error(
      `Invalid role. Must be one of: ${validRoles.join(", ")}`
    );
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { role: newRole, updatedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error(`Error updating user role: ${error.message}`);
  }
};

/**
 * Get users filtered by role
 * @param {String} role - The role to filter by (buyer, seller, admin)
 * @returns {Promise<Array>} Array of users with specified role
 */
export const getUsersByRole = async (role) => {
  const validRoles = ["buyer", "seller", "admin"];

  if (!validRoles.includes(role)) {
    throw new Error(
      `Invalid role. Must be one of: ${validRoles.join(", ")}`
    );
  }

  try {
    const users = await User.find(
      { role },
      { password: 0 }
    ).sort({ createdAt: -1 });
    return users;
  } catch (error) {
    throw new Error(`Error fetching users by role: ${error.message}`);
  }
};

/**
 * Promote user to admin
 * @param {String} userId - The user ID to promote
 * @returns {Promise<Object>} Updated user object
 */
export const promoteToAdmin = async (userId) => {
  return updateUserRole(userId, "admin");
};

/**
 * Promote user to seller
 * @param {String} userId - The user ID to promote
 * @returns {Promise<Object>} Updated user object
 */
export const promoteToSeller = async (userId) => {
  return updateUserRole(userId, "seller");
};

/**
 * Demote user to buyer
 * @param {String} userId - The user ID to demote
 * @returns {Promise<Object>} Updated user object
 */
export const demoteToBuyer = async (userId) => {
  return updateUserRole(userId, "buyer");
};

/**
 * Disable/Deactivate a user account
 * @param {String} userId - The user ID to disable
 * @returns {Promise<Object>} Updated user object
 */
export const disableUser = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error(`Error disabling user: ${error.message}`);
  }
};

/**
 * Enable/Activate a user account
 * @param {String} userId - The user ID to enable
 * @returns {Promise<Object>} Updated user object
 */
export const enableUser = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true, updatedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error(`Error enabling user: ${error.message}`);
  }
};

/**
 * Get admin statistics
 * @returns {Promise<Object>} Statistics about users and roles
 */
export const getAdminStats = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const buyers = await User.countDocuments({ role: "buyer" });
    const sellers = await User.countDocuments({ role: "seller" });
    const admins = await User.countDocuments({ role: "admin" });
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    return {
      totalUsers,
      buyers,
      sellers,
      admins,
      activeUsers,
      inactiveUsers,
    };
  } catch (error) {
    throw new Error(`Error fetching admin stats: ${error.message}`);
  }
};

/**
 * Delete a user (hard delete)
 * @param {String} userId - The user ID to delete
 * @returns {Promise<Object>} Deleted user object
 */
export const deleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};
