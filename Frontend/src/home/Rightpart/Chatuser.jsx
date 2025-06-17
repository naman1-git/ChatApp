import React, { useEffect, useState } from "react";
import useConversation from "../../statemanage/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";

function Chatuser() {
  const { selectedConversation } = useConversation();
  const { socket, onlineUsers } = useSocketContext();
  const [isTyping, setIsTyping] = useState(false);

  if (!selectedConversation) {
    return (
      <div className="text-white p-5">
        Select a user to start chatting
      </div>
    );
  }

  // Check if user is online
  const isOnline = onlineUsers.includes(selectedConversation._id);

  // Listen for typing events from selected user
  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ senderId }) => {
      if (senderId === selectedConversation._id) {
        setIsTyping(true);

        // Remove typing indicator after 2 seconds of no typing event
        const timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 2000);

        return () => clearTimeout(timeoutId);
      }
    };

    socket.on("typing", handleTyping);

    return () => {
      socket.off("typing", handleTyping);
      setIsTyping(false);
    };
  }, [socket, selectedConversation]);

  return (
    <div className="pl-5 pt-5 h-[10vh] flex items-center space-x-4 bg-gradient-to-r from-gray-200/80 to-gray-100/80 backdrop-blur-lg shadow-xl rounded-2xl p-3 border border-gray-300/40">
      {/* Profile Picture */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-gradient-to-tr from-blue-300 via-purple-300 to-pink-300 shadow-lg">
          <img
            src={selectedConversation.profile_pic}
            alt={`${selectedConversation.fullname}'s avatar`}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Status Indicator */}
        <span
          className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-gray-200 shadow ${
            isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"
          }`}
        ></span>
      </div>

      {/* User Details */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">{selectedConversation.fullname}</h1>
        <span
          className={`text-sm font-medium ${
            isOnline ? "text-green-500" : "text-red-400"
          }`}
        >
          {isTyping ? (
            <span className="animate-pulse">Typing...</span>
          ) : isOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
}

export default Chatuser;
