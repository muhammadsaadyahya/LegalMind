import express from "express";
import {
  addCashFlowEntry,
  getMonthlyReport,
} from "../controllers/CashFlowController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", auth, addCashFlowEntry);
router.get("/report", auth, getMonthlyReport);

export default router;
