import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Alert from "../models/Alert.js";
import { sendEmailAlert } from "./emailService.js";
import { sendWhatsAppAlert } from "./whatsappService.js";
import { getSavingTips } from "./aiService.js";
import { monthlyReportTemplate } from "../utils/templates.js";

export const generateAndSendMonthlyReports = async () => {
    try {
        const users = await User.find();
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const month = lastMonth.getMonth() + 1;
        const year = lastMonth.getFullYear();

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        console.log(`📅 Generating Monthly Reports for ${month}/${year}...`);

        for (const user of users) {
            const transactions = await Transaction.find({
                userId: user._id,
                date: { $gte: startDate, $lte: endDate }
            });

            if (transactions.length === 0) continue;

            // 1. Calculate Totals
            const totalIncome = transactions
                .filter(t => t.type.toLowerCase() === "income")
                .reduce((acc, curr) => acc + curr.amount, 0);

            const totalExpense = transactions
                .filter(t => t.type.toLowerCase() === "expense")
                .reduce((acc, curr) => acc + curr.amount, 0);

            const categoryBreakdown = transactions
                .filter(t => t.type.toLowerCase() === "expense")
                .reduce((acc, curr) => {
                    const cat = curr.category || "Other";
                    acc[cat] = (acc[cat] || 0) + curr.amount;
                    return acc;
                }, {});

            const savings = totalIncome - totalExpense;

            // 2. Get AI Analysis
            console.log(`🤖 Analyzing finances for ${user.name}...`);
            const aiAnalysis = await getSavingTips(categoryBreakdown, totalIncome, totalExpense);

            const message = `📊 *Monthly Financial Report* (${lastMonth.toLocaleString('default', { month: 'long' })} ${year})\n\n` +
                `💰 Total Income: ₹${totalIncome.toLocaleString()}\n` +
                `📉 Total Expense: ₹${totalExpense.toLocaleString()}\n` +
                `🏦 Total Savings: ₹${savings.toLocaleString()}\n\n` +
                `🧠 *AI Saving Suggestions:* \n${aiAnalysis}\n\n` +
                `Log in to Wealth App to see more details!`;

            const sentVia = [];

            if (user.alertSettings?.email !== false && user.email) {
                const htmlContent = monthlyReportTemplate(
                    user.name,
                    lastMonth.toLocaleString('default', { month: 'long' }),
                    year,
                    totalIncome,
                    totalExpense,
                    savings,
                    aiAnalysis
                );
                await sendEmailAlert(user.email, `Wealth App: Monthly Review - ${lastMonth.toLocaleString('default', { month: 'long' })}`, htmlContent);
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

            // 3. Record history
            await Alert.create({
                userId: user._id,
                type: "MONTHLY_REPORT",
                message,
                sentVia
            });
        }

        console.log("✅ All monthly reports with AI analysis sent.");
    } catch (error) {
        console.error("❌ Monthly Report Automation Error:", error);
    }
};
