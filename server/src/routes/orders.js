import express from "express";
import Order from "../models/Order.js";
import Car from "../models/Car.js";
import Part from "../models/Part.js";
import Notification from "../models/Notification.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/orders
 * Create an order for parts
 * Body: { items: [{ partId, quantity }], paymentMethod }
 */
router.post("/", auth, async (req, res) => {
  try {
    const { items, paymentMethod = "cod" } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items are required" });
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const qty = Number(item.quantity || 0);
      if (qty <= 0) continue;

      if (item.type === 'car') {
        // Handle Car
        const car = await Car.findById(item._id).populate('seller'); // item._id is the car ID from frontend
        if (!car) {
          return res.status(404).json({ success: false, message: `Car not found: ${item._id}` });
        }

        orderItems.push({
          product: car._id,
          productType: 'Car',
          seller: car.seller._id,
          name: `${car.brand} ${car.model}`,
          price: Number(item.price) || car.price, // Use frontend price (with customizations) or fallback to base
          basePrice: car.price, // Store real base price
          quantity: qty,
          customizations: item.customizations || {}
        });
        total += (Number(item.price) || car.price) * qty;

      } else {
        // Handle Part (default)
        const partId = item._id || item.partId; // Handle both formats
        const part = await Part.findById(partId);

        if (!part) {
          return res.status(404).json({ success: false, message: `Part not found: ${partId}` });
        }
        if (part.quantity < qty) {
          return res.status(400).json({ success: false, message: `Insufficient stock for ${part.name}` });
        }

        orderItems.push({
          product: part._id,
          productType: 'Part',
          seller: part.seller,
          name: part.name,
          price: part.price,
          quantity: qty,
          // Parts don't have customizations in this schema yet, but we could add if needed
        });
        total += part.price * qty;

        // Deduct stock immediately for parts
        await Part.findByIdAndUpdate(part._id, { $inc: { quantity: -qty } });
      }
    }

    const order = await Order.create({
      buyer: req.userId,
      items: orderItems,
      total,
      paymentMethod: req.body.paymentMethod || paymentMethod,
      shippingAddress: req.body.shippingAddress,
      status: "pending",
      paymentStatus: req.body.paymentMethod === "mastercard" ? "pending" : "pending"
    });

    // Create notifications for each unique seller
    const sellerIds = [...new Set(orderItems.map(item => item.seller.toString()))];
    for (const sellerId of sellerIds) {
      const sellerItems = orderItems.filter(item => item.seller.toString() === sellerId);
      await Notification.create({
        recipient: sellerId,
        type: "order_received",
        message: `New order received! ${sellerItems.length} item(s) worth ৳${sellerItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toLocaleString()}`,
        orderId: order._id
      });
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Error creating order", error: error.message });
  }
});

/**
 * GET /api/orders/my
 * List orders for current buyer
 */
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.userId })
      .sort({ createdAt: -1 })
      .populate("items.part", "name images")
      .populate("buyer", "name email");
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders", error: error.message });
  }
});

/**
 * GET /api/orders/seller
 * List orders that include parts from current seller/admin
 */
router.get("/seller", auth, async (req, res) => {
  try {
    if (req.role !== "seller" && req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Seller access required" });
    }

    const orders = await Order.find({ "items.seller": req.userId })
      .sort({ createdAt: -1 })
      .populate("items.part", "name images")
      .populate("buyer", "name email");

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Get seller orders error:", error);
    res.status(500).json({ success: false, message: "Error fetching seller orders", error: error.message });
  }
});

/**
 * GET /api/orders/:id
 * Get order by ID (user must be buyer or seller or admin)
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name email phone")
      .populate("items.product", "name brand model price")
      .populate("transaction");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check authorization
    const isBuyer = order.buyer._id.toString() === req.userId;
    const isSeller = order.items.some((item) => item.seller.toString() === req.userId);
    if (!isBuyer && !isSeller && req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ success: false, message: "Error fetching order", error: error.message });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Seller/admin updates order status
 */
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only sellers of items or admin can update
    const isSeller = order.items.some((item) => item.seller.toString() === req.userId);
    if (!isSeller && req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this order" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "Error updating order status", error: error.message });
  }
});

export default router;

