import express from "express";
import {
  //   createChatController,
  //   sendMessageController,
  getChatByCase,
  //   getChatMessagesController,
  //   markSeenController,
} from "../controllers/chatController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// router.post("/create", auth, createChatController);
// router.post("/:chatId/message", auth, sendMessageController);
// router.get("/", auth, getUserChatsController);
router.get("/messages/:id", auth, getChatByCase);
// router.post("/:chatId/seen", auth, markSeenController);

export default router;
