import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import BackButton from "../components/BackButton";

import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

const SetBudget = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [amount, setAmount] = useState("");
    const [currentBudget, setCurrentBudget] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchBudget = async () => {
            try {
                const date = new Date();
                const res = await API.get(`/budgets`, {
                    params: {
                        month: date.getMonth() + 1,
                        year: date.getFullYear(),
                    },
                });
                if (res.data) {
                    setCurrentBudget(res.data.amount);
                    setAmount(res.data.amount);
                }
            } catch (error) {
                console.error("Fetch budget failed", error);
            }
        };
        fetchBudget();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const date = new Date();
            await API.post(`/budgets`, {
                amount: Number(amount),
                month: date.getMonth() + 1,
                year: date.getFullYear(),
            });
            // alert("Budget set successfully!"); // Removed pop-up
            setCurrentBudget(amount);
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            alert("Failed to set budget");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto mt-10">
                <BackButton />
                <Card>
                    <h1 className="text-2xl font-bold mb-2">Monthly Budget</h1>
                    <p className="text-gray-400 mb-6">
                        Set a limit for your monthly expenses. We'll alert you via email if you cross it.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1">Budget Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-3 rounded bg-white/10 border border-white/20 focus:border-purple-500 outline-none text-xl"
                                placeholder="e.g. 50000"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded font-bold transition-all"
                        >
                            {loading ? "Saving..." : "Set Budget"}
                        </button>
                    </form>

                    {currentBudget && (
                        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                            <p className="text-emerald-400 text-sm">Current Active Budget</p>
                            <p className="text-2xl font-bold text-white">₹{Number(currentBudget).toLocaleString()}</p>
                        </div>
                    )}
                </Card>
            </div>
        </Layout>
    );
};

export default SetBudget;
