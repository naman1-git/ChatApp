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
    if (authUser) {
      const newSocket = io("https://chatapp-1-7iuz.onrender.com", {
        query: { userId: authUser._id },
        transports: ["websocket", "polling"], 
        withCredentials: true,
      });
  
      console.log("Attempting to connect socket...");
  
      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);
      });
  
      newSocket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err);
      });
  
      setSocket(newSocket);
  
      return () => {
        console.log("Socket disconnected");
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser]);
  

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
