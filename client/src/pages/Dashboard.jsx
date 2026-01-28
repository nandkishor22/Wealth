import React, { useEffect, useState } from "react";
import Loader from "../components/Loader"; // ADDED IMPORT
import Layout from "../components/Layout";
import Chart from "../components/Chart";
import Card from "../components/Card";
import { motion, AnimatePresence } from "framer-motion";

import { Link } from "react-router-dom";
import { FaArrowUp, FaArrowDown, FaWallet, FaRobot } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [aiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchAccounts();
      fetchBudget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchBudget = async () => {
    try {
      const date = new Date();
      const res = await API.get(`/budgets`, {
        params: {
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
      });
      if (res.data && res.data.amount) {
        setCurrentBudget(res.data.amount);
      }
    } catch (error) {
      console.error("Error fetching budget:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const { data } = await API.get(`/accounts`);
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data } = await API.get(`/transactions`);
      setTransactions(data);

      // Calculate current month's expense for budget logic
      const now = new Date();
      const currentMonthExpenses = data.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear() &&
          t.type.toLowerCase() === 'expense';
      }).reduce((acc, curr) => acc + curr.amount, 0);

      setMonthlyExpense(currentMonthExpenses);

    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTimeout(() => setLoading(false), 2000); // Demo delay
    }
  };




  const calculateChartData = () => {
    const data = {};
    transactions.forEach((t) => {
      if (t.type.toLowerCase() === "expense") {
        data[t.category] = (data[t.category] || 0) + t.amount;
      }
    });
    return Object.keys(data).map((key) => ({ name: key, value: data[key] }));
  };

  const totalIncome = transactions.filter(t => t.type.toLowerCase() === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type.toLowerCase() === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6 md:space-y-8"
      >
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <motion.h1
              className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              Dashboard
            </motion.h1>
            <p className="text-gray-400 mt-2 text-base md:text-lg">Your financial health at a glance.</p>

            {/* Budget Progress Bar */}
            {currentBudget && (
              <div className="mt-6 w-full max-w-md">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Monthly Budget</span>
                  <span className={`${monthlyExpense > currentBudget ? "text-red-400 font-bold" : "text-gray-400"}`}>
                    {Math.round((monthlyExpense / currentBudget) * 100)}% Used
                  </span>
                </div>
                <div className="h-4 bg-gray-700/50 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((monthlyExpense / currentBudget) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${monthlyExpense > currentBudget ? "bg-red-500" :
                      monthlyExpense > currentBudget * 0.8 ? "bg-yellow-500" : "bg-emerald-500"
                      }`}
                  />
                </div>
                <div className="flex justify-between text-xs mt-2 text-gray-500">
                  <span>Spent: ₹{monthlyExpense.toLocaleString()}</span>
                  <span>Limit: ₹{currentBudget.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          <Link to="/add">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-purple-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-xl shadow-purple-900/20 flex items-center justify-center md:justify-start gap-2 w-full md:w-auto"
            >
              <span>+</span> New Transaction
            </motion.button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-900/10 border-green-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                <FaArrowUp size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider">Total Income</p>
                <h3 className="text-2xl font-bold text-white">₹{totalIncome.toLocaleString()}</h3>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-900/10 border-red-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-lg text-red-400">
                <FaArrowDown size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider">Total Expense</p>
                <h3 className="text-2xl font-bold text-white">₹{totalExpense.toLocaleString()}</h3>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-blue-900/10 border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                <FaWallet size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider">Total Balance</p>
                <h3 className="text-2xl font-bold text-white">₹{balance.toLocaleString()}</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Charts */}
          <motion.div variants={item}>
            <Card className="h-full">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-purple-500 rounded-full" />
                Spending Breakdown
              </h2>
              {transactions.length > 0 ? (
                <Chart data={calculateChartData()} />
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                  <p>No enough data to display chart.</p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={item}>
            <Card className="h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="w-2 h-8 bg-indigo-500 rounded-full" />
                  Recent Transactions
                </h2>
                <span className="text-xs text-purple-300 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">Last 5</span>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {transactions.slice(0, 5).map((t, index) => {
                    const currencyMap = {
                      'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥'
                    };
                    const symbol = currencyMap[t.currency] || t.currency || '₹';
                    const isIncome = t.type.toLowerCase() === 'income';

                    return (
                      <motion.div
                        key={t._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                        className="flex justify-between items-center p-3 rounded-xl border border-white/5 transition-colors cursor-default gap-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg ${isIncome ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {isIncome ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-200 truncate pr-2">{t.description}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                              <span>{new Date(t.date).toLocaleDateString()}</span>
                              <span className="hidden sm:inline-block w-1 h-1 bg-gray-500 rounded-full" />
                              <span className="text-gray-500">{t.category}</span>
                              <span className="hidden sm:inline-block w-1 h-1 bg-gray-500 rounded-full" />
                              <span className="text-gray-500 uppercase text-[10px] tracking-wide border border-gray-600 px-1 rounded">{t.currency || 'INR'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-bold text-lg ${isIncome ? "text-green-400" : "text-gray-200"}`}>
                            {isIncome ? "+" : "-"}{symbol}{t.amount}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                {transactions.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No recent transactions.</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions & Accounts */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/budget">
            <Card className="h-full hover:bg-white/5 transition-colors cursor-pointer border-dashed border-2 border-white/10 flex flex-col items-center justify-center p-8 group min-h-[180px]">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaWallet size={20} />
              </div>
              <h3 className="font-bold text-white">Set Budget</h3>
              <p className="text-sm text-gray-500 mt-1">Manage Limits</p>
            </Card>
          </Link>

          <Link to="/add-account">
            <Card className="h-full hover:bg-white/5 transition-colors cursor-pointer border-dashed border-2 border-white/10 flex flex-col items-center justify-center p-8 group min-h-[180px]">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaWallet size={20} />
              </div>
              <h3 className="font-bold text-white">Add New Account</h3>
              <p className="text-sm text-gray-500 mt-1">Bank, Cash, or Crypto</p>
            </Card>
          </Link>

          {accounts.map((acc) => (
            <Link to={`/account/${acc._id}`} key={acc._id}>
              <Card className="h-full bg-white/5 border-white/10 hover:border-purple-500/50 transition-colors group relative overflow-hidden min-h-[180px] flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-[50px] transition-all group-hover:bg-purple-500/20" />

                <div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-gray-800 rounded-lg text-white shadow-lg">
                      <FaWallet />
                    </div>
                    <span className="text-xs font-mono text-gray-400 border border-gray-700 px-2 py-0.5 rounded uppercase bg-black/50">{acc.currency}</span>
                  </div>

                  <h3 className="text-gray-400 text-sm font-medium mb-1">{acc.name}</h3>
                  <p className="text-2xl font-bold text-white tracking-tight">
                    {acc.currency === 'INR' ? '₹' : acc.currency === 'USD' ? '$' : acc.currency === 'EUR' ? '€' : acc.currency}
                    {acc.initialBalance.toLocaleString()}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-gray-500">
                  <span className="uppercase tracking-wider">{acc.type}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    Active <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </motion.div>

        {/* AI Insights Panel (Optional Demo) */}
        {aiInsights && (
          <motion.div variants={item}>
            <Card className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-500/30">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500 rounded-full text-white shadow-lg shadow-purple-500/40">
                  <FaRobot size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">AI Financial Insights</h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{aiInsights}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
