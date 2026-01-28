import express from "express";
import { handleIncomingMessage } from "../controllers/whatsappController.js";

const router = express.Router();

// POST /whatsapp
router.post("/", handleIncomingMessage);

export default router;
