import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import axiosInstance from "../utils/axios";
import ChatBox from "../components/ChatBox";

export default function SellerMessages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startChat, activeChat, closeChat } = useChat();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showChatBox, setShowChatBox] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Determine if current user is a seller
  const isSeller = user?.role === "seller" || user?.role === "admin";

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  // Listen for real-time message updates
  useEffect(() => {
    const handleMessageReceived = () => {
      fetchChats(); // Refresh chat list when new message arrives
    };

    window.addEventListener("chatMessageReceived", handleMessageReceived);
    return () => {
      window.removeEventListener("chatMessageReceived", handleMessageReceived);
    };
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/chat/my-chats");
      if (response.data.success) {
        // Filter to ensure only chats where the logged-in user is a participant
        const userChats = response.data.data.filter((chat) => {
          if (!chat.participants || !Array.isArray(chat.participants)) {
            return false;
          }
          
          // Check if current user is in participants
          const isUserParticipant = chat.participants.some((p) => {
            const participantId = p._id || p;
            return participantId.toString() === user.id.toString();
          });
          
          if (!isUserParticipant) {
            return false;
          }
          
          // Check if there's another participant (not the current user)
          const otherParticipant = chat.participants.find((p) => {
            const participantId = p._id || p;
            return participantId.toString() !== user.id.toString();
          });
          
          return !!otherParticipant; // Only show chats with another participant
        });
        setChats(userChats);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = async (chat) => {
    try {
      setChatLoading(true);
      const otherParticipant = chat.participants.find(
        (p) => p._id !== user.id && p._id?.toString() !== user.id?.toString()
      );
      
      if (otherParticipant && chat.carListing) {
        // For buyers: pass sellerId, for sellers: pass buyerId (but startChat expects sellerId)
        // Since startChat creates/gets chat between buyer and seller, we need to pass the other participant's ID
        // The API will handle the logic correctly
        await startChat(otherParticipant._id, chat.carListing._id);
        setSelectedChat(chat);
        setShowChatBox(true);
      }
    } catch (error) {
      console.error("Error opening chat:", error);
      alert("Failed to open chat. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleCloseChat = () => {
    closeChat();
    setShowChatBox(false);
    setSelectedChat(null);
    fetchChats(); // Refresh to get latest messages
  };

  const handleDeleteConversation = async (chatId, e) => {
    // Prevent opening the chat when clicking delete
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

    if (!window.confirm('Delete this conversation? This will remove it permanently.')) return;

    try {
      await axiosInstance.delete(`/chat/${chatId}`);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      // If the currently open chat was deleted, close it
      if (selectedChat?._id === chatId) {
        handleCloseChat();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      alert(err.response?.data?.message || 'Failed to delete conversation');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (chat) => {
    if (!chat.participants) return null;
    return chat.participants.find(
      (p) => p._id !== user.id && p._id?.toString() !== user.id?.toString()
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#3C2414' }}>
        <div className="text-center backdrop-blur-sm rounded-2xl shadow-2xl p-12 border" style={{ backgroundColor: 'rgba(93, 64, 55, 0.9)', borderColor: '#6D4C41' }}>
          <p className="mb-6 text-lg font-semibold" style={{ color: '#D7CCC8' }}>Please login to view messages</p>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-4 text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            style={{ background: 'linear-gradient(to right, #6D4C41, #5D4037)' }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#3C2414' }}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto" style={{ borderColor: '#5D4037', borderTopColor: '#8D6E63' }}></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderRightColor: '#6D4C41', animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-6 font-semibold text-lg" style={{ color: '#D7CCC8' }}>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#3C2414' }}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${showChatBox ? 'mr-96' : ''} transition-all duration-300`}>
        {/* Chat Box - appears on right side for sellers */}
        {showChatBox && selectedChat && activeChat && (
          <div className="fixed right-0 top-0 h-full w-96 z-50">
            <ChatBox
              sellerName={getOtherParticipant(selectedChat)?.name || getOtherParticipant(selectedChat)?.email || (isSeller ? "Buyer" : "Seller")}
              sellerId={getOtherParticipant(selectedChat)?._id}
              carId={selectedChat.carListing?._id}
              onClose={handleCloseChat}
            />
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8">
          <div className="rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden" style={{ backgroundColor: '#5D4037' }}>
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <h1 className="text-5xl font-black tracking-tight">Messages</h1>
            </div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: '#6D4C41', opacity: 0.1 }}></div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="rounded-2xl shadow-2xl border overflow-hidden" style={{ backgroundColor: 'rgba(93, 64, 55, 0.9)', borderColor: '#6D4C41' }}>
          {chats.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #6D4C41, #5D4037)' }}>
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-white">No messages yet</h3>
              <p className="mt-3 text-lg" style={{ color: '#D7CCC8' }}>
                {isSeller
                  ? "When buyers contact you about your listings, their messages will appear here."
                  : "When you contact sellers about listings, your conversations will appear here."}
              </p>
            </div>
          ) : (
            <div className="p-4">
              {chats.map((chat, index) => {
                const otherParticipant = getOtherParticipant(chat);
                const car = chat.carListing;
                const lastMessage = chat.lastMessage || "No messages yet";
                const isActive = selectedChat?._id === chat._id;
                const participantName = isSeller 
                  ? (otherParticipant?.name || otherParticipant?.email || "Unknown Buyer")
                  : (otherParticipant?.name || otherParticipant?.email || "Unknown Seller");
                const participantLabel = isSeller ? "Buyer" : "Seller";

                return (
                  <div
                      key={chat._id}
                      onClick={() => handleOpenChat(chat)}
                      className={`p-6 cursor-pointer transition-all duration-300 relative rounded-xl border-2 mb-4 ${
                        isActive ? "border-l-4" : ""
                      }`}
                      style={{
                        backgroundColor: '#F5F5DC',
                        borderColor: '#000000',
                        borderLeftColor: isActive ? '#000000' : '#000000',
                        borderLeftWidth: isActive ? '4px' : '2px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(245, 245, 220, 0.9)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F5F5DC';
                      }}
                    >
                    <div className="flex items-start gap-4">
                      {/* Participant Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-md border-2" style={{ backgroundColor: '#F5F5DC', borderColor: '#000000', color: '#000000' }}>
                          {participantName.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold" style={{ color: '#000000' }}>
                              {participantName}
                            </h3>
                            {car && (
                              <div className="mt-1">
                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full border" style={{ backgroundColor: '#F5F5DC', borderColor: '#000000', color: '#000000' }}>
                                  {car.brand} {car.model}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs whitespace-nowrap ml-4 font-medium" style={{ color: '#000000' }}>
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        </div>

                        <p className="text-sm mt-3 truncate font-medium" style={{ color: '#000000' }}>
                          {lastMessage}
                        </p>

                        {car && car.images && car.images.length > 0 && (
                          <div className="mt-3">
                            <img
                              src={`http://localhost:5000${car.images[0]}`}
                              alt={`${car.brand} ${car.model}`}
                              className="w-20 h-20 object-cover rounded-xl shadow-md border-2"
                              style={{ borderColor: '#000000' }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete Icon Button - Bottom Right */}
                    <button
                      onClick={(e) => handleDeleteConversation(chat._id, e)}
                      className="absolute bottom-3 right-3 z-10 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-110"
                      title="Delete conversation"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

