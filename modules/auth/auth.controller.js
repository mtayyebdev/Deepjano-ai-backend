import { User } from "../../models/User.model.js";
import { ApiError } from "../../errors/ApiError.js";
import { TryCatchHandler } from "../../utils/TryCatch.util.js";
import { generateJwtToken } from "../../utils/jwt.util.js";
import { ENV } from "../../config/env.config.js";
import { sendEmail } from "../../utils/email.util.js";
import jwt from "jsonwebtoken";

const registerController = TryCatchHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const userExist = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (userExist) {
    throw new ApiError(400, "Username or Email already exist.");
  }

  await User.create({
    username,
    email,
    password,
  });

  return res.status(201).json({
    success: true,
    message: "Account Created",
  });
});

const loginController = TryCatchHandler(async (req, res) => {
  const { email, password } = req.body;

  const emailExist = await User.findOne({ email, status: "active" });
  if (!emailExist) {
    throw new ApiError(400, "Invalid email or password");
  }

  const passwordExist = await emailExist.comparePassword(password);
  if (!passwordExist) {
    throw new ApiError(400, "Invalid email or password");
  }

  const token = await generateJwtToken(emailExist);
  res.cookie(ENV.TOKEN_NAME, token, {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
    maxAge: ENV.JWT_EXPIRESIN,
  });

  return res.status(200).json({
    success: true,
    message: "Login Successfully",
  });
});

const logoutController = TryCatchHandler(async (req, res) => {
  res.clearCookie(ENV.TOKEN_NAME, {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({
    success: true,
    message: "Logout Successfully",
  });
});

const getUserController = TryCatchHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) {
    throw new ApiError(404, "Account not found");
  }

  return res.status(200).json({
    success: true,
    data: user,
  });
});

const updateUserController = TryCatchHandler(async (req, res) => {
  const { email, username, gender } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new ApiError(404, "Account not found");
  }

  if (email) user.email = email;
  if (username) user.username = username;
  if (gender) user.gender = gender;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile Updated.",
  });
});

const changePasswordController = TryCatchHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new ApiError(404, "Account not found");
  }

  const passwordExist = await user.comparePassword(oldPassword);
  if (!passwordExist) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password Changed.",
  });
});

const deleteUserController = TryCatchHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new ApiError(404, "Account not found");
  }

  user.status = "deleted";
  await user.save();

  res.clearCookie(ENV.TOKEN_NAME, {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({
    success: true,
    message: "Account Deleted.",
  });
});

const sendEmailController = TryCatchHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new ApiError(404, "Account not found");
  }

  const token = await generateJwtToken(user, "1h");
  const verificationLink = `${req.protocol}://${req.get(
    "host",
  )}/api/v1/auth/verify-email?token=${token}`;

  await sendEmail(
    user.email,
    "Email Verification",
    `Please click the following link to verify your email: ${verificationLink}`,
  );

  return res.status(200).json({
    success: true,
    message: "Verification email sended, please check you email account.",
  });
});

const verifyEmailController = TryCatchHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) {
    throw new ApiError(400, "Token is required");
  }

  const decoded = await jwt.verify(token, ENV.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new ApiError(404, "Account not found");
  }

  user.isVerified = true;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Email Verified Successfully",
  });
});

export const AuthController = {
  registerController,
  loginController,
  logoutController,
  getUserController,
  updateUserController,
  changePasswordController,
  deleteUserController,
  sendEmailController,
  verifyEmailController,
};
