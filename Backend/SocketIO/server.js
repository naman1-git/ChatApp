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
    return [...socketSet][0];
  }
  return null;
};

io.on("connection", (socket) => {
  console.log(`✅ New WebSocket connection: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  if (!userId) return;

  if (!users.has(userId)) {
    users.set(userId, new Set());
  }
  users.get(userId).add(socket.id);

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

  // ✅ New: Real-time Reactions
  socket.on("send-reaction", async ({ messageId, userId, emoji }) => {
    try {
      const message = await Message.findById(messageId);
      const existingIndex = message.reactions.findIndex(
        (r) => r.userId.toString() === userId
      );

      if (existingIndex !== -1) {
        const existingReaction = message.reactions[existingIndex];
        if (existingReaction.emoji === emoji) {
          // Remove reaction
          message.reactions.splice(existingIndex, 1);
        } else {
          // Update reaction
          message.reactions[existingIndex].emoji = emoji;
        }
      } else {
        // Add new reaction
        message.reactions.push({ userId, emoji });
      }

      await message.save();

      // Broadcast updated reaction to all sockets
      io.emit("reaction-updated", {
        messageId,
        userId,
        emoji: message.reactions.find((r) => r.userId.toString() === userId)?.emoji || null,
      });
    } catch (error) {
      console.error("Reaction error:", error.message);
    }
  });

  // Mark message as delivered
  socket.on("delivered", async ({ messageId, userId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message && !message.delivered) {
        message.delivered = true;
        await message.save();
        io.emit("message-delivered", { messageId, userId });
      }
    } catch (err) {
      console.error("Deliver error:", err);
    }
  });

  // Mark message as seen
  socket.on("seen", async ({ messageId, userId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message && !message.seen) {
        message.seen = true;
        await message.save();
        io.emit("message-seen", { messageId, userId });
      }
    } catch (err) {
      console.error("Seen error:", err);
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
