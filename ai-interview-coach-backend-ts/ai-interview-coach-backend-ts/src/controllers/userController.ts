import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { User } from "../models";
import ApiResponse from "../utils/apiResponse";

// @route  PUT /api/users/profile
// @access Private
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, targetRole } = req.body as { name?: string; targetRole?: string };

  const user = await User.findByPk(req.user!.id);
  if (!user) {
    ApiResponse.error(res, 404, "User not found");
    return;
  }

  if (name) user.name = name;
  if (targetRole) user.targetRole = targetRole;
  await user.save();

  ApiResponse.success(res, 200, "Profile updated", { user });
});
