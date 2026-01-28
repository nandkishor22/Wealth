import { motion } from "framer-motion";
import { cn } from "../utils/cn";

const Card = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        y: -5,
        transition: { type: "spring", stiffness: 300 }
      }}
      className={cn(
        "glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300",
        "flex flex-col relative overflow-hidden group",
        className
      )}
    >
      {/* Glossy sheen effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {children}
    </motion.div>
  );
};

export default Card;
