import { Router } from "express";
import { getDailyQuestion, submitDailyAnswer } from "../controllers/dailyController";
import { protect } from "../middlewares/authMiddleware";
import validate from "../middlewares/validateMiddleware";

const router = Router();

// Protect all daily routes
router.use(protect);

router.get("/", getDailyQuestion);
router.post("/:id/answer", submitDailyAnswer);

export default router;