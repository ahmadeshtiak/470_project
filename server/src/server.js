import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from "./routes/auth.js";
import carRoutes from "./routes/cars.js";
import partRoutes from "./routes/parts.js";
import orderRoutes from "./routes/orders.js";
import notificationRoutes from "./routes/notifications.js";
import transactionRoutes from "./routes/transactions.js";
import designRoutes from "./routes/designs.js";
import chatRoutes from "./routes/chat.js";
import Chat from "./models/Chat.js";

dotenv.config();

const app = express();

// Create HTTP server for Socket.io
const httpServer = createServer(app);

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Serve uploaded images - go up one level from src/ to server/ then into uploads/
const uploadsPath = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));

// Log the uploads path for debugging
console.log("📁 Serving static files from:", uploadsPath);


// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan("dev"));


// Mount routes
app.use("/api/auth", authRoutes);
// app.use("/api/cars", carRoutes);
// app.use("/api/parts", partRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/transactions", transactionRoutes);
// app.use("/api/designs", designRoutes);
// app.use("/api/chat", chatRoutes);

// Simple route to test the server
app.get("/", (req, res) => {
  res.send("✅ Backend server is running...");
});

// MongoDB connection
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));
} else {
  console.warn("⚠️  MONGO_URI not set. Server will start but database features won't work.");
  console.warn("⚠️  Please create a .env file in the server directory with: MONGO_URI=mongodb://localhost:27017/motorwala");
}

// Socket.io authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-prod";
    const decoded = jwt.verify(token, JWT_SECRET);
    const User = (await import("./models/User.js")).default;
    const user = await User.findById(decoded.id).select("name email");
    if (!user) {
      return next(new Error("User not found"));
    }
    socket.userId = decoded.id;
    socket.userName = user.name || user.email;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.userId} (${socket.userName})`);

  // Join user's personal room
  socket.join(`user_${socket.userId}`);

  // Join a specific chat room
  socket.on("join_chat", (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  });

  // Leave a chat room
  socket.on("leave_chat", (chatId) => {
    socket.leave(`chat_${chatId}`);
    console.log(`User ${socket.userId} left chat ${chatId}`);
  });

  // Handle new message
  socket.on("send_message", async (data) => {
    try {
      const { chatId, content } = data;

      // Verify user is part of this chat
      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.userId,
      });

      if (!chat) {
        socket.emit("error", { message: "Chat not found or unauthorized" });
        return;
      }

      // Add message to chat
      const newMessage = {
        sender: socket.userId,
        content,
        timestamp: new Date(),
        read: false,
      };

      chat.messages.push(newMessage);
      chat.lastMessage = content;
      chat.lastMessageTime = new Date();
      await chat.save();

      // Populate sender info
      await chat.populate("messages.sender", "name email");

      // Get the last message with populated sender
      const lastMessage = chat.messages[chat.messages.length - 1];

      // Emit to all users in the chat room
      io.to(`chat_${chatId}`).emit("new_message", {
        chatId,
        message: lastMessage,
      });

      // Notify other participant if they're not in the chat room
      const otherParticipant = chat.participants.find(
        (p) => p.toString() !== socket.userId
      );
      if (otherParticipant) {
        io.to(`user_${otherParticipant}`).emit("chat_notification", {
          chatId,
          message: lastMessage,
          carListing: chat.carListing,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { chatId } = data;
    socket.to(`chat_${chatId}`).emit("user_typing", {
      userId: socket.userId,
      userName: socket.userName,
    });
  });

  // Handle stop typing
  socket.on("stop_typing", (data) => {
    const { chatId } = data;
    socket.to(`chat_${chatId}`).emit("user_stopped_typing", {
      userId: socket.userId,
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.userId}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
