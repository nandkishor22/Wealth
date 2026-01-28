import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["80_PERCENT", "EXCEEDED", "MONTHLY_REPORT"],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        sentVia: [
            {
                type: String,
                enum: ["email", "whatsapp"],
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);
