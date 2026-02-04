import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import BackButton from "../components/BackButton";
import DatePicker from "../components/DatePicker";
import Select from "../components/Select";
import { motion } from "framer-motion";
import { FaTrophy, FaSave } from "react-icons/fa";
import API from "../utils/api";

const AddGoal = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        targetAmount: "",
        currentAmount: "",
        deadline: new Date(),
        category: "Other",
        priority: "Medium",
        accountId: "",
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const { data } = await API.get("/accounts");
            setAccounts(data);
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = {
                ...formData,
                targetAmount: parseFloat(formData.targetAmount),
                currentAmount: formData.currentAmount ? parseFloat(formData.currentAmount) : 0,
                accountId: formData.accountId || undefined,
            };

            await API.post("/goals", submitData);
            navigate("/goals");
        } catch (error) {
            console.error("Error creating goal:", error);
            alert(error.response?.data?.message || "Failed to create goal");
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        "Travel",
        "Emergency",
        "Investment",
        "Education",
        "Home",
        "Vehicle",
        "Wedding",
        "Retirement",
        "Other",
    ];

    const priorities = ["High", "Medium", "Low"];

    return (
        <Layout>
            <div className="min-h-screen p-6 md:p-8">
                <BackButton to="/goals" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="inline-block mb-4"
                        >
                            <FaTrophy className="text-6xl text-yellow-400" />
                        </motion.div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
                            Create Financial Goal
                        </h1>
                        <p className="text-gray-400">Set your target and start your journey to success</p>
                    </div>

                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Goal Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Goal Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Dream Vacation to Bali"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Add some details about your goal..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 resize-none"
                                />
                            </div>

                            {/* Category & Priority */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Category <span className="text-red-400">*</span>
                                    </label>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        options={categories.map((cat) => ({ value: cat, label: cat }))}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Priority <span className="text-red-400">*</span>
                                    </label>
                                    <Select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        options={priorities.map((pri) => ({ value: pri, label: pri }))}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Target & Current Amount */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Target Amount (₹) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="targetAmount"
                                        value={formData.targetAmount}
                                        onChange={handleChange}
                                        placeholder="50000"
                                        min="1"
                                        step="0.01"
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Current Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="currentAmount"
                                        value={formData.currentAmount}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                                    />
                                </div>
                            </div>

                            {/* Deadline */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Deadline <span className="text-red-400">*</span>
                                </label>
                                <DatePicker
                                    selected={formData.deadline}
                                    onChange={(date) => setFormData((prev) => ({ ...prev, deadline: date }))}
                                    minDate={new Date()}
                                    required
                                />
                            </div>

                            {/* Linked Account */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Link to Account (Optional)
                                </label>
                                <Select
                                    name="accountId"
                                    value={formData.accountId}
                                    onChange={handleChange}
                                    options={[
                                        { value: "", label: "No account linked" },
                                        ...accounts.map((acc) => ({
                                            value: acc._id,
                                            label: `${acc.name} (${acc.type})`,
                                        })),
                                    ]}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Link this goal to a specific account for better tracking
                                </p>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span>Creating...</span>
                                ) : (
                                    <>
                                        <FaSave /> Create Goal
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </Card>

                    {/* Tips Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8"
                    >
                        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                            <h3 className="text-lg font-bold text-white mb-3">💡 Goal Setting Tips</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400">✓</span>
                                    <span>Make your goals specific and measurable</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400">✓</span>
                                    <span>Set realistic deadlines based on your income</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400">✓</span>
                                    <span>Link goals to dedicated savings accounts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400">✓</span>
                                    <span>Review and update your progress regularly</span>
                                </li>
                            </ul>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default AddGoal;
