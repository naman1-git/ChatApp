import Agenda from "agenda";
import Message from "../models/message.model.js";
import { io, getReceiverSocketId } from "../SocketIO/server.js";
import dotenv from "dotenv";
import moment from "moment-timezone";

dotenv.config();

export const agenda = new Agenda({
  db: { address: process.env.MONGODB_URL, collection: "scheduledJobs" },
});

// Job definition
agenda.define("send scheduled message", async (job) => {
  const { messageId } = job.attrs.data;
  const msg = await Message.findById(messageId);
  if (!msg || msg.cancelled) return;

  msg.delivered = true;
  msg.scheduled = false;
  await msg.save();

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

  const receiverSocketId = getReceiverSocketId(msg.receiverId.toString());
  if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", msg);

  const senderSocketId = getReceiverSocketId(msg.senderId.toString());
  if (senderSocketId) io.to(senderSocketId).emit("newMessage", msg);
});

// Always treat schedule time as IST and convert to UTC for Agenda
export const scheduleMessageJob = async (messageId, sendAtIST) => {
  // sendAtIST is a string like "2025-08-10T14:30"
  const utcDate = moment.tz(sendAtIST, "Asia/Kolkata").utc().toDate();
  const job = await agenda.schedule(utcDate, "send scheduled message", { messageId });
  return job.attrs._id;
};
