import mongoose from "mongoose";

const cashFlowSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["debit", "credit"], required: true },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const CashFlow = mongoose.model("CashFlow", cashFlowSchema);
export default CashFlow;
