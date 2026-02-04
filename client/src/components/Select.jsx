import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

const Select = ({ label, name, options, value, onChange, placeholder = "Select...", error, required }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative" ref={ref}>
            {label && <label className="block mb-1 text-sm text-gray-400">{label}</label>}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`w-full p-3 rounded-xl bg-white/5 border ${error ? 'border-red-500' : 'border-white/10 hover:border-emerald-500'} cursor-pointer flex justify-between items-center transition-all duration-200 active:scale-[0.98]`}
            >
                <span className={selectedOption ? "text-white" : "text-gray-500"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <FaChevronDown className="text-gray-400 text-xs" />
                </motion.div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] max-h-60 overflow-y-auto scrollbar-hide"
                    >
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // Create event-like object for compatibility with form handlers
                                    onChange({
                                        target: {
                                            name: name,
                                            value: opt.value
                                        }
                                    });
                                    setIsOpen(false);
                                }}
                                className={`p-3 cursor-pointer hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors ${value === opt.value ? "bg-emerald-500/10 text-emerald-400" : "text-gray-300"}`}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default Select;
