import cron from "node-cron";
import { processAllDueRecurring, sendUpcomingNotifications } from "../controllers/recurringController.js";

// Process due recurring transactions every day at 12:00 AM
export const startRecurringTransactionsCron = () => {
    // Run every day at midnight to process due recurring transactions
    cron.schedule("0 0 * * *", async () => {
        console.log("⏰ Running recurring transactions cron job...");
        try {
            await processAllDueRecurring();
        } catch (error) {
            console.error("❌ Recurring transactions cron job failed:", error);
        }
    });

    // Run every day at 9:00 AM to send reminder notifications for tomorrow's recurring transactions
    cron.schedule("0 9 * * *", async () => {
        console.log("⏰ Running recurring transaction reminders cron job...");
        try {
            await sendUpcomingNotifications();
        } catch (error) {
            console.error("❌ Recurring reminders cron job failed:", error);
        }
    });

    console.log("✅ Recurring transactions cron jobs scheduled:");
    console.log("   - Process due transactions: Daily at 12:00 AM");
    console.log("   - Send reminders: Daily at 9:00 AM");
};
