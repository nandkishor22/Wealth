import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUpload,
    FaCheckCircle,
    FaSpinner,
    FaExclamationCircle,
    FaImage,
    FaTimes,
    FaArrowRight,
    FaRedo
} from 'react-icons/fa';
import { uploadReceipt, processReceiptOCR } from '../utils/receiptApi';
import Layout from "../components/Layout";
import BackButton from "../components/BackButton";
import Card from "../components/Card";

const ReceiptScanner = () => {
    const navigate = useNavigate();
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [ocrData, setOcrData] = useState(null);
    const [error, setError] = useState(null);
    const [step, setStep] = useState('upload'); // upload, processing, review

    const onDrop = async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setError(null);

        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Auto-upload
        await handleUpload(file);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.heic']
        },
        multiple: false,
        maxSize: 10 * 1024 * 1024 // 10MB
    });

    const handleUpload = async (file) => {
        setUploading(true);
        setError(null);

        try {
            const result = await uploadReceipt(file);
            setReceipt(result.data);
            setStep('processing');

            // Auto-process OCR
            await handleProcessOCR(result.data._id);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload receipt');
            setStep('upload');
        } finally {
            setUploading(false);
        }
    };

    const handleProcessOCR = async (receiptId) => {
        setError(null);

        try {
            const result = await processReceiptOCR(receiptId);
            setOcrData(result.data.extractedData);
            setReceipt(result.data);
            setStep('review');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process OCR');
        }
    };

    const handleCreateTransaction = () => {
        navigate('/add', {
            state: {
                receiptId: receipt._id,
                receiptData: ocrData,
                receiptUrl: receipt.imageUrl
            }
        });
    };

    const handleReset = () => {
        setPreview(null);
        setReceipt(null);
        setOcrData(null);
        setError(null);
        setStep('upload');
    };

    return (
        <Layout>
            <div className="min-h-screen p-6 md:p-8">
                <BackButton to="/receipts" />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
                        Scan Receipt
                    </h1>
                    <p className="text-gray-400">Upload a receipt to automatically extract transaction details</p>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        {step === 'upload' && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div
                                    {...getRootProps()}
                                    className={`relative border-3 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive
                                        ? "border-purple-400 bg-purple-500/10 scale-[1.02]"
                                        : "border-gray-600 hover:border-purple-500 hover:bg-white/5"
                                        }`}
                                >
                                    <input {...getInputProps()} />

                                    {preview ? (
                                        <div className="relative max-w-sm mx-auto">
                                            <img
                                                src={preview}
                                                alt="Receipt preview"
                                                className="w-full rounded-xl shadow-2xl"
                                            />
                                            <button
                                                className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all shadow-lg"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReset();
                                                }}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-24 h-24 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <FaImage className="text-4xl text-purple-400" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2">
                                                {isDragActive ? 'Drop it here!' : 'Drag & drop your receipt'}
                                            </h3>
                                            <p className="text-gray-400 mb-8">or click to browse from your device</p>

                                            <div className="flex justify-center gap-4">
                                                <div className="px-6 py-3 bg-white/10 rounded-full font-semibold text-white flex items-center gap-2">
                                                    <FaUpload /> Choose File
                                                </div>
                                            </div>
                                            <p className="text-gray-500 text-sm mt-6">
                                                Supports: JPEG, PNG, GIF, WebP, HEIC (Max 10MB)
                                            </p>
                                        </>
                                    )}

                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10 text-white">
                                            <FaSpinner className="text-5xl text-purple-500 animate-spin mb-4" />
                                            <p className="text-xl font-semibold">Uploading...</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 'processing' && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex justify-center"
                            >
                                <Card className="w-full max-w-md p-10 text-center">
                                    <div className="relative w-20 h-20 mx-auto mb-6">
                                        <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                        <FaSpinner className="absolute inset-0 m-auto text-2xl text-purple-400 animate-pulse" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Processing Receipt...</h2>
                                    <p className="text-gray-400">Extracting transaction details using AI</p>

                                    <div className="w-full h-2 bg-gray-700 rounded-full mt-8 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-progress w-full origin-left"></div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {step === 'review' && ocrData && (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                            >
                                {/* Left Column: Image */}
                                <div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                        <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                                            <FaImage /> Original Receipt
                                        </h3>
                                        <img
                                            src={receipt.imageUrl}
                                            alt="Uploaded receipt"
                                            className="w-full rounded-lg shadow-lg"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Data */}
                                <div>
                                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                                <FaCheckCircle className="text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Extraction Complete</h3>
                                                <p className="text-sm text-gray-400">Review the details below</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Total Amount</p>
                                                <p className="text-3xl font-bold text-green-400">
                                                    {ocrData.amount ? `₹${ocrData.amount.toFixed(2)}` : 'Not detected'}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Date</p>
                                                    <p className="text-white font-medium">
                                                        {ocrData.date
                                                            ? new Date(ocrData.date).toLocaleDateString()
                                                            : 'Not detected'}
                                                    </p>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Category</p>
                                                    <p className="text-white font-medium">
                                                        {ocrData.category || 'Other'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Merchant</p>
                                                <p className="text-white font-medium text-lg">
                                                    {ocrData.merchantName || 'Not detected'}
                                                </p>
                                            </div>
                                        </div>

                                        {receipt.ocrConfidence && (
                                            <div className="mt-6">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-400">AI Confidence</span>
                                                    <span className="text-white font-bold">{receipt.ocrConfidence.toFixed(0)}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                                                        style={{ width: `${receipt.ocrConfidence}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-3 mt-8">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleReset}
                                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                                            >
                                                <FaRedo /> Scan Again
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleCreateTransaction}
                                                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                                            >
                                                Create Transaction <FaArrowRight />
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mt-6 flex items-center gap-3"
                        >
                            <FaExclamationCircle className="text-red-400 text-xl" />
                            {error}
                        </motion.div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ReceiptScanner;
