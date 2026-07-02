import { Router } from "express";
import {
  startInterview,
  submitAnswer,
  completeInterview,
  getMyInterviews,
  getInterviewById,
} from "../controllers/interviewController";
import {
  startInterviewValidator,
  submitAnswerValidator,
} from "../validators/interviewValidator";
import validate from "../middlewares/validateMiddleware";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.use(protect); // all interview routes require authentication

router.post("/start", startInterviewValidator, validate, startInterview);
router.post("/:id/answer", submitAnswerValidator, validate, submitAnswer);
router.post("/:id/complete", completeInterview);
router.get("/", getMyInterviews);
router.get("/:id", getInterviewById);

export default router;
