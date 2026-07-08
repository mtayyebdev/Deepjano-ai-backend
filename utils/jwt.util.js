import jwt from "jsonwebtoken";
import { ENV } from "../config/env.config.js";

export const generateJwtToken = async (user, expiresIn) => {
  const token = await jwt.sign(
    {
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
    },
    ENV.JWT_SECRET,
    {
      expiresIn: expiresIn ? expiresIn : ENV.JWT_EXPIRESIN,
    },
  );
  return token;
};
