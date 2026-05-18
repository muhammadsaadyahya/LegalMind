import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { uploadDocument } from "../utils/uploadDocuments.js";
import {
  uploadDocumentController,
  getDocumentController,
  downloadDocumentController,
  deleteDocumentController,
} from "../controllers/documentController.js";

const router = express.Router();

router.post(
  "/upload/:id",
  auth,
  uploadDocument.single("file"),
  uploadDocumentController
);

router.get("/", auth, getDocumentController);

router.get("/download/:id", downloadDocumentController);

router.delete("/:id", auth, deleteDocumentController);

export default router;
