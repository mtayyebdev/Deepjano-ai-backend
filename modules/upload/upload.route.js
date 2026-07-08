import { Router } from "express";
import { uploadController } from "./upload.controller.js";
import { Upload } from "../../middleware/multer.middleware.js";
import { authUser } from "../../middleware/auth.middleware.js";

const UploadDocumentRouter = Router();

UploadDocumentRouter.route("/upload-file/:chatId").post(
  authUser,
  Upload.single("file"),
  uploadController.uploadDocumentController,
);

export default UploadDocumentRouter;
