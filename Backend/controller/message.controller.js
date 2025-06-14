import { getReceiverSocketId, io } from "../SocketIO/server.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import mime from "mime-types"; // Add this if not already used
import { scheduleMessageJob } from "../utils/messageScheduler.js"; // Import the scheduling function
import {agenda} from "../utils/messageScheduler.js"; // Import agenda for job management


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


export const reactToMessage = async (req, res) => {
  const { messageId, userId, emoji } = req.body;

  try {
    const message = await Message.findById(messageId);

    const existingIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId
    );

    if (existingIndex !== -1) {
      const existingReaction = message.reactions[existingIndex];
      if (existingReaction.emoji === emoji) {
        // Same emoji → remove reaction
        message.reactions.splice(existingIndex, 1);
      } else {
        // Different emoji → update
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      // No previous reaction → add
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    req.io.emit("reaction-updated", {
      messageId,
      userId,
      emoji: message.reactions.find((r) => r.userId.toString() === userId)?.emoji || null,
    });

    res.status(200).json({ success: true, reactions: message.reactions });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle reaction" });
  }
};


export const scheduleMessage = async (req, res) => {
  const { message, sendAt, receiverId, file, type } = req.body;
  const senderId = req.user._id; // comes from secureRoute

  try {
    // Validate required fields
    if (!receiverId || !message || !sendAt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      file: file || null,
      type: type || "text",
      sendAt,
      scheduled: true,
      delivered: false,
      cancelled: false,
    });

    await newMessage.save();
    const jobId = await scheduleMessageJob(newMessage._id, sendAt);
    newMessage.agendaJobId = jobId;
    await newMessage.save();

    res.status(200).json({ message: "Message scheduled successfully." });
  } catch (err) {
    console.error("Scheduling failed:", err);
    res.status(500).json({ message: "Scheduling failed", error: err.message });
  }
};

export const cancelScheduledMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);
    if (!message || !message.scheduled || message.delivered || message.cancelled) {
      return res.status(400).json({ message: "Message cannot be cancelled" });
    }

    // Cancel Agenda job
    await agenda.cancel({ _id: message.agendaJobId });

    // Update message as cancelled
    message.cancelled = true;
    message.scheduled = false;
    await message.save();

    res.status(200).json({ message: "Scheduled message cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Cancellation failed", error: err.message });
  }
};

export const getScheduledMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const scheduledMessages = await Message.find({
      senderId: userId,
      scheduled: true,
      cancelled: false,
    })
      .sort({ sendAt: 1 })
      .populate("receiverId", "email"); // <-- Add this line

    res.json(scheduledMessages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch scheduled messages" });
  }
};


