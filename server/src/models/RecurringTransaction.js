import mongoose from "mongoose";

const recurringTransactionSchema = new mongoose.Schema(
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
            enum: ["Income", "Expense"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "INR",
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
        },
        interval: {
            type: String,
            enum: ["Daily", "Weekly", "Monthly", "Yearly"],
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
        },
        nextDueDate: {
            type: Date,
            required: true,
        },
        lastProcessedDate: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        autoExecute: {
            type: Boolean,
            default: true,
        },
        notifyBeforeDays: {
            type: Number,
            default: 1,
        },
        notificationSent: {
            type: Boolean,
            default: false,
        },
        metadata: {
            totalExecutions: {
                type: Number,
                default: 0,
            },
            lastExecutionStatus: {
                type: String,
                enum: ["success", "failed", "pending"],
                default: "pending",
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
recurringTransactionSchema.index({ userId: 1, isActive: 1 });
recurringTransactionSchema.index({ nextDueDate: 1, isActive: 1 });

// Method to calculate next due date
recurringTransactionSchema.methods.calculateNextDueDate = function () {
    const current = this.nextDueDate || this.startDate;
    const next = new Date(current);

    switch (this.interval) {
        case "Daily":
            next.setDate(next.getDate() + 1);
            break;
        case "Weekly":
            next.setDate(next.getDate() + 7);
            break;
        case "Monthly":
            next.setMonth(next.getMonth() + 1);
            break;
        case "Yearly":
            next.setFullYear(next.getFullYear() + 1);
            break;
    }

    return next;
};

// Method to check if recurring transaction should be processed
recurringTransactionSchema.methods.shouldProcess = function () {
    if (!this.isActive) return false;

    const now = new Date();
    const dueDate = new Date(this.nextDueDate);

    // Check if due date has passed
    if (now >= dueDate) {
        // Check if end date is set and has passed
        if (this.endDate && now > new Date(this.endDate)) {
            return false;
        }
        return true;
    }

    return false;
};

// Virtual for days until next execution
recurringTransactionSchema.virtual("daysUntilNext").get(function () {
    const now = new Date();
    const next = new Date(this.nextDueDate);
    const diff = Math.ceil((next - now) / (1000 * 60 * 60 * 24));
    return diff;
});

// Ensure virtuals are included in JSON
recurringTransactionSchema.set("toJSON", { virtuals: true });
recurringTransactionSchema.set("toObject", { virtuals: true });

const RecurringTransaction = mongoose.model("RecurringTransaction", recurringTransactionSchema);

export default RecurringTransaction;
