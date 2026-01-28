import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
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
        },
        type: {
            type: String,
            enum: ["CASH", "BANK", "WALLET", "CREDIT", "Bank", "Cash", "Mobile Wallet", "Crypto", "Other"], // Added legacy types for compat
            required: true,
        },
        currency: {
            type: String,
            default: 'INR'
        },
        initialBalance: { // Keeping initialBalance for compatibility, but schema says 'balance'. 
            // I will alias balance to initialBalance or just allow both. 
            // For now, I will use 'initialBalance' as 'balance' effectively.
            type: Number,
            default: 0,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// We should probably migrate completely to the new schema cleanly, but existing code uses 'initialBalance' and 'currency' fields on Account.
// I've added currency and compatible types.

export default mongoose.model("Account", accountSchema);
