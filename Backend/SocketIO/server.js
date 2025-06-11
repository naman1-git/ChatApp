import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Message from "../models/message.model.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// --- ✅ TRACK MULTIPLE SOCKETS PER USER ---
const users = new Map(); // userId -> Set(socketIds)

export const getReceiverSocketId = (receiverId) => {
  const socketSet = users.get(receiverId);
  if (socketSet && socketSet.size > 0) {
    // return first socket ID (can be improved for broadcasting)
    return [...socketSet][0];
  }
  return null;
};

io.on("connection", (socket) => {
  console.log(`✅ New WebSocket connection: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  if (!userId) return;

  // Add this socket.id to the user's set
  if (!users.has(userId)) {
    users.set(userId, new Set());
  }
  users.get(userId).add(socket.id);

  // Emit current online users
  io.emit("getOnlineUsers", Array.from(users.keys()));

  // 📢 Typing indicator
  socket.on("typing", ({ receiverId }) => {
    const receiverSocket = getReceiverSocketId(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("typing", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocket = getReceiverSocketId(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("stopTyping", { senderId: userId });
    }
  });

  socket.on("disconnect", () => {
    if (userId && users.has(userId)) {
      const userSockets = users.get(userId);
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        users.delete(userId);
      }
    }

    io.emit("getOnlineUsers", Array.from(users.keys()));
  });
});

export { app, server, io };
