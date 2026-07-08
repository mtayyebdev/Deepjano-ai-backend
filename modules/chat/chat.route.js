import { Router } from "express";
import { chatController } from "./chat.controller.js";
import { authUser } from "../../middleware/auth.middleware.js";

const ChatRouter = Router();

ChatRouter.route("/create").post(authUser, chatController.createChatController);
ChatRouter.route("/send-message/:chatId").patch(
  authUser,
  chatController.sendChatMessageController,
);
ChatRouter.route("/delete/:chatId").delete(
  authUser,
  chatController.deleteChatController,
);
ChatRouter.route("/get-chats").get(authUser, chatController.getChatsController);
ChatRouter.route("/get-chat/:chatId").get(
  authUser,
  chatController.getChatByIdController,
);
ChatRouter.route("/rename/:chatId").patch(
  authUser,
  chatController.renameChatController,
);
ChatRouter.route("/delete-message/:chatId/:messageId").delete(
  authUser,
  chatController.deleteChatMessageController,
);

export default ChatRouter;
