import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Loader from "../components/Loader";
import BackButton from "../components/BackButton";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaCalendarAlt, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPlay, FaClock } from "react-icons/fa";
import API from "../utils/api";

const RecurringTransactions = () => {
    const [recurring, setRecurring] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        fetchRecurring();
    }, []);

    const fetchRecurring = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/recurring");
            setRecurring(data);
        } catch (error) {
            console.error("Error fetching recurring transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await API.patch(`/recurring/${id}/toggle`);
            fetchRecurring();
        } catch (error) {
            console.error("Error toggling recurring transaction:", error);
            alert("Failed to toggle recurring transaction");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this recurring transaction?")) return;

        try {
            await API.delete(`/recurring/${id}`);
            fetchRecurring();
        } catch (error) {
            console.error("Error deleting recurring transaction:", error);
            alert("Failed to delete recurring transaction");
        }
    };

    const handleProcess = async (id) => {
        if (!window.confirm("Process this recurring transaction now?")) return;

        try {
            await API.post(`/recurring/${id}/process`);
            alert("Recurring transaction processed successfully!");
            fetchRecurring();
        } catch (error) {
            console.error("Error processing recurring transaction:", error);
            alert("Failed to process recurring transaction");
        }
    };

    const getFilteredRecurring = () => {
        if (filter === "All") return recurring;
        if (filter === "Active") return recurring.filter((r) => r.isActive);
        if (filter === "Inactive") return recurring.filter((r) => !r.isActive);
        return recurring;
    };

    const getIntervalColor = (interval) => {
        switch (interval) {
            case "Daily":
                return "bg-blue-500/20 text-blue-300";
            case "Weekly":
                return "bg-green-500/20 text-green-300";
            case "Monthly":
                return "bg-purple-500/20 text-purple-300";
            case "Yearly":
                return "bg-yellow-500/20 text-yellow-300";
            default:
                return "bg-gray-500/20 text-gray-300";
        }
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

    const filteredRecurring = getFilteredRecurring();

    return (
        <Layout>
            <div className="min-h-screen p-6 md:p-8">
                <BackButton to="/dashboard" />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent">
                            Recurring Transactions
                        </h1>
                        <p className="text-gray-400 mt-2">Manage your automatic bills and income</p>
                    </div>
                    <Link to="/add-recurring">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                        >
                            <FaPlus /> Add Recurring Transaction
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Filter Tabs */}
                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                    {["All", "Active", "Inactive"].map((status) => (
                        <motion.button
                            key={status}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === status
                                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                                }`}
                        >
                            {status}
                        </motion.button>
                    ))}
                </div>

                {/* Recurring Transactions Grid */}
                {filteredRecurring.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                        <FaCalendarAlt className="text-6xl text-gray-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-400 mb-2">No recurring transactions found</h3>
                        <p className="text-gray-500 mb-6">Set up automatic bills and income to save time!</p>
                        <Link to="/add-recurring">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                            >
                                Add Your First Recurring Transaction
                            </motion.button>
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-6">
                        <AnimatePresence>
                            {filteredRecurring.map((item) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    layout
                                >
                                    <Card className={`hover:shadow-xl transition-all duration-300 ${!item.isActive ? "opacity-60" : ""}`}>
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            {/* Left: Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-2xl">{item.type === "Income" ? "💰" : "💸"}</span>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white">{item.description}</h3>
                                                        <p className="text-gray-400 text-sm">{item.category}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getIntervalColor(item.interval)}`}>
                                                        {item.interval}
                                                    </span>
                                                    <span className="text-sm text-gray-400">
                                                        <FaClock className="inline mr-1" />
                                                        Next: {new Date(item.nextDueDate).toLocaleDateString()}
                                                    </span>
                                                    {item.autoExecute && (
                                                        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">Auto</span>
                                                    )}
                                                    {!item.isActive && (
                                                        <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">Inactive</span>
                                                    )}
                                                </div>

                                                {item.endDate && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Ends: {new Date(item.endDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Right: Amount & Actions */}
                                            <div className="flex flex-col items-end gap-3">
                                                <div className="text-right">
                                                    <p className={`text-2xl font-bold ${item.type === "Income" ? "text-green-400" : "text-white"}`}>
                                                        {item.type === "Income" ? "+" : "-"}₹{item.amount.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Executed {item.metadata?.totalExecutions || 0} times
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleProcess(item._id)}
                                                        className="px-3 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-all"
                                                        title="Process Now"
                                                    >
                                                        <FaPlay />
                                                    </motion.button>

                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleToggle(item._id)}
                                                        className={`px-3 py-2 rounded-lg transition-all ${item.isActive
                                                                ? "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
                                                                : "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30"
                                                            }`}
                                                        title={item.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        {item.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                                    </motion.button>

                                                    <Link to={`/edit-recurring/${item._id}`}>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                                                        >
                                                            <FaEdit />
                                                        </motion.button>
                                                    </Link>

                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleDelete(item._id)}
                                                        className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                                                    >
                                                        <FaTrash />
                                                    </motion.button>
                                                </div>
                                            </div>
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

export default RecurringTransactions;
