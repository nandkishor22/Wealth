import twilio from "twilio";
let client;

const getTwilioClient = () => {
    if (!client) {
        client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    return client;
};

export const sendWhatsAppAlert = async (toPhone, message) => {
    try {
        const twilioClient = getTwilioClient();
        console.log(`Debug: Twilio SID prefix: ${process.env.TWILIO_SID?.substring(0, 6)}`);
        // Clean the phone number: remove any non-digit characters except '+'
        let cleanedPhone = toPhone.toString().replace(/[^\d+]/g, '');

        // Ensure it starts with +
        if (!cleanedPhone.startsWith('+')) {
            cleanedPhone = `+${cleanedPhone}`;
        }

        await twilioClient.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${cleanedPhone}`,
            body: message,
        });
        console.log(`💬 WhatsApp sent to ${cleanedPhone}`);
    } catch (error) {
        console.error("WhatsApp Error:", error.message);
    }
};
