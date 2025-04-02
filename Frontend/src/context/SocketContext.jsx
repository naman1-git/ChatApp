import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import io from "socket.io-client";

const SocketContext = createContext();

// Hook to access socket context
export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const { user: authUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!authUser) {
      console.log("❌ No authUser found, skipping socket connection.");
      return;
    }

    console.log("✅ Connecting to socket server...");

    const newSocket = io("https://chatapp-1-7iuz.onrender.com", {
      query: { userId: authUser._id },
      transports: ["websocket", "polling"], 
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });

    newSocket.on("getOnlineUsers", (users) => {
      console.log("👥 Online users received:", users);
      setOnlineUsers(users);
    });

    return () => {
      console.log("🔌 Disconnecting socket...");
      newSocket.close();
    };
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
