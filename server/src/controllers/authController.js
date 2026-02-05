import User from "../models/User.js";
import Account from "../models/Account.js";
import jwt from "jsonwebtoken";
import { sendWhatsAppAlert } from "../services/whatsappService.js";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret", {
        expiresIn: "30d",
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        const userExists = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (userExists) {
            return res.status(400).json({ error: "User already exists with this email or phone" });
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
        });

        if (user) {
            // Create default account for new user
            await Account.create({
                userId: user._id,
                name: "Cash Wallet",
                type: "CASH",
                currency: "INR",
                initialBalance: 0,
                isDefault: true // Make the first account default
            });

            // Send WhatsApp Welcome Message (Non-blocking)
            const welcomeMsg = `Welcome to Wealth, ${user.name}! 🚀\nYour financial journey begins now.\n\nType 'Help' to see what I can do!`;
            sendWhatsAppAlert(user.phone, welcomeMsg).catch(err => console.error(err));

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ error: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: "User not found" });
    }
};
// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
