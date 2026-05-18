import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roles.js";
import { upload } from "../utils/uploads.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllLawyers,
  uploadAvatar,
  getAvatar,
} from "../controllers/userController.js";

const router = express.Router();
router.get("/lawyer", auth, getAllLawyers);
router.get("/", auth, allowRoles("admin"), getAllUsers);
router.get("/:id/avatar", auth, getAvatar);
router.get("/:id", auth, getUserById);

router.put("/:id", auth, updateUser);

router.delete("/:id", auth, deleteUser);
router.put("/upload/:id", auth, upload.single("avatar"), uploadAvatar);

export default router;
