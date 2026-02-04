import Goal from "../models/Goal.js";
import Account from "../models/Account.js";
import { sendEmailAlert } from "../services/emailService.js";
import { sendWhatsAppAlert } from "../services/whatsappService.js";
import User from "../models/User.js";

// @desc    Get all goals for a user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id })
            .populate("accountId", "name type")
            .sort({ deadline: 1 });

        res.status(200).json(goals);
    } catch (error) {
        console.error("❌ Get Goals Error:", error);
        res.status(500).json({ message: "Failed to fetch goals", error: error.message });
    }
};

// @desc    Get a single goal by ID
// @route   GET /api/goals/:id
// @access  Private
export const getGoalById = async (req, res) => {
    try {
        const goal = await Goal.findOne({
            _id: req.params.id,
            userId: req.user.id,
        }).populate("accountId", "name type");

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        res.status(200).json(goal);
    } catch (error) {
        console.error("❌ Get Goal Error:", error);
        res.status(500).json({ message: "Failed to fetch goal", error: error.message });
    }
};

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res) => {
    try {
        const { name, description, targetAmount, currentAmount, deadline, category, priority, accountId } = req.body;

        // Validate deadline
        const deadlineDate = new Date(deadline);
        if (deadlineDate <= new Date()) {
            return res.status(400).json({ message: "Deadline must be in the future" });
        }

        // Validate account if provided
        if (accountId) {
            const account = await Account.findOne({ _id: accountId, userId: req.user.id });
            if (!account) {
                return res.status(404).json({ message: "Account not found" });
            }
        }

        // Create default milestones (25%, 50%, 75%, 100%)
        const milestones = [
            { percentage: 25, reached: false },
            { percentage: 50, reached: false },
            { percentage: 75, reached: false },
            { percentage: 100, reached: false },
        ];

        const goal = await Goal.create({
            userId: req.user.id,
            name,
            description,
            targetAmount,
            currentAmount: currentAmount || 0,
            deadline: deadlineDate,
            category,
            priority,
            accountId,
            milestones,
        });

        // Check if any milestone is already reached based on currentAmount
        await checkAndUpdateMilestones(goal);

        const populatedGoal = await Goal.findById(goal._id).populate("accountId", "name type");

        res.status(201).json(populatedGoal);
    } catch (error) {
        console.error("❌ Create Goal Error:", error);
        res.status(500).json({ message: "Failed to create goal", error: error.message });
    }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        const { name, description, targetAmount, currentAmount, deadline, category, priority, accountId, status } = req.body;

        // Validate account if provided
        if (accountId) {
            const account = await Account.findOne({ _id: accountId, userId: req.user.id });
            if (!account) {
                return res.status(404).json({ message: "Account not found" });
            }
        }

        // Update fields
        if (name !== undefined) goal.name = name;
        if (description !== undefined) goal.description = description;
        if (targetAmount !== undefined) goal.targetAmount = targetAmount;
        if (currentAmount !== undefined) goal.currentAmount = currentAmount;
        if (deadline !== undefined) {
            const deadlineDate = new Date(deadline);
            if (deadlineDate <= new Date()) {
                return res.status(400).json({ message: "Deadline must be in the future" });
            }
            goal.deadline = deadlineDate;
        }
        if (category !== undefined) goal.category = category;
        if (priority !== undefined) goal.priority = priority;
        if (accountId !== undefined) goal.accountId = accountId;
        if (status !== undefined) {
            goal.status = status;
            if (status === "Completed") {
                goal.completedAt = new Date();
            }
        }

        await goal.save();

        // Check milestones
        await checkAndUpdateMilestones(goal);

        const updatedGoal = await Goal.findById(goal._id).populate("accountId", "name type");

        res.status(200).json(updatedGoal);
    } catch (error) {
        console.error("❌ Update Goal Error:", error);
        res.status(500).json({ message: "Failed to update goal", error: error.message });
    }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        res.status(200).json({ message: "Goal deleted successfully" });
    } catch (error) {
        console.error("❌ Delete Goal Error:", error);
        res.status(500).json({ message: "Failed to delete goal", error: error.message });
    }
};

// @desc    Add money to a goal
// @route   POST /api/goals/:id/contribute
// @access  Private
export const contributeToGoal = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than 0" });
        }

        const goal = await Goal.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        if (goal.status !== "In Progress") {
            return res.status(400).json({ message: "Cannot contribute to a goal that is not in progress" });
        }

        // Add contribution
        goal.currentAmount += amount;

        // Check if goal is completed
        if (goal.currentAmount >= goal.targetAmount) {
            goal.status = "Completed";
            goal.completedAt = new Date();

            // Send completion notification
            await sendGoalCompletionNotification(goal);
        }

        await goal.save();

        // Check and update milestones
        await checkAndUpdateMilestones(goal);

        const updatedGoal = await Goal.findById(goal._id).populate("accountId", "name type");

        res.status(200).json(updatedGoal);
    } catch (error) {
        console.error("❌ Contribute to Goal Error:", error);
        res.status(500).json({ message: "Failed to contribute to goal", error: error.message });
    }
};

// @desc    Get goal statistics
// @route   GET /api/goals/stats
// @access  Private
export const getGoalStats = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id });

        const stats = {
            total: goals.length,
            inProgress: goals.filter((g) => g.status === "In Progress").length,
            completed: goals.filter((g) => g.status === "Completed").length,
            cancelled: goals.filter((g) => g.status === "Cancelled").length,
            totalTargetAmount: goals.reduce((sum, g) => sum + g.targetAmount, 0),
            totalCurrentAmount: goals.reduce((sum, g) => sum + g.currentAmount, 0),
            averageProgress: goals.length > 0 ? goals.reduce((sum, g) => sum + g.progressPercentage, 0) / goals.length : 0,
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error("❌ Get Goal Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch goal statistics", error: error.message });
    }
};

// Helper function to check and update milestones
async function checkAndUpdateMilestones(goal) {
    let milestonesUpdated = false;

    for (let milestone of goal.milestones) {
        if (!milestone.reached && goal.progressPercentage >= milestone.percentage) {
            milestone.reached = true;
            milestone.reachedAt = new Date();
            milestonesUpdated = true;

            // Send milestone notification
            await sendMilestoneNotification(goal, milestone.percentage);
        }
    }

    if (milestonesUpdated) {
        await goal.save();
    }
}

// Helper function to send milestone notification
async function sendMilestoneNotification(goal, percentage) {
    try {
        const user = await User.findById(goal.userId);
        if (!user) return;

        const message = `🎉 Milestone Alert!\n\nCongratulations! You've reached ${percentage}% of your "${goal.name}" goal!\n\nCurrent: ₹${goal.currentAmount.toLocaleString()}\nTarget: ₹${goal.targetAmount.toLocaleString()}\n\nKeep going! 💪`;

        // Send WhatsApp
        if (user.alertSettings?.whatsapp !== false && user.phone) {
            let phone = user.phone.trim();
            if (!phone.startsWith("+")) {
                if (phone.length === 10) phone = `+91${phone}`;
            }
            await sendWhatsAppAlert(phone, message);
        }

        // Send Email
        if (user.alertSettings?.email !== false && user.email) {
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
                    <h1 style="color: white; text-align: center;">🎉 Milestone Reached!</h1>
                    <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
                        <h2 style="color: #667eea; margin-top: 0;">Congratulations, ${user.name}! 🎊</h2>
                        <p style="font-size: 16px; color: #333;">You've reached <strong>${percentage}%</strong> of your goal:</p>
                        <h3 style="color: #764ba2;">"${goal.name}"</h3>
                        <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 10px 0;"><strong>Current Amount:</strong> ₹${goal.currentAmount.toLocaleString()}</p>
                            <p style="margin: 10px 0;"><strong>Target Amount:</strong> ₹${goal.targetAmount.toLocaleString()}</p>
                            <p style="margin: 10px 0;"><strong>Progress:</strong> ${goal.progressPercentage.toFixed(1)}%</p>
                        </div>
                        <p style="font-size: 16px; color: #333; margin-top: 20px;">Keep up the great work! You're making excellent progress! 💪</p>
                    </div>
                </div>
            `;
            await sendEmailAlert(user.email, `Wealth App: ${percentage}% Goal Milestone Reached! 🎉`, htmlContent);
        }

        console.log(`🎉 Milestone notification sent for goal "${goal.name}" at ${percentage}%`);
    } catch (error) {
        console.error("❌ Milestone Notification Error:", error);
    }
}

// Helper function to send goal completion notification
async function sendGoalCompletionNotification(goal) {
    try {
        const user = await User.findById(goal.userId);
        if (!user) return;

        const message = `🎊 GOAL COMPLETED! 🎊\n\nCongratulations! You've successfully achieved your "${goal.name}" goal!\n\nTarget: ₹${goal.targetAmount.toLocaleString()}\nAchieved: ₹${goal.currentAmount.toLocaleString()}\n\nCelebrate your success! 🥳`;

        // Send WhatsApp
        if (user.alertSettings?.whatsapp !== false && user.phone) {
            let phone = user.phone.trim();
            if (!phone.startsWith("+")) {
                if (phone.length === 10) phone = `+91${phone}`;
            }
            await sendWhatsAppAlert(phone, message);
        }

        // Send Email
        if (user.alertSettings?.email !== false && user.email) {
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 10px;">
                    <h1 style="color: white; text-align: center; font-size: 32px;">🎊 GOAL COMPLETED! 🎊</h1>
                    <div style="background: white; padding: 40px; border-radius: 10px; margin-top: 20px;">
                        <h2 style="color: #f5576c; margin-top: 0; text-align: center;">Congratulations, ${user.name}! 🥳</h2>
                        <p style="font-size: 18px; color: #333; text-align: center;">You've successfully achieved your goal:</p>
                        <h3 style="color: #f093fb; text-align: center; font-size: 24px;">"${goal.name}"</h3>
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; margin: 30px 0; color: white; text-align: center;">
                            <p style="margin: 10px 0; font-size: 18px;"><strong>Target Amount:</strong> ₹${goal.targetAmount.toLocaleString()}</p>
                            <p style="margin: 10px 0; font-size: 18px;"><strong>Achieved:</strong> ₹${goal.currentAmount.toLocaleString()}</p>
                            <div style="background: rgba(255,255,255,0.2); height: 20px; border-radius: 10px; margin: 20px 0; overflow: hidden;">
                                <div style="background: #4ade80; height: 100%; width: 100%; border-radius: 10px;"></div>
                            </div>
                            <p style="margin: 10px 0; font-size: 24px; font-weight: bold;">100% Complete! ✨</p>
                        </div>
                        <p style="font-size: 16px; color: #333; margin-top: 20px; text-align: center;">Take a moment to celebrate this achievement! Your dedication and smart financial planning have paid off! 🎉</p>
                    </div>
                </div>
            `;
            await sendEmailAlert(user.email, `🎊 Wealth App: Goal Achieved - "${goal.name}"!`, htmlContent);
        }

        console.log(`🎊 Goal completion notification sent for "${goal.name}"`);
    } catch (error) {
        console.error("❌ Goal Completion Notification Error:", error);
    }
}
