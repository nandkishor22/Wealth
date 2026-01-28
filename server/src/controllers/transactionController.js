import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import { checkBudgetExceeded } from "../services/budgetService.js";

// POST /transactions
export const addTransaction = async (req, res) => {
  try {
    const {
      accountId, type, amount, currency,
      category, description, date,
      isRecurring, recurringInterval, status, receiptUrl
    } = req.body;
    const userId = req.user._id;

    if (!type || !amount || !date || !accountId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify account ownership
    const account = await Account.findById(accountId);
    if (!account || account.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized account" });
    }

    // 1. Create Transaction
    const newTx = await Transaction.create({
      userId,
      accountId,
      type,
      amount,
      currency: currency || 'INR',
      category,
      description,
      date,
      isRecurring,
      recurringInterval,
      status: status || 'COMPLETED',
      receiptUrl
    });

    // 2. Update Account Balance
    if (type.toLowerCase() === "income") {
      account.initialBalance += amount;
    } else {
      account.initialBalance -= amount;
      // Check budget if expense
      checkBudgetExceeded(userId, amount, date);
    }
    await account.save();

    res.status(201).json(newTx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /transactions?accountId=...&month=...&year=...
export const getTransactions = async (req, res) => {
  try {
    const { accountId, month, year } = req.query;
    const userId = req.user._id;
    const query = { userId };

    if (accountId) query.accountId = accountId;

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /transactions/:id
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    const oldTx = await Transaction.findById(id);

    if (!oldTx) return res.status(404).json({ error: "Transaction not found" });

    // Verify ownership
    if (oldTx.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // If amount or type changed, revert old balance and apply new
    if (updates.amount !== undefined || updates.type !== undefined) {
      const account = await Account.findById(oldTx.accountId);
      if (account) {
        // Revert old effect
        if (oldTx.type.toLowerCase() === "income") {
          account.initialBalance -= oldTx.amount;
        } else {
          account.initialBalance += oldTx.amount;
        }

        // Apply new effect (use new val if provided, else old)
        const newAmount = updates.amount !== undefined ? updates.amount : oldTx.amount;
        const newType = updates.type !== undefined ? updates.type : oldTx.type;

        if (newType.toLowerCase() === "income") {
          account.initialBalance += newAmount;
        } else {
          account.initialBalance -= newAmount;
        }
        await account.save();
      }
    }

    const updatedTx = await Transaction.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json(updatedTx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /transactions/:id
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    // Verify ownership
    if (tx.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Reverse Balance
    const account = await Account.findById(tx.accountId);
    if (account) {
      if (tx.type.toLowerCase() === "income") {
        account.initialBalance -= tx.amount;
      } else {
        account.initialBalance += tx.amount;
      }
      await account.save();
    }

    await tx.deleteOne();
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
