import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { startScheduler } from "./cron/scheduler.js";

import transactionRoutes from "./routes/transactionRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";

dotenv.config();

// Connect Database
connectDB();
// Start Cron Jobs (if any)
try {
  startScheduler();
} catch (error) {
  console.log("Scheduler error or not implemented:", error.message);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/accounts", accountRoutes);
app.use("/budgets", budgetRoutes);
app.use("/ai", aiRoutes);
app.use("/whatsapp", whatsappRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Wealth API is running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
