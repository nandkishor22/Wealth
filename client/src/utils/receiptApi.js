import API from './api';

/**
 * Upload receipt image
 */
export const uploadReceipt = async (file) => {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await API.post('/receipts/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};

/**
 * Process OCR on receipt
 */
export const processReceiptOCR = async (receiptId) => {
    const response = await API.post(`/receipts/${receiptId}/process-ocr`);
    return response.data;
};

/**
 * Create transaction from receipt
 */
export const createTransactionFromReceipt = async (receiptId, transactionData) => {
    const response = await API.post(`/receipts/${receiptId}/create-transaction`, transactionData);
    return response.data;
};

/**
 * Update receipt extracted data
 */
export const updateReceiptData = async (receiptId, data) => {
    const response = await API.put(`/receipts/${receiptId}/update-data`, data);
    return response.data;
};

/**
 * Get all receipts
 */
export const getReceipts = async (params = {}) => {
    const response = await API.get('/receipts', { params });
    return response.data;
};

/**
 * Get single receipt
 */
export const getReceiptById = async (receiptId) => {
    const response = await API.get(`/receipts/${receiptId}`);
    return response.data;
};

/**
 * Delete receipt
 */
export const deleteReceipt = async (receiptId) => {
    const response = await API.delete(`/receipts/${receiptId}`);
    return response.data;
};

/**
 * Get receipt statistics
 */
export const getReceiptStats = async () => {
    const response = await API.get('/receipts/stats');
    return response.data;
};
