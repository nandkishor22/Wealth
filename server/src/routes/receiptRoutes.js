import express from 'express';
import {
    uploadReceipt,
    processOCR,
    createTransactionFromReceipt,
    updateReceiptData,
    getReceipts,
    getReceiptById,
    deleteReceipt,
    getReceiptStats
} from '../controllers/receiptController.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Receipt upload
router.post('/upload', uploadSingle, handleUploadError, uploadReceipt);

// OCR processing
router.post('/:id/process-ocr', processOCR);

// Create transaction from receipt
router.post('/:id/create-transaction', createTransactionFromReceipt);

// Update extracted data
router.put('/:id/update-data', updateReceiptData);

// Get receipts (with filters)
router.get('/', getReceipts);

// Get statistics
router.get('/stats', getReceiptStats);

// Get single receipt
router.get('/:id', getReceiptById);

// Delete receipt
router.delete('/:id', deleteReceipt);

export default router;
