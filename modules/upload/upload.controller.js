import { Document } from "../../models/Document.model.js";
import { ApiError } from "../../errors/ApiError.js";
import { TryCatchHandler } from "../../utils/TryCatch.util.js";
import { parseFile } from "../../utils/parseFile.js";
import { Chat } from "../../models/Chat.model.js";
import { isValidObjectId } from "mongoose";
import crypto from "crypto";

const generateFileId = (file) => {
  const extension = file.originalname.split(".").pop();
  const name = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension

  const safeName = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}.${extension}`;
};

const uploadDocumentController = TryCatchHandler(async (req, res) => {
  const file = req.file;
  const userId = req.user.userId;
  const { chatId } = req.params;

  if (!chatId || !isValidObjectId(chatId)) {
    throw new ApiError(400, "Invalid Chat ID");
  }

  if (!file || !file.path) {
    throw new ApiError(404, "File is required");
  }

  const chat = await Chat.findOne({ _id: chatId, userId });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  if (chat.documentId) {
    throw new ApiError(400, "Document already uploaded for this chat");
  }

  const { filename, result } = await parseFile(file);

  const fileName = generateFileId(file);

  const document = await Document.create({
    filename: fileName,
    extractedText: result,
    userId,
  });

  chat.documentId = document._id;
  await chat.save();

  return res.status(201).json({
    success: true,
    message: "File uploaded successfully",
  });
});

export const uploadController = {
  uploadDocumentController,
};
