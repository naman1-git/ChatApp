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
      enum: ["text", "image", "video", "audio", "file"],
      default: "text",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("message", messageSchema);

export default Message;
