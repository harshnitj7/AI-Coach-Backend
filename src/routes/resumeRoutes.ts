import { Router } from "express";
import { analyzeResume, getMyResumes, getResumeById } from "../controllers/resumeController";
import { protect } from "../middlewares/authMiddleware";
import upload from "../middlewares/uploadMiddleware";

const router = Router();

router.use(protect);

router.post("/analyze", upload.single("resume"), analyzeResume);
router.get("/", getMyResumes);
router.get("/:id", getResumeById);

export default router;
