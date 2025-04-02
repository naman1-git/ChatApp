import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

const app = express();

// ✅ Allow CORS for WebSockets
app.use(cors({
  origin: "https://stellular-gnome-b5e2ae.netlify.app", // Your frontend URL
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://stellular-gnome-b5e2ae.netlify.app", // Change to your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // Force WebSockets
});

// Store online users
const users = {};

io.on("connection", (socket) => {
  console.log(`✅ New WebSocket connection: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  
  if (!userId) {
    console.log("❌ No userId received in handshake query");
    return;
  }

  users[userId] = socket.id;
  console.log("👥 Current online users:", users);

  io.emit("getOnlineUsers", Object.keys(users));

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    delete users[userId];
    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { app, server,io };
