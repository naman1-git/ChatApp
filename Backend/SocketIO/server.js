import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

import cors from "cors";

app.use(cors({
  origin: "https://stellular-gnome-b5e2ae.netlify.app", // Change this if frontend URL changes
  credentials: true
}));


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://stellular-gnome-b5e2ae.netlify.app", // Netlify URL
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // Force WebSockets
});


// realtime message code goes here
export const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
};

const users = {};

// used to listen events on server side.
io.on("connection", (socket) => {
  console.log(`✅ New WebSocket connection: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  
  if (!userId) {
    console.log("❌ No userId received in handshake query");
    return;
  }

  users[userId] = socket.id;
  console.log("Current online users:", users);

  // Send online users list
  io.emit("getOnlineUsers", Object.keys(users));

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    delete users[userId];
    io.emit("getOnlineUsers", Object.keys(users));
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
export { io, app, server };