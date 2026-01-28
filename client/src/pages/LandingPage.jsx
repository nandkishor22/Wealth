import React from "react";
import Layout from "../components/Layout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaRobot, FaChartPie, FaMobileAlt } from "react-icons/fa";
import SpotlightCard from "../components/SpotlightCard";
import TechMarquee from "../components/TechMarquee";

const LandingPage = () => {
    const { user } = useAuth();
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { y: 30, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <Layout>
            <motion.div
                initial="hidden"
                animate="show"
                variants={container}
                className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-20 px-4 relative z-10"
            >
                {/* Hero Section */}
                <motion.div variants={item} className="max-w-5xl space-y-8 relative pt-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="inline-block px-4 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold tracking-wide mb-4"
                    >
                        ✨ AI Powered Finance Manager
                    </motion.div>

                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-6xl md:text-8xl font-black tracking-tight"
                    >
                        <span className="text-white">Next Generation </span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-6xl md:text-8xl">
                            Wealth
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Manage your wealth like a pro. Real-time tracking, AI categorization, and premium analytics in one place.
                    </motion.p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="pt-6 flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        {!user ? (
                            <>
                                <Link to="/register">
                                    <button className="px-10 py-4 bg-emerald-500 text-black font-bold text-lg rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:scale-105 transition-all">
                                        Get Started
                                    </button>
                                </Link>
                                <Link to="/login">
                                    <button className="px-10 py-4 bg-white/5 border border-white/10 text-white font-bold text-lg rounded-full backdrop-blur-md hover:bg-white/10 transition-all">
                                        Login
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <Link to="/dashboard">
                                <button className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-lg rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 transition-all">
                                    Go to Dashboard
                                </button>
                            </Link>
                        )}
                    </motion.div>
                </motion.div>

                {/* Spotlight Feature Grid */}
                <motion.div variants={item} className="w-full max-w-7xl px-4 py-20">
                    <h2 className="text-3xl font-bold mb-10 text-white"><span className="text-emerald-400">{"///"}</span> KEY FEATURES</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <SpotlightCard className="h-full bg-black/40 backdrop-blur-xl">
                            <div className="text-center p-10 h-full flex flex-col items-center">
                                <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-purple-500/50">
                                    <FaRobot className="text-4xl text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">AI Intelligence</h3>
                                <p className="text-gray-400 leading-relaxed">Our neural engine automatically categorizes every transaction with 99% accuracy.</p>
                            </div>
                        </SpotlightCard>

                        <SpotlightCard className="h-full bg-black/40 backdrop-blur-xl">
                            <div className="text-center p-10 h-full flex flex-col items-center">
                                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-cyan-500/50">
                                    <FaChartPie className="text-4xl text-cyan-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Deep Analytics</h3>
                                <p className="text-gray-400 leading-relaxed">Visualize your cash flow with stunning interactive charts and trend predictions.</p>
                            </div>
                        </SpotlightCard>

                        <SpotlightCard className="h-full bg-black/40 backdrop-blur-xl">
                            <div className="text-center p-10 h-full flex flex-col items-center">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-emerald-500/50">
                                    <FaMobileAlt className="text-4xl text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Global Sync</h3>
                                <p className="text-gray-400 leading-relaxed">Access your financial data from any device in the world, instantly securely.</p>
                            </div>
                        </SpotlightCard>
                    </div>
                </motion.div>

                {/* Tech Stack Marquee */}
                <div className="w-full pb-20">
                    <h2 className="text-2xl font-bold mb-6 text-gray-500 text-sm tracking-widest uppercase">Powered By Modern Stack</h2>
                    <TechMarquee />
                </div>

            </motion.div>
        </Layout>
    );
};

export default LandingPage;
