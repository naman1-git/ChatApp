import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String, // Encrypted text
    },
    file: {
      type: String, // Cloudinary URL if any
      default: null,
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file","pdf"],
      default: "text",
    },

    reactions: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      emoji: String,
    },
  ],

  sendAt: { type: Date },
  seen: { type: Boolean, default: false },
  scheduled: { type: Boolean, default: false },
  delivered: { type: Boolean, default: false },
  cancelled: { type: Boolean, default: false },
  agendaJobId: { type: mongoose.Schema.Types.ObjectId }


  },
  { timestamps: true }
);

const Message = mongoose.model("message", messageSchema);

export default Message;
