import Tesseract from 'tesseract.js';

import { parseReceiptTextAI } from '../services/aiService.js';

/**
 * Process OCR on receipt image
 * @param {string} imagePath - Path to the receipt image
 * @returns {object} Extracted receipt data
 */
export const processReceiptOCR = async (imagePath) => {
    try {
        // Perform OCR
        const result = await Tesseract.recognize(
            imagePath,
            'eng',
            {
                logger: m => console.log(m) // Log progress
            }
        );

        const text = result.data.text;
        // console.log('OCR Text:', text); // Disabled for security

        // Try AI Parsing first
        let parsedData = await parseReceiptTextAI(text);

        // Fallback to Regex Parsing if AI fails
        if (!parsedData) {
            console.log("⚠️ AI parsing failed or disabled. Falling back to Regex.");
            parsedData = parseReceiptText(text);
        } else {
            console.log("✅ AI parsing successful:", parsedData);
        }

        return {
            success: true,
            rawText: text,
            confidence: result.data.confidence,
            ...parsedData
        };
    } catch (error) {
        console.error('OCR processing error:', error);
        throw new Error(`Failed to process OCR: ${error.message}`);
    }
};

/**
 * Parse extracted text to find transaction details
 * @param {string} text - Raw OCR text
 * @returns {object} Parsed transaction data
 */
const parseReceiptText = (text) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);

    return {
        amount: extractAmount(text),
        date: extractDate(text),
        merchantName: extractMerchantName(lines),
        category: extractCategory(text),
        items: extractLineItems(lines)
    };
};

/**
 * Extract amount from receipt text
 * Looks for patterns like: $10.50, 10.50, Rs. 100, ₹100, TOTAL: 50.00
 */
const extractAmount = (text) => {
    // Common patterns for amounts
    const patterns = [
        /total[:\s]*(?:rs\.?|₹|\$)?\s*(\d+[.,]\d{2})/i,
        /amount[:\s]*(?:rs\.?|₹|\$)?\s*(\d+[.,]\d{2})/i,
        /(?:rs\.?|₹|\$)\s*(\d+[.,]\d{2})/i,
        /(\d+[.,]\d{2})\s*(?:rs\.?|₹|\$)?$/m,
        /grand\s*total[:\s]*(\d+[.,]\d{2})/i,
        /balance[:\s]*(\d+[.,]\d{2})/i
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            // Extract numeric value and convert comma to dot
            const amount = parseFloat(match[1].replace(',', '.'));
            if (!isNaN(amount) && amount > 0) {
                return amount;
            }
        }
    }

    // Fallback: find largest number with decimal
    const numbers = text.match(/\d+[.,]\d{2}/g);
    if (numbers && numbers.length > 0) {
        const amounts = numbers.map(n => parseFloat(n.replace(',', '.')));
        return Math.max(...amounts);
    }

    return null;
};

/**
 * Extract date from receipt text
 * Supports various date formats
 */
const extractDate = (text) => {
    // Date patterns
    const patterns = [
        // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
        /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
        // YYYY-MM-DD
        /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
        // Month DD, YYYY (e.g., Jan 15, 2024)
        /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i,
        // DD Month YYYY (e.g., 15 January 2024)
        /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            try {
                let dateStr;

                if (match[0].match(/\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/)) {
                    // YYYY-MM-DD format
                    dateStr = match[0];
                } else if (match[0].match(/[a-z]/i)) {
                    // Contains month name
                    dateStr = match[0];
                } else {
                    // DD/MM/YYYY format - convert to YYYY-MM-DD
                    const parts = match[0].split(/[\/\-\.]/);
                    if (parts[2].length === 2) {
                        parts[2] = '20' + parts[2]; // Assume 20xx for 2-digit years
                    }
                    dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }

                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    return date.toISOString();
                }
            } catch (e) {
                console.error('Date parsing error:', e);
            }
        }
    }

    // Default to current date if no date found
    return new Date().toISOString();
};

/**
 * Extract merchant name from receipt
 * Usually in the first few lines
 */
const extractMerchantName = (lines) => {
    if (lines.length === 0) return null;

    // Take first non-empty line that's not a date or number
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim();

        // Skip if line contains only numbers, dates, or is too short
        if (line.length < 3) continue;
        if (/^\d+$/.test(line)) continue;
        if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(line)) continue;

        // Skip common headers
        if (/^(receipt|invoice|bill|tax|gst)/i.test(line)) continue;

        // This is likely the merchant name
        return line.length > 50 ? line.substring(0, 50) : line;
    }

    return lines[0]?.substring(0, 50) || null;
};

/**
 * Extract category based on keywords in text
 */
const extractCategory = (text) => {
    const lowerText = text.toLowerCase();

    const categories = {
        'Food & Dining': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'dining', 'kitchen', 'bistro', 'eatery'],
        'Groceries': ['supermarket', 'grocery', 'market', 'fresh', 'vegetables', 'fruits', 'mart'],
        'Transportation': ['uber', 'lyft', 'taxi', 'cab', 'fuel', 'petrol', 'gas station', 'parking'],
        'Shopping': ['store', 'shop', 'retail', 'mall', 'boutique', 'clothing', 'fashion'],
        'Healthcare': ['pharmacy', 'medical', 'hospital', 'clinic', 'doctor', 'health', 'medicine'],
        'Entertainment': ['cinema', 'movie', 'theater', 'concert', 'tickets', 'entertainment'],
        'Utilities': ['electricity', 'water', 'gas', 'internet', 'phone', 'utility'],
        'Education': ['school', 'college', 'university', 'books', 'education', 'course']
    };

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            return category;
        }
    }

    return 'Other';
};

/**
 * Extract line items from receipt (optional, for detailed receipts)
 */
const extractLineItems = (lines) => {
    const items = [];

    // Look for lines with item name and price
    const itemPattern = /(.+?)\s+(?:rs\.?|₹|\$)?\s*(\d+[.,]\d{2})/i;

    for (const line of lines) {
        const match = line.match(itemPattern);
        if (match) {
            const name = match[1].trim();
            const price = parseFloat(match[2].replace(',', '.'));

            // Filter out likely non-item lines
            if (name.length > 2 && !/(total|subtotal|tax|discount|amount)/i.test(name)) {
                items.push({ name, price });
            }
        }
    }

    return items.slice(0, 10); // Limit to 10 items
};

/**
 * Validate extracted data
 */
export const validateReceiptData = (data) => {
    const errors = [];

    if (!data.amount || data.amount <= 0) {
        errors.push('Amount not found or invalid');
    }

    if (!data.date) {
        errors.push('Date not found');
    }

    if (!data.merchantName) {
        errors.push('Merchant name not found');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
