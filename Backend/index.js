// api/index.js (main entry point for Vercel)
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "../routes/user.route.js";
import messageRoute from "../routes/message.route.js";

dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connection pooling for MongoDB
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  try {
    const connection = await mongoose.connect("mongodb+srv://namanadlakha2004:namanadlakha@cluster0.3b5ae.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
      serverSelectionTimeoutMS: 5000, // Reduce timeout to 5 seconds
    });
    
    cachedDb = connection;
    console.log("Connected to MongoDB");
    return connection;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

// Routes
app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);

app.get("/", (req, res) => {
  res.status(200).send("hello from server");
});

// Connect to database
connectToDatabase().catch(console.error);

// Export the Express API
export default app;