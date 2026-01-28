import Budget from "../models/Budget.js";

// POST /budgets
export const setBudget = async (req, res) => {
    try {
        const { amount, month, year } = req.body;
        const userId = req.user._id;

        if (!amount || month === undefined || !year) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if budget exists
        let budget = await Budget.findOne({ userId, month, year });

        if (budget) {
            budget.amount = amount;
            // Reset alerts if budget is manually updated/increased
            budget.alert80Sent = false;
            budget.alert100Sent = false;
            await budget.save();
        } else {
            budget = await Budget.create({ userId, amount, month, year });
        }

        res.status(200).json(budget);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /budgets?month=...&year=...
export const getBudget = async (req, res) => {
    try {
        const { month, year } = req.query;
        const userId = req.user._id;

        if (month === undefined || !year) return res.status(400).json({ error: "Params required" });

        const budget = await Budget.findOne({ userId, month, year });
        res.status(200).json(budget || { amount: 0 }); // Return 0 if no budget set
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
