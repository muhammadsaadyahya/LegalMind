import express from "express";
import {
  getChatMsgs,
  clearChatMsgs,
  ragQueryHandler,
  chatWithAssistant,
  summarizeController,
  predictOutcomeController,
} from "../controllers/aiController.js";
import { auth } from "../middlewares/authMiddleware.js";
import { upload } from "../utils/getFileInBuffer.js";

const router = express.Router();

router.get("/getChat", auth, getChatMsgs);
router.delete("/deleteChat", auth, clearChatMsgs);

router.post("/rag/:id", auth, ragQueryHandler);
router.post("/ask", auth, chatWithAssistant);
router.post("/summarize/:id", auth, summarizeController);
router.post("/predict", auth, upload.single("file"), predictOutcomeController);

export default router;
