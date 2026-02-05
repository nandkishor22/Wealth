import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash } from "react-icons/fa";

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Item?",
    message = "This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel"
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#0b0620] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Background Effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

                        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/10">
                            <FaTrash size={24} />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-white">{title}</h2>
                        <p className="text-gray-400 mb-6 text-sm leading-relaxed">{message}</p>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 transition-all duration-200"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 py-2.5 rounded-xl bg-red-500/90 text-white font-semibold hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200"
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
