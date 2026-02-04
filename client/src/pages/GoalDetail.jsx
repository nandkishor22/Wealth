import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import BackButton from "../components/BackButton";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import { FaTrophy, FaCoins, FaEdit, FaTrash, FaCheckCircle, FaClock, FaCalendar } from "react-icons/fa";
import API from "../utils/api";

const GoalDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [goal, setGoal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contributionAmount, setContributionAmount] = useState("");
    const [contributing, setContributing] = useState(false);

    const fetchGoal = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get(`/goals/${id}`);
            setGoal(data);
        } catch (error) {
            console.error("Error fetching goal:", error);
            alert("Failed to load goal");
            navigate("/goals");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchGoal();
    }, [fetchGoal]);

    const handleContribute = async (e) => {
        e.preventDefault();
        if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        setContributing(true);
        try {
            await API.post(`/goals/${id}/contribute`, {
                amount: parseFloat(contributionAmount),
            });
            setContributionAmount("");
            fetchGoal();
        } catch (error) {
            console.error("Error contributing:", error);
            alert(error.response?.data?.message || "Failed to contribute");
        } finally {
            setContributing(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this goal?")) return;

        try {
            await API.delete(`/goals/${id}`);
            navigate("/goals");
        } catch (error) {
            console.error("Error deleting goal:", error);
            alert("Failed to delete goal");
        }
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return "from-green-500 to-emerald-500";
        if (percentage >= 75) return "from-blue-500 to-cyan-500";
        if (percentage >= 50) return "from-yellow-500 to-orange-500";
        if (percentage >= 25) return "from-orange-500 to-red-500";
        return "from-red-500 to-pink-500";
    };

    const getCategoryIcon = (category) => {
        const icons = {
            Travel: "✈️",
            Emergency: "🚨",
            Investment: "📈",
            Education: "🎓",
            Home: "🏠",
            Vehicle: "🚗",
            Wedding: "💍",
            Retirement: "🏖️",
            Other: "🎯",
        };
        return icons[category] || "🎯";
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-96">
                    <Loader />
                </div>
            </Layout>
        );
    }

    if (!goal) return null;

    const isCompleted = goal.status === "Completed";
    const dayProgress = goal.daysRemaining;

    return (
        <Layout>
            <div className="min-h-screen p-6 md:p-8">
                <BackButton to="/goals" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header Card */}
                    <Card className="mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <motion.span
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    className="text-6xl"
                                >
                                    {getCategoryIcon(goal.category)}
                                </motion.span>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{goal.name}</h1>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm font-semibold">
                                            {goal.category}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${goal.priority === "High"
                                                ? "bg-red-500/30 text-red-200"
                                                : goal.priority === "Medium"
                                                    ? "bg-yellow-500/30 text-yellow-200"
                                                    : "bg-green-500/30 text-green-200"
                                                }`}
                                        >
                                            {goal.priority} Priority
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${goal.status === "Completed"
                                                ? "bg-green-500/30 text-green-200"
                                                : goal.status === "In Progress"
                                                    ? "bg-blue-500/30 text-blue-200"
                                                    : "bg-gray-500/30 text-gray-200"
                                                }`}
                                        >
                                            {goal.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {!isCompleted && (
                                    <Link to={`/edit-goal/${goal._id}`}>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="p-3 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                                        >
                                            <FaEdit className="text-xl" />
                                        </motion.button>
                                    </Link>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDelete}
                                    className="p-3 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                                >
                                    <FaTrash className="text-xl" />
                                </motion.button>
                            </div>
                        </div>

                        {goal.description && <p className="text-gray-300 mb-6">{goal.description}</p>}

                        {/* Progress Section */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-gray-300 font-semibold">Overall Progress</span>
                                <span className="text-2xl font-bold text-white">{goal.progressPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="h-6 bg-gray-700/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className={`h-full bg-gradient-to-r ${getProgressColor(goal.progressPercentage)} rounded-full`}
                                />
                            </div>
                        </div>

                        {/* Amount Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                <p className="text-sm text-gray-400 mb-1">Current Amount</p>
                                <p className="text-2xl font-bold text-green-400">₹{goal.currentAmount.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                <p className="text-sm text-gray-400 mb-1">Target Amount</p>
                                <p className="text-2xl font-bold text-purple-400">₹{goal.targetAmount.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                <p className="text-sm text-gray-400 mb-1">Remaining</p>
                                <p className="text-2xl font-bold text-orange-400">₹{goal.remainingAmount.toLocaleString()}</p>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Contribution Form */}
                        <div className="lg:col-span-2">
                            {!isCompleted && (
                                <Card className="mb-6">
                                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                        <FaCoins className="text-yellow-400" /> Contribute to Goal
                                    </h2>
                                    <form onSubmit={handleContribute} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                Contribution Amount (₹)
                                            </label>
                                            <input
                                                type="number"
                                                value={contributionAmount}
                                                onChange={(e) => setContributionAmount(e.target.value)}
                                                placeholder="Enter amount"
                                                min="0.01"
                                                step="0.01"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                                            />
                                        </div>

                                        {/* Quick Amounts */}
                                        <div className="flex flex-wrap gap-2">
                                            {[500, 1000, 5000, 10000].map((amount) => (
                                                <motion.button
                                                    key={amount}
                                                    type="button"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setContributionAmount(amount.toString())}
                                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-semibold text-gray-300 transition-all"
                                                >
                                                    +₹{amount.toLocaleString()}
                                                </motion.button>
                                            ))}
                                        </div>

                                        <motion.button
                                            type="submit"
                                            disabled={contributing}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
                                        >
                                            {contributing ? "Processing..." : "Add Contribution"}
                                        </motion.button>
                                    </form>
                                </Card>
                            )}

                            {isCompleted && (
                                <Card className="mb-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
                                    <div className="text-center py-8">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200 }}
                                        >
                                            <FaTrophy className="text-8xl text-yellow-400 mx-auto mb-4" />
                                        </motion.div>
                                        <h2 className="text-3xl font-bold text-white mb-2">🎉 Goal Completed!</h2>
                                        <p className="text-gray-300">
                                            Congratulations! You've achieved your goal on{" "}
                                            {new Date(goal.completedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Card>
                            )}

                            {/* Milestones */}
                            {goal.milestones && goal.milestones.length > 0 && (
                                <Card>
                                    <h2 className="text-2xl font-bold text-white mb-4">🎯 Milestones</h2>
                                    <div className="space-y-3">
                                        {goal.milestones.map((milestone, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className={`flex items-center justify-between p-4 rounded-lg ${milestone.reached ? "bg-green-500/20" : "bg-white/5"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FaCheckCircle
                                                        className={`text-2xl ${milestone.reached ? "text-green-400" : "text-gray-600"
                                                            }`}
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-white">{milestone.percentage}% Milestone</p>
                                                        {milestone.reached && milestone.reachedAt && (
                                                            <p className="text-sm text-gray-400">
                                                                Reached on {new Date(milestone.reachedAt).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-lg font-bold text-gray-300">
                                                    ₹{((goal.targetAmount * milestone.percentage) / 100).toLocaleString()}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Details */}
                        <div>
                            <Card className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-4">📅 Timeline</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <FaCalendar className="text-purple-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-400">Deadline</p>
                                            <p className="font-semibold text-white">
                                                {new Date(goal.deadline).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <FaClock className="text-blue-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-400">Days Remaining</p>
                                            <p
                                                className={`font-semibold ${dayProgress < 0
                                                    ? "text-red-400"
                                                    : dayProgress <= 7
                                                        ? "text-orange-400"
                                                        : "text-green-400"
                                                    }`}
                                            >
                                                {dayProgress < 0 ? "Overdue" : `${dayProgress} days`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {goal.accountId && (
                                <Card>
                                    <h3 className="text-xl font-bold text-white mb-4">💳 Linked Account</h3>
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <p className="font-semibold text-white">{goal.accountId.name}</p>
                                        <p className="text-sm text-gray-400">{goal.accountId.type}</p>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default GoalDetail;
