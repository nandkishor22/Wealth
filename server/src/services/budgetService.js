import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Alert from "../models/Alert.js";
import { sendEmailAlert } from "./emailService.js";
import { sendWhatsAppAlert } from "./whatsappService.js";
import { getSavingTips } from "./aiService.js";
import { budgetEmailTemplate } from "../utils/templates.js";

export const checkBudgetExceeded = async (userId, newTransactionAmount, date) => {
    try {
        const txDate = new Date(date);
        const month = txDate.getMonth() + 1;
        const year = txDate.getFullYear();

        console.log(`🔍 Processing Smart Budget Check: User ${userId}, ${month}/${year}`);

        // 1. Get Budget
        const budget = await Budget.findOne({ userId, month, year });
        if (!budget) return;

        // 2. Aggregate Expenses
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);

        const transactions = await Transaction.find({
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
            type: /expense/i
        });

        const totalExpense = transactions.reduce((acc, curr) => acc + curr.amount, 0);
        const usagePercentage = (totalExpense / budget.amount) * 100;

        console.log(`📊 Usage: ${usagePercentage.toFixed(1)}% (₹${totalExpense}/₹${budget.amount})`);

        let sendAlert = false;
        let alertType = "";
        let message = "";

        // 3. Determine Milestone
        if (usagePercentage >= 100 && !budget.alert100Sent) {
            alertType = "EXCEEDED";
            budget.alert100Sent = true;
            budget.alert80Sent = true;
            sendAlert = true;
        } else if (usagePercentage >= 80 && !budget.alert80Sent) {
            alertType = "80_PERCENT";
            budget.alert80Sent = true;
            sendAlert = true;
        }

        if (sendAlert) {
            const user = await User.findById(userId);
            if (!user) return;

            // 4. Get Category Breakdown for AI
            const categoryBreakdown = transactions.reduce((acc, curr) => {
                const cat = curr.category || "Other";
                acc[cat] = (acc[cat] || 0) + curr.amount;
                return acc;
            }, {});

            // 5. Generate AI Saving Tips
            console.log("🤖 Generating AI Saving Tips...");
            const aiTips = await getSavingTips(categoryBreakdown, budget.amount, totalExpense);

            const baseMessage = alertType === "EXCEEDED"
                ? `🚨 Budget Exceeded! You have spent ₹${totalExpense}, which is ${usagePercentage.toFixed(0)}% of your monthly budget.`
                : `⚠️ Budget Warning! You have reached ${usagePercentage.toFixed(0)}% of your monthly budget (Spent ₹${totalExpense}).`;

            message = `${baseMessage}\n\n💡 AI Saving Tips:\n${aiTips}`;

            console.log("📤 Sending Multi-Channel Alerts...");
            const sentVia = [];

            if (user.alertSettings?.email !== false && user.email) {
                const htmlContent = budgetEmailTemplate(
                    user.name,
                    alertType,
                    totalExpense,
                    budget.amount,
                    usagePercentage.toFixed(0),
                    aiTips
                );
                await sendEmailAlert(user.email, `Wealth App: ${alertType.replace('_', ' ')} Milestone`, htmlContent);
                sentVia.push("email");
            }

            if (user.alertSettings?.whatsapp !== false && user.phone) {
                let phone = user.phone.trim();
                if (!phone.startsWith('+')) {
                    if (phone.length === 10) phone = `+91${phone}`;
                }
                await sendWhatsAppAlert(phone, message);
                sentVia.push("whatsapp");
            }

            // 6. Record Alert History
            await Alert.create({
                userId,
                type: alertType,
                message,
                sentVia
            });

            await budget.save();
            console.log(`✅ ${alertType} alert processed and recorded.`);
        }

    } catch (error) {
        console.error("❌ Smart Budget Logic Error:", error);
    }
};
