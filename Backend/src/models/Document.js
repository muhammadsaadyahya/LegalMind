import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fileName: String,
    filePath: String,
    fileType: String,
    fileSize: Number,
    textExtracted: String,
    history: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
