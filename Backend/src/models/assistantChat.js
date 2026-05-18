import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  isSeen: { type: Boolean, default: false },
});

const assistantChatSchema = new mongoose.Schema({
  participants: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messages: [messageSchema],
});

const AssistantChat = mongoose.model("AssistantChat", assistantChatSchema);

export default AssistantChat;
