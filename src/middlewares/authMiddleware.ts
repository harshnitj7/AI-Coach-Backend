import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../models";
import ApiResponse from "../utils/apiResponse";
import { DecodedToken } from "../utils/generateToken";
import { UserRole } from "../types";

// Verifies the access token sent in the Authorization header (Bearer <token>)
// and attaches the authenticated user to req.user.
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    ApiResponse.error(res, 401, "Not authorized, no token provided");
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as DecodedToken;
    const user = await User.findByPk(decoded.id);

    if (!user) {
      ApiResponse.error(res, 401, "Not authorized, user no longer exists");
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if ((error as Error).name === "TokenExpiredError") {
      ApiResponse.error(res, 401, "Access token expired");
      return;
    }
    ApiResponse.error(res, 401, "Not authorized, token invalid");
  }
});

// Restrict route to specific roles, e.g. authorize("admin")
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      ApiResponse.error(res, 403, "You do not have permission to perform this action");
      return;
    }
    next();
  };
};
