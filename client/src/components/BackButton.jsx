import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { motion } from 'framer-motion';

const BackButton = () => {
    const navigate = useNavigate();

    return (
        <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 group transition-colors px-3 py-2 rounded-lg hover:bg-white/5 w-fit"
        >
            <IoArrowBack size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
        </motion.button>
    );
};

export default BackButton;
