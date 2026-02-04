import RecurringTransaction from "../models/RecurringTransaction.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { sendWhatsAppAlert } from "../services/whatsappService.js";
import { sendEmailAlert } from "../services/emailService.js";

// Get all recurring transactions for user
export const getRecurringTransactions = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.find({
            userId: req.user.id,
        })
            .populate("accountId", "name type")
            .sort({ nextDueDate: 1 });

        res.status(200).json(recurring);
    } catch (error) {
        console.error("❌ Get Recurring Transactions Error:", error);
        res.status(500).json({ message: "Failed to fetch recurring transactions", error: error.message });
    }
};

// Get single recurring transaction
export const getRecurringTransaction = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findOne({
            _id: req.params.id,
            userId: req.user.id,
        }).populate("accountId", "name type");

        if (!recurring) {
            return res.status(404).json({ message: "Recurring transaction not found" });
        }

        res.status(200).json(recurring);
    } catch (error) {
        console.error("❌ Get Recurring Transaction Error:", error);
        res.status(500).json({ message: "Failed to fetch recurring transaction", error: error.message });
    }
};

// Create recurring transaction
export const createRecurringTransaction = async (req, res) => {
    try {
        const {
            accountId,
            type,
            amount,
            currency,
            description,
            category,
            interval,
            startDate,
            endDate,
            autoExecute,
            notifyBeforeDays,
        } = req.body;

        // Validate start date
        const start = new Date(startDate);
        if (start < new Date()) {
            return res.status(400).json({ message: "Start date cannot be in the past" });
        }

        // Create recurring transaction
        const recurring = await RecurringTransaction.create({
            userId: req.user.id,
            accountId,
            type,
            amount,
            currency: currency || "INR",
            description,
            category,
            interval,
            startDate: start,
            endDate: endDate || null,
            nextDueDate: start,
            autoExecute: autoExecute !== undefined ? autoExecute : true,
            notifyBeforeDays: notifyBeforeDays || 1,
        });

        const populatedRecurring = await RecurringTransaction.findById(recurring._id).populate("accountId", "name type");

        console.log(`✅ Created recurring transaction: ${description} (${interval})`);
        res.status(201).json(populatedRecurring);
    } catch (error) {
        console.error("❌ Create Recurring Transaction Error:", error);
        res.status(500).json({ message: "Failed to create recurring transaction", error: error.message });
    }
};

// Update recurring transaction
export const updateRecurringTransaction = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!recurring) {
            return res.status(404).json({ message: "Recurring transaction not found" });
        }

        const allowedUpdates = [
            "amount",
            "description",
            "category",
            "interval",
            "endDate",
            "autoExecute",
            "isActive",
            "notifyBeforeDays",
        ];

        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                recurring[field] = req.body[field];
            }
        });

        await recurring.save();

        const updated = await RecurringTransaction.findById(recurring._id).populate("accountId", "name type");

        res.status(200).json(updated);
    } catch (error) {
        console.error("❌ Update Recurring Transaction Error:", error);
        res.status(500).json({ message: "Failed to update recurring transaction", error: error.message });
    }
};

// Delete recurring transaction
export const deleteRecurringTransaction = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!recurring) {
            return res.status(404).json({ message: "Recurring transaction not found" });
        }

        res.status(200).json({ message: "Recurring transaction deleted successfully" });
    } catch (error) {
        console.error("❌ Delete Recurring Transaction Error:", error);
        res.status(500).json({ message: "Failed to delete recurring transaction", error: error.message });
    }
};

// Toggle active status
export const toggleRecurringTransaction = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!recurring) {
            return res.status(404).json({ message: "Recurring transaction not found" });
        }

        recurring.isActive = !recurring.isActive;
        await recurring.save();

        const updated = await RecurringTransaction.findById(recurring._id).populate("accountId", "name type");

        res.status(200).json(updated);
    } catch (error) {
        console.error("❌ Toggle Recurring Transaction Error:", error);
        res.status(500).json({ message: "Failed to toggle recurring transaction", error: error.message });
    }
};

// Get upcoming recurring transactions (next 30 days)
export const getUpcomingRecurring = async (req, res) => {
    try {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const upcoming = await RecurringTransaction.find({
            userId: req.user.id,
            isActive: true,
            nextDueDate: { $lte: thirtyDaysFromNow },
        })
            .populate("accountId", "name type")
            .sort({ nextDueDate: 1 })
            .limit(10);

        res.status(200).json(upcoming);
    } catch (error) {
        console.error("❌ Get Upcoming Recurring Error:", error);
        res.status(500).json({ message: "Failed to fetch upcoming recurring transactions", error: error.message });
    }
};

// Process single recurring transaction manually
export const processRecurringTransaction = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!recurring) {
            return res.status(404).json({ message: "Recurring transaction not found" });
        }

        // Create the actual transaction
        const transaction = await Transaction.create({
            userId: recurring.userId,
            accountId: recurring.accountId,
            type: recurring.type,
            amount: recurring.amount,
            currency: recurring.currency,
            description: `${recurring.description} (Recurring)`,
            category: recurring.category,
            date: new Date(),
        });

        // Update recurring transaction
        recurring.lastProcessedDate = new Date();
        recurring.nextDueDate = recurring.calculateNextDueDate();
        recurring.metadata.totalExecutions += 1;
        recurring.metadata.lastExecutionStatus = "success";
        recurring.notificationSent = false;

        // Check if we've reached end date
        if (recurring.endDate && new Date(recurring.nextDueDate) > new Date(recurring.endDate)) {
            recurring.isActive = false;
        }

        await recurring.save();

        console.log(`✅ Processed recurring transaction: ${recurring.description}`);

        res.status(200).json({
            message: "Recurring transaction processed successfully",
            transaction,
            recurring,
        });
    } catch (error) {
        console.error("❌ Process Recurring Transaction Error:", error);
        res.status(500).json({ message: "Failed to process recurring transaction", error: error.message });
    }
};

// Helper function: Process all due recurring transactions (called by cron job)
export const processAllDueRecurring = async () => {
    try {
        console.log("🔄 Processing due recurring transactions...");

        const dueRecurring = await RecurringTransaction.find({
            isActive: true,
            autoExecute: true,
            nextDueDate: { $lte: new Date() },
        }).populate("userId");

        let successCount = 0;
        let failCount = 0;

        for (const recurring of dueRecurring) {
            try {
                // Create the transaction
                await Transaction.create({
                    userId: recurring.userId._id,
                    accountId: recurring.accountId,
                    type: recurring.type,
                    amount: recurring.amount,
                    currency: recurring.currency,
                    description: `${recurring.description} (Auto-Recurring)`,
                    category: recurring.category,
                    date: new Date(),
                });

                // Update recurring transaction
                recurring.lastProcessedDate = new Date();
                recurring.nextDueDate = recurring.calculateNextDueDate();
                recurring.metadata.totalExecutions += 1;
                recurring.metadata.lastExecutionStatus = "success";
                recurring.notificationSent = false;

                // Check if we've reached end date
                if (recurring.endDate && new Date(recurring.nextDueDate) > new Date(recurring.endDate)) {
                    recurring.isActive = false;
                }

                await recurring.save();

                // Send notification
                await sendRecurringNotification(recurring);

                successCount++;
                console.log(`✅ Processed: ${recurring.description}`);
            } catch (error) {
                recurring.metadata.lastExecutionStatus = "failed";
                await recurring.save();
                failCount++;
                console.error(`❌ Failed to process: ${recurring.description}`, error);
            }
        }

        console.log(`✅ Recurring transactions processed: ${successCount} success, ${failCount} failed`);
    } catch (error) {
        console.error("❌ Process All Due Recurring Error:", error);
    }
};

// Helper function: Send notifications for upcoming recurring transactions
export const sendUpcomingNotifications = async () => {
    try {
        console.log("📧 Sending notifications for upcoming recurring transactions...");

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

        const upcomingRecurring = await RecurringTransaction.find({
            isActive: true,
            notificationSent: false,
            nextDueDate: { $gte: tomorrow, $lt: dayAfterTomorrow },
        }).populate("userId");

        for (const recurring of upcomingRecurring) {
            try {
                await sendRecurringReminderNotification(recurring);
                recurring.notificationSent = true;
                await recurring.save();
                console.log(`✅ Sent reminder for: ${recurring.description}`);
            } catch (error) {
                console.error(`❌ Failed to send reminder for: ${recurring.description}`, error);
            }
        }

        console.log(`✅ Sent ${upcomingRecurring.length} recurring transaction reminders`);
    } catch (error) {
        console.error("❌ Send Upcoming Notifications Error:", error);
    }
};

// Send notification after processing
async function sendRecurringNotification(recurring) {
    try {
        const user = recurring.userId;
        if (!user) return;

        const symbol = recurring.currency === "INR" ? "₹" : recurring.currency === "USD" ? "$" : recurring.currency;
        const typeEmoji = recurring.type === "Income" ? "💰" : "💸";

        const message = `${typeEmoji} Recurring Transaction Processed\n\n${recurring.description}\nAmount: ${symbol}${recurring.amount.toLocaleString()}\nType: ${recurring.type
            }\nNext Due: ${new Date(recurring.nextDueDate).toLocaleDateString()}`;

        // WhatsApp
        if (user.alertSettings?.whatsapp !== false && user.phone) {
            let phone = user.phone.trim();
            if (!phone.startsWith("+")) {
                if (phone.length === 10) phone = `+91${phone}`;
            }
            await sendWhatsAppAlert(phone, message);
        }

        // Email
        if (user.alertSettings?.email !== false && user.email) {
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
                    <h1 style="color: white; text-align: center;">${typeEmoji} Recurring Transaction Processed</h1>
                    <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
                        <h2 style="color: #667eea; margin-top: 0;">${recurring.description}</h2>
                        <p style="font-size: 16px; color: #333;"><strong>Amount:</strong> ${symbol}${recurring.amount.toLocaleString()}</p>
                        <p style="font-size: 16px; color: #333;"><strong>Type:</strong> ${recurring.type}</p>
                        <p style="font-size: 16px; color: #333;"><strong>Category:</strong> ${recurring.category}</p>
                        <p style="font-size: 16px; color: #333;"><strong>Interval:</strong> ${recurring.interval}</p>
                        <p style="font-size: 16px; color: #333;"><strong>Next Due:</strong> ${new Date(recurring.nextDueDate).toLocaleDateString()}</p>
                        <div style="background: #f7f7f7; padding: 15px; border-radius: 8px; margin-top: 20px;">
                            <p style="margin: 0; color: #666;">This transaction was automatically processed as part of your recurring ${recurring.interval.toLowerCase()} schedule.</p>
                        </div>
                    </div>
                </div>
            `;

            await sendEmailAlert(user.email, "Recurring Transaction Processed - Wealth App", html);
        }
    } catch (error) {
        console.error("Error sending recurring notification:", error);
    }
}

// Send reminder notification
async function sendRecurringReminderNotification(recurring) {
    try {
        const user = recurring.userId;
        if (!user) return;

        const symbol = recurring.currency === "INR" ? "₹" : recurring.currency === "USD" ? "$" : recurring.currency;
        const typeEmoji = recurring.type === "Income" ? "💰" : "💸";

        const message = `⏰ Upcoming Recurring Transaction Reminder\n\n${recurring.description}\nAmount: ${symbol}${recurring.amount.toLocaleString()}\nType: ${recurring.type
            }\nDue Tomorrow: ${new Date(recurring.nextDueDate).toLocaleDateString()}`;

        // WhatsApp
        if (user.alertSettings?.whatsapp !== false && user.phone) {
            let phone = user.phone.trim();
            if (!phone.startsWith("+")) {
                if (phone.length === 10) phone = `+91${phone}`;
            }
            await sendWhatsAppAlert(phone, message);
        }

        // Email
        if (user.alertSettings?.email !== false && user.email) {
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 10px;">
                    <h1 style="color: white; text-align: center;">⏰ Recurring Transaction Reminder</h1>
                    <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
                        <h2 style="color: #f5576c; margin-top: 0;">Due Tomorrow!</h2>
                        <h3 style="color: #333;">${recurring.description}</h3>
                        <p style="font-size: 16px; color: #333;"><strong>Amount:</strong> ${symbol}${recurring.amount.toLocaleString()}</p>
                        <p style="font-size: 16px; color: #333;"><strong>Type:</strong> ${typeEmoji} ${recurring.type}</p>
                        <p style="font-size: 16px; color: #333;"><strong>Category:</strong> ${recurring.category}</p>
                        <p style="font-size: 16px; color: #333;"><strong>Due Date:</strong> ${new Date(recurring.nextDueDate).toLocaleDateString()}</p>
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #856404;">This ${recurring.interval.toLowerCase()} transaction will be ${recurring.autoExecute ? "automatically processed" : "due for manual processing"
                } tomorrow.</p>
                        </div>
                    </div>
                </div>
            `;

            await sendEmailAlert(user.email, "Upcoming Recurring Transaction - Wealth App", html);
        }
    } catch (error) {
        console.error("Error sending recurring reminder notification:", error);
    }
}
