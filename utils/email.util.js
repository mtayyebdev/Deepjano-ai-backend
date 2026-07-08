import { createTransport } from "nodemailer";
import { ENV } from "../config/env.config.js";
import { ApiError } from "../errors/ApiError.js";

const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: ENV.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    ENV.NODE_ENV === "development" &&
      console.log("Email sending error:", error);
    throw new ApiError(500, "Failed to send email");
  }
};
