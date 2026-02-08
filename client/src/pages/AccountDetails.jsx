import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Loader from "../components/Loader";
import BackButton from "../components/BackButton";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaTrash, FaEdit, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

const AccountDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Transaction States
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [deletingTransaction, setDeletingTransaction] = useState(null);
    const [editForm, setEditForm] = useState({ amount: "", description: "", type: "expense" });

    // Account States
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [accountEditForm, setAccountEditForm] = useState({ name: "", type: "", currency: "INR", initialBalance: 0 });

    const [currentDate] = useState(new Date());

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Account Info
            const accRes = await API.get(`/accounts/${id}`);
            setAccount(accRes.data);
            setAccountEditForm({
                name: accRes.data.name,
                type: accRes.data.type,
                currency: accRes.data.currency,
                initialBalance: accRes.data.initialBalance
            });

            // Fetch Transactions for current month
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const txnRes = await API.get(`/transactions?accountId=${id}&month=${month}&year=${year}`);
            setTransactions(txnRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && id) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, id, currentDate]);

    const handleAccountUpdate = async () => {
        try {
            await API.put(`/accounts/${id}`, {
                ...accountEditForm,
                initialBalance: Number(accountEditForm.initialBalance)
            });
            setIsEditingAccount(false);
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Account update failed", error);
            alert("Failed to update account");
        }
    };

    const handleAccountDelete = async () => {
        try {
            await API.delete(`/accounts/${id}`);
            navigate("/dashboard");
        } catch (error) {
            console.error("Account delete failed", error);
            alert("Failed to delete account");
        }
    };

    const handleEditClick = (tx) => {
        setEditForm({
            amount: tx.amount,
            description: tx.description,
            type: tx.type.toLowerCase()
        });
        setEditingTransaction(tx);
    };

    const handleUpdate = async () => {
        if (!editingTransaction) return;
        try {
            await API.put(`/transactions/${editingTransaction._id}`, {
                ...editForm,
                amount: Number(editForm.amount)
            });
            setEditingTransaction(null);
            fetchData();
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update");
        }
    };

    const confirmDelete = async () => {
        if (!deletingTransaction) return;
        try {
            await API.delete(`/transactions/${deletingTransaction}`);
            setDeletingTransaction(null);
            fetchData();
        } catch (e) {
            alert("Failed to delete");
        }
    };

    // Calculate Chart Data (Group by Day)
    const chartData = React.useMemo(() => {
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const data = Array.from({ length: daysInMonth }, (_, i) => ({
            name: (i + 1).toString(),
            Income: 0,
            Expense: 0
        }));

        transactions.forEach(t => {
            const day = new Date(t.date).getDate();
            if (t.type.toLowerCase() === 'income') {
                data[day - 1].Income += t.amount;
            } else {
                data[day - 1].Expense += t.amount;
            }
        });

        return data;
    }, [transactions, currentDate]);

    if (loading) return <Layout><Loader /></Layout>;
    if (!account) return <Layout><div className="text-center p-10">Account not found</div></Layout>;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <BackButton />

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditingAccount(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                        >
                            <FaEdit /> Edit Account
                        </button>
                        <button
                            onClick={() => setIsDeletingAccount(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                        >
                            <FaTrash /> Delete Account
                        </button>
                    </div>
                </div>

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{account.name} Analysis</h1>
                        <p className="text-gray-400">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Current Balance</p>
                        <h2 className="text-4xl font-bold text-emerald-400">
                            {account.currency === 'INR' ? '₹' : '$'}
                            {account.initialBalance.toLocaleString()}
                        </h2>
                    </div>
                </div>

                {/* Analysis Chart */}
                <Card>
                    <h3 className="text-xl font-bold mb-4">Daily Activity</h3>
                    <div style={{ width: "100%", height: 320, minHeight: 320, minWidth: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 10 }} interval={2} />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Transactions List */}
                <Card>
                    <h3 className="text-xl font-bold mb-4">Transactions History</h3>
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No transactions this month.</p>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx._id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${tx.type.toLowerCase() === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {tx.category[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{tx.description}</p>
                                            <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()} • {tx.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`font-bold text-lg ${tx.type.toLowerCase() === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {tx.type.toLowerCase() === 'income' ? '+' : '-'} {account.currency === 'INR' ? '₹' : '$'}{tx.amount}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditClick(tx)}
                                                className="p-2 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => setDeletingTransaction(tx._id)}
                                                className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {/* Account Edit Modal */}
            <AnimatePresence>
                {isEditingAccount && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-gray-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative"
                        >
                            <h2 className="text-xl font-bold mb-4">Edit Account</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400">Account Name</label>
                                    <input
                                        type="text"
                                        value={accountEditForm.name}
                                        onChange={(e) => setAccountEditForm({ ...accountEditForm, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded p-2 text-white mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Type</label>
                                    <div className="relative">
                                        <select
                                            value={accountEditForm.type}
                                            onChange={(e) => setAccountEditForm({ ...accountEditForm, type: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded p-2 pr-8 text-white mt-1 appearance-none cursor-pointer"
                                        >
                                            <option value="Bank" className="text-black">Bank Account</option>
                                            <option value="Cash" className="text-black">Cash (Wallet)</option>
                                            <option value="Mobile Wallet" className="text-black">Mobile Wallet</option>
                                            <option value="Crypto" className="text-black">Crypto Wallet</option>
                                            <option value="Other" className="text-black">Other</option>
                                        </select>
                                        <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Balance</label>
                                    <input
                                        type="number"
                                        value={accountEditForm.initialBalance}
                                        onChange={(e) => setAccountEditForm({ ...accountEditForm, initialBalance: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded p-2 text-white mt-1"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setIsEditingAccount(false)}
                                    className="flex-1 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAccountUpdate}
                                    className="flex-1 py-2 rounded bg-purple-600 hover:bg-purple-700 font-bold transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Account Delete Modal */}
            <AnimatePresence>
                {isDeletingAccount && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-gray-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center"
                        >
                            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaTrash size={24} />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Delete Account?</h2>
                            <p className="text-gray-400 mb-6">Type: <strong>{account.name}</strong><br />All associated transactions will also be permanently deleted. This cannot be undone.</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDeletingAccount(false)}
                                    className="flex-1 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAccountDelete}
                                    className="flex-1 py-2 rounded bg-red-600 hover:bg-red-700 font-bold transition-colors"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Transaction Modal */}
            <AnimatePresence>
                {editingTransaction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-gray-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative"
                        >
                            <h2 className="text-xl font-bold mb-4">Edit Transaction</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400">Amount</label>
                                    <input
                                        type="number"
                                        value={editForm.amount}
                                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded p-2 text-white mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Description</label>
                                    <input
                                        type="text"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded p-2 text-white mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Type</label>
                                    <div className="relative">
                                        <select
                                            value={editForm.type}
                                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded p-2 pr-8 text-white mt-1 appearance-none cursor-pointer"
                                        >
                                            <option value="income" className="text-black">Income</option>
                                            <option value="expense" className="text-black">Expense</option>
                                        </select>
                                        <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setEditingTransaction(null)}
                                    className="flex-1 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="flex-1 py-2 rounded bg-purple-600 hover:bg-purple-700 font-bold transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Transaction Modal */}
            <AnimatePresence>
                {deletingTransaction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-gray-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center"
                        >
                            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaTrash size={24} />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Delete Transaction?</h2>
                            <p className="text-gray-400 mb-6">This action cannot be undone. The amount will be reversed from your account balance.</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingTransaction(null)}
                                    className="flex-1 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-2 rounded bg-red-600 hover:bg-red-700 font-bold transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default AccountDetails;
