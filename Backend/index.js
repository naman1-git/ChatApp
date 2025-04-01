import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./SocketIO/server.js";

dotenv.config();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: ["https://stellular-gnome-b5e2ae.netlify.app", "http://localhost:3000"],
       
    }
));

const PORT = process.env.PORT || 5001;
const URI = process.env.MONGODB_URI;

try {
    mongoose.connect(URI);
    console.log("Connected to MongoDB");
} catch (error) {
    console.log(error);
}

//routes
app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);

app.get("/", (req, res) => {
    res.send("Server is running");
});

server.listen(PORT, () => {
    console.log(`Server is Running on port ${PORT}`);
});