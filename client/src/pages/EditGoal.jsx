import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import BackButton from "../components/BackButton";
import DatePicker from "../components/DatePicker";
import Select from "../components/Select";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import { FaSave, FaEdit } from "react-icons/fa";
import API from "../utils/api";

const EditGoal = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        status: "In Progress",
    });

    const fetchGoal = useCallback(async () => {
        try {
            const { data } = await API.get(`/goals/${id}`);
            setFormData({
                name: data.name,
                description: data.description || "",
                targetAmount: data.targetAmount,
                currentAmount: data.currentAmount,
                deadline: new Date(data.deadline),
                category: data.category,
                priority: data.priority,
                accountId: data.accountId?._id || "",
                status: data.status,
            });
        } catch (error) {
            console.error("Error fetching goal:", error);
            alert("Failed to load goal");
            navigate("/goals");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    const fetchAccounts = async () => {
        try {
            const { data } = await API.get("/accounts");
            setAccounts(data);
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    };

    useEffect(() => {
        fetchGoal();
        fetchAccounts();
    }, [fetchGoal]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const submitData = {
                ...formData,
                targetAmount: parseFloat(formData.targetAmount),
                currentAmount: parseFloat(formData.currentAmount),
                accountId: formData.accountId || undefined,
            };

            await API.put(`/goals/${id}`, submitData);
            navigate(`/goal/${id}`);
        } catch (error) {
            console.error("Error updating goal:", error);
            alert(error.response?.data?.message || "Failed to update goal");
        } finally {
            setSaving(false);
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
    const statuses = ["In Progress", "Completed", "Cancelled"];

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-96">
                    <Loader />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen p-6 md:p-8">
                <BackButton to={`/goal/${id}`} />

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
                            <FaEdit className="text-6xl text-blue-400" />
                        </motion.div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
                            Edit Goal
                        </h1>
                        <p className="text-gray-400">Update your goal details</p>
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
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
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
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 resize-none"
                                />
                            </div>

                            {/* Category, Priority & Status */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Status <span className="text-red-400">*</span>
                                    </label>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        options={statuses.map((status) => ({ value: status, label: status }))}
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
                                        min="1"
                                        step="0.01"
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Current Amount (₹) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="currentAmount"
                                        value={formData.currentAmount}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
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
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4">
                                <motion.button
                                    type="submit"
                                    disabled={saving}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <span>Saving...</span>
                                    ) : (
                                        <>
                                            <FaSave /> Save Changes
                                        </>
                                    )}
                                </motion.button>

                                <motion.button
                                    type="button"
                                    onClick={() => navigate(`/goal/${id}`)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-lg transition-all"
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </Layout>
    );
};

export default EditGoal;
