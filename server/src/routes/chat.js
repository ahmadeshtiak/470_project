import express from "express";
import Chat from "../models/Chat.js";
import { auth as authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get or create a chat between buyer and seller for a specific car
router.post("/get-or-create", authenticate, async (req, res) => {
  try {
    const { sellerId, carId } = req.body;
    const buyerId = req.userId;

    if (!sellerId || !carId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID and Car ID are required",
      });
    }

    if (buyerId === sellerId) {
      return res.status(400).json({
        success: false,
        message: "Cannot create chat with yourself",
      });
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({
      participants: { $all: [buyerId, sellerId] },
      carListing: carId,
    })
      .populate("participants", "name email")
      .populate("carListing", "brand model price images");

    if (!chat) {
      chat = new Chat({
        participants: [buyerId, sellerId],
        carListing: carId,
        messages: [],
      });
      await chat.save();
      chat = await Chat.findById(chat._id)
        .populate("participants", "name email")
        .populate("carListing", "brand model price images");
    }

    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error("Error getting or creating chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get or create chat",
      error: error.message,
    });
  }
});

// Get all chats for the current user
router.get("/my-chats", authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    // Only get chats where the user is actually a participant
    const chats = await Chat.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "name email")
      .populate("carListing", "brand model price images")
      .sort({ lastMessageTime: -1 });

    // Filter to ensure user is actually in the participants array
    const userChats = chats.filter(chat => {
      const participantIds = chat.participants.map(p => 
        p._id ? p._id.toString() : p.toString()
      );
      return participantIds.includes(userId.toString());
    });

    res.json({
      success: true,
      data: userChats,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
      error: error.message,
    });
  }
});

// Get messages for a specific chat
router.get("/:chatId/messages", authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    res.json({
      success: true,
      data: chat.messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});

// Delete a chat (conversation) entirely for a participant
router.delete("/:chatId", authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    // Only allow deletion if the requester is a participant
    // Use $in to check if userId is in the participants array
    const deleted = await Chat.findOneAndDelete({ 
      _id: chatId, 
      participants: { $in: [userId] } 
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or you are not authorized to delete it",
      });
    }

    return res.json({ success: true, message: "Chat deleted" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ success: false, message: "Failed to delete chat", error: error.message });
  }
});

export default router;

