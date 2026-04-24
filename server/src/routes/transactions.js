import express from "express";
import Transaction from "../models/Transaction.js";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import { auth } from "../middleware/auth.js";
import { processMastercardPayment, processRefund } from "../utils/paymentGateway.js";

const router = express.Router();

/**
 * POST /api/transactions/process-mastercard
 * Process MasterCard payment for an order
 */
router.post("/process-mastercard", auth, async (req, res) => {
  try {
    const {
      orderId,
      cardNumber,
      cardholderName,
      expiryDate,
      cvv,
      amount
    } = req.body;

    // Validate order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.buyer.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (order.paymentStatus !== "pending") {
      return res.status(400).json({ success: false, message: "Order payment already processed" });
    }

    // Process payment
    const paymentResult = await processMastercardPayment({
      cardNumber,
      cardholderName,
      expiryDate,
      cvv,
      amount: order.total,
      orderId
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.error
      });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      orderId: orderId,
      buyer: req.userId,
      amount: order.total,
      paymentMethod: "mastercard",
      mastercardDetails: {
        lastFourDigits: paymentResult.lastFourDigits,
        cardholderName: cardholderName,
        transactionId: paymentResult.transactionId
      },
      status: "completed",
      statusDescription: "Payment successfully processed",
      processingTime: new Date(),
      metadata: {
        ipAddress: req.ip || "unknown",
        userAgent: req.get('user-agent') || "unknown"
      }
    });

    // Update order
    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.transaction = transaction._id;
    await order.save();

    // Create buyer notification
    await Notification.create({
      recipient: req.userId,
      type: "payment_confirmed",
      message: `Payment of ৳${order.total.toLocaleString()} confirmed for order #${order._id.toString().slice(-6).toUpperCase()}`,
      orderId: order._id,
      transactionId: transaction._id,
      paymentMethod: "mastercard",
      amount: order.total
    });

    // Create seller notifications
    const sellerIds = [...new Set(order.items.map(item => item.seller.toString()))];
    for (const sellerId of sellerIds) {
      const sellerItems = order.items.filter(item => item.seller.toString() === sellerId);
      await Notification.create({
        recipient: sellerId,
        type: "order_received",
        message: `New paid order received! ${sellerItems.length} item(s) worth ৳${sellerItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toLocaleString()}. Transaction ID: ${paymentResult.transactionId}`,
        orderId: order._id,
        transactionId: transaction._id,
        paymentMethod: "mastercard",
        amount: order.total
      });
    }

    res.status(201).json({
      success: true,
      data: {
        transaction: transaction,
        order: order,
        transactionId: paymentResult.transactionId,
        message: "Payment processed successfully"
      }
    });

  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing payment",
      error: error.message
    });
  }
});

/**
 * GET /api/transactions/admin/all
 * Get all transactions (admin only)
 * MUST be before /:id route to avoid matching
 */
router.get("/admin/all", auth, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const transactions = await Transaction.find()
      .populate("buyer", "name email phone")
      .populate("orderId", "status items total")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error("Get all transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message
    });
  }
});

/**
 * GET /api/transactions/admin/stats
 * Get transaction statistics (admin only)
 * MUST be before /:id route to avoid matching
 */
router.get("/admin/stats", auth, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const totalStats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
          totalCompleted: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          totalRefunded: {
            $sum: { $cond: [{ $eq: ["$status", "refunded"] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        overall: totalStats[0] || {
          totalTransactions: 0,
          totalRevenue: 0,
          totalCompleted: 0,
          totalRefunded: 0
        }
      }
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message
    });
  }
});

/**
 * GET /api/transactions/my
 * Get transaction history for current user
 * MUST be before /:id route to avoid matching
 */
router.get("/my", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ buyer: req.userId })
      .populate("orderId", "status items total shippingAddress")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message
    });
  }
});

/**
 * GET /api/transactions/:transactionId
 * Get transaction details
 */
router.get("/:transactionId", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate("orderId", "status items total buyer shippingAddress")
      .populate("buyer", "name email phone");

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Check authorization
    if (transaction.buyer._id.toString() !== req.userId && req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transaction",
      error: error.message
    });
  }
});

/**
 * POST /api/transactions/:transactionId/refund
 * Process refund for a transaction
 */
router.post("/:transactionId/refund", auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const transaction = await Transaction.findById(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Check if user is authorized or admin
    if (transaction.buyer.toString() !== req.userId && req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Check if transaction can be refunded
    if (transaction.status === "refunded") {
      return res.status(400).json({ success: false, message: "Transaction already refunded" });
    }

    if (transaction.status !== "completed") {
      return res.status(400).json({ success: false, message: "Only completed transactions can be refunded" });
    }

    // Process refund
    const refundResult = await processRefund(
      transaction.mastercardDetails.transactionId,
      transaction.amount,
      reason || "Customer requested refund"
    );

    if (!refundResult.success) {
      return res.status(400).json({
        success: false,
        message: refundResult.error
      });
    }

    // Update transaction
    transaction.status = "refunded";
    transaction.refundDate = new Date();
    transaction.refundReason = reason || "Customer requested refund";
    transaction.statusDescription = `Refund processed: ${refundResult.refundId}`;
    await transaction.save();

    // Update order status
    const order = await Order.findById(transaction.orderId);
    if (order) {
      order.paymentStatus = "failed";
      order.status = "cancelled";
      await order.save();
    }

    // Create notifications
    await Notification.create({
      recipient: transaction.buyer,
      type: "payment_refunded",
      message: `Refund of ৳${transaction.amount.toLocaleString()} processed. Refund ID: ${refundResult.refundId}`,
      orderId: transaction.orderId,
      transactionId: transaction._id,
      paymentMethod: "mastercard",
      amount: transaction.amount
    });

    // Notify sellers
    if (order) {
      const sellerIds = [...new Set(order.items.map(item => item.seller.toString()))];
      for (const sellerId of sellerIds) {
        await Notification.create({
          recipient: sellerId,
          type: "payment_refunded",
          message: `Order #${order._id.toString().slice(-6).toUpperCase()} has been cancelled and payment refunded.`,
          orderId: transaction.orderId,
          transactionId: transaction._id,
          paymentMethod: "mastercard",
          amount: transaction.amount
        });
      }
    }

    res.status(200).json({
      success: true,
      data: transaction,
      message: "Refund processed successfully"
    });

  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing refund",
      error: error.message
    });
  }
});

export default router;
