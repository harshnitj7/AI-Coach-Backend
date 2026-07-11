import nodemailer from "nodemailer";
import logger from "../utils/logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTP = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"AI Interview Coach" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify Your Account - Your OTP Code",
    html: `<h2>Welcome!</h2><p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    logger.error("Failed to send OTP email:", error);
    throw new Error("Could not send verification email.");
  }
};