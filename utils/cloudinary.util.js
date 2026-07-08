import { v2 as cloudinary } from "cloudinary";
import { ENV } from "../config/env.config.js";
import { ApiError } from "../errors/ApiError.js";

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_SECRET_KEY,
});

const uploadFileToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `DeepJanoAI/${String(folder).toLowerCase()}`,
      resource_type: "auto",
      format: "auto",
    });
    return result;
  } catch (error) {
    throw new ApiError(500, "Failed to upload file to Cloudinary");
  }
};

const deleteFileFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new ApiError(500, "Failed to delete file from Cloudinary");
  }
};

export const cloudinaryUtil = {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
};
