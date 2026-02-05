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

export const parseReceiptTextAI = async (ocrText) => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        console.warn("⚠️ GROQ_API_KEY not found. Using fallback regex parsing.");
        return null;
    }

    try {
        const groq = new Groq({ apiKey });

        const prompt = `
            You are a receipt parsing assistant. Your goal is to extract structured data from messy OCR text.
            
            EXTRACT THESE DETAILS:
            1. Merchant Name: Look for large text at the top or "Welcome to..." Avoid generic terms like "Tax Invoice" or "Receipt".
            2. Date: Look for dates in any format (DD/MM/YYYY, YYYY-MM-DD, Month DD, etc.). Convert to YYYY-MM-DD.
            3. Total Amount: Look for the FINAL TOTAL. Ignore subtotals, tax amounts, or cash tendered. It is usually the largest number or labeled "Total".
            4. Category: Infer the category based on the merchant and items (Food & Dining, Groceries, Transportation, Shopping, Healthcare, Entertainment, Utilities, Education, Other).

            RAW OCR TEXT:
            """${ocrText.substring(0, 2000)}"""

            RETURN ONLY A VALID JSON OBJECT. NO markdown, NO explanations.
            If a field cannot be found, set it to null.

            {
                "merchantName": "Merchant Name or null",
                "date": "YYYY-MM-DD or null",
                "amount": 0.00,
                "category": "Category or Other"
            }
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1, // Low temperature for consistent formatting
        });

        const responseContent = chatCompletion.choices[0]?.message?.content;

        // Clean up response if it wraps in markdown
        const cleanerJson = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanerJson);
    } catch (error) {
        console.error("❌ Groq Receipt Parse Error:", error);
        return null;
    }
};
