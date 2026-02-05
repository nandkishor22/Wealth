import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import Receipt from "../models/Receipt.js";

// POST /accounts
// POST /accounts
export const addAccount = async (req, res) => {
    try {
        const { name, type, currency, initialBalance, isDefault } = req.body;
        const userId = req.user._id;

        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        // Logic:
        // 1. If this is the FIRST account, it MUST be default.
        // 2. If isDefault is true, set others to false.
        // 3. If isDefault is false, but user has other accounts, it's fine.

        const count = await Account.countDocuments({ userId });
        let finalIsDefault = isDefault;

        if (count === 0) {
            finalIsDefault = true; // First account is always default
        } else if (isDefault) {
            // Unset previous default
            await Account.updateMany({ userId }, { isDefault: false });
        }

        const newAccount = await Account.create({
            userId,
            name,
            type,
            currency: currency || 'INR',
            initialBalance: initialBalance || 0,
            isDefault: finalIsDefault
        });

        res.status(201).json(newAccount);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /accounts
export const getAccounts = async (req, res) => {
    try {
        const userId = req.user._id;
        const accounts = await Account.find({ userId });
        res.status(200).json(accounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /accounts/:id
export const getAccountById = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);

        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }

        // Check ownership
        if (account.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }

        res.status(200).json(account);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /accounts/:id
export const updateAccount = async (req, res) => {
    try {
        const { name, type, currency, initialBalance, isDefault } = req.body;
        const account = await Account.findById(req.params.id);

        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }

        // Check ownership
        if (account.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }

        account.name = name || account.name;
        account.type = type || account.type;
        account.currency = currency || account.currency;
        if (initialBalance !== undefined) {
            account.initialBalance = initialBalance;
        }

        if (isDefault !== undefined) {
            if (isDefault) {
                // If setting to true, unset others
                await Account.updateMany({ userId: req.user._id }, { isDefault: false });
                account.isDefault = true;
            } else {
                // If trying to set to false
                if (account.isDefault) {
                    return res.status(400).json({
                        error: "Cannot unset default account directly. Please set another account as default to switch."
                    });
                }
                account.isDefault = false;
            }
        }

        const updatedAccount = await account.save();
        res.status(200).json(updatedAccount);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /accounts/:id
export const deleteAccount = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);

        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }

        // Check ownership
        if (account.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }

        const wasDefault = account.isDefault;

        // Find transactions to clean up receipts
        const transactions = await Transaction.find({ accountId: account._id });
        const transactionIds = transactions.map(t => t._id);

        // Unlink receipts
        if (transactionIds.length > 0) {
            await Receipt.updateMany(
                { transactionId: { $in: transactionIds } },
                {
                    $set: {
                        transactionId: null,
                        status: 'PROCESSED'
                    }
                }
            );
        }

        // Delete associated transactions
        await Transaction.deleteMany({ accountId: account._id });
        await account.deleteOne();

        // If we deleted the default account, assign a new one
        if (wasDefault) {
            const newDefault = await Account.findOne({ userId: req.user._id }); // Find any other account
            if (newDefault) {
                newDefault.isDefault = true;
                await newDefault.save();
            }
        }

        res.status(200).json({ message: "Account deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
