import { Router } from "express";
import {
  LoginSchema,
  RegisterSchema,
  ChangePasswordSchema,
  UpdateUserSchema,
} from "./authSchema.zod.js";
import { AuthController } from "./auth.controller.js";
import { authUser } from "../../middleware/auth.middleware.js";
import { ValidateWithZod } from "../../middleware/zod.middleware.js";

const AuthRouter = Router();

AuthRouter.route("/register").post(
  ValidateWithZod(RegisterSchema),
  AuthController.registerController,
);
AuthRouter.route("/login").post(
  ValidateWithZod(LoginSchema),
  AuthController.loginController,
);
AuthRouter.route("/logout").post(authUser, AuthController.logoutController);
AuthRouter.route("/me").get(authUser, AuthController.getUserController);
AuthRouter.route("/update").patch(
  authUser,
  ValidateWithZod(UpdateUserSchema),
  AuthController.updateUserController,
);
AuthRouter.route("/change-password").patch(
  authUser,
  ValidateWithZod(ChangePasswordSchema),
  AuthController.changePasswordController,
);
AuthRouter.route("/delete").delete(
  authUser,
  AuthController.deleteUserController,
);
AuthRouter.route("/send-verification-email").post(
  authUser,
  AuthController.sendEmailController,
);
AuthRouter.route("/verify-email").get(AuthController.verifyEmailController);

export default AuthRouter;
