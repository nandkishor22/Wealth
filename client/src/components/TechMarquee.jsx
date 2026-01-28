import { motion } from "framer-motion";
import { FaReact, FaNodeJs, FaAws, FaStripe, FaBtc, FaEthereum } from "react-icons/fa";
import { SiMongodb, SiTailwindcss, SiOpenai } from "react-icons/si";

const TechMarquee = () => {
    const icons = [
        { Icon: FaReact, color: "text-blue-400" },
        { Icon: FaNodeJs, color: "text-green-500" },
        { Icon: SiMongodb, color: "text-green-400" },
        { Icon: SiTailwindcss, color: "text-cyan-400" },
        { Icon: SiOpenai, color: "text-white" },
        { Icon: FaAws, color: "text-orange-400" },
        { Icon: FaStripe, color: "text-indigo-400" },
        { Icon: FaBtc, color: "text-yellow-500" },
        { Icon: FaEthereum, color: "text-purple-400" },
    ];

    return (
        <div className="w-full overflow-hidden py-10 opacity-70">
            <div className="flex w-[200%]">
                <motion.div
                    className="flex gap-16 pr-16"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    {[...icons, ...icons, ...icons].map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <item.Icon className={`text-4xl ${item.color}`} />
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default TechMarquee;
