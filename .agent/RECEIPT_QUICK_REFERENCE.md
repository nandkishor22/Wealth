# 📸 Receipt Scanner - Quick Reference

## 🚀 Quick Start

### 1. Setup Cloudinary (One-time)
```bash
# Sign up at https://cloudinary.com (free tier)
# Get: Cloud Name, API Key, API Secret
# Add to server/.env:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Start Application
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm start
```

### 3. Use Feature
- Navigate to: http://localhost:3000/scan-receipt
- Upload receipt
- Review extracted data
- Create transaction

---

## 📍 Routes

| Route | Description |
|-------|-------------|
| `/scan-receipt` | Upload and scan new receipt |
| `/receipts` | View all receipts gallery |
| Navigation: **📸 Receipts** button in header |

---

## 🎯 Feature Overview

### What It Does
✅ Scan receipts automatically  
✅ Extract transaction details via OCR  
✅ Store receipts securely in cloud  
✅ Create transactions with one click  
✅ Link receipts to transactions  

### What It Extracts
- 💰 Amount
- 📅 Date
- 🏪 Merchant Name
- 📂 Category

---

## 🔌 API Quick Reference

```javascript
// Upload receipt
POST /receipts/upload
Body: FormData with 'receipt' file

// Process OCR
POST /receipts/:id/process-ocr

// Create transaction from receipt
POST /receipts/:id/create-transaction
Body: { accountId, type, amount, description, category, date }

// Get all receipts
GET /receipts?page=1&limit=20&status=PROCESSED&linked=true

// Delete receipt
DELETE /receipts/:id
```

---

## 📁 Key Files

### Backend
```
server/src/
├── config/cloudinary.js       # Cloud storage config
├── middleware/upload.js        # File upload handler
├── models/Receipt.js           # Receipt data model
├── controllers/receiptController.js
├── routes/receiptRoutes.js
└── utils/ocrParser.js          # OCR text extraction
```

### Frontend
```
client/src/
├── pages/
│   ├── ReceiptScanner.jsx    # Main scanner UI
│   └── ReceiptGallery.jsx    # View all receipts
└── utils/receiptApi.js        # API calls
```

---

## 🎨 Usage Tips

### For Best Results:
✅ Good lighting  
✅ Flat, straight receipt  
✅ Clear, focused image  
✅ High resolution (1-3MP)  
✅ Avoid shadows  

### Supported Formats:
- JPEG, PNG, GIF, WebP, HEIC
- Max size: 10MB

---

## ⚡ Workflow

```
1. Upload Receipt
   ↓
2. Automatic OCR Processing
   ↓
3. Review Extracted Data
   ↓
4. Edit if Needed
   ↓
5. Create Transaction
   ↓
6. Done! Receipt linked to transaction
```

---

## 🔐 Environment Variables

Required in `server/.env`:
```env
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
CLOUDINARY_FOLDER=wealth-receipts  # Optional
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Upload fails | Check Cloudinary credentials |
| OCR fails | Try better lighting/quality image |
| Page not found | Verify routes in App.js |
| Can't create transaction | Ensure account exists |

---

## 📊 Status Indicators

| Status | Meaning |
|--------|---------|
| 🟡 PENDING | Uploaded, not processed |
| 🟢 PROCESSED | OCR completed |
| 🔵 LINKED | Connected to transaction |
| 🔴 FAILED | Processing error |

---

## 🎯 Next Features (Roadmap)

- Batch upload
- Email receipt forwarding
- Google Vision API fallback
- Receipt templates
- Multi-language support

---

**Status**: ✅ Feature Complete & Ready to Use!
