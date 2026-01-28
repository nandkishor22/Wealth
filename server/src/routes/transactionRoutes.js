import express from "express";
import {
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /transactions → create transaction
router.post("/", protect, addTransaction);

// GET /transactions → fetch user's transactions
router.get("/", protect, getTransactions);

// PUT /transactions/:id → update
router.put("/:id", protect, updateTransaction);

// DELETE /transactions/:id → delete by ID
router.delete("/:id", protect, deleteTransaction);

export default router;
