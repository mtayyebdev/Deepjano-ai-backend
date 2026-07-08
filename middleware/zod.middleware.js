import { ZodError } from "zod";
import { ApiError } from "../errors/ApiError.js";

export const ValidateWithZod = (schema) => async (req, res, next) => {
  try {
    const body = await schema.parseAsync(req.body);
    req.body = body;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0].message;
      throw new ApiError(404, message);
    }
    next(error);
  }
};
