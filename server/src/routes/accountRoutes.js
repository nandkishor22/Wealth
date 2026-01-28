import express from "express";
import { addAccount, getAccounts, getAccountById, updateAccount, deleteAccount } from "../controllers/accountController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addAccount);
router.get("/", protect, getAccounts);
router.get("/:id", protect, getAccountById);
router.put("/:id", protect, updateAccount);
router.delete("/:id", protect, deleteAccount);

export default router;
