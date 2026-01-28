import React from "react";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Select from "../components/Select";
import DatePicker from "../components/DatePicker";
import { motion } from "framer-motion";
import BackButton from "../components/BackButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../constants/categories";

const schema = z.object({
    amount: z.number().min(1, "Amount must be at least 1"),
    currency: z.string().min(3, "Currency code required"),
    date: z.date({ invalid_type_error: "Invalid date" }),
    type: z.enum(["income", "expense"]),
    category: z.string().min(2, "Category is required"),
    accountId: z.string().min(1, "Account is required"),

});

const AddTransaction = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = React.useState([]);
    const { user } = useAuth();

    const {
        register,
        handleSubmit,
        watch,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            date: new Date(),
            type: "expense",
            currency: "INR"
        }
    });

    React.useEffect(() => {
        const fetchAccounts = async () => {
            if (!user) return;
            try {
                const { data } = await API.get(`/accounts`);
                setAccounts(data);
                if (data.length === 0) {
                    navigate("/add-account");
                }
            } catch (e) {
                console.error("Failed to fetch accounts");
            }
        };
        if (user) fetchAccounts();
    }, [user, navigate]);

    const onSubmit = async (data) => {
        try {
            await API.post("/transactions", {
                ...data,
                description: data.category, // Category becomes the title
            });
            navigate("/dashboard");
        } catch (error) {
            console.error("Error adding transaction:", error);
            alert("Failed to add transaction");
        }
    };

    return (
        <Layout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md mx-auto"
            >
                <BackButton />
                <Card className="overflow-visible">
                    <h2 className="text-2xl font-bold mb-6 text-center">Add Transaction</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Controller
                                name="accountId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        label="Account"
                                        options={accounts.map(acc => ({ value: acc._id, label: `${acc.name} (${acc.currency})` }))}
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={errors.accountId?.message}
                                        placeholder="Select Account"
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        label="Type"
                                        options={[
                                            { value: "expense", label: "Expense" },
                                            { value: "income", label: "Income" }
                                        ]}
                                        value={field.value}
                                        onChange={(val) => {
                                            field.onChange(val);
                                            // Reset category when type changes
                                            // Optional: setValue('category', '');
                                        }}
                                        error={errors.type?.message}
                                    />
                                )}
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block mb-1 text-sm">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register("amount", { valueAsNumber: true })}
                                    className="w-full p-3 rounded-xl bg-white/5 border border-white/20 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                                {errors.amount && <p className="text-red-400 text-sm">{errors.amount.message}</p>}
                            </div>
                            <div className="w-1/3">
                                <Controller
                                    name="currency"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label="Currency"
                                            options={[
                                                { value: "INR", label: "INR (₹)" },
                                                { value: "USD", label: "USD ($)" },
                                                { value: "EUR", label: "EUR (€)" },
                                                { value: "GBP", label: "GBP (£)" },
                                                { value: "JPY", label: "JPY (¥)" }
                                            ]}
                                            value={field.value || "INR"}
                                            onChange={field.onChange}
                                            error={errors.currency?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>



                        <div>
                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        label="Category"
                                        options={watch("type") === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES}
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={errors.category?.message}
                                        placeholder="Select Category"
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="date"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Transaction Date"
                                        selected={field.value ? new Date(field.value) : new Date()}
                                        onChange={(date) => field.onChange(date)}
                                        error={errors.date?.message}
                                    />
                                )}
                            />
                        </div>



                        <button
                            type="submit"
                            className="w-full p-3 mt-4 bg-purple-600 rounded hover:bg-purple-700 font-bold transition-colors"
                        >
                            Add Transaction
                        </button>
                    </form>
                </Card>
            </motion.div>
        </Layout >
    );
};

export default AddTransaction;
