import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
export const generateEmailVerificationToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.EMAIL_VERIFICATION_SECRET, {
    expiresIn: "1h",
  });
};

export const verifyEmailVerificationToken = (token) => {
  return jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
};
