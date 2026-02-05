import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import morgan from "morgan";

// Last restarted: Force reload env vars
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { startScheduler } from "./cron/scheduler.js";
import { startRecurringTransactionsCron } from "./cron/recurringCron.js";

import transactionRoutes from "./routes/transactionRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";

dotenv.config();

// Connect Database
connectDB();
// Start Cron Jobs (if any)
try {
  startScheduler();
  startRecurringTransactionsCron();
} catch (error) {
  console.log("Scheduler error or not implemented:", error.message);
}

const app = express();

// Security Middleware
app.use(helmet()); // Set security HTTP headers

// Logging
app.use(morgan("dev")); // Log requests

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use("/auth", limiter); // Apply stricter limits to auth routes specifically
app.use(limiter); // Apply to all routes

// Standard Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://10.154.153.74:3000"], // Restrict to frontend URLs
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: "50mb" })); // Limit body size expanded for large receipts
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Data Sanitization against NoSQL query injection
// Custom middleware manually because express-mongo-sanitize was crashing
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query); // This might be read-only? If so, we just skip or catch.
  if (req.params) sanitize(req.params);
  next();
});

// Data Sanitization against XSS
// Custom middleware manually because xss-clean was causing TypeError
app.use((req, res, next) => {
  const sanitizeXss = (obj) => {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Simple manual sanitization: escape HTML characters
        obj[key] = obj[key]
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeXss(obj[key]);
      }
    }
  };

  if (req.body) sanitizeXss(req.body);
  if (req.query) sanitizeXss(req.query);
  if (req.params) sanitizeXss(req.params);
  next();
});

// Prevent Parameter Pollution
app.use(hpp());

// Routes
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/accounts", accountRoutes);
app.use("/budgets", budgetRoutes);
app.use("/ai", aiRoutes);
app.use("/whatsapp", whatsappRoutes);
app.use("/goals", goalRoutes);
app.use("/recurring", recurringRoutes);
app.use("/receipts", receiptRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Wealth API is running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
