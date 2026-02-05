import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaReceipt,
    FaCheckCircle,
    FaTrash,
    FaEye,
    FaPlus,
    FaLink,
    FaSpinner,
    FaExclamationCircle
} from 'react-icons/fa';
import { getReceipts, deleteReceipt } from '../utils/receiptApi';
import Layout from "../components/Layout";
import Card from "../components/Card";
import BackButton from "../components/BackButton";
import ConfirmationModal from "../components/ConfirmationModal";


const ReceiptGallery = () => {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, linked, unlinked, processed
    const [error, setError] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [receiptToDelete, setReceiptToDelete] = useState(null);

    useEffect(() => {
        const fetchReceipts = async () => {
            setLoading(true);
            setError(null);

            try {
                const params = {};
                if (filter === 'linked') params.linked = true;
                if (filter === 'unlinked') params.linked = false;
                if (filter === 'processed') params.status = 'PROCESSED';

                const result = await getReceipts(params);
                setReceipts(result.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load receipts');
            } finally {
                setLoading(false);
            }
        };

        fetchReceipts();
    }, [filter]);

    const handleDeleteClick = (receipt) => {
        setReceiptToDelete(receipt);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!receiptToDelete) return;

        try {
            await deleteReceipt(receiptToDelete._id);
            setReceipts(receipts.filter(r => r._id !== receiptToDelete._id));
            setDeleteModalOpen(false);
            setReceiptToDelete(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete receipt');
        }
    };

    const handleView = (receipt) => {
        navigate(`/receipts/${receipt._id}`);
    };

    const handleCreateTransaction = (receipt) => {
        navigate('/add', {
            state: {
                receiptId: receipt._id,
                receiptData: receipt.extractedData,
                receiptUrl: receipt.imageUrl
            }
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: "bg-yellow-500/20 text-yellow-300",
            PROCESSED: "bg-green-500/20 text-green-300",
            LINKED: "bg-blue-500/20 text-blue-300",
            FAILED: "bg-red-500/20 text-red-300",
        };
        return styles[status] || "bg-gray-500/20 text-gray-300";
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-96">
                    <div className="flex flex-col items-center gap-4">
                        <FaSpinner className="text-4xl text-purple-500 animate-spin" />
                        <p className="text-gray-400">Loading receipts...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen p-6 md:p-8">
                <BackButton to="/dashboard" />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                            Receipt Gallery
                        </h1>
                        <p className="text-gray-400 mt-2">Manage all your scanned receipts</p>
                    </div>
                    <Link to="/scan-receipt">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all text-white"
                        >
                            <FaPlus /> Scan New Receipt
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Filters */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                    {[
                        { id: 'all', label: 'All Receipts', icon: null },
                        { id: 'processed', label: 'Processed', icon: FaCheckCircle },
                        { id: 'linked', label: 'Linked', icon: FaLink },
                        { id: 'unlinked', label: 'Unlinked', icon: null }
                    ].map((item) => (
                        <motion.button
                            key={item.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter(item.id)}
                            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${filter === item.id
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                                }`}
                        >
                            {item.icon && <item.icon />}
                            {item.label}
                        </motion.button>
                    ))}
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3"
                    >
                        <FaExclamationCircle className="text-red-400 text-xl" />
                        {error}
                    </motion.div>
                )}

                {/* Grid */}
                {receipts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <FaReceipt className="text-6xl text-gray-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-400 mb-2">No receipts found</h3>
                        <p className="text-gray-500 mb-6">Start by scanning your first receipt!</p>
                        <Link to="/scan-receipt">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all text-white"
                            >
                                Scan Receipt
                            </motion.button>
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        <AnimatePresence>
                            {receipts.map((receipt) => (
                                <motion.div
                                    key={receipt._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    layout
                                >
                                    <Card className="hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 h-full">
                                        {/* Image Section */}
                                        <div
                                            className="relative w-full h-48 rounded-lg overflow-hidden mb-4 cursor-pointer group/image"
                                            onClick={() => handleView(receipt)}
                                        >
                                            <img
                                                src={receipt.imageUrl}
                                                alt="Receipt"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <FaEye className="text-white text-3xl drop-shadow-lg" />
                                            </div>

                                            {/* Badges */}
                                            {receipt.transactionId && (
                                                <div className="absolute top-2 right-2 bg-blue-500/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                                    <FaLink /> Linked
                                                </div>
                                            )}
                                            {receipt.ocrProcessed && !receipt.transactionId && (
                                                <div className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                                    <FaCheckCircle /> Processed
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-white truncate max-w-[70%]">
                                                    {receipt.extractedData?.merchantName || "Unknown Merchant"}
                                                </h3>
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusBadge(receipt.status)}`}>
                                                    {receipt.status}
                                                </span>
                                            </div>

                                            <div className="space-y-2 mb-4 text-sm text-gray-400">
                                                {receipt.extractedData?.amount && (
                                                    <div className="flex justify-between">
                                                        <span>Amount</span>
                                                        <span className="text-green-400 font-bold">₹{receipt.extractedData.amount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {receipt.extractedData?.date && (
                                                    <div className="flex justify-between">
                                                        <span>Date</span>
                                                        <span className="text-white">
                                                            {new Date(receipt.extractedData.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {receipt.extractedData?.category && (
                                                    <div className="flex justify-between">
                                                        <span>Category</span>
                                                        <span className="text-white">{receipt.extractedData.category}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 mt-auto pt-4 border-t border-white/10">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleView(receipt)}
                                                    className="flex-1 p-2 bg-white/5 text-blue-300 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center justify-center"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </motion.button>

                                                {!receipt.transactionId && receipt.ocrProcessed && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleCreateTransaction(receipt)}
                                                        className="flex-1 p-2 bg-white/5 text-green-300 rounded-lg hover:bg-green-500/20 transition-colors flex items-center justify-center"
                                                        title="Create Transaction"
                                                    >
                                                        <FaPlus />
                                                    </motion.button>
                                                )}

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDeleteClick(receipt)}
                                                    className="flex-1 p-2 bg-white/5 text-red-300 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center"
                                                    title="Delete Receipt"
                                                >
                                                    <FaTrash />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}


                <ConfirmationModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Receipt?"
                    message="Are you sure you want to delete this receipt? This action cannot be undone."
                />
            </div>
        </Layout >
    );
};

export default ReceiptGallery;
