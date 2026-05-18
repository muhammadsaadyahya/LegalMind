import express from "express";
import {
  createNotificationController,
  getUserNotificationsController,
  markNotificationReadController,
  createSystemNotificationController,
  deleteAllNotifications,
} from "../controllers/notificationController.js";
import { auth, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", auth, createNotificationController);

router.get("/", auth, getUserNotificationsController);

router.patch("/:id/read", auth, markNotificationReadController);
router.post(
  "/system",
  auth,
  authorizeRoles("admin"),
  createSystemNotificationController
);
router.delete("/all", auth, deleteAllNotifications);

export default router;
