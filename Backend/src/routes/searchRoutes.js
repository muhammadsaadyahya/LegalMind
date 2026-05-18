import express from "express";
import {
  searchCases,
  searchUsers,
  searchDocuments,
  searchBlogs,
} from "../controllers/searchController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/cases/search", auth, searchCases);
router.get("/users/search", auth, searchUsers);
router.get("/documents/search", auth, searchDocuments);
router.get("/blogs/search", auth, searchBlogs);

export default router;
