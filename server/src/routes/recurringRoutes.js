import express from "express";
import {
    getRecurringTransactions,
    getRecurringTransaction,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    toggleRecurringTransaction,
    getUpcomingRecurring,
    processRecurringTransaction,
} from "../controllers/recurringController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all recurring transactions for user
router.get("/", getRecurringTransactions);

// Get upcoming recurring transactions
router.get("/upcoming", getUpcomingRecurring);

// Get single recurring transaction
router.get("/:id", getRecurringTransaction);

// Create recurring transaction
router.post("/", createRecurringTransaction);

// Update recurring transaction
router.put("/:id", updateRecurringTransaction);

// Delete recurring transaction
router.delete("/:id", deleteRecurringTransaction);

// Toggle active status
router.patch("/:id/toggle", toggleRecurringTransaction);

// Manually process a recurring transaction
router.post("/:id/process", processRecurringTransaction);

export default router;
