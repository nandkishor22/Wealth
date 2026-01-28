import User from "../models/User.js";
import Account from "../models/Account.js";

// POST /users/sync
export const syncUser = async (req, res) => {
    try {
        const { clerkId, email, name } = req.body;

        if (!clerkId || !email) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                clerkId, // We should add this to schema or use as ID if model allows
                email,
                name
            });
            console.log("New User Created:", email);
        }

        // Check if user has any accounts
        const accountCount = await Account.countDocuments({ userId: user._id });

        if (accountCount === 0) {
            // Create default accounts
            await Account.create({
                userId: user._id,
                name: "Cash Wallet",
                type: "Cash",
                currency: "INR",
                initialBalance: 0
            });
            console.log("Default Account Created for:", email);
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Sync Error:", err);
        res.status(500).json({ error: err.message });
    }
};
