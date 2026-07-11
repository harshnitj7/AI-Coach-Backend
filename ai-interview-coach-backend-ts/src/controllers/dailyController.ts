import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
// Assuming you will create these models in your models/index.ts
// import { DailyQuestion, DailyAttempt } from "../models"; 
import * as aiService from "../services/aiService";
import ApiResponse from "../utils/apiResponse";

// @route   GET /api/daily
// @access  Private
// Fetches today's question. If it doesn't exist, generates it via AI.
export const getDailyQuestion = asyncHandler(async (req: Request, res: Response) => {
  // 1. Get today's date boundary (midnight to midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 2. Check if a question already exists in the database for today
  /* 
  let question = await DailyQuestion.findOne({
    where: { createdAt: { $gte: today } } 
  }); 
  */

  let question = null; // Remove this once your DB model is linked

  // 3. If no question exists for today, generate a new one!
  if (!question) {
    // We generate a targeted question. 
    const promptContext = "Generate a hard-level technical interview question. Focus on Data Structures and Algorithms using Java, or a complex embedded systems architecture problem.";
    
    // const generatedData = await aiService.generateDailyQuestion(promptContext);
    
    // Mocking the DB creation for now
    question = {
      id: "daily-" + Date.now(),
      title: "Warehouse Path Optimization",
      category: "Data Structures & Algorithms (Java)",
      text: "Given a 2D grid representing an automated warehouse facility where 0 is an open path and 1 is a rack (obstacle), write an optimized Java solution to find the shortest path for an autonomous bot to travel from the top-left (0,0) to the bottom-right (n-1, m-1). What is the time and space complexity of your approach?",
      difficulty: "Hard",
      createdAt: new Date(),
    };
    
    // await DailyQuestion.create(question);
  }

  // 4. Check if the current user already attempted it today
  /*
  const attempt = await DailyAttempt.findOne({ 
    where: { userId: req.user!.id, questionId: question.id } 
  });
  */
  const attempt = null; // Mocking

  ApiResponse.success(res, 200, "Daily question fetched", { 
    question, 
    hasAttempted: !!attempt,
    previousScore: attempt ? (attempt as any).score : null
  });
});


// @route   POST /api/daily/:id/answer
// @access  Private
// Submits the user's answer, scores it using AI, and updates their streak.
export const submitDailyAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { id: questionId } = req.params;
  const { answer } = req.body as { answer: string };

  if (!answer) {
    ApiResponse.error(res, 400, "Answer is required");
    return;
  }

  // 1. Fetch the question from the DB
  // const question = await DailyQuestion.findByPk(questionId);
  const question = { text: "Mock question text" }; // Replace with real DB call

  // 2. Evaluate the answer using your AI Service
  // const evaluation = await aiService.evaluateDailyAnswer(question.text, answer);
  
  // Mock AI response
  const evaluation = {
    score: 9.0,
    comments: "Excellent approach using Breadth-First Search (BFS). Your time complexity analysis of O(N*M) is correct. To make this a perfect Java 21 solution, consider using a record for the queue coordinates instead of an array for cleaner syntax.",
  };

  // 3. Save the attempt to the database
  /*
  await DailyAttempt.create({
    userId: req.user!.id,
    questionId,
    userAnswer: answer,
    score: evaluation.score,
    feedback: evaluation.comments
  });
  */

  // 4. (Optional) Update user's streak logic here
  
  ApiResponse.success(res, 200, "Answer evaluated successfully", { evaluation });
});