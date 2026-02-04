import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import BackButton from "../components/BackButton";
import DatePicker from "../components/DatePicker";
import Select from "../components/Select";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import { FaSave, FaCalendarAlt } from "react-icons/fa";
import API from "../utils/api";

const AddRecurringTransaction = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [formData, setFormData] = useState({
        accountId: "",
        type: "Expense",
        amount: "",
        currency: "INR",
        description: "",
        category: "",
        interval: "Monthly",
        startDate: new Date(),
        endDate: null,
        autoExecute: true,
        notifyBeforeDays: 1,
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
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const submitData = {
                ...formData,
                amount: parseFloat(formData.amount),
            };

            await API.post("/recurring", submitData);
            navigate("/recurring");
        } catch (error) {
            console.error("Error creating recurring transaction:", error);
            alert(error.response?.data?.message || "Failed to create recurring transaction");
        } finally {
            setSaving(false);
        }
    };

    const incomeCategories = ["Salary", "Freelance", "Business", "Investment", "Rental", "Gift", "Other"];
    const expenseCategories = [
        "Rent",
        "Utilities",
        "Internet",
        "Phone",
        "Subscriptions",
        "Insurance",
        "Loan EMI",
        "Groceries",
        "Transportation",
        "Other",
    ];

    const intervals = ["Daily", "Weekly", "Monthly", "Yearly"];

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
                <BackButton to="/recurring" />

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="inline-block mb-4"
                        >
                            <FaCalendarAlt className="text-6xl text-blue-400" />
                        </motion.div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent mb-2">
                            Add Recurring Transaction
                        </h1>
                        <p className="text-gray-400">Set up automatic bills or income</p>
                    </div>

                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Description <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="e.g., Netflix Subscription, Monthly Salary"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                                />
                            </div>

                            {/* Type & Amount */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Type <span className="text-red-400">*</span>
                                    </label>
                                    <Select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        options={[
                                            { value: "Income", label: "💰 Income" },
                                            { value: "Expense", label: "💸 Expense" },
                                        ]}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Amount (₹) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        min="1"
                                        step="0.01"
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                                    />
                                </div>
                            </div>

                            {/* Category & Interval */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Category <span className="text-red-400">*</span>
                                    </label>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        options={(formData.type === "Income" ? incomeCategories : expenseCategories).map((cat) => ({
                                            value: cat,
                                            label: cat,
                                        }))}
                                        placeholder="Select category"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Interval <span className="text-red-400">*</span>
                                    </label>
                                    <Select
                                        name="interval"
                                        value={formData.interval}
                                        onChange={handleChange}
                                        options={intervals.map((int) => ({ value: int, label: int }))}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Account */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Account <span className="text-red-400">*</span>
                                </label>
                                <Select
                                    name="accountId"
                                    value={formData.accountId}
                                    onChange={handleChange}
                                    options={accounts.map((acc) => ({
                                        value: acc._id,
                                        label: `${acc.name} (${acc.type})`,
                                    }))}
                                    placeholder="Select account"
                                    required
                                />
                            </div>

                            {/* Start & End Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Start Date <span className="text-red-400">*</span>
                                    </label>
                                    <DatePicker
                                        selected={formData.startDate}
                                        onChange={(date) => setFormData((prev) => ({ ...prev, startDate: date }))}
                                        minDate={new Date()}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">End Date (Optional)</label>
                                    <DatePicker
                                        selected={formData.endDate}
                                        onChange={(date) => setFormData((prev) => ({ ...prev, endDate: date }))}
                                        minDate={formData.startDate || new Date()}
                                        placeholderText="No end date"
                                    />
                                </div>
                            </div>

                            {/* Auto Execute */}
                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-lg">
                                <input
                                    type="checkbox"
                                    name="autoExecute"
                                    checked={formData.autoExecute}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                                />
                                <div>
                                    <label className="text-white font-semibold">Auto Execute</label>
                                    <p className="text-sm text-gray-400">Automatically create transactions on due date</p>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4">
                                <motion.button
                                    type="submit"
                                    disabled={saving}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? <span>Saving...</span> : (
                                        <>
                                            <FaSave /> Save Recurring Transaction
                                        </>
                                    )}
                                </motion.button>

                                <motion.button
                                    type="button"
                                    onClick={() => navigate("/recurring")}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-lg transition-all"
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </form>

                        {/* Info Box */}
                        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <h4 className="text-blue-300 font-semibold mb-2">💡 How It Works</h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li>• Transactions will be created automatically based on your chosen interval</li>
                                <li>• You'll receive reminders before each transaction</li>
                                <li>• Turn off "Auto Execute" if you prefer manual processing</li>
                                <li>• Set an end date if this recurring has a fixed duration</li>
                            </ul>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </Layout>
    );
};

export default AddRecurringTransaction;
