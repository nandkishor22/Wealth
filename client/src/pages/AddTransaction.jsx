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
import { useNavigate, useLocation } from "react-router-dom";
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
    description: z.string().optional(),
});

const AddTransaction = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [accounts, setAccounts] = React.useState([]);
    const { user } = useAuth();

    // Receipt data from navigation state
    const { receiptId, receiptData, receiptUrl } = location.state || {}; // Extract receipt info

    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            date: new Date(),
            type: "expense",
            currency: "INR",
            description: ""
        }
    });

    React.useEffect(() => {
        if (receiptData) {
            if (receiptData.amount) setValue("amount", receiptData.amount);
            if (receiptData.date) setValue("date", new Date(receiptData.date));
            if (receiptData.merchantName) setValue("description", receiptData.merchantName);

            // Map receipt categories to app categories
            const categoryMap = {
                'food & dining': 'Food',
                'groceries': 'Food',
                'transportation': 'Transport',
                'shopping': 'Shopping',
                'healthcare': 'Health',
                'entertainment': 'Entertainment',
                'utilities': 'Bills',
                'education': 'Education',
                'travel': 'Travel',
                'other': 'Other'
            };

            if (receiptData.category) {
                const mappedCategory = categoryMap[receiptData.category.toLowerCase()];
                // Check if the mapped category exists in our options
                const isValidCategory = EXPENSE_CATEGORIES.some(c => c.value === mappedCategory);

                if (isValidCategory) {
                    setValue("category", mappedCategory);
                } else if (EXPENSE_CATEGORIES.some(c => c.value.toLowerCase() === receiptData.category.toLowerCase())) {
                    // Fallback: try direct case-insensitive match
                    const exactMatch = EXPENSE_CATEGORIES.find(c => c.value.toLowerCase() === receiptData.category.toLowerCase());
                    if (exactMatch) setValue("category", exactMatch.value);
                }
            }
        }
    }, [receiptData, setValue]);

    React.useEffect(() => {
        const fetchAccounts = async () => {
            if (!user) return;
            try {
                const { data } = await API.get(`/accounts`);
                setAccounts(data);

                // Set default account if available and not already set manually
                if (!watch("accountId")) {
                    const defaultAcc = data.find(acc => acc.isDefault);
                    if (defaultAcc) {
                        setValue("accountId", defaultAcc._id);
                    } else if (data.length > 0) {
                        // Fallback to first account if no default
                        setValue("accountId", data[0]._id);
                    }
                }

                if (data.length === 0) {
                    navigate("/add-account");
                }
            } catch (e) {
                console.error("Failed to fetch accounts");
            }
        };
        if (user) fetchAccounts();
    }, [user, navigate, setValue, watch]);

    const onSubmit = async (data) => {
        try {
            await API.post("/transactions", {
                ...data,
                description: data.description || data.category, // Use description if available
                receiptId, // Send receipt info
                receiptUrl // Send receipt info
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
                            <label className="block mb-1 text-sm">Description / Merchant</label>
                            <input
                                type="text"
                                {...register("description")}
                                placeholder="What is this transaction for?"
                                className="w-full p-3 rounded-xl bg-white/5 border border-white/20 focus:outline-none focus:border-purple-500 transition-colors"
                            />
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
