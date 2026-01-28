import React from "react";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Select from "../components/Select";
import { motion } from "framer-motion";
import BackButton from "../components/BackButton";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

const schema = z.object({
    name: z.string().min(2, "Account name is required"),
    type: z.enum(["Bank", "Cash", "Mobile Wallet", "Crypto", "Other"]),
    currency: z.string(),
    initialBalance: z.number().min(0, "Balance cannot be negative"),
});

const AddAccount = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            type: "Bank",
            currency: "INR",
            initialBalance: 0
        }
    });

    const onSubmit = async (data) => {
        if (!user) return;
        try {
            await API.post("/accounts", {
                ...data,
            });
            navigate("/dashboard");
        } catch (error) {
            console.error("Error creating account:", error);
            const msg = error.response?.data?.error || "Failed to create account. Ensure MongoDB is running.";
            alert(msg);
        }
    };

    return (
        <Layout>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto pt-10"
            >
                <BackButton />
                <Card className="overflow-visible">
                    <h2 className="text-2xl font-bold mb-6 text-center text-white">Create Account</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm text-gray-400">Account Name</label>
                            <input
                                {...register("name")}
                                placeholder="e.g. Chase Checking"
                                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors"
                            />
                            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        label="Type"
                                        options={[
                                            { value: "Bank", label: "Bank Account" },
                                            { value: "Cash", label: "Cash (Wallet)" },
                                            { value: "Mobile Wallet", label: "Mobile Wallet" },
                                            { value: "Crypto", label: "Crypto Wallet" },
                                            { value: "Other", label: "Other" }
                                        ]}
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={errors.type?.message}
                                    />
                                )}
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block mb-1 text-sm text-gray-400">Initial Balance</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register("initialBalance", { valueAsNumber: true })}
                                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none"
                                />
                                {errors.initialBalance && <p className="text-red-400 text-sm mt-1">{errors.initialBalance.message}</p>}
                            </div>
                            <div className="w-1/3">
                                <Controller
                                    name="currency"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label="Currency"
                                            options={[
                                                { value: "INR", label: "INR" },
                                                { value: "USD", label: "USD" },
                                                { value: "EUR", label: "EUR" },
                                                { value: "GBP", label: "GBP" },
                                            ]}
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors.currency?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 mt-6 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        >
                            Create Account
                        </button>
                    </form>
                </Card>
            </motion.div>
        </Layout>
    );
};

export default AddAccount;
