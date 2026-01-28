import cron from "node-cron";
import { generateAndSendMonthlyReports } from "../services/monthlyReportService.js";

export const startScheduler = () => {
    // Schedule task to run on the 1st of every month at 10:00 AM
    cron.schedule("0 10 1 * *", async () => {
        console.log("🚀 Starting monthly report automation...");
        await generateAndSendMonthlyReports();
        console.log("✅ Monthly report job completed.");
    });
};
