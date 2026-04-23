import express from "express";
import { auth } from "../middleware/auth.js";
import ExchangeRequest from "../models/ExchangeRequest.js";
import Car from "../models/Car.js";
import Part from "../models/Part.js";

const router = express.Router();

/**
 * POST /api/exchanges
 * Create a new exchange request
 * Auth: Required
 */
router.post("/", auth, async (req, res) => {
  try {
    const {
      itemOffered,
      itemRequested,
      message,
    } = req.body;

    // Validation
    if (
      !itemOffered ||
      !itemOffered.itemType ||
      !itemOffered.itemId ||
      !itemRequested ||
      !itemRequested.itemType ||
      !itemRequested.itemId
    ) {
      return res.status(400).json({
        success: false,
        message: "Offered item and requested item details are required",
      });
    }

    // Fetch both items to get details and verify ownership
    let offeredItem, requestedItem;

    if (itemOffered.itemType === "car") {
      offeredItem = await Car.findById(itemOffered.itemId);
    } else {
      offeredItem = await Part.findById(itemOffered.itemId);
    }

    if (itemRequested.itemType === "car") {
      requestedItem = await Car.findById(itemRequested.itemId);
    } else {
      requestedItem = await Part.findById(itemRequested.itemId);
    }

    if (!offeredItem || !requestedItem) {
      return res.status(404).json({
        success: false,
        message: "One or both items not found",
      });
    }

    // Verify user owns the offered item
    if (offeredItem.seller.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only offer items you own",
      });
    }

    // Verify requesting different items
    if (
      itemOffered.itemId === itemRequested.itemId &&
      itemOffered.itemType === itemRequested.itemType
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot exchange the same item",
      });
    }

    // Create exchange request
    const exchangeRequest = await ExchangeRequest.create({
      requestedBy: req.userId,
      requestedFrom: requestedItem.seller,
      itemOffered: {
        itemType: itemOffered.itemType,
        itemId: itemOffered.itemId,
        itemName:
          itemOffered.itemType === "car"
            ? `${offeredItem.brand} ${offeredItem.model}`
            : offeredItem.name,
        itemImage: offeredItem.images?.[0] || "",
      },
      itemRequested: {
        itemType: itemRequested.itemType,
        itemId: itemRequested.itemId,
        itemName:
          itemRequested.itemType === "car"
            ? `${requestedItem.brand} ${requestedItem.model}`
            : requestedItem.name,
        itemImage: requestedItem.images?.[0] || "",
      },
      message: message || "",
    });

    const populated = await ExchangeRequest.findById(exchangeRequest._id)
      .populate("requestedBy", "name email")
      .populate("requestedFrom", "name email");

    res.status(201).json({
      success: true,
      message: "Exchange request created successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Create exchange error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating exchange request",
      error: error.message,
    });
  }
});

/**
 * GET /api/exchanges
 * Get all exchange requests (received and sent)
 * Auth: Required
 */
router.get("/", auth, async (req, res) => {
  try {
    const { type } = req.query; // 'received' or 'sent'

    let query = {};
    if (type === "received") {
      query.requestedFrom = req.userId;
    } else if (type === "sent") {
      query.requestedBy = req.userId;
    } else {
      // Default: return both
      query = {
        $or: [{ requestedBy: req.userId }, { requestedFrom: req.userId }],
      };
    }

    const exchanges = await ExchangeRequest.find(query)
      .populate("requestedBy", "name email")
      .populate("requestedFrom", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: exchanges,
    });
  } catch (error) {
    console.error("Get exchanges error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exchange requests",
      error: error.message,
    });
  }
});

/**
 * GET /api/exchanges/:id
 * Get a specific exchange request
 * Auth: Required
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const exchange = await ExchangeRequest.findById(req.params.id)
      .populate("requestedBy", "name email phone")
      .populate("requestedFrom", "name email phone");

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found",
      });
    }

    // Verify user is involved in this exchange
    if (
      exchange.requestedBy._id.toString() !== req.userId &&
      exchange.requestedFrom._id.toString() !== req.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: exchange,
    });
  } catch (error) {
    console.error("Get exchange error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exchange request",
      error: error.message,
    });
  }
});

/**
 * PUT /api/exchanges/:id
 * Update exchange request status
 * Auth: Required
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const { status, responseMessage } = req.body;

    if (!["accepted", "rejected", "withdrawn"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const exchange = await ExchangeRequest.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found",
      });
    }

    // Only the recipient can accept/reject, only the requester can withdraw
    if (status === "withdrawn") {
      if (exchange.requestedBy.toString() !== req.userId) {
        return res.status(403).json({
          success: false,
          message: "Only the requester can withdraw",
        });
      }
    } else {
      if (exchange.requestedFrom.toString() !== req.userId) {
        return res.status(403).json({
          success: false,
          message: "Only the recipient can accept or reject",
        });
      }
    }

    // Prevent status changes on already resolved requests
    if (["accepted", "rejected", "withdrawn"].includes(exchange.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of a resolved request",
      });
    }

    exchange.status = status;
    exchange.responseMessage = responseMessage || "";
    exchange.respondedAt = new Date();

    await exchange.save();

    const populated = await ExchangeRequest.findById(exchange._id)
      .populate("requestedBy", "name email")
      .populate("requestedFrom", "name email");

    res.status(200).json({
      success: true,
      message: `Exchange request ${status} successfully`,
      data: populated,
    });
  } catch (error) {
    console.error("Update exchange error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating exchange request",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/exchanges/:id
 * Delete an exchange request (only pending ones)
 * Auth: Required
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const exchange = await ExchangeRequest.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found",
      });
    }

    // Only requester can delete and only if pending
    if (exchange.requestedBy.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Only the requester can delete their exchange request",
      });
    }

    if (exchange.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Can only delete pending exchange requests",
      });
    }

    await ExchangeRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Exchange request deleted successfully",
    });
  } catch (error) {
    console.error("Delete exchange error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting exchange request",
      error: error.message,
    });
  }
});

export default router;
