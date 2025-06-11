import { getReceiverSocketId, io } from "../SocketIO/server.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import mime from "mime-types"; // Add this if not already used

// POST /message/send/:id 
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let fileUrl = null;
    let fileType = "text";

    // Handle file upload if file exists
    if (req.file) {
      const mimeType = req.file.mimetype;

      let resourceType = "auto";
      if (mimeType.startsWith("application/pdf")) {
        resourceType = "raw"; // Force Cloudinary to treat it as a raw file
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: resourceType,
      });
      fileUrl = result.secure_url;

      // Determine file type for message
      if (mimeType.startsWith("image/")) fileType = "image";
      else if (mimeType.startsWith("video/")) fileType = "video";
      else if (mimeType.startsWith("audio/")) fileType = "audio";
      else if (mimeType === "application/pdf") fileType = "pdf";
      else fileType = "file";

      // Clean up temp file
      fs.unlinkSync(req.file.path);
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
      });
    }

    // Save message
    const newMessage = new Message({
      senderId,
      receiverId,
      message: message || "",
      file: fileUrl,
      type: fileUrl ? fileType : "text",
    });

    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    const messageToSend = newMessage.toObject();

    // Emit to both sender and receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", messageToSend);
    }

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", messageToSend);
    }

    res.status(201).json(messageToSend);
  } catch (error) {
  console.error("❌ Error in sendMessage:", {
    message: error.message,
    stack: error.stack,
    code: error.code,
  });
  res.status(500).json({ error: "Internal server error" });
}
};


// GET /message/get/:id
export const getMessage = async (req, res) => {
  try {
    const { id: chatUser } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      members: { $all: [senderId, chatUser] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);

    // No decryption
    const messages = conversation.messages.map(msg => msg.toObject());

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Error in getMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
