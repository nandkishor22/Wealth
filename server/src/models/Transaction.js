import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    type: {
      type: String,
      enum: ["INCOME", "EXPENSE", "income", "expense"], // Case insensitive compat
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: { type: String, default: "INR" },

    description: String,
    category: String,

    date: {
      type: Date,
      required: true,
    },

    receiptUrl: String,

    // Recurring logic
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringInterval: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
    },
    nextRecurringDate: Date,
    lastProcessed: Date,

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "COMPLETED",
    },

    // AI Fields
    aiCategory: String
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });

export default mongoose.model("Transaction", transactionSchema);
