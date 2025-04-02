import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./SocketIO/server.js";

dotenv.config();

// middlewarenp
app.use(cors({ origin: true, credentials: true }));


app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT ;
const URI = process.env.MONGODB_URI;

mongoose.connect(URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));


//routes
app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);

app.get("/", (req, res) => {
    res.send("Server is running");
});

server.listen(PORT, () => {
    console.log(`Server is Running on port ${PORT}`);
});