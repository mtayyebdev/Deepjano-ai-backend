import mongoose from "mongoose";
import { ENV } from "./env.config.js";

export const ConnectDB = async () => {
  try {
    const connection = await mongoose.connect(ENV.DB_URL);
    if (connection) {
      console.log("Database Connected Successfully");
    }
  } catch (error) {
    console.log("Database Connection Error: ", error);
    process.exit(1);
  }
};
