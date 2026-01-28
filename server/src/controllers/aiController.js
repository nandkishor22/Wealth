import Groq from "groq-sdk";
import Transaction from "../models/Transaction.js";

let groqInstance = null;

const getGroq = () => {
    if (process.env.GROQ_API_KEY) {
        console.log("GROQ_API_KEY found:", process.env.GROQ_API_KEY.substring(0, 10) + "...");
    } else {
        console.error("GROQ_API_KEY is missing in process.env");
    }

    if (!groqInstance && process.env.GROQ_API_KEY) {
        groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groqInstance;
};

export const predictCategory = async (req, res) => {
    const { description } = req.body;

    if (!description) {
        return res.status(400).json({ error: "Description is required" });
    }

    try {
        const groq = getGroq();
        if (!groq) {
            return res.json({ category: "Uncategorized (No API Key)" });
        }

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful financial assistant. Categorize the transaction description into a short category name (e.g. Food, Travel, Rent, Utilities, Entertainment, Health). Return only the category name, nothing else.",
                },
                { role: "user", content: `Categorize this transaction: '${description}'` },
            ],
            max_tokens: 10,
        });

        const category = response.choices[0].message.content.trim();
        res.json({ category });
    } catch (error) {
        console.error("Groq AI Error:", error);
        res.status(500).json({ error: "Failed to predict category" });
    }
};

export const getMonthlyInsights = async (req, res) => {
    const { month } = req.params;
    const userId = req.user._id;

    try {
        const year = new Date().getFullYear();
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const transactions = await Transaction.find({
            userId,
            date: { $gte: startDate, $lte: endDate }
        });

        if (transactions.length === 0) {
            return res.json({ insights: "No transactions found for analysis this month." });
        }

        // Limit transaction summary length for token limits if necessary
        const transactionSummary = transactions.slice(0, 100).map(t => `${t.date.toISOString().split('T')[0]}: ${t.description} - ${t.amount} (${t.category})`).join("\n");

        const groq = getGroq();
        if (!groq) {
            return res.json({ insights: "AI insights require a Groq API Key. Please add it to your .env file." });
        }

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "Analyze the following monthly expense report. Identify overspending areas, provide saving tips, and give one actionable suggestion. Keep it concise, friendly, and professional.",
                },
                { role: "user", content: transactionSummary },
            ],
        });

        const insights = response.choices[0].message.content;
        res.json({ insights });

    } catch (error) {
        console.error("Groq Insights Error:", error);
        res.status(500).json({ error: "Failed to generate insights" });
    }
};

export const financeChat = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const groq = getGroq();
        if (!groq) {
            return res.json({ reply: "I'm sorry, but I can't help you right now. Please check the API key configuration." });
        }

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are a knowledgeable and helpful financial assistant. Your goal is to help users with financial questions, calculations, and advice. You can solve equations related to finance, explain concepts, and provide tips. Keep your answers clear, concise, and professional. IMPORTANT: Always use Indian Rupees (₹) for currency in your examples and calculations, unless the user explicitly asks for another currency.",
                },
                { role: "user", content: message },
            ],
        });

        const reply = response.choices[0].message.content;
        res.json({ reply });

    } catch (error) {
        console.error("Groq Chat Error:", error);
        res.status(500).json({ error: "Failed to process chat message" });
    }
};
