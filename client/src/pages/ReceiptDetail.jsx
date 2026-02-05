import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaCalendar,
    FaStore,
    FaTags,
    FaMoneyBillWave,
    FaTrash,
    FaPlus,
    FaLink,
    FaSpinner,
    FaExclamationCircle,
    FaCheckCircle,
    FaSearchPlus,
    FaSearchMinus
} from 'react-icons/fa';
import Layout from "../components/Layout";
import Card from "../components/Card";
import BackButton from "../components/BackButton";
import { getReceiptById, deleteReceipt } from '../utils/receiptApi';
import ConfirmationModal from "../components/ConfirmationModal";

const ReceiptDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                setLoading(true);
                const { data } = await getReceiptById(id);
                setReceipt(data);
            } catch (err) {
                console.error("Error fetching receipt:", err);
                setError("Failed to load receipt details. It may have been deleted.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchReceipt();
    }, [id]);

    const handleDeleteClick = () => {
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteReceipt(id);
            navigate('/receipts');
        } catch (err) {
            alert("Failed to delete receipt");
        }
    };

    const handleCreateTransaction = () => {
        navigate('/add', {
            state: {
                receiptId: receipt._id,
                receiptData: receipt.extractedData,
                receiptUrl: receipt.imageUrl
            }
        });
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-96">
                    <div className="flex flex-col items-center gap-4">
                        <FaSpinner className="text-4xl text-purple-500 animate-spin" />
                        <p className="text-gray-400">Loading receipt...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !receipt) {
        return (
            <Layout>
                <div className="min-h-screen p-6 md:p-8 flex flex-col items-center justify-center text-center">
                    <div className="bg-red-500/10 p-6 rounded-full mb-4">
                        <FaExclamationCircle className="text-4xl text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Receipt Not Found</h2>
                    <p className="text-gray-400 mb-6">{error || "The receipt you are looking for does not exist."}</p>
                    <Link to="/receipts">
                        <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all">
                            Back to Gallery
                        </button>
                    </Link>
                </div>
            </Layout>
        );
    }

    const { extractedData } = receipt;

    return (
        <Layout>
            <div className="min-h-screen p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <BackButton to="/receipts" />
                    <div className="flex gap-2">
                        {!receipt.transactionId && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCreateTransaction}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-green-500/20 text-white"
                            >
                                <FaPlus /> Create Transaction
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDeleteClick}
                            className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-semibold flex items-center gap-2 hover:bg-red-500/20"
                        >
                            <FaTrash />
                        </motion.button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Col: Image Viewer */}
                    <div className="flex flex-col gap-4">
                        <Card className="p-0 overflow-hidden bg-black/40 border-white/10 relative h-[600px] flex items-center justify-center">
                            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                                <button
                                    onClick={() => setZoomLevel(z => Math.min(z + 0.2, 3))}
                                    className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-white/10 transition-colors"
                                >
                                    <FaSearchPlus />
                                </button>
                                <button
                                    onClick={() => setZoomLevel(z => Math.max(z - 0.2, 0.5))}
                                    className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-white/10 transition-colors"
                                >
                                    <FaSearchMinus />
                                </button>
                                <button
                                    onClick={() => setZoomLevel(1)}
                                    className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white text-xs font-bold hover:bg-white/10 transition-colors"
                                >
                                    100%
                                </button>
                            </div>
                            <div className="overflow-auto w-full h-full flex items-center justify-center p-4">
                                <motion.img
                                    src={receipt.imageUrl}
                                    alt="Receipt"
                                    animate={{ scale: zoomLevel }}
                                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Right Col: Details */}
                    <div className="flex flex-col gap-6">
                        <Card>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                                        Receipt Details
                                    </h1>
                                    <p className="text-gray-400 text-sm mt-1">ID: {receipt._id}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-2 ${receipt.status === 'PROCESSED' ? 'bg-green-500/20 text-green-300' :
                                        receipt.status === 'LINKED' ? 'bg-blue-500/20 text-blue-300' :
                                            'bg-yellow-500/20 text-yellow-300'
                                        }`}>
                                        {receipt.status === 'PROCESSED' && <FaCheckCircle />}
                                        {receipt.status === 'LINKED' && <FaLink />}
                                        {receipt.status}
                                    </span>
                                    {receipt.ocrConfidence && (
                                        <span className="text-xs text-gray-500">
                                            Confidence: {receipt.ocrConfidence.toFixed(0)}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xl">
                                        <FaMoneyBillWave />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 uppercase font-semibold">Total Amount</p>
                                        <p className="text-2xl font-bold text-white">
                                            {extractedData?.amount ? `₹${extractedData.amount.toFixed(2)}` : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xl">
                                        <FaStore />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 uppercase font-semibold">Merchant</p>
                                        <p className="text-xl font-bold text-white">
                                            {extractedData?.merchantName || 'Unknown Merchant'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                                            <FaCalendar />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Date</p>
                                            <p className="text-white font-medium truncate">
                                                {extractedData?.date ? new Date(extractedData.date).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                                            <FaTags />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Category</p>
                                            <p className="text-white font-medium truncate">
                                                {extractedData?.category || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {receipt.transactionId && (
                                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                    <div className="flex items-center gap-2 text-blue-300 font-semibold mb-2">
                                        <FaLink /> Linked Transaction
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3">
                                        This receipt is linked to a transaction.
                                    </p>
                                    <Link to="/dashboard"> {/* Ideally link to transaction detail if available */}
                                        <button className="text-sm px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-white rounded transition-colors">
                                            View Transaction
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Receipt?"
                message="Are you sure you want to delete this receipt? This action cannot be undone."
            />
        </Layout>
    );
};

export default ReceiptDetail;
