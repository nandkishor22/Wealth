import { motion } from "framer-motion";

const Loader = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] w-full bg-transparent">
            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-4 h-4 rounded-full bg-emerald-500"
                        animate={{
                            y: [0, -15, 0],
                            opacity: [0.3, 1, 0.3],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                className="mt-6 text-emerald-400/60 font-mono text-xs tracking-[0.2em] uppercase"
            >
                Initializing
            </motion.p>
        </div>
    );
};

export default Loader;
