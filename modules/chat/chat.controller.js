import { Chat } from "../../models/Chat.model.js";
import { ChatMessage } from "../../models/Message.model.js";
import { Document } from "../../models/Document.model.js";
import { User } from "../../models/User.model.js";
import { ApiError } from "../../errors/ApiError.js";
import { TryCatchHandler } from "../../utils/TryCatch.util.js";
import { openai } from "../../config/openAi.config.js";
import { isValidObjectId } from "mongoose";

const getSystemPrompt = (documentText) => `
    You are DeepJano AI — an intelligent document assistant.

    Your ONLY job is to read the document provided below and answer 
    user questions strictly based on its content.
    You have zero knowledge outside of this document.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    STRICT RULES — NEVER BREAK THESE
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    1. ONLY answer from the document content below
    2. NEVER use outside knowledge, training data, or assumptions
    3. If the answer is NOT found in the document, respond EXACTLY:
      "I could not find this information in your document.
      Please check if this topic is covered in the file you uploaded."
    4. NEVER guess, hallucinate, or fill in gaps creatively
    5. NEVER mention that you are an AI or language model
    6. If user asks anything unrelated to the document, respond:
      "I can only answer questions related to your uploaded document."

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    RESPONSE STYLE
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    - Be clear, concise and easy to understand
    - Adapt tone to document type:
      → Legal doc      = formal and precise
      → Research paper = structured and factual
      → Business doc   = professional and direct
      → General doc    = friendly and simple
    - Maximum 200 words per response
    - Use bullet points for multi-part answers
    - Bold the most important keywords
    - Quote directly from document when it strongly supports the answer

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    DOCUMENT CONTENT
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ${documentText}
`;

const createChatController = TryCatchHandler(async (req, res) => {
  const { name } = req.body;

  const chat = await Chat.create({
    userId: req.user.userId,
    name: name || "New Chat",
  });

  return res.status(201).json({
    success: true,
    message: "New Chat created",
  });
});

const sendChatMessageController = TryCatchHandler(async (req, res) => {
  const { chatId } = req.params;
  const { userMessage } = req.body;

  if (!chatId || !isValidObjectId(chatId)) {
    throw new ApiError(400, "Invalid Chat ID");
  }

  if (!userMessage) {
    throw new ApiError(400, "Please enter something");
  }

  const chat = await Chat.findOne({
    _id: chatId,
    userId: req.user.userId,
  }).populate("documentId", "filename extractedText");

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  if (!chat.documentId) {
    throw new ApiError(400, "Please upload document");
  }

  const documentText = chat.documentId.extractedText;

  const completion = await openai.chat.completions.create({
    model: "poolside/laguna-xs-2.1:free",
    messages: [
      {
        role: "system",
        content: getSystemPrompt(documentText),
      },
      { role: "user", content: userMessage },
    ],
  });

  const aiResponse = completion.choices[0].message.content.trim();

  const message = await ChatMessage.create({
    chatId: chat._id,
    userMessage,
    aiMessage: aiResponse,
    userId: req.user.userId,
  });

  return res.status(200).json({
    success: true,
    message: "Message received",
    data: {
      userMessage: message.userMessage,
      aiResponse: message.aiMessage,
    },
  });
});

const deleteChatController = TryCatchHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId || !isValidObjectId(chatId)) {
    throw new ApiError(400, "Invalid Chat ID");
  }

  const chat = await Chat.findOne({
    _id: chatId,
    userId: req.user.userId,
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  const session = await ChatMessage.startSession();
  session.startTransaction();

  await ChatMessage.deleteMany(
    { chatId: chatId, userId: req.user.userId },
    { session },
  );

  await Document.findOneAndDelete(
    {
      _id: chat.documentId,
      userId: req.user.userId,
    },
    { session },
  );
  
  await chat.deleteOne().session(session);

  await session.commitTransaction();
  session.endSession();

  return res.status(200).json({
    success: true,
    message: "Chat deleted successfully",
  });
});

const getChatsController = TryCatchHandler(async (req, res) => {
  const chats = await Chat.find({ userId: req.user.userId })
    .populate("documentId", "filename")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "Chats fetched successfully",
    data: chats,
  });
});

const getChatByIdController = TryCatchHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId || !isValidObjectId(chatId)) {
    throw new ApiError(400, "Invalid Chat ID");
  }

  const chat = await Chat.findOne({
    _id: chatId,
    userId: req.user.userId,
  }).populate("documentId", "filename extractedText");

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  const messages = await ChatMessage.find({
    chatId: chat._id,
    userId: req.user.userId,
  }).sort({ createdAt: 1 });

  return res.status(200).json({
    success: true,
    message: "Chat fetched successfully",
    data: {
      chat,
      messages,
    },
  });
});

const deleteChatMessageController = TryCatchHandler(async (req, res) => {
  const { chatId, messageId } = req.params;
  if (!chatId || !isValidObjectId(chatId)) {
    throw new ApiError(400, "Invalid Chat ID");
  }
  if (!messageId || !isValidObjectId(messageId)) {
    throw new ApiError(400, "Invalid Message ID");
  }

  const message = await ChatMessage.findOneAndDelete({
    _id: messageId,
    chatId: chatId,
    userId: req.user.userId,
  });

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  return res.status(200).json({
    success: true,
    message: "Message deleted successfully",
  });
});

const renameChatController = TryCatchHandler(async (req, res) => {
  const { chatId } = req.params;
  const { name } = req.body;

  if (!chatId || !isValidObjectId(chatId)) {
    throw new ApiError(400, "Invalid Chat ID");
  }

  if (!name) {
    throw new ApiError(400, "Please enter a name");
  }

  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, userId: req.user.userId },
    { name },
    { new: true },
  );

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  return res.status(200).json({
    success: true,
    message: "Chat renamed successfully",
    data: chat,
  });
});

export const chatController = {
  createChatController,
  deleteChatController,
  getChatByIdController,
  renameChatController,
  getChatsController,
  sendChatMessageController,
  deleteChatMessageController,
};
