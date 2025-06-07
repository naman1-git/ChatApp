import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";
import Message from "../models/message.model.js";

dotenv.config();

import cors from "cors";
const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL, // Change this if frontend URL changes
  credentials: true
}));


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Netlify URL
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
  if (!userId) return;

  users[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(users));

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
    delete users[userId];
    io.emit("getOnlineUsers", Object.keys(users));
  });
});



export { app, server, io };