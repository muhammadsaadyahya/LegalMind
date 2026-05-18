import Notification from "../models/Notification.js";

export const createNotification = async ({
  userId,
  title,
  description,
  type,
}) => {
  const notification = new Notification({
    userId,
    title,
    description,
    type,
  });
  await notification.save();
  return notification;
};

export const getNotificationsByUser = async (userId) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

export const markNotificationRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};
export const deleteAllNotificationsService = (userId) => {
  return Notification.deleteMany({ userId });
};
