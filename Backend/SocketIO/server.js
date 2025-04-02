import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://stellular-gnome-b5e2ae.netlify.app",
    methods: ["GET", "POST"],
  },
});

const users = {}; // Move users above getReceiverSocketId

export const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    users[userId] = socket.id;
    console.log("Current users:", users);
  }

  io.emit("getOnlineUsers", Object.keys(users));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId) {
      delete users[userId];
      io.emit("getOnlineUsers", Object.keys(users));
    }
  });
});

export { app, io, server };
