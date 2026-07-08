import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    userMessage: {
      type: String,
      required: true,
    },
    aiMessage: {
      type: String,
      required: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
