import Receipt from '../models/Receipt.js';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { processReceiptOCR, validateReceiptData } from '../utils/ocrParser.js';
import fs from 'fs';

/**
 * Upload receipt image
 * POST /api/receipts/upload
 */
export const uploadReceipt = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const userId = req.user.id;
        const filePath = req.file.path;

        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(filePath, 'wealth-receipts');

        // Create receipt record
        const receipt = new Receipt({
            userId,
            imageUrl: cloudinaryResult.url,
            cloudinaryPublicId: cloudinaryResult.publicId,
            imageFormat: cloudinaryResult.format,
            imageWidth: cloudinaryResult.width,
            imageHeight: cloudinaryResult.height,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            status: 'PENDING'
        });

        await receipt.save();

        // Delete local file
        fs.unlinkSync(filePath);

        res.status(201).json({
            success: true,
            message: 'Receipt uploaded successfully',
            data: receipt
        });
    } catch (error) {
        console.error('Upload receipt error:', error);

        // Clean up local file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: `Failed to upload receipt: ${error.message}`,
            error: error.message
        });
    }
};

/**
 * Process OCR on uploaded receipt
 * POST /api/receipts/:id/process-ocr
 */
export const processOCR = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const receipt = await Receipt.findOne({ _id: id, userId });
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        if (receipt.ocrProcessed) {
            return res.status(200).json({
                success: true,
                message: 'Receipt already processed',
                data: receipt
            });
        }

        // Download image temporarily for OCR processing
        const tempPath = `uploads/temp-${Date.now()}.jpg`;

        // Note: For production, you'd download the image from Cloudinary URL
        // For now, we'll process directly from URL if Tesseract supports it
        // Otherwise, download the image first

        try {
            // Process OCR
            const ocrResult = await processReceiptOCR(receipt.imageUrl);

            // Update receipt with OCR data
            await receipt.markAsProcessed(ocrResult, ocrResult.confidence);

            // Validate extracted data
            const validation = validateReceiptData(ocrResult);

            res.status(200).json({
                success: true,
                message: 'OCR processing completed',
                data: receipt,
                validation: validation
            });
        } catch (ocrError) {
            // Mark as failed
            receipt.status = 'FAILED';
            receipt.processingError = ocrError.message;
            await receipt.save();

            throw ocrError;
        }
    } catch (error) {
        console.error('Process OCR error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process OCR',
            error: error.message
        });
    }
};

/**
 * Create transaction from receipt
 * POST /api/receipts/:id/create-transaction
 */
export const createTransactionFromReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { accountId, type, amount, description, category, date } = req.body;

        const receipt = await Receipt.findOne({ _id: id, userId });
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        if (receipt.transactionId) {
            return res.status(400).json({
                success: false,
                message: 'Receipt already linked to a transaction'
            });
        }

        // Verify account exists and belongs to user
        const account = await Account.findOne({ _id: accountId, userId });
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        // Create transaction
        const transaction = new Transaction({
            userId,
            accountId,
            type: type || 'EXPENSE',
            amount: amount || receipt.extractedData.amount,
            description: description || receipt.extractedData.merchantName,
            category: category || receipt.extractedData.category,
            date: date || receipt.extractedData.date || new Date(),
            receiptUrl: receipt.imageUrl
        });

        await transaction.save();

        // Update account balance atomically
        const adjustment = (transaction.type === 'EXPENSE' || transaction.type === 'expense')
            ? -transaction.amount
            : transaction.amount;

        await Account.findByIdAndUpdate(
            accountId,
            { $inc: { initialBalance: adjustment } }
        );

        // Link receipt to transaction
        await receipt.linkToTransaction(transaction._id);

        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: {
                transaction,
                receipt
            }
        });
    } catch (error) {
        console.error('Create transaction from receipt error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create transaction',
            error: error.message
        });
    }
};

/**
 * Update extracted receipt data
 * PUT /api/receipts/:id/update-data
 */
export const updateReceiptData = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { amount, date, merchantName, category } = req.body;

        const receipt = await Receipt.findOne({ _id: id, userId });
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        // Update extracted data
        if (amount !== undefined) receipt.extractedData.amount = amount;
        if (date !== undefined) receipt.extractedData.date = date;
        if (merchantName !== undefined) receipt.extractedData.merchantName = merchantName;
        if (category !== undefined) receipt.extractedData.category = category;

        await receipt.save();

        res.status(200).json({
            success: true,
            message: 'Receipt data updated successfully',
            data: receipt
        });
    } catch (error) {
        console.error('Update receipt data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update receipt data',
            error: error.message
        });
    }
};

/**
 * Get all receipts for user
 * GET /api/receipts
 */
export const getReceipts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, status, linked } = req.query;

        const query = { userId };

        if (status) {
            query.status = status;
        }

        if (linked !== undefined) {
            query.transactionId = linked === 'true' ? { $ne: null } : null;
        }

        const receipts = await Receipt.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('transactionId', 'amount type description date');

        const total = await Receipt.countDocuments(query);

        res.status(200).json({
            success: true,
            data: receipts,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get receipts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch receipts',
            error: error.message
        });
    }
};

/**
 * Get single receipt
 * GET /api/receipts/:id
 */
export const getReceiptById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const receipt = await Receipt.findOne({ _id: id, userId })
            .populate('transactionId');

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        res.status(200).json({
            success: true,
            data: receipt
        });
    } catch (error) {
        console.error('Get receipt error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch receipt',
            error: error.message
        });
    }
};

/**
 * Delete receipt
 * DELETE /api/receipts/:id
 */
export const deleteReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const receipt = await Receipt.findOne({ _id: id, userId });
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        // Check if linked to transaction
        if (receipt.transactionId) {
            const transaction = await Transaction.findById(receipt.transactionId);
            if (transaction) {
                // Revert account balance atomically
                // Determine the adjustment amount
                const adjustment = (transaction.type === 'expense' || transaction.type === 'EXPENSE')
                    ? transaction.amount  // Add back expense
                    : -transaction.amount; // Remove income

                await Account.findByIdAndUpdate(
                    transaction.accountId,
                    { $inc: { initialBalance: adjustment } }
                );

                // Delete the transaction
                await Transaction.findByIdAndDelete(receipt.transactionId);
            }
        }

        // Delete from Cloudinary
        await deleteFromCloudinary(receipt.cloudinaryPublicId);

        // Delete receipt record
        await Receipt.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Receipt deleted successfully'
        });
    } catch (error) {
        console.error('Delete receipt error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete receipt',
            error: error.message
        });
    }
};

/**
 * Get receipt statistics
 * GET /api/receipts/stats
 */
export const getReceiptStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await Receipt.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalReceipts: { $sum: 1 },
                    processedReceipts: {
                        $sum: { $cond: ['$ocrProcessed', 1, 0] }
                    },
                    linkedReceipts: {
                        $sum: { $cond: [{ $ne: ['$transactionId', null] }, 1, 0] }
                    },
                    averageConfidence: { $avg: '$ocrConfidence' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats[0] || {
                totalReceipts: 0,
                processedReceipts: 0,
                linkedReceipts: 0,
                averageConfidence: 0
            }
        });
    } catch (error) {
        console.error('Get receipt stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch receipt statistics',
            error: error.message
        });
    }
};
