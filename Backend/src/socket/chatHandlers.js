import {
  getChat,
  createChat,
  sendMessage,
  markSeen,
} from "../service/chatService.js";
import mongoose from "mongoose";

export default function chatHandlers(io, socket) {
  socket.on("joinChat", async ({ caseId, userId }) => {
    if (!caseId || !userId) {
      console.log("User or CaseId not found");
    }

    socket.join(caseId);
    console.log(`User ${userId} joined chat room: ${caseId}`);

    try {
      const chat = await getChat(caseId);
      socket.emit("chatHistory", chat ? chat.messages : []);
    } catch (error) {
      socket.emit("errorMessage", error.message);
    }
  });

  socket.on("createChat", async ({ caseId }) => {
    if (!caseId) {
      console.log("createChat event received with empty caseId");
      return;
    }
    caseId = new mongoose.Types.ObjectId(caseId);

    try {
      console.log(`Creating chat for caseId: ${caseId}`);
      const chat = await createChat(caseId);
      console.log("Chat created:", chat);
      socket.emit("chatCreated", chat);
    } catch (error) {
      console.error("Error in createChat handler:", error);
      socket.emit("errorMessage", error.message);
    }
  });

  socket.on("sendMessage", async ({ caseId, userId, message }) => {
    console.log(
      `[sendMessage] Received - caseId: ${caseId}, userId: ${userId}, message: "${message}"`
    );

    if (!caseId || !userId || !message) {
      console.warn("[sendMessage] Missing caseId, userId, or message");
      return;
    }

    try {
      // FIX: Map 'message' to 'messageText'
      const newMessage = await sendMessage({
        caseId,
        userId,
        messageText: message,
      });

      console.log("[sendMessage] Message sent successfully:", newMessage);
      io.to(caseId).emit("newMessage", newMessage);
    } catch (error) {
      console.error("[sendMessage] Error sending message:", error);
      socket.emit("errorMessage", error.message);
    }
  });

  socket.on("markSeen", async ({ caseId }) => {
    if (!caseId) return;

    try {
      await markSeen(caseId);

      io.to(caseId).emit("messagesSeen");
    } catch (error) {
      socket.emit("errorMessage", error.message);
    }
  });

  socket.on("typing", ({ caseId, userId }) => {
    if (!caseId || !userId) return;

    socket.to(caseId).emit("typing", { userId });
  });

  socket.on("stopTyping", ({ caseId, userId }) => {
    if (!caseId || !userId) return;

    socket.to(caseId).emit("stopTyping", { userId });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
}
