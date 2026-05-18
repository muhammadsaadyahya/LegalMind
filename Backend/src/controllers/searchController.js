import mongoose from "mongoose";
import Case from "../models/Case.js";
import User from "../models/User.js";
import Document from "../models/Document.js";
import Blog from "../models/Blog.js";

const getTextSearchCondition = (query) => {
  if (query && query.trim() !== "") {
    return { $text: { $search: query.trim() } };
  }
  return {};
};

const paginateAndSort = (page, limit, sortBy, sortOrder) => {
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };
  return { skip, limit, sort };
};

export const searchCases = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const {
      query,
      status,
      priority,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filters = {};

    // Role based filtering
    if (userRole === "client")
      filters.clientId = mongoose.Types.ObjectId(userId);
    else if (userRole === "lawyer")
      filters.lawyerId = mongoose.Types.ObjectId(userId);

    if (status) filters.status = status;
    if (priority) filters.priority = priority;

    const textSearch = getTextSearchCondition(query);
    const conditions = [];

    if (filters && Object.keys(filters).length > 0) conditions.push(filters);
    if (textSearch && Object.keys(textSearch).length > 0)
      conditions.push(textSearch);

    const matchStage = conditions.length > 0 ? { $and: conditions } : {};

    const {
      skip,
      limit: lim,
      sort,
    } = paginateAndSort(page, limit, sortBy, sortOrder);

    const cases = await Case.aggregate([
      { $match: matchStage },
      { $sort: sort },
      { $skip: skip },
      { $limit: parseInt(lim) },
      {
        $project: {
          score: { $meta: "textScore" },
          title: 1,
          description: 1,
          status: 1,
          priority: 1,
          clientId: 1,
          lawyerId: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    const totalCount = await Case.countDocuments(matchStage);

    res.json({
      data: cases,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(lim),
        pages: Math.ceil(totalCount / lim),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const userRole = req.user.role;
    const {
      query,
      role,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let filters = {};

    if (userRole === "admin") {
      // Admin can search all roles, but if query param role is given, filter by it
      if (role) filters.role = role;
    } else if (userRole === "lawyer") {
      // Lawyer can only search clients
      filters.role = "client";
    } else if (userRole === "client") {
      // Client can only search lawyers
      filters.role = "lawyer";
    } else {
      // Other roles or unauthorized users cannot search
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Build text search condition (match on fullName or email)
    const textSearch = getTextSearchCondition(query);
    const conditions = [];

    if (filters && Object.keys(filters).length > 0) conditions.push(filters);
    if (textSearch && Object.keys(textSearch).length > 0)
      conditions.push(textSearch);

    const matchStage = conditions.length > 0 ? { $and: conditions } : {};

    // Pagination and sorting helpers
    const {
      skip,
      limit: lim,
      sort,
    } = paginateAndSort(page, limit, sortBy, sortOrder);

    // Aggregate query
    const users = await User.aggregate([
      { $match: matchStage },
      { $sort: sort },
      { $skip: skip },
      { $limit: parseInt(lim) },
      {
        $project: {
          fullName: 1,
          email: 1,
          role: 1,
          bio: 1,
          avatar: 1,
          isVerified: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    // Get total count for pagination
    const totalCount = await User.countDocuments(matchStage);

    res.json({
      data: users,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(lim),
        pages: Math.ceil(totalCount / lim),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const {
      query,
      caseId,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filters
    const filters = {};

    // Clients can only see documents from their cases
    // Lawyers can see docs from cases assigned to them
    // Admin can see all documents
    if (userRole === "client") {
      filters["caseId"] = mongoose.Types.ObjectId(caseId); // caseId must be provided by client
      // Additional check on backend could be added here to ensure case belongs to user
    } else if (userRole === "lawyer") {
      filters["caseId"] = mongoose.Types.ObjectId(caseId); // same as above, with possible extra check
    } else if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const textSearch = getTextSearchCondition(query);
    const conditions = [];

    if (filters && Object.keys(filters).length > 0) conditions.push(filters);
    if (textSearch && Object.keys(textSearch).length > 0)
      conditions.push(textSearch);

    const matchStage = conditions.length > 0 ? { $and: conditions } : {};

    const {
      skip,
      limit: lim,
      sort,
    } = paginateAndSort(page, limit, sortBy, sortOrder);

    const documents = await Document.aggregate([
      { $match: matchStage },
      { $sort: sort },
      { $skip: skip },
      { $limit: parseInt(lim) },
      {
        $project: {
          fileName: 1,
          fileUrl: 1,
          fileType: 1,
          fileSize: 1,
          caseId: 1,
          uploadedBy: 1,
          createdAt: 1,
        },
      },
    ]);

    const totalCount = await Document.countDocuments(matchStage);

    res.json({
      data: documents,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(lim),
        pages: Math.ceil(totalCount / lim),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchBlogs = async (req, res) => {
  try {
    const {
      query,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const textSearch = getTextSearchCondition(query);

    const matchStage = textSearch;

    const {
      skip,
      limit: lim,
      sort,
    } = paginateAndSort(page, limit, sortBy, sortOrder);

    const blogs = await Blog.aggregate([
      { $match: matchStage },
      { $sort: sort },
      { $skip: skip },
      { $limit: parseInt(lim) },
      {
        $project: {
          title: 1,
          content: 1,
          thumbnail: 1,
          authorId: 1,
          tags: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    const totalCount = await Blog.countDocuments(matchStage);

    res.json({
      data: blogs,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(lim),
        pages: Math.ceil(totalCount / lim),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
