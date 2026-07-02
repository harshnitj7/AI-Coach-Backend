import { Router } from "express";
import { generateRoadmap, getMyRoadmaps, getRoadmapById } from "../controllers/roadmapController";
import { roadmapValidator } from "../validators/interviewValidator";
import validate from "../middlewares/validateMiddleware";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.use(protect);

router.post("/", roadmapValidator, validate, generateRoadmap);
router.get("/", getMyRoadmaps);
router.get("/:id", getRoadmapById);

export default router;
