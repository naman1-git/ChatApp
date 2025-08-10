import Agenda from "agenda";
import Message from "../models/message.model.js";
import { io, getReceiverSocketId } from "../SocketIO/server.js";
import dotenv from "dotenv";
import moment from "moment-timezone";

dotenv.config();

export const agenda = new Agenda({
  db: { address: process.env.MONGODB_URL, collection: "scheduledJobs" },
});

// Define agenda job
agenda.define("send scheduled message", async (job) => {
  const { messageId } = job.attrs.data;

  const msg = await Message.findById(messageId);
  if (!msg || msg.cancelled) return;

  msg.delivered = true;
  msg.scheduled = false;
  await msg.save();

  // Add message to conversation
  const Conversation = (await import("../models/conversation.model.js")).default;
  let conversation = await Conversation.findOne({
    members: { $all: [msg.senderId, msg.receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      members: [msg.senderId, msg.receiverId],
    });
  }

  conversation.messages.push(msg._id);
  await conversation.save();

  // Emit to receiver if online
  const receiverSocketId = getReceiverSocketId(msg.receiverId.toString());
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", msg);
  }

  // Emit to sender if online
  const senderSocketId = getReceiverSocketId(msg.senderId.toString());
  if (senderSocketId) {
    io.to(senderSocketId).emit("newMessage", msg);
  }
});

// Schedule job with proper timezone handling
export const scheduleMessageJob = async (messageId, sendAt, userTimeZone = "Asia/Kolkata") => {
  // Convert the sendAt (in user's timezone) to UTC date
  const utcDate = moment.tz(sendAt, userTimeZone).utc().toDate();

  const job = await agenda.schedule(utcDate, "send scheduled message", { messageId });
  return job.attrs._id;
};
