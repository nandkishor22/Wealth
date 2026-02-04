import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        targetAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        currentAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        deadline: {
            type: Date,
            required: true,
        },
        category: {
            type: String,
            enum: ["Travel", "Emergency", "Investment", "Education", "Home", "Vehicle", "Wedding", "Retirement", "Other"],
            default: "Other",
        },
        priority: {
            type: String,
            enum: ["High", "Medium", "Low"],
            default: "Medium",
        },
        status: {
            type: String,
            enum: ["In Progress", "Completed", "Cancelled"],
            default: "In Progress",
        },
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
        },
        reminderSent: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
        },
        milestones: [
            {
                percentage: {
                    type: Number,
                    required: true,
                },
                reached: {
                    type: Boolean,
                    default: false,
                },
                reachedAt: {
                    type: Date,
                },
            },
        ],
    },
    { timestamps: true }
);

// Virtual for progress percentage
goalSchema.virtual("progressPercentage").get(function () {
    if (this.targetAmount === 0) return 0;
    return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
});

// Virtual for remaining amount
goalSchema.virtual("remainingAmount").get(function () {
    return Math.max(this.targetAmount - this.currentAmount, 0);
});

// Virtual for days remaining
goalSchema.virtual("daysRemaining").get(function () {
    const now = new Date();
    const deadline = new Date(this.deadline);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Ensure virtuals are included in JSON
goalSchema.set("toJSON", { virtuals: true });
goalSchema.set("toObject", { virtuals: true });

// Index for efficient queries
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, deadline: 1 });

export default mongoose.model("Goal", goalSchema);
