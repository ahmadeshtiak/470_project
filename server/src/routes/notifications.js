import express from "express";
import { auth } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Get notifications for current user
router.get("/", auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("orderId", "total status");

        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get unread count
router.get("/unread-count", auth, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.userId,
            read: false
        });

        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark notification as read
router.patch("/:id/read", auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark all as read
router.patch("/mark-all-read", auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.userId, read: false },
            { read: true }
        );

        res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
