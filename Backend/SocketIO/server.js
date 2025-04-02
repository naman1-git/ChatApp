import { Server } from "socket.io";
import cors from "cors";

app.use(cors({
  origin: "https://stellular-gnome-b5e2ae.netlify.app", // Change this to your frontend URL
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: "https://stellular-gnome-b5e2ae.netlify.app", // Same as above
    credentials: true, // Allow cookies
  },
});

io.on("connection", (socket) => {
  console.log(`✅ New WebSocket connection: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  if (userId) {
    onlineUsers[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(onlineUsers));
  }

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    delete onlineUsers[userId];
    io.emit("getOnlineUsers", Object.keys(onlineUsers));
  });
});
