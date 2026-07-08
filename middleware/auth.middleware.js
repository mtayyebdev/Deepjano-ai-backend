import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { ApiError } from "../errors/ApiError.js";
import { ENV } from "../config/env.config.js";

export const authUser = async (req, res, next) => {
  try {
    const tokenName = ENV.TOKEN_NAME;
    const token = req.cookies[tokenName] || "";
    if (!token) {
      throw new ApiError(401, "Unauthorized access");
    }

    const payload = jwt.verify(token, ENV.JWT_SECRET);

    const user = await User.findById(payload.userId);
    if (!user) {
      throw new ApiError(401, "Unauthorized access");
    }

    req.user = {
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(new ApiError(401, "Invalid or expired token"));
    }
    next(error);
  }
};

export const isAdmin = (req, res, next) => {
  try {
    if (req.user?.userRole !== "admin") {
      throw new ApiError(403, "You cannot access this route");
    }

    next();
  } catch (error) {
    next(error);
  }
};
