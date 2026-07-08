import express, { json, urlencoded } from "express";
import "dotenv/config.js";
import cors from "cors";
import { ENV } from "./config/env.config.js";
import { ConnectDB } from "./config/db.config.js";
import { errorHandler } from "./middleware/errorhandler.middleware.js";
import cookieParser from "cookie-parser";

// routes paths
import AuthRouter from "./modules/auth/auth.route.js";
import UploadDocumentRouter from "./modules/upload/upload.route.js";
import ChatRouter from "./modules/chat/chat.route.js";

const app = express();

const options = {
  origin: ENV.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PATCH"],
};

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(options));

// Routes
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/upload", UploadDocumentRouter);
app.use("/api/v1/chat", ChatRouter);

// Global Error Handler
app.use(errorHandler);

app.listen(ENV.PORT, async () => {
  console.log(`Server is running on PORT: ${ENV.PORT}`);
  await ConnectDB();
});
