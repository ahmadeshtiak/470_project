import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import axiosInstance from "../utils/axios";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const activeChatRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const newSocket = io("http://localhost:5000", {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
      });

      socketRef.current = newSocket;

      newSocket.on("connect", () => {
        console.log("✅ Connected to chat server");
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Disconnected from chat server");
        setIsConnected(false);
      });

      newSocket.on("new_message", (data) => {
        // Update messages if this is for the active chat
        setMessages((prev) => {
          // Check if this message is for the current active chat using ref
          const isActiveChat = activeChatRef.current && activeChatRef.current._id === data.chatId;
          if (isActiveChat) {
            return [...prev, data.message];
          }
          return prev;
        });
        // Emit event for messages page to refresh
        window.dispatchEvent(new CustomEvent("chatMessageReceived", { detail: data }));
      });

      newSocket.on("chat_notification", (data) => {
        // Handle notification for new message in other chat
        console.log("New message notification:", data);
      });

      newSocket.on("user_typing", (data) => {
        // Handle typing indicator
        console.log("User typing:", data);
      });

      newSocket.on("user_stopped_typing", (data) => {
        // Handle stop typing
        console.log("User stopped typing:", data);
      });

      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  const startChat = async (sellerId, carId) => {
    try {
      const response = await axiosInstance.post("/chat/get-or-create", {
        sellerId,
        carId,
      });

      if (response.data.success) {
        const chat = response.data.data;
        setActiveChat(chat);
        activeChatRef.current = chat;

        // Join chat room
        if (socketRef.current) {
          socketRef.current.emit("join_chat", chat._id);
        }

        // Load messages
        setMessages(chat.messages || []);

        return chat;
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      throw error;
    }
  };

  const sendMessage = (content) => {
    if (!socketRef.current || !activeChatRef.current || !content.trim()) {
      return;
    }

    socketRef.current.emit("send_message", {
      chatId: activeChatRef.current._id,
      content: content.trim(),
    });
  };

  const closeChat = () => {
    if (socketRef.current && activeChatRef.current) {
      socketRef.current.emit("leave_chat", activeChatRef.current._id);
    }
    setActiveChat(null);
    activeChatRef.current = null;
    setMessages([]);
  };

  const emitTyping = () => {
    if (socketRef.current && activeChatRef.current) {
      socketRef.current.emit("typing", { chatId: activeChatRef.current._id });
    }
  };

  const emitStopTyping = () => {
    if (socketRef.current && activeChatRef.current) {
      socketRef.current.emit("stop_typing", { chatId: activeChatRef.current._id });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        socket: socketRef.current,
        activeChat,
        messages,
        isConnected,
        startChat,
        sendMessage,
        closeChat,
        emitTyping,
        emitStopTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

