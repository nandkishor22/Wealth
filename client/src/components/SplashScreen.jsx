import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FaRupeeSign } from "react-icons/fa";

const SplashScreen = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
        exit: {
            opacity: 0,
            scale: 1.1,
            filter: "blur(10px)",
            transition: { duration: 0.8 },
        },
    };

    const letterAnim = {
        hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
        show: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        },
    };

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden font-sans"
            variants={container}
            initial="hidden"
            animate="show"
            exit="exit"
        >
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
                {/* Logo Icon - Spinning/Blurring In */}
                <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, ease: "backOut" }}
                    className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-[0_0_50px_rgba(16,185,129,0.5)]"
                >
                    <FaRupeeSign className="text-3xl md:text-4xl font-bold" />
                </motion.div>

                {/* Text Section */}
                <div className="flex flex-col justify-center items-center md:items-start">
                    {/* Staggered 'WEALTH' Text */}
                    <h1 className="flex text-5xl md:text-7xl font-black text-white tracking-tighter leading-none overflow-hidden">
                        {["W", "E", "A", "L", "T", "H"].map((char, index) => (
                            <motion.span key={index} variants={letterAnim}>
                                {char}
                            </motion.span>
                        ))}
                    </h1>

                    {/* Subtext sliding in */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="mt-2"
                    >
                        <p className="text-gray-400 text-xs md:text-sm font-medium tracking-[0.3em] uppercase bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                            AI POWERED FINANCE MANAGER
                        </p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default SplashScreen;
