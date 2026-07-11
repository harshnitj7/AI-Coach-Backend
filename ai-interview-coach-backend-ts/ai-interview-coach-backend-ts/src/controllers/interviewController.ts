import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Interview, InterviewQuestion } from "../models";
import * as aiService from "../services/aiService";
import ApiResponse from "../utils/apiResponse";
import { InterviewType, InterviewDifficulty } from "../types";

// @route  POST /api/interviews/start
// @access Private
// Creates an interview session and generates AI questions for it.
export const startInterview = asyncHandler(async (req: Request, res: Response) => {
  const {
    role,
    type = "technical",
    difficulty = "medium",
    questionCount = 5,
  } = req.body as {
    role: string;
    type?: InterviewType;
    difficulty?: InterviewDifficulty;
    questionCount?: number;
  };

  const interview = await Interview.create({
    userId: req.user!.id,
    role,
    type,
    difficulty,
    status: "in-progress",
  });

  const questions = await aiService.generateInterviewQuestions(
    role,
    type,
    difficulty,
    questionCount
  );

  const questionRecords = await InterviewQuestion.bulkCreate(
    questions.map((q, index) => ({
      interviewId: interview.id,
      order: index + 1,
      question: q,
    }))
  );

  ApiResponse.success(res, 201, "Interview started", {
    interview,
    questions: questionRecords,
  });
});

// @route  POST /api/interviews/:id/answer
// @access Private
// Submits an answer for one question and gets instant AI feedback + score.
export const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { id: interviewId } = req.params;
  const { questionId, answer } = req.body as { questionId: string; answer: string };

  const interview = await Interview.findOne({ where: { id: interviewId, userId: req.user!.id } });
  if (!interview) {
    ApiResponse.error(res, 404, "Interview not found");
    return;
  }

  const question = await InterviewQuestion.findOne({
    where: { id: questionId, interviewId },
  });
  if (!question) {
    ApiResponse.error(res, 404, "Question not found");
    return;
  }

  const { score, feedback } = await aiService.evaluateAnswer(
    interview.role,
    question.question,
    answer
  );

  question.userAnswer = answer;
  question.score = score;
  question.aiFeedback = feedback;
  await question.save();

  ApiResponse.success(res, 200, "Answer evaluated", { question });
});

// @route  POST /api/interviews/:id/complete
// @access Private
// Finalizes the interview: aggregates all Q&A and generates overall feedback.
export const completeInterview = asyncHandler(async (req: Request, res: Response) => {
  const { id: interviewId } = req.params;

  const interview = await Interview.findOne({ where: { id: interviewId, userId: req.user!.id } });
  if (!interview) {
    ApiResponse.error(res, 404, "Interview not found");
    return;
  }

  const questions = await InterviewQuestion.findAll({
    where: { interviewId },
    order: [["order", "ASC"]],
  });

  const qaList = questions.map((q) => ({
    question: q.question,
    answer: q.userAnswer,
    score: q.score,
  }));

  const { overallScore, overallFeedback } = await aiService.generateOverallInterviewFeedback(
    interview.role,
    qaList
  );

  interview.status = "completed";
  interview.overallScore = overallScore;
  interview.overallFeedback = overallFeedback;
  await interview.save();

  ApiResponse.success(res, 200, "Interview completed", { interview, questions });
});

// @route  GET /api/interviews
// @access Private
export const getMyInterviews = asyncHandler(async (req: Request, res: Response) => {
  const interviews = await Interview.findAll({
    where: { userId: req.user!.id },
    order: [["createdAt", "DESC"]],
  });
  ApiResponse.success(res, 200, "Interviews fetched", { interviews });
});

// @route  GET /api/interviews/:id
// @access Private
export const getInterviewById = asyncHandler(async (req: Request, res: Response) => {
  const interview = await Interview.findOne({
    where: { id: req.params.id, userId: req.user!.id },
    include: [{ model: InterviewQuestion, as: "questions" }],
  });
  if (!interview) {
    ApiResponse.error(res, 404, "Interview not found");
    return;
  }
  ApiResponse.success(res, 200, "Interview fetched", { interview });
});
