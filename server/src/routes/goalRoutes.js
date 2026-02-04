import express from "express";
import {
    getGoals,
    getGoalById,
    createGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    getGoalStats,
} from "../controllers/goalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Goal CRUD routes
router.route("/").get(getGoals).post(createGoal);

router.route("/stats").get(getGoalStats);

router.route("/:id").get(getGoalById).put(updateGoal).delete(deleteGoal);

router.route("/:id/contribute").post(contributeToGoal);

export default router;
