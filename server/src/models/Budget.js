import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        month: {
            type: Number, // 0-11
            required: true,
        },

        year: {
            type: Number,
            required: true,
        },

        alert80Sent: {
            type: Boolean,
            default: false
        },
        alert100Sent: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

budgetSchema.index({ userId: 1, month: 1, year: 1 });

export default mongoose.model("Budget", budgetSchema);
