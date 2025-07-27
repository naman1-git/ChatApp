import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { agenda } from "./utils/messageScheduler.js"; 
import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./SocketIO/server.js";
import path from "path"; // <-- ADD THIS LINE

dotenv.config();

// ADD THIS LINE
const __dirname = path.resolve();

app.use(
  cors({
    origin: process.env.FRONTEND_URL, 
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;

mongoose.connect("mongodb+srv://namanadlakha2004:naman@cluster0.esuqa5q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));
  
agenda.start();

// --- API Routes ---
app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);

// --- Deployment Code (ADD THIS BLOCK) ---
// This must be AFTER your API routes
app.use(express.static(path.join(__dirname, "/Frontend/dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "Frontend", "dist", "index.html"));
});
// -----------------------------------------

// This route is now handled by the catch-all above, so you can remove it.
/* app.get("/", (req, res) => {
    res.send("Server is running");
});
*/

server.listen(PORT, () => {
    console.log(`Server is Running on port ${PORT}`);
});