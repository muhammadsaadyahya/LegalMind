import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
});

const activityLogSchema = new mongoose.Schema(
  {
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const caseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      default: "In Progress",
    },
    caseType: String,
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    tags: [String],
    milestones: [milestoneSchema],
    deadlines: [Date],
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
    activityLog: [activityLogSchema],
  },
  { timestamps: true }
);

const Case = mongoose.model("Case", caseSchema);

export default Case;
