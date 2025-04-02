// index.js - modified for Vercel
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";

dotenv.config();
const app = express();

// Connect to MongoDB only when handling requests
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const connection = await mongoose.connect("mongodb+srv://namanadlakha2004:namanadlakha@cluster0.3b5ae.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
  cachedDb = connection;
  return connection;
}

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Important for Vercel - use this pattern instead of server.listen()
export default async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};