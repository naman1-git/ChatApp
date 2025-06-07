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
    <div className="pl-5 pt-5 h-[10vh] flex items-center space-x-4 bg-gray-700 hover:bg-gray-600 duration-300 shadow-lg rounded-lg p-3">
      {/* Profile Picture */}
      <div className="relative">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-500">
          <img
            src={selectedConversation.profile_pic}
            alt={`${selectedConversation.fullname}'s avatar`}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Status Indicator */}
        <span
          className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-gray-700 ${
            isOnline ? "bg-green-400" : "bg-red-400"
          }`}
        ></span>
      </div>

      {/* User Details */}
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-white">{selectedConversation.fullname}</h1>
        <span
          className={`text-sm font-medium ${
            isOnline ? "text-green-400" : "text-red-400"
          }`}
        >
          {isTyping ? "Typing..." : isOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
}

export default Chatuser;
