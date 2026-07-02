import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
} from "../controllers/authController";
import { registerValidator, loginValidator } from "../validators/authValidator";
import validate from "../middlewares/validateMiddleware";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", registerValidator, validate, registerUser);
router.post("/login", loginValidator, validate, loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getCurrentUser);

export default router;
