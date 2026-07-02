import { body } from "express-validator";

export const startInterviewValidator = [
  body("role").trim().notEmpty().withMessage("Target role is required"),
  body("type")
    .optional()
    .isIn(["technical", "hr", "behavioral", "system-design"])
    .withMessage("Invalid interview type"),
  body("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Invalid difficulty"),
];

export const submitAnswerValidator = [
  body("questionId").notEmpty().withMessage("questionId is required"),
  body("answer").trim().notEmpty().withMessage("Answer cannot be empty"),
];

export const roadmapValidator = [
  body("targetRole").trim().notEmpty().withMessage("Target role is required"),
  body("currentSkills").optional().isArray().withMessage("currentSkills must be an array"),
  body("durationWeeks")
    .optional()
    .isInt({ min: 1, max: 52 })
    .withMessage("durationWeeks must be between 1 and 52"),
];
