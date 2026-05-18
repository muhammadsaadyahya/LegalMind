import {
  createNotification,
  getNotificationsByUser,
  markNotificationRead,
  deleteAllNotificationsService,
} from "../service/notificationService.js";
import User from "../models/User.js";
export const createNotificationController = async (req, res) => {
  try {
    const { userId, title, description, type } = req.body;

    const notification = await createNotification({
      userId,
      title,
      description,
      type,
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserNotificationsController = async (req, res) => {
  try {
    const notifications = await getNotificationsByUser(req.user.id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationReadController = async (req, res) => {
  try {
    const updated = await markNotificationRead(req.user.id);
    if (!updated)
      return res.status(404).json({ message: "Notification not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const createSystemNotificationController = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const users = await User.find({});
    await Promise.all(
      users.map((user) =>
        createNotification({
          userId: user._id,
          title: req.body.title,
          description: req.body.description,
          type: "system",
        })
      )
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteAllNotifications = async (req, res) => {
  await deleteAllNotificationsService(req.user.id);
  res.json({ message: "All notifications removed" });
};
