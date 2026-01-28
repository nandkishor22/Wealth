import twilio from "twilio";
import Transaction from "../models/Transaction.js";

const MessagingResponse = twilio.twiml.MessagingResponse;

export const handleIncomingMessage = async (req, res) => {
    const { Body, From } = req.body;
    const twiml = new MessagingResponse();

    console.log(`Received message from ${From}: ${Body}`);

    // Regex to match "Spent <amount> on <category>"
    const regex = /Spent (\d+) on (.+)/i;
    const match = Body.match(regex);

    if (match) {
        const amount = parseFloat(match[1]);
        const category = match[2].trim();

        try {
            // In a real app, find user by 'From' (phone number)
            // const user = await User.findOne({ phone: From });

            await Transaction.create({
                amount,
                category,
                description: `WhatsApp Entry`,
                type: "expense",
                date: new Date(),
                // userId: user._id
            });

            twiml.message(`✅ Expense added: ₹${amount} for ${category}.`);
        } catch (error) {
            console.error("Error creating transaction:", error);
            twiml.message("❌ Error saving transaction.");
        }
    } else {
        twiml.message("Please use format: 'Spent <amount> on <category>'");
    }

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
};
