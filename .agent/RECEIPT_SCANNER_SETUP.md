# 📸 Receipt Scanning & OCR Feature - Setup Guide

## 🎯 Overview
The Receipt Scanning & OCR feature allows users to scan receipts and automatically extract transaction details using OCR technology. This makes expense tracking effortless and provides proof of purchase.

## 🔧 Prerequisites

### 1. Cloudinary Account Setup
Cloudinary is used for storing receipt images securely. Follow these steps:

1. **Create Account**:
   - Go to [https://cloudinary.com](https://cloudinary.com)
   - Sign up for a free account
   - Free tier includes:
     - 25 GB storage
     - 25 GB bandwidth/month
     - 500,000 transformations/month

2. **Get API Credentials**:
   - After signing in, go to your Dashboard
   - Find your Cloud Name, API Key, and API Secret
   - Copy these credentials

3. **Add to Environment Variables**:
   Add the following to your `server/.env` file:
   ```env
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   CLOUDINARY_FOLDER=wealth-receipts
   ```

## 🚀 Installation

All dependencies have already been installed. If you need to reinstall:

### Backend Dependencies:
```bash
cd server
npm install multer cloudinary tesseract.js sharp
```

### Frontend Dependencies:
```bash
cd client
npm install tesseract.js react-dropzone
```

## 📁 File Structure

### Backend (Server)
```
server/src/
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── middleware/
│   └── upload.js               # Multer upload middleware
├── models/
│   └── Receipt.js              # Receipt model
├── controllers/
│   └── receiptController.js   # Receipt CRUD + OCR logic
├── routes/
│   └── receiptRoutes.js       # Receipt API routes
└── utils/
    └── ocrParser.js            # OCR text parsing utilities
```

### Frontend (Client)
```
client/src/
├── pages/
│   ├── ReceiptScanner.jsx     # Main scanner page
│   ├── ReceiptScanner.css     # Scanner styles
│   ├── ReceiptGallery.jsx     # View all receipts
│   └── ReceiptGallery.css     # Gallery styles
└── utils/
    └── receiptApi.js           # Receipt API service
```

## 🎨 Features

### 1. Receipt Scanner (`/scan-receipt`)
- **Drag & Drop Upload**: Intuitive drag-and-drop interface
- **Camera Capture**: Take photos directly from your device
- **Real-time OCR**: Automatic text extraction from receipts
- **Smart Parsing**:
  - Amount detection (supports multiple formats)
  - Date extraction (various formats)
  - Merchant name identification
  - Category auto-detection
- **Editable Results**: Review and edit extracted data
- **Direct Transaction Creation**: Create transaction with one click

### 2. Receipt Gallery (`/receipts`)
- **Grid View**: Beautiful card layout for all receipts
- **Filtering**:
  - All receipts
  - Processed receipts
  - Linked to transactions
  - Unlinked receipts
- **Actions**:
  - View full receipt
  - Create transaction
  - Delete receipt
- **Status Badges**: Visual indicators for processing status

## 🔌 API Endpoints

### POST `/receipts/upload`
Upload a receipt image
- **Auth**: Required
- **Body**: FormData with 'receipt' file
- **Returns**: Receipt object with upload details

### POST `/receipts/:id/process-ocr`
Process OCR on uploaded receipt
- **Auth**: Required
- **Returns**: Receipt with extracted data

### POST `/receipts/:id/create-transaction`
Create transaction from receipt
- **Auth**: Required
- **Body**: Transaction details (can override OCR data)
- **Returns**: Created transaction and updated receipt

### PUT `/receipts/:id/update-data`
Update extracted receipt data
- **Auth**: Required
- **Body**: Updated extracted data
- **Returns**: Updated receipt

### GET `/receipts`
Get all receipts for user
- **Auth**: Required
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `status`: Filter by status
  - `linked`: Filter by linked status
- **Returns**: Array of receipts with pagination

### GET `/receipts/:id`
Get single receipt
- **Auth**: Required
- **Returns**: Receipt details

### DELETE `/receipts/:id`
Delete receipt
- **Auth**: Required
- **Returns**: Success message

### GET `/receipts/stats`
Get receipt statistics
- **Auth**: Required
- **Returns**: Stats object with totals and averages

## 🧪 Testing the Feature

1. **Start the Server**:
   ```bash
   cd server
   npm start
   ```

2. **Start the Client**:
   ```bash
   cd client
   npm start
   ```

3. **Test Receipt Scanning**:
   - Navigate to `/scan-receipt`
   - Upload a receipt image (or use a sample)
   - Wait for OCR processing
   - Review extracted data
   - Create transaction

4. **Test Receipt Gallery**:
   - Navigate to `/receipts`
   - View all uploaded receipts
   - Try filtering options
   - Test CRUD operations

## 📊 OCR Accuracy

The OCR parser supports:
- ✅ Multiple currency formats (₹, $, €, £, ¥, Rs.)
- ✅ Various date formats (DD/MM/YYYY, YYYY-MM-DD, Month DD YYYY, etc.)
- ✅ Merchant name detection (first lines of receipt)
- ✅ Smart category detection based on keywords
- ✅ Line item extraction
- ✅ Total amount identification

**Expected accuracy**: 70-90% depending on:
- Image quality
- Receipt clarity
- Lighting conditions
- Text orientation

## 🎯 Usage Tips

### For Best OCR Results:
1. **Good Lighting**: Ensure receipt is well-lit
2. **Flat Surface**: Place receipt on flat surface
3. **Full Receipt**: Capture entire receipt
4. **Clear Image**: Avoid blurry or skewed images
5. **High Resolution**: Use at least 1MP camera

### Supported Image Formats:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- HEIC (.heic) - iOS photos

### File Size Limits:
- Max file size: **10MB** per receipt
- Recommended: 1-3MB for optimal processing speed

## 🔒 Security

- **JWT Authentication**: All endpoints require authentication
- **Secure Upload**: Files stored on Cloudinary with HTTPS
- **User Isolation**: Users can only access their own receipts
- **Auto-cleanup**: Local uploads deleted after cloud upload
- **Receipt Validation**: File type and size validation

## 🚨 Troubleshooting

### "Failed to upload receipt"
- Check Cloudinary credentials in `.env`
- Verify internet connection
- Check file size (must be < 10MB)

### "OCR processing failed"
- Image might be too blurry
- Text might be too small
- Try rotating or cropping the image
- Ensure good lighting

### "Cannot create transaction"
- Verify account exists
- Check extracted amount is valid
- Ensure date format is correct

## 🔄 Future Enhancements

Planned features (not yet implemented):
- [ ] Batch receipt upload
- [ ] Google Vision API integration (fallback)
- [ ] Receipt template recognition
- [ ] Email receipt forwarding
- [ ] Export receipts for tax
- [ ] Receipt categories learning from user corrections
- [ ] Multi-language support

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check network tab in browser DevTools
5. Review server logs for backend errors

## ✨ Credits

- **OCR Engine**: Tesseract.js
- **Image Storage**: Cloudinary
- **File Upload**: Multer
- **Image Processing**: Sharp
