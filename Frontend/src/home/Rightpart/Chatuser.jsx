import React from "react";
import useConversation from "../../statemanage/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import { CiMenuFries } from "react-icons/ci";

function Chatuser() {
  const { selectedConversation } = useConversation();
  const { socket, onlineUsers } = useSocketContext();

  if (!socket) {
    console.log("Socket is not connected yet.");
    return <div className="text-white p-5">Connecting to chat...</div>; // Prevents errors
  }

  const getOnlineUsersStatus = (userId) => {
    return onlineUsers.includes(userId) ? "Online" : "Offline";
  };

  const status = getOnlineUsersStatus(selectedConversation._id);

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
            status === "Online" ? "bg-green-400" : "bg-red-400"
          }`}
        ></span>
      </div>

      {/* User Details */}
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-white">{selectedConversation.fullname}</h1>
        <span className={`text-sm font-medium ${status === "Online" ? "text-green-400" : "text-red-400"}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

export default Chatuser;
