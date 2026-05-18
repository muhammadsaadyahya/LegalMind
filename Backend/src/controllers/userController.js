import {
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
  getUserByRoleService,
} from "../service/userService.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await getUserByIdService(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateUser = async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const isOwner = req.user.id === req.params.id;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ msg: "Access denied" });
  }
  try {
    const user = await updateUserService(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const isOwner = req.user.id === req.params.id;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ msg: "Access denied" });
  }

  try {
    const deletedUser = await deleteUserService(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ msg: "User not found" });
    }
    const userObj = deletedUser.toObject();
    delete userObj.password;
    res.status(200).json({ msg: "User deleted successfully", user: userObj });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
export const getAllLawyers = async (req, res) => {
  const lawyers = await getUserByRoleService("lawyer");
  res.json(lawyers);
};
export const uploadAvatar = async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const isOwner = req.user.id === req.params.id;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ msg: "Access denied" });
  }
  try {
    const user = await updateUserService(
      req.params.id,
      { avatar: req.file.filename },
      { new: true }
    );

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getAvatar = async (req, res) => {
  try {
    const user = await getUserByIdService(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.avatar || user.avatar === "default-avatar-url.jpg") {
      return res.status(404).json({ msg: "Avatar not found" });
    }

    const avatarPath = path.join(
      __dirname,
      "../uploads/profile-pics",
      user.avatar
    );

    // Check if file exists
    if (!fs.existsSync(avatarPath)) {
      return res.status(404).json({ msg: "Avatar file not found" });
    }

    res.sendFile(avatarPath);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
