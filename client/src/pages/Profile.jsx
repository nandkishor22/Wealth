import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import BackButton from "../components/BackButton";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });
    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                password: "",
                confirmPassword: ""
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: "", message: "" });

        if (formData.password && formData.password !== formData.confirmPassword) {
            return setStatus({ type: "error", message: "Passwords do not match" });
        }

        setLoading(true);
        const updateData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
        };
        if (formData.password) updateData.password = formData.password;

        const result = await updateProfile(updateData);
        setLoading(false);

        if (result.success) {
            setStatus({ type: "success", message: "Profile updated successfully!" });
            setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
        } else {
            setStatus({ type: "error", message: result.error });
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto pt-10 px-4 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <BackButton />
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-black text-2xl font-black shadow-lg shadow-emerald-500/20">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Your Profile</h1>
                            <p className="text-gray-400">Manage your personal information and security</p>
                        </div>
                    </div>

                    <Card className="overflow-visible">
                        {status.message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${status.type === "success"
                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                                    }`}
                            >
                                {status.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
                                <span className="text-sm font-medium">{status.message}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                        <FaUser className="text-xs" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 transition-all text-white"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                        <FaEnvelope className="text-xs" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 transition-all text-white"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                    <FaPhone className="text-xs" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 transition-all text-white"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FaLock className="text-emerald-500" /> Change Password
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">Leave blank if you don't want to change it</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 transition-all text-white"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 transition-all text-white"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 mt-4"
                            >
                                {loading ? "Updating Profile..." : "Save Changes"}
                            </button>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </Layout>
    );
};

export default Profile;
