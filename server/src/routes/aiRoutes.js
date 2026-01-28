import express from "express";
import { predictCategory, getMonthlyInsights, financeChat } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /ai/category
router.post("/category", protect, predictCategory);

// GET /ai/insights/:month
router.get("/insights/:month", protect, getMonthlyInsights);

// POST /ai/chat
router.post("/chat", protect, financeChat);

export default router;
