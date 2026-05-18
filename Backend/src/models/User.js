import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["client", "lawyer", "admin"],
      required: [true, "Role is required"],
      default: "client",
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    bio: {
      type: String,
      required: function () {
        return this.role === "lawyer" || this.role === "admin";
      },
      maxlength: 500,
      trim: true,
    },
    avatar: {
      type: String,
      default: "default-avatar-url.jpg",
    },
    location: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },

    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
