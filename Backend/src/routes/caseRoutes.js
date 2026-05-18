import express from "express";
import * as caseController from "../controllers/caseController.js";
import { auth } from "../middlewares/authMiddleware.js";
const router = express.Router();

// Correct the handler for "GET /" to getAllCases
router.get("/", auth, caseController.getAllCases);

// All other routes
router.get("/:id", auth, caseController.getCaseById);

router.put("/:id", auth, caseController.updateCase);
router.put("/:id/assign-lawyer", auth, caseController.assignLawyer);

router.post("/", auth, caseController.createCase);
router.post("/:id/milestones", auth, caseController.addMilestone);
router.post("/:id/deadlines", auth, caseController.addDeadline);
router.post("/:id/activity", auth, caseController.logActivity);

router.delete("/:id", auth, caseController.deleteCase);

export default router;
