import mongoose from "mongoose";
import Case from "../models/Case.js";

// CREATE
export const createCaseService = async (caseData) => {
  return await Case.create(caseData);
};

// READ (Single)
export const getCaseByIdService = async (caseId) => {
  return await Case.findById(caseId).populate(
    "clientId lawyerId documents activityLog.updatedBy"
  );
};

// UPDATE
export const updateCaseService = async (caseId, data) => {
  return await Case.findByIdAndUpdate(caseId, data, { new: true });
};

// DELETE
export const deleteCaseByIdService = async (caseId) => {
  return await Case.findByIdAndDelete(caseId);
};

// ADD MILESTONE
export const addMilestoneService = async (caseId, milestone) => {
  const caseItem = await Case.findById(caseId);
  if (!caseItem) return null;
  caseItem.milestones.push(milestone);
  return await caseItem.save();
};

// ADD DEADLINE
export const addDeadlineService = async (caseId, deadline) => {
  const caseItem = await Case.findById(caseId);
  if (!caseItem) return null;
  if (Array.isArray(deadline)) {
    caseItem.deadlines.push(...deadline);
  } else {
    caseItem.deadlines.push(deadline);
  }
  return await caseItem.save();
};

export const getMyCasesService = async (user) => {
  // if (!user) {
  //   return await Case.find({}).populate("clientId lawyerId documents");
  // }

  let filter = {};
  if (user.role === "client") {
    filter.clientId = new mongoose.Types.ObjectId(user.id);
  } else if (user.role === "lawyer") {
    filter.lawyerId = new mongoose.Types.ObjectId(user.id);
  } else if (user.role === "admin") {
    return await Case.find({}).populate("clientId lawyerId documents");
  }

  const cases = await Case.find(filter).populate("clientId lawyerId documents");

  return cases;
};

// ASSIGN LAWYER
export const assignLawyerService = async (caseId, lawyerId) => {
  return await Case.findByIdAndUpdate(
    caseId,
    { lawyerId },
    { new: true }
  ).populate("clientId lawyerId documents");
};

// LOG ACTIVITY
export const logActivityService = async (caseId, userId, action) => {
  return await Case.findByIdAndUpdate(
    caseId,
    {
      $push: { activityLog: { updatedBy: userId, action } },
    },
    { new: true }
  );
};
