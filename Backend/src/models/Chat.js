import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  sentAt: { type: Date, default: Date.now },
  isSeen: { type: Boolean, default: false },
});

const chatSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [messageSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
