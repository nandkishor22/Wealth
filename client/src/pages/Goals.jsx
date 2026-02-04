import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Loader from "../components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrophy, FaEdit, FaTrash, FaCheckCircle, FaHourglassHalf, FaBan, FaCoins } from "react-icons/fa";
import API from "../utils/api";

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        fetchGoals();
        fetchStats();
    }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/goals");
            setGoals(data);
        } catch (error) {
            console.error("Error fetching goals:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await API.get("/goals/stats");
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this goal?")) return;

        try {
            await API.delete(`/goals/${id}`);
            fetchGoals();
            fetchStats();
        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    };

    const getFilteredGoals = () => {
        if (filter === "All") return goals;
        return goals.filter((goal) => goal.status === filter);
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return "bg-green-500";
        if (percentage >= 75) return "bg-blue-500";
        if (percentage >= 50) return "bg-yellow-500";
        if (percentage >= 25) return "bg-orange-500";
        return "bg-red-500";
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High":
                return "bg-red-500/20 text-red-300";
            case "Medium":
                return "bg-yellow-500/20 text-yellow-300";
            case "Low":
                return "bg-green-500/20 text-green-300";
            default:
                return "bg-gray-500/20 text-gray-300";
        }
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

    const formatDaysRemaining = (days) => {
        if (days < 0) return <span className="text-red-400">Overdue</span>;
        if (days === 0) return <span className="text-yellow-400">Today!</span>;
        if (days === 1) return <span className="text-yellow-400">1 day</span>;
        if (days <= 7) return <span className="text-orange-400">{days} days</span>;
        if (days <= 30) return <span className="text-blue-400">{days} days</span>;
        const months = Math.floor(days / 30);
        return <span className="text-green-400">{months} month{months > 1 ? 's' : ''}</span>;
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

    const filteredGoals = getFilteredGoals();

    return (
        <Layout>
            <div className="min-h-screen p-6 md:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                            Financial Goals
                        </h1>
                        <p className="text-gray-400 mt-2">Track and achieve your financial dreams</p>
                    </div>
                    <Link to="/add-goal">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                        >
                            <FaPlus /> Add New Goal
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Stats Cards */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                    >
                        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Total Goals</p>
                                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                                </div>
                                <FaTrophy className="text-4xl text-purple-400" />
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">In Progress</p>
                                    <p className="text-3xl font-bold text-white">{stats.inProgress}</p>
                                </div>
                                <FaHourglassHalf className="text-4xl text-blue-400" />
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Completed</p>
                                    <p className="text-3xl font-bold text-white">{stats.completed}</p>
                                </div>
                                <FaCheckCircle className="text-4xl text-green-400" />
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Avg Progress</p>
                                    <p className="text-3xl font-bold text-white">{stats.averageProgress.toFixed(1)}%</p>
                                </div>
                                <FaCoins className="text-4xl text-yellow-400" />
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Filter Tabs */}
                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                    {["All", "In Progress", "Completed", "Cancelled"].map((status) => (
                        <motion.button
                            key={status}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === status
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                                }`}
                        >
                            {status}
                        </motion.button>
                    ))}
                </div>

                {/* Goals Grid */}
                {filteredGoals.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <FaTrophy className="text-6xl text-gray-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-400 mb-2">No goals found</h3>
                        <p className="text-gray-500 mb-6">Start your journey by creating your first financial goal!</p>
                        <Link to="/add-goal">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                            >
                                Create Your First Goal
                            </motion.button>
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        <AnimatePresence>
                            {filteredGoals.map((goal) => (
                                <motion.div
                                    key={goal._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    layout
                                >
                                    <Card className="hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                                        {/* Goal Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-4xl">{getCategoryIcon(goal.category)}</span>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{goal.name}</h3>
                                                    <p className="text-gray-400 text-sm">{goal.category}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(goal.priority)}`}>
                                                {goal.priority}
                                            </span>
                                        </div>

                                        {goal.description && (
                                            <p className="text-gray-400 text-sm mb-4">{goal.description}</p>
                                        )}

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-400">Progress</span>
                                                <span className="text-sm font-semibold text-white">
                                                    {goal.progressPercentage.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                                                    transition={{ duration: 1, delay: 0.2 }}
                                                    className={`h-full ${getProgressColor(goal.progressPercentage)} rounded-full`}
                                                />
                                            </div>
                                        </div>

                                        {/* Amount Info */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <p className="text-xs text-gray-400 mb-1">Current</p>
                                                <p className="text-lg font-bold text-green-400">
                                                    ₹{goal.currentAmount.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <p className="text-xs text-gray-400 mb-1">Target</p>
                                                <p className="text-lg font-bold text-purple-400">
                                                    ₹{goal.targetAmount.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Deadline & Status */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-xs text-gray-400">Deadline</p>
                                                <p className="text-sm font-semibold text-white">
                                                    {new Date(goal.deadline).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400">Time Left</p>
                                                <p className="text-sm font-semibold">
                                                    {formatDaysRemaining(goal.daysRemaining)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Link to={`/goal/${goal._id}`} className="flex-1">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                                                >
                                                    <FaCoins /> Contribute
                                                </motion.button>
                                            </Link>
                                            <Link to={`/edit-goal/${goal._id}`}>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                                                >
                                                    <FaEdit />
                                                </motion.button>
                                            </Link>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleDelete(goal._id)}
                                                className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                                            >
                                                <FaTrash />
                                            </motion.button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </Layout>
    );
};

export default Goals;
