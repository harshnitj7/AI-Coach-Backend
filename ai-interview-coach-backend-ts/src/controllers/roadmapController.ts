import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Roadmap } from "../models";
import * as aiService from "../services/aiService";
import ApiResponse from "../utils/apiResponse";

// @route  POST /api/roadmaps
// @access Private
export const generateRoadmap = asyncHandler(async (req: Request, res: Response) => {
  const {
    targetRole,
    currentSkills = [],
    durationWeeks = 12,
  } = req.body as { targetRole: string; currentSkills?: string[]; durationWeeks?: number };

  const roadmapData = await aiService.generateRoadmap(targetRole, currentSkills, durationWeeks);

  const roadmap = await Roadmap.create({
    userId: req.user!.id,
    targetRole,
    currentSkills,
    durationWeeks,
    roadmapData,
  });

  ApiResponse.success(res, 201, "Roadmap generated successfully", { roadmap });
});

// @route  GET /api/roadmaps
// @access Private
export const getMyRoadmaps = asyncHandler(async (req: Request, res: Response) => {
  const roadmaps = await Roadmap.findAll({
    where: { userId: req.user!.id },
    order: [["createdAt", "DESC"]],
  });
  ApiResponse.success(res, 200, "Roadmaps fetched", { roadmaps });
});

// @route  GET /api/roadmaps/:id
// @access Private
export const getRoadmapById = asyncHandler(async (req: Request, res: Response) => {
  const roadmap = await Roadmap.findOne({ where: { id: req.params.id, userId: req.user!.id } });
  if (!roadmap) {
    ApiResponse.error(res, 404, "Roadmap not found");
    return;
  }
  ApiResponse.success(res, 200, "Roadmap fetched", { roadmap });
});
