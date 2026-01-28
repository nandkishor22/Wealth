import { motion } from "framer-motion";
import { FaChartLine, FaWallet, FaShieldAlt, FaCoins, FaBitcoin, FaGem } from "react-icons/fa";
import { SiEthereum } from "react-icons/si";

const FloatingBackground = () => {
    // Increased particle count and variety
    const items = [
        { Icon: FaChartLine, color: "text-emerald-500", size: 50, x: "10%", y: "20%", duration: 15, delay: 0 },
        { Icon: FaWallet, color: "text-cyan-500", size: 40, x: "85%", y: "15%", duration: 20, delay: 2 },
        { Icon: FaShieldAlt, color: "text-teal-500", size: 60, x: "75%", y: "75%", duration: 18, delay: 1 },
        { Icon: FaCoins, color: "text-yellow-400", size: 35, x: "15%", y: "65%", duration: 22, delay: 4 },
        { Icon: FaBitcoin, color: "text-orange-500", size: 45, x: "50%", y: "10%", duration: 25, delay: 3 },
        { Icon: SiEthereum, color: "text-purple-400", size: 30, x: "90%", y: "50%", duration: 19, delay: 5 },
        { Icon: FaGem, color: "text-pink-400", size: 25, x: "20%", y: "90%", duration: 28, delay: 0 },

        // Background large faint icons
        { Icon: FaChartLine, color: "text-emerald-800", size: 120, x: "40%", y: "40%", duration: 40, opacity: 0.03, delay: 0 },
        { Icon: FaWallet, color: "text-cyan-900", size: 100, x: "60%", y: "80%", duration: 35, opacity: 0.03, delay: 0 },
    ];

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050b14] pointer-events-none">
            {/* Deep Space Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#050b14_100%)]" />

            {/* Aurora Borealis Glows - Animated */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]"
            />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_50%,transparent_100%)]" />

            {/* Floating Tech Icons */}
            {items.map((item, index) => (
                <motion.div
                    key={index}
                    className={`absolute ${item.color}`}
                    style={{ left: item.x, top: item.y, opacity: item.opacity || 0.15 }}
                    animate={{
                        y: [0, -40, 0],
                        x: [0, 20, 0], // Added horizontal drift
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: item.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: item.delay
                    }}
                >
                    <item.Icon size={item.size} />
                </motion.div>
            ))}

            {/* Subtle Particles Dust */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={`dust-${i}`}
                    className="absolute w-1 h-1 bg-white/20 rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -100],
                        opacity: [0, 0.5, 0],
                    }}
                    transition={{
                        duration: 5 + Math.random() * 5,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
};

export default FloatingBackground;
