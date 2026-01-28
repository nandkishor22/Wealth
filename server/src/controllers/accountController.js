import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

// POST /accounts
export const addAccount = async (req, res) => {
    try {
        const { name, type, currency, initialBalance } = req.body;
        const userId = req.user._id;

        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        const newAccount = await Account.create({
            userId,
            name,
            type,
            currency: currency || 'INR',
            initialBalance: initialBalance || 0
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
        const { name, type, currency, initialBalance } = req.body;
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

        // Delete associated transactions
        await Transaction.deleteMany({ accountId: account._id });
        await account.deleteOne();

        res.status(200).json({ message: "Account deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
