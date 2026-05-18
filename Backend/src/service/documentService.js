import Document from "../models/Document.js";
import mongoose from "mongoose";

export const createDocument = async (data) => {
  return await Document.create(data);
};

export const getDocumentsByLawyerService = async (lawyerId) => {
  const lawyerObjectId = new mongoose.Types.ObjectId(lawyerId);

  const documents = await Document.aggregate([
    {
      $lookup: {
        from: "cases",
        localField: "caseId",
        foreignField: "_id",
        as: "caseData",
      },
    },
    { $unwind: "$caseData" },

    { $match: { "caseData.lawyerId": lawyerObjectId } },

    {
      $lookup: {
        from: "users",
        localField: "uploadedBy",
        foreignField: "_id",
        as: "uploader",
      },
    },
    { $unwind: "$uploader" },

    {
      $project: {
        _id: 1,
        fileName: 1,
        fileSize: 1,
        caseId: 1,
        uploadedBy: "$uploader.fullName",
        createdAt: 1,
      },
    },
  ]);

  return documents;
};

export const getDocumentById = async (id) => {
  return await Document.findById(id);
};

export const getDocumentsByUser = async (userId) => {
  return await Document.find({ uploadedBy: userId });
};

export const deleteDocumentById = async (id) => {
  return await Document.findByIdAndDelete(id);
};

export const addHistory = async (id, entry) => {
  return await Document.findByIdAndUpdate(
    id,
    { $push: { history: entry } },
    { new: true }
  );
};
