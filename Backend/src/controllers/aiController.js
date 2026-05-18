import AssistantChat from "../models/assistantChat.js";
import {
  getChatResponse,
  summarizeDocument,
  getCaseOutcomePrediction,
} from "../service/ai/geminiClient.js";
import { queryDocuments } from "../service/ai/retrievalService.js";
import { generateAnswer } from "../service/ai/ragAnswerService.js";
import mongoose from "mongoose";
import Document from "../models/Document.js";
import { extractText, extractTextBuffer } from "../utils/extractText.js";
const ASSISTANT_SENDER_ID = new mongoose.Types.ObjectId(
  "64f3e6a1f1e7c42f5a123456"
);
export const getChatMsgs = async (req, res) => {
  try {
    const userId = req.user.id;

    const chat = await AssistantChat.findOne({ participants: userId });

    if (!chat) {
      return res.status(200).json({ messages: [] });
    }

    const formatted = chat.messages.map((msg) => ({
      role: msg.senderId.toString() === userId ? "user" : "assistant",
      content: msg.message,
      timestamp: msg.sentAt,
      isSeen: msg.isSeen,
    }));

    res.status(200).json({ messages: formatted });
  } catch (error) {
    console.error("Error loading chat messages:", error);
    res.status(500).json({ error: "Failed to load chat messages" });
  }
};

export const clearChatMsgs = async (req, res) => {
  try {
    const userId = req.user.id;

    await AssistantChat.findOneAndDelete({ participants: userId });

    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (error) {
    console.error("Error clearing chat messages:", error);
    res.status(500).json({ error: "Failed to clear chat messages" });
  }
};

export const chatWithAssistant = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    let chat = await AssistantChat.findOne({ participants: userId });

    if (!chat) {
      chat = new AssistantChat({
        participants: userId,
        messages: [],
      });
    }

    chat.messages.push({
      senderId: userId,
      message,
      sentAt: new Date(),
      isSeen: true,
    });

    const lastFiveMessages = chat.messages.slice(-5);
    console.log(lastFiveMessages);
    const formattedMessages = lastFiveMessages.map((msg) => ({
      role:
        msg.senderId && msg.senderId.toString() === userId.toString()
          ? "user"
          : "assistant",
      content: msg.message,
    }));

    const geminiResponse = await getChatResponse(formattedMessages);

    chat.messages.push({
      senderId: ASSISTANT_SENDER_ID,
      message: geminiResponse.reply,
      sentAt: new Date(),
      isSeen: false,
    });

    chat.messages = chat.messages.slice(-5);

    await chat.save();
    res.json({ reply: geminiResponse.reply });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
export const summarizeController = async (req, res) => {
  console.log("It started");
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "File is required" });
    }
    const document = await Document.findById(id);
    const filePath = document.filePath;

    const extractedText = await extractText(filePath);

    if (!extractedText || extractedText.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "No extractable text found in document" });
    }

    const summary = await summarizeDocument(extractedText);
    console.log(summary);

    res.json({ summary });
  } catch (error) {
    console.log("It wasted");

    console.error("Summarize from file error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const predictOutcomeController = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    console.log("Processing PDF file:", file.originalname, "Size:", file.size);

    const pdfBuffer = file.buffer;

    // Extract text from PDF
    const data = await extractTextBuffer(pdfBuffer);
    const extractedText = data.text;

    console.log("Extracted text length:", extractedText?.length);
    console.log("First 200 chars:", extractedText?.substring(0, 200));

    if (!extractedText || extractedText.trim() === "") {
      return res.status(400).json({
        error:
          "Could not extract text from PDF.  Please ensure the PDF contains readable text.",
      });
    }

    // Get prediction from AI
    console.log("Sending to AI for prediction...");
    const prediction = await getCaseOutcomePrediction(extractedText);

    console.log("Prediction received:", prediction);

    res.json({ prediction });
  } catch (error) {
    console.error("Case Outcome Prediction Error:", error);

    // More specific error messages
    if (error.message === "Failed to parse PDF") {
      return res.status(400).json({ error: "Invalid or corrupted PDF file" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};
export async function ragQueryHandler(req, res) {
  try {
    const docId = req.params.id;
    const { question } = req.body;

    if (!question || !docId)
      return res.status(400).json({ error: "Question and docId are required" });

    const contexts = await queryDocuments(question, docId);

    const answer = await generateAnswer(question, contexts);
    res.json({ answer, contexts: contexts });
  } catch (err) {
    console.error("RAG query error:", err);
    res.status(500).json({ error: "Failed to answer query" });
  }
}
