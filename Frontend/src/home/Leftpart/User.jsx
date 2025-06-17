import React from "react";
import useConversation from "../../statemanage/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";

function User({ user }) {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const isSelected = selectedConversation?._id === user._id;
  const { socket, onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(user._id);
  return (
    <div
      className={`hover:bg-gradient-to-r hover:from-blue-200/40 hover:to-purple-200/40 duration-300 ${
        isSelected ? "bg-gradient-to-r from-blue-300/60 to-purple-200/60 shadow-lg" : ""
      } rounded-xl cursor-pointer mb-2`}
      onClick={() => setSelectedConversation(user)}
    >
      <div className="flex space-x-4 px-8 py-3 items-center">
        <div className={`avatar ${isOnline ? "online" : ""}`}>
          <div className="w-14 h-14 rounded-full border-2 border-gradient-to-tr from-blue-300 via-purple-300 to-pink-200 shadow">
            <img
              src={user.profile_pic}
              alt={`${user.name}'s avatar`}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <div>
          <h1 className="font-bold text-lg text-gray-800">{user.name}</h1>
          <span className="text-gray-700 text-sm font-bold">{user.email}</span>
        </div>
      </div>
    </div>
  );
}

export default User;
