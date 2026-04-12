import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnvFile } from 'process';
import nocache from "nocache"
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import { protect } from './middleware/auth.js';
// Load environment variables from .env file
loadEnvFile();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware
app.use(cors());
app.use(express.json());
app.use(nocache());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
// Multer setup for file uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit for larger PDFs
});

// System prompt for Gemini - optimized for concise output
const SYSTEM_PROMPT = `Analyze this bank statement PDF. Return ONLY valid JSON.
Structure:
{
  "summary": {
    "current_balance": number,
    "total_credit": number,
    "total_debit": number,
    "monthly_burn_rate": number,
    "runway_months": number
  },
  "ledger": [
    { "category": "String", "value": number }
  ],
  "merchants": [
    { "name": "String", "total_spend": number }
  ]
}

CRITICAL INSTRUCTIONS:
1. **Summary**: Calculate total_credit (sum of all credits/deposits) and total_debit (sum of all debits/withdrawals).
   - **monthly_burn_rate**: If the statement covers approximately one month, use total_debit. If multiple months, use total_debit / number_of_months.
   - **runway_months**: Calculate as current_balance / monthly_burn_rate.
2. **Granularity**: For the "ledger", provide at least 30 and up to 40 individual debit transactions. DO NOT group multiple transactions into one entry. Each merchant/category name MUST be UNIQUE — no merchant name should appear more than once in the ledger. If the same merchant has multiple transactions, keep only the single largest one. Always aim for the maximum number of unique entries possible.
3. **UPI Name Extraction**: Look for transactions starting with "UPI-". Extract ONLY the first 2-3 words immediately following "UPI-" as the category name. (Example: for "UPI-STARBUCKS COFFEE-...", ONLY return "STARBUCKS COFFEE" ).
4. **Merchants List**: Top 5 spenders (unique merchants) with clean short names and "total sum of their transactions".
6. **Filter**: Only include transactions >= 500 rupees in the ledger. Prioritize larger transactions first, but include smaller ones (down to ₹500) to reach at least 30 entries. Return up to 40 entries.
7. **Sorting**: Sort the ledger entries by value descending.
8. **Validation**: Ensure runway_months is calculated. If monthly_burn_rate is 0, set runway_months to 99.

Ensure the output is valid, complete JSON.`;


// Strip UPI prefixes and deduplicate names
function cleanUPINames(data) {
    const stripUPI = (name) => {
        if (typeof name !== 'string') return name;
        return name.replace(/^UPI[-\s]+/i, '').trim();
    };

    // Clean and deduplicate ledger entries (keep largest value per unique name)
    if (data.ledger && Array.isArray(data.ledger)) {
        const ledgerMap = new Map();
        data.ledger.forEach(item => {
            if (item.category) item.category = stripUPI(item.category);
            const key = (item.category || '').toLowerCase();
            const existing = ledgerMap.get(key);
            if (!existing || (item.value || 0) > (existing.value || 0)) {
                ledgerMap.set(key, item);
            }
        });
        data.ledger = Array.from(ledgerMap.values())
            .sort((a, b) => (b.value || 0) - (a.value || 0))
            .slice(0, 40); // Hard cap at 40 entries
    }

    // Clean and deduplicate merchants (sum total_spend for duplicates)
    if (data.merchants && Array.isArray(data.merchants)) {
        const merchantMap = new Map();
        data.merchants.forEach(item => {
            if (item.name) item.name = stripUPI(item.name);
            const key = (item.name || '').toLowerCase();
            const existing = merchantMap.get(key);
            if (existing) {
                existing.total_spend = (existing.total_spend || 0) + (item.total_spend || 0);
            } else {
                merchantMap.set(key, { ...item });
            }
        });
        data.merchants = Array.from(merchantMap.values())
            .sort((a, b) => (b.total_spend || 0) - (a.total_spend || 0));
    }

    return data;
}

// Robust JSON recovery function
function recoverJSON(text) {
    let cleaned = text.trim();

    // Remove markdown code blocks
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
    }

    // Try direct parse first
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.log('Initial parse failed, attempting recovery...');
    }

    // Find the first '{' and work from there
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace > 0) {
        cleaned = cleaned.substring(firstBrace);
    }

    // Count brackets to determine what's missing
    let openBraces = 0, closeBraces = 0;
    let openBrackets = 0, closeBrackets = 0;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (char === '\\') {
            escaped = true;
            continue;
        }
        if (char === '"') {
            inString = !inString;
            continue;
        }
        if (inString) continue;

        if (char === '{') openBraces++;
        if (char === '}') closeBraces++;
        if (char === '[') openBrackets++;
        if (char === ']') closeBrackets++;
    }

    // Remove trailing commas before closing brackets
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

    // If we're inside an unclosed string, try to close it
    if (inString) {
        cleaned += '"';
    }

    // Add missing closing brackets
    const missingBrackets = openBrackets - closeBrackets;
    const missingBraces = openBraces - closeBraces;

    for (let i = 0; i < missingBrackets; i++) {
        cleaned += ']';
    }
    for (let i = 0; i < missingBraces; i++) {
        cleaned += '}';
    }

    // Try parsing again
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.error('JSON recovery failed:', e.message);
        throw new Error(`Failed to parse API response as JSON: ${e.message}`);
    }
}

// Analyze PDF with retry logic
async function analyzePDFWithRetry(filePath, retries = 3) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const base64File = fileBuffer.toString('base64');

        console.log('Sending to Gemini API...');

        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: SYSTEM_PROMPT },
                        {
                            inlineData: {
                                mimeType: 'application/pdf',
                                data: base64File
                            }
                        }
                    ]
                }
            ],
            config: {
                responseMimeType: 'application/json',
                maxOutputTokens: 16384  // Increased token limit to prevent truncation
            }
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || response.text || "";

        if (!text || text.trim().length === 0) {
            throw new Error('Empty response from Gemini API');
        }

        console.log('Response received, parsing JSON...');
        const parsed = recoverJSON(text);
        return cleanUPINames(parsed);

    } catch (error) {
        console.error('Gemini API error:', error.message);

        // Handle rate limiting (429)
        if ((error.status === 429 || error.message?.includes('429')) && retries > 0) {
            console.log(`Rate limited. Waiting 30 seconds before retry... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 30000));
            return analyzePDFWithRetry(filePath, retries - 1);
        }

        // Retry on JSON parse errors
        if (error.message?.includes('JSON') && retries > 0) {
            console.log(`JSON parse error. Retrying... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return analyzePDFWithRetry(filePath, retries - 1);
        }

        throw error;
    }
}

// POST /analyze route
app.post('/analyze', protect, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.json({ error: 'No PDF file uploaded' });
    }

    const filePath = req.file.path;

    try {
        console.log(`Analyzing PDF: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`);
        const result = await analyzePDFWithRetry(filePath);

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.json(result);
    } catch (error) {
        console.error('Analysis error:', error);

        // Clean up uploaded file on error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        if (error.status === 429) {
            return res.status(429).json({
                error: 'Rate limit exceeded. Please try again later.'
            });
        }

        res.status(500).json({
            error: 'Failed to analyze PDF',
            details: error.message
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 FinSights server running on http://localhost:${PORT}`);
    if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️  Warning: GEMINI_API_KEY environment variable not set');
    }
});
console.log("http://localhost:5173/.");
