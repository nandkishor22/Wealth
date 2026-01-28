import nodemailer from "nodemailer";
let transporter;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            pool: true, // Use pooled connections for better performance
            maxConnections: 5,
            maxMessages: 100,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    return transporter;
};

export const sendEmailAlert = async (toEmail, subject, text) => {
    try {
        const mailTransporter = getTransporter();
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject,
            text: text.replace(/<[^>]*>?/gm, ''), // Fallback: strip HTML tags for plain text
            html: text, // Treat the 'text' argument as HTML
        };

        await mailTransporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${toEmail}`);
    } catch (error) {
        console.error("Email Error:", error.message);
    }
};
