import Chat from "../models/Chat.js";
import Case from "../models/Case.js";
import mongoose from "mongoose";
export async function getChat(caseId) {
  return Chat.findOne({ caseId }).populate(
    "participants",
    "fullName role avatar"
  );
}

export async function createChat(caseId) {
  console.log(caseId, typeof caseId);
  const existingChat = await Chat.findOne({ caseId });
  if (existingChat) {
    throw new Error("Chat already exists");
  }
  const caseData = await Case.findById(caseId);

  if (!caseData) {
    throw new Error("Case not found");
  }

  const chat = await Chat.create({
    caseId,
    participants: [caseData.clientId, caseData.lawyerId],
    messages: [],
  });

  return chat;
}

export async function sendMessage({ caseId, userId, messageText }) {
  if (!mongoose.Types.ObjectId.isValid(caseId)) {
    throw new Error("Invalid Case ID format");
  }

  const chat = await Chat.findOne({
    caseId: new mongoose.Types.ObjectId(caseId),
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  if (!chat.participants.some((p) => p.toString() === userId.toString())) {
    throw new Error("Unauthorized");
  }

  const newMessage = {
    senderId: userId,
    message: messageText,
  };

  chat.messages.push(newMessage);
  await chat.save();

  return newMessage;
}

export async function markSeen(caseId) {
  await Chat.updateOne({ caseId }, { $set: { "messages.$[].isSeen": true } });

  return { message: "Seen updated" };
}
