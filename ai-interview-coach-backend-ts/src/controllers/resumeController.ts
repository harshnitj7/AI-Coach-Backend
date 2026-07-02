import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import fs from "fs";
import { Resume } from "../models";
import { extractTextFromResume } from "../services/resumeParserService";
import * as aiService from "../services/aiService";
import ApiResponse from "../utils/apiResponse";

// @route  POST /api/resumes/analyze
// @access Private
// Accepts a multipart file upload, extracts text, and runs it through the AI analyzer.
export const analyzeResume = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    ApiResponse.error(res, 400, "Please upload a resume file (PDF)");
    return;
  }

  const { targetRole } = req.body as { targetRole?: string };

  let resumeText: string;
  try {
    resumeText = await extractTextFromResume(req.file.path);
  } catch (err) {
    fs.unlinkSync(req.file.path); // cleanup on failure
    ApiResponse.error(res, 400, (err as Error).message);
    return;
  }

  const analysis = await aiService.analyzeResume(resumeText, targetRole);

  const resume = await Resume.create({
    userId: req.user!.id,
    fileName: req.file.originalname,
    filePath: req.file.path,
    targetRole,
    atsScore: analysis.atsScore,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    missingKeywords: analysis.missingKeywords,
    suggestions: analysis.suggestions,
  });

  ApiResponse.success(res, 201, "Resume analyzed successfully", { resume });
});

// @route  GET /api/resumes
// @access Private
export const getMyResumes = asyncHandler(async (req: Request, res: Response) => {
  const resumes = await Resume.findAll({
    where: { userId: req.user!.id },
    order: [["createdAt", "DESC"]],
  });
  ApiResponse.success(res, 200, "Resumes fetched", { resumes });
});

// @route  GET /api/resumes/:id
// @access Private
export const getResumeById = asyncHandler(async (req: Request, res: Response) => {
  const resume = await Resume.findOne({ where: { id: req.params.id, userId: req.user!.id } });
  if (!resume) {
    ApiResponse.error(res, 404, "Resume not found");
    return;
  }
  ApiResponse.success(res, 200, "Resume fetched", { resume });
});
