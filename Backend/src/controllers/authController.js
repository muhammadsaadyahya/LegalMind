import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken, verifyEmailVerificationToken } from "../utils/token.js";

// import { generateEmailVerificationToken } from "../utils/token.js";
// import nodemailer from "nodemailer";

export const register = async (req, res) => {
  try {
    const { fullName, email, password, role, bio } = req.body;

    if (
      (role === "lawyer" || role === "admin") &&
      (!bio || bio.trim() === "")
    ) {
      return res
        .status(400)
        .json({ msg: "Bio is required for the selected role." });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashed,
      role,
      bio,
      isVerified: false,
    });

    const userObj = user.toObject();
    delete userObj.password;
    // const verificationToken = generateEmailVerificationToken(user);

    // const transporter = nodemailer.createTransport({
    //   service: "Gmail",
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    //   tls: {
    //     rejectUnauthorized: false, // <--- add this line to ignore cert errors
    //   },
    // });

    // const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;

    // const mailOptions = {
    //   from: `"LegalMind" <${process.env.EMAIL_USER}>`,
    //   to: user.email,
    //   subject: "Verify Your Email",
    //   html: `<p>Welcome, please verify your email by clicking this link:</p>
    //          <a href="${verificationUrl}">${verificationUrl}</a>`,
    // };

    // await transporter.sendMail(mailOptions);

    res.json({
      msg: "Registered successfully.",
      userObj,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Wrong password" });
    // if (!user.isVerified) {
    //   return res.status(403).json({ msg: "Please verify your email first." });
    // }

    user.lastLogin = new Date();
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    res.json({
      msg: "Login successful",
      token: generateToken(user),
      userObj,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("Invalid token");

    const payload = verifyEmailVerificationToken(token);

    const user = await User.findById(payload.id);
    if (!user) return res.status(400).send("User not found");
    if (user.isVerified) return res.send("Email already verified");

    user.isVerified = true;
    await user.save();

    res.send("Email verified successfully");
  } catch (error) {
    res.status(400).send("Invalid or expired token");
  }
};
