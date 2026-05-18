import {
  createCaseService,
  getCaseByIdService,
  updateCaseService,
  addMilestoneService,
  addDeadlineService,
  logActivityService,
  deleteCaseByIdService,
  getMyCasesService,
  assignLawyerService,
} from "../service/caseService.js";
import { createChat } from "../service/chatService.js";

// CREATE
export const createCase = async (req, res) => {
  try {
    const caseData = req.body;
    caseData.clientId = req.user?.id;

    const newCase = await createCaseService(caseData);
    const newChat = await createChat(newCase._id);

    res.status(201).json(newCase);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "Failed to create case", error: error.message });
  }
};

// GET ALL CASES
export const getAllCases = async (req, res) => {
  try {
    const cases = await getMyCasesService(req.user);
    res.status(200).json(cases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET CASE BY ID
export const getCaseById = async (req, res) => {
  try {
    const caseItem = await getCaseByIdService(req.params.id);
    if (!caseItem) return res.status(404).json({ msg: "Case not found" });
    res.json(caseItem);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// UPDATE CASE
export const updateCase = async (req, res) => {
  try {
    const caseItem = await getCaseByIdService(req.params.id);
    if (!caseItem) return res.status(404).json({ msg: "Case not found" });
    const updatedCase = await updateCaseService(req.params.id, req.body);
    res.json(updatedCase);
  } catch (error) {
    res.status(500).json({ msg: "Update failed", error: error.message });
  }
};

// ASSIGN LAWYER
export const assignLawyer = async (req, res) => {
  try {
    const caseId = req.params.id;
    const { lawyerId } = req.body;
    const updatedCase = await assignLawyerService(caseId, lawyerId);
    if (!updatedCase) {
      return res.status(404).json({ msg: "Case not found" });
    }
    res.status(200).json(updatedCase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD MILESTONE
export const addMilestone = async (req, res) => {
  try {
    const caseItem = await getCaseByIdService(req.params.id);
    if (!caseItem) return res.status(404).json({ msg: "Case not found" });
    const milestone = req.body;
    const updatedCase = await addMilestoneService(req.params.id, milestone);
    res.json(updatedCase);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Failed to add milestone", error: error.message });
  }
};

// ADD DEADLINE
export const addDeadline = async (req, res) => {
  try {
    const caseItem = await getCaseByIdService(req.params.id);
    if (!caseItem) return res.status(404).json({ msg: "Case not found" });
    const deadline = req.body;
    const updatedCase = await addDeadlineService(req.params.id, deadline);
    res.status(200).json(updatedCase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOG ACTIVITY
export const logActivity = async (req, res) => {
  try {
    const { userId, action } = req.body;
    const { id: caseId } = req.params;
    const updatedCase = await logActivityService(caseId, userId, action);
    if (!updatedCase) {
      return res.status(404).json({ msg: "Case not found" });
    }
    return res.json({
      msg: "Activity logged successfully",
      data: updatedCase,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Failed to log activity",
      error: error.message,
    });
  }
};

// DELETE CASE
export const deleteCase = async (req, res) => {
  try {
    await deleteCaseByIdService(req.params.id);
    res.status(200).json({ message: "Case deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
