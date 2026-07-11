import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { User, RefreshToken } from "../models";
import { sendOTP } from "../services/emailService";
import { generateAccessToken, generateRefreshToken, DecodedToken } from "../utils/generateToken";
import ApiResponse from "../utils/apiResponse";

const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Helper: issue access + refresh token pair, persist refresh token, set cookie
const issueTokens = async (res: Response, user: User): Promise<string> => {
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  const decoded = jwt.decode(refreshToken) as DecodedToken;
  await RefreshToken.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(decoded.exp * 1000),
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  return accessToken;
};

// @route  POST /api/auth/register
// @access Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    ApiResponse.error(res, 409, "An account with this email already exists");
    return;
  }

  // 1. Generate a 6-digit OTP and set expiration to 10 minutes from now
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // 2. Create the user as unverified
  const user = await User.create({ 
    name, 
    email, 
    password,
    otp,
    otpExpiresAt,
    isVerified: false
  });

  // 3. Dispatch the email
  await sendOTP(email, otp);

  // 4. Return success WITHOUT issuing JWTs yet
  ApiResponse.success(res, 201, "Registered successfully. Please check your email for the verification code.", {
    userId: user.id, // Frontend needs this to send to the verify endpoint
  });
});

// @route  POST /api/auth/verify-otp
// @access Public
export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { userId, otp } = req.body as { userId: string; otp: string };

  const user = await User.findByPk(userId);
  if (!user) {
    ApiResponse.error(res, 404, "User not found");
    return;
  }

  // 1. Validate the OTP and check expiration
  if (user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    ApiResponse.error(res, 400, "Invalid or expired verification code");
    return;
  }

  // 2. Mark user as verified and clear the OTP fields
  user.isVerified = true;
  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();

  // 3. Issue the secure tokens now that they have proven ownership
  const accessToken = await issueTokens(res, user);

  ApiResponse.success(res, 200, "Account verified successfully", {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });
});

// @route  POST /api/auth/login
// @access Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.scope("withPassword").findOne({ where: { email } });
  
  if (!user || !(await user.matchPassword(password))) {
    ApiResponse.error(res, 401, "Invalid email or password");
    return;
  }

  // SECURITY GATE: Prevent login if email is not verified
  if (!user.isVerified) {
    ApiResponse.error(res, 403, "Account is not verified. Please check your email for the OTP.");
    return;
  }

  const accessToken = await issueTokens(res, user);

  ApiResponse.success(res, 200, "Logged in successfully", {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });
});

// @route  POST /api/auth/refresh
// @access Public (requires valid refresh cookie)
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (!token) {
    ApiResponse.error(res, 401, "No refresh token provided");
    return;
  }

  let decoded: DecodedToken;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as DecodedToken;
  } catch {
    ApiResponse.error(res, 401, "Refresh token invalid or expired");
    return;
  }

  const storedToken = await RefreshToken.findOne({ where: { token, revoked: false } });
  if (!storedToken) {
    ApiResponse.error(res, 401, "Refresh token has been revoked");
    return;
  }

  const user = await User.findByPk(decoded.id);
  if (!user) {
    ApiResponse.error(res, 401, "User no longer exists");
    return;
  }

  // Rotate refresh token: revoke old, issue new
  storedToken.revoked = true;
  await storedToken.save();

  const accessToken = await issueTokens(res, user);

  ApiResponse.success(res, 200, "Token refreshed", { accessToken });
});

// @route  POST /api/auth/logout
// @access Private
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;

  if (token) {
    await RefreshToken.update({ revoked: true }, { where: { token } });
  }

  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
  ApiResponse.success(res, 200, "Logged out successfully");
});

// @route  GET /api/auth/me
// @access Private
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  ApiResponse.success(res, 200, "Current user fetched", { user: req.user });
});