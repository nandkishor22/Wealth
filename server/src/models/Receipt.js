import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },

        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
            default: null
        },

        // Image storage
        imageUrl: {
            type: String,
            required: true
        },
        cloudinaryPublicId: {
            type: String,
            required: true
        },
        imageFormat: String,
        imageWidth: Number,
        imageHeight: Number,

        // OCR Data
        ocrProcessed: {
            type: Boolean,
            default: false
        },
        ocrConfidence: Number,
        rawOcrText: String,

        // Extracted information
        extractedData: {
            amount: Number,
            date: Date,
            merchantName: String,
            category: String,
            items: [{
                name: String,
                price: Number
            }]
        },

        // User verification
        verified: {
            type: Boolean,
            default: false
        },
        verifiedAt: Date,

        // Metadata
        fileName: String,
        fileSize: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        },

        // Status
        status: {
            type: String,
            enum: ['PENDING', 'PROCESSED', 'LINKED', 'FAILED'],
            default: 'PENDING'
        },

        processingError: String
    },
    {
        timestamps: true
    }
);

// Indexes for better query performance
receiptSchema.index({ userId: 1, createdAt: -1 });
receiptSchema.index({ transactionId: 1 });
receiptSchema.index({ 'extractedData.merchantName': 'text' });

// Virtual for checking if linked to transaction
receiptSchema.virtual('isLinked').get(function () {
    return !!this.transactionId;
});

// Method to mark receipt as processed
receiptSchema.methods.markAsProcessed = function (ocrData, confidence) {
    this.ocrProcessed = true;
    this.ocrConfidence = confidence;
    this.rawOcrText = ocrData.rawText;
    this.extractedData = {
        amount: ocrData.amount,
        date: ocrData.date,
        merchantName: ocrData.merchantName,
        category: ocrData.category,
        items: ocrData.items || []
    };
    this.status = 'PROCESSED';
    return this.save();
};

// Method to link receipt to transaction
receiptSchema.methods.linkToTransaction = function (transactionId) {
    this.transactionId = transactionId;
    this.status = 'LINKED';
    return this.save();
};

// Method to verify receipt data
receiptSchema.methods.markAsVerified = function () {
    this.verified = true;
    this.verifiedAt = new Date();
    return this.save();
};

export default mongoose.model('Receipt', receiptSchema);
