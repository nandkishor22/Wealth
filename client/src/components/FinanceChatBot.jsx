import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import API from "../utils/api";

const sampleQuestions = [
    "How do I save money effectively?",
    "Explain the 50/30/20 budget rule.",
    "What is compound interest?",
    "Tips for reducing expenses?",
    "How much should I invest?"
];

const FinanceChatBot = () => {
    // ... (state remains same)
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello! I am your AI financial assistant. Ask me anything about finance, budgeting, or savings." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleQuestionClick = async (question) => {
        // ... (same as before)
        const userMessage = { role: "user", content: question };
        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);

        try {
            const { data } = await API.post("/ai/chat", { message: question });
            const botMessage = { role: "assistant", content: data.reply };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, I encountered an error. Please try again later." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        // ... (same as before)
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const { data } = await API.post("/ai/chat", { message: input });
            const botMessage = { role: "assistant", content: data.reply };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, I encountered an error. Please try again later." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-2 md:mb-4 w-[calc(100vw-32px)] md:w-96 bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[60vh] md:h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 p-3 md:p-4 flex justify-between items-center border-b border-white/10">
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                                    <FaRobot />
                                </div>
                                <h3 className="text-white font-bold text-sm md:text-base">Finance AI</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label="Close chat"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar bg-gray-900/95 flex flex-col">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex w-full mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] md:max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                            ? "bg-purple-600/90 text-white rounded-tr-sm"
                                            : "bg-gray-800/90 text-gray-200 rounded-tl-sm border border-gray-700"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {/* Sample Questions (Show only if there is only the welcome message) */}
                            {messages.length === 1 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {sampleQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleQuestionClick(q)}
                                            className="text-xs text-left bg-gray-800/50 hover:bg-gray-700 text-purple-300 border border-purple-500/20 px-3 py-2 rounded-xl transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {loading && (
                                <div className="flex justify-start mb-4">
                                    <div className="bg-gray-800/50 p-3 rounded-2xl rounded-tl-sm border border-gray-700/50 flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-3 bg-gray-800/50 border-t border-white/5">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about finance..."
                                    className="w-full bg-gray-900/50 text-white border border-gray-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-purple-500/50 focus:bg-gray-900 transition-all placeholder-gray-500 text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <FaPaperPlane size={16} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen((prev) => !prev)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg shadow-purple-900/30 flex items-center justify-center text-white text-2xl md:text-3xl transition-all ${isOpen
                    ? "bg-gray-700 hover:bg-gray-600 rotate-90"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                    }`}
            >
                {isOpen ? <FaTimes /> : <FaCommentDots />}
            </motion.button>
        </div>
    );
};

export default FinanceChatBot;
