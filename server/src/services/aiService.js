import Groq from "groq-sdk";

export const getSavingTips = async (expenses, budget, totalSpent) => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        console.warn("⚠️ GROQ_API_KEY not found in .env. Skipping AI suggestions.");
        return "Budget exceeded. Consider reducing miscellaneous expenses.";
    }

    try {
        const groq = new Groq({ apiKey });

        const prompt = `
            You are "WealthAssistant AI", a high-end personal financial strategist.
            
            USER FINANCIAL DATA:
            - Monthly Budget: ₹${budget}
            - Current Total Expenditure: ₹${totalSpent}
            - Spending Breakdown (Category: Amount): ${JSON.stringify(expenses)}
            - Budget Status: ${totalSpent > budget ? 'OVER BUDGET' : 'APPROACHING LIMIT'}

            TASK:
            Analyze the user's spending habits and provide a high-impact "Rescue Plan" in exactly this format:
            
            1. ⚡ THE QUICK FIX: One immediate action to stop the bleed in their top category.
            2. 🧠 THE WEALTH HABIT: A psychological or behavioral shift for long-term control.
            3. 🛠️ THE SMART HACK: A technical or life-hack to reduce costs in a high-spend area.
            4. 🎯 THE WEEKLY CHALLENGE: A specific, fun challenge for the next 7 days (e.g., "No-Spend Weekend" or "Unsubscribe Sunday").

            STYLE GUIDELINES:
            - Use a professional yet encouraging tone.
            - Ensure tips are strictly based on the provided categories.
            - Keep each point concise (max 2 sentences).
            - Total word limit: 150 words.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        return chatCompletion.choices[0]?.message?.content || "Try to limit your spending in major categories to stay within budget.";
    } catch (error) {
        console.error("❌ Groq AI Error:", error.message || error);
        return "Try to limit your spending in major categories to stay within budget.";
    }
};
