import Agenda from "agenda";
import Message from "../models/message.model.js";
import { io, getReceiverSocketId } from "../SocketIO/server.js";
import dotenv from "dotenv";
dotenv.config(); 
import moment from "moment-timezone";

const userTimeZone = "Asia/Kolkata"; // or detect from user profile
const utcDate = moment.tz(sendAt, userTimeZone).utc().toDate();

export const agenda = new Agenda({ db: { address: process.env.MONGODB_URL, collection: "scheduledJobs" } });

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

export const scheduleMessageJob = async (messageId, sendAt) => {
  const job = await agenda.schedule(new Date(sendAt), "send scheduled message", { messageId });
  return job.attrs._id;
};
