import mongoose from "mongoose";
import CashFlow from "../models/cashFlow.js";

export const addCashFlowEntry = async (req, res) => {
  try {
    const { amount, type, description } = req.body;
    const userId = req.user.id;
    if (!["debit", "credit"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }
    const entry = await CashFlow.create({ userId, amount, type, description });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.id;
    console.log(userId);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    console.log(
      await CashFlow.find({ userId: new mongoose.Types.ObjectId(userId) })
    );
    const report = await CashFlow.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
