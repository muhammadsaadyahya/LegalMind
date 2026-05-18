import express from "express";
import { upload } from "../utils/upload.js";
import { auth } from "../middlewares/authMiddleware.js";
import { uploadAvatar } from "../controllers/userController.js";

const router = express.Router();

router.put("/upload/:id", auth, upload.single("avatar"), uploadAvatar);

export default router;
