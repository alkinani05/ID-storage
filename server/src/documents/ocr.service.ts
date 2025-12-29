import { Injectable, Logger } from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

// Sharp for image processing (needs to be installed)
let sharp: any;
try {
    sharp = require('sharp');
} catch (e) {
    // Sharp not available - handled in OcrService constructor
}

export interface AIAnalysisResult {
    documentType: 'PASSPORT' | 'ID_CARD' | 'BILL' | 'CERTIFICATE' | 'CONTRACT' | 'RESIDENCE' | 'OTHER';
    confidence: number;
    detectedLanguages: string[];
    extractedFields: Record<string, { value: string; confidence: number }>;
    qualityScore: number;
    qualityDetails: {
        brightness: number;
        contrast: number;
        sharpness: number;
        readability: number;
    };
    suggestions: string[];
    summary: string;
    rawText: string;
}

@Injectable()
export class OcrService {
    private readonly logger = new Logger(OcrService.name);
    private openai: OpenAI | null = null;

    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
            this.logger.log('✅ OpenAI initialized for advanced analysis');
        } else {
            this.logger.warn('⚠️ OpenAI API Key not found. Falling back to basic regex analysis.');
        }
    }

    // Multi-language OCR support
    async parseImage(imagePath: string, languages = 'eng+ara'): Promise<string> {
        try {
            // Verify file exists before processing
            if (!fs.existsSync(imagePath)) {
                this.logger.error(`Image file not found: ${imagePath}`);
                throw new Error(`Image file not found: ${imagePath}`);
            }

            // Check for local traineddata in root app dir
            const workerConfig: any = {
                // cachePath: '.',
                // langPath: '.',
                gzip: false
            };

            // Should verify if .traineddata exists locally to avoid re-download
            const localTrainedDataPath = path.join(process.cwd(), 'eng.traineddata');
            if (fs.existsSync(localTrainedDataPath)) {
                this.logger.log('📂 Using local Tesseract data');
                workerConfig.langPath = process.cwd();
                workerConfig.cachePath = process.cwd();
            } else {
                this.logger.warn('⚠️ Local Tesseract data not found, will download from CDN');
            }

            this.logger.debug(`Creating Tesseract worker for languages: ${languages}`);
            const worker = await createWorker(languages, 1, workerConfig);

            this.logger.debug(`Recognizing text from: ${imagePath}`);
            const ret = await worker.recognize(imagePath);

            await worker.terminate();
            this.logger.debug(`OCR completed successfully, extracted ${ret.data.text.length} characters`);

            return ret.data.text;
        } catch (error) {
            this.logger.error(`OCR failed for ${imagePath}`, error);

            // Provide more specific error messages
            if (error.message?.includes('ENOENT')) {
                throw new Error('OCR process failed: Image file not accessible');
            } else if (error.message?.includes('traineddata')) {
                throw new Error('OCR process failed: Tesseract language data not available');
            } else if (error.message?.includes('worker')) {
                throw new Error('OCR process failed: Unable to initialize Tesseract worker');
            }

            throw new Error('OCR process failed');
        }
    }

    // Advanced AI Analysis with multiple detection methods
    async analyzeDocument(imagePath: string): Promise<AIAnalysisResult> {
        const result: AIAnalysisResult = {
            documentType: 'OTHER',
            confidence: 0,
            detectedLanguages: [],
            extractedFields: {},
            qualityScore: 0,
            qualityDetails: { brightness: 0, contrast: 0, sharpness: 0, readability: 0 },
            suggestions: [],
            summary: '',
            rawText: ''
        };

        try {
            // Step 1: Image Quality Analysis
            if (sharp && fs.existsSync(imagePath)) {
                const qualityAnalysis = await this.analyzeImageQuality(imagePath);
                result.qualityDetails = qualityAnalysis.details;
                result.qualityScore = qualityAnalysis.score;
                this.generateQualitySuggestions(result, qualityAnalysis);
            }

            // Step 2: OCR with multiple languages
            this.logger.debug(`Starting OCR for ${imagePath}`);
            const workerConfig: any = { gzip: false };
            if (fs.existsSync(path.join(process.cwd(), 'eng.traineddata'))) {
                workerConfig.langPath = process.cwd();
                workerConfig.cachePath = process.cwd();
            }

            const worker = await createWorker('eng+ara', 1, workerConfig);
            const ret = await worker.recognize(imagePath);
            await worker.terminate();
            result.rawText = ret.data.text;

            // Detect languages basic check
            const hasArabic = /[\u0600-\u06FF]/.test(result.rawText);
            const hasEnglish = /[a-zA-Z]{3,}/.test(result.rawText);
            if (hasArabic) result.detectedLanguages.push('العربية');
            if (hasEnglish) result.detectedLanguages.push('English');

            // Step 3: Intelligence Layer (OpenAI or Regex Fallback)
            if (this.openai && result.rawText.length > 50) {
                await this.enrichWithOpenAI(result);
            } else {
                this.enrichWithRegex(result);
            }

        } catch (error) {
            this.logger.error('AI Analysis Error:', error);
            result.summary = 'تعذر تحليل المستند بشكل كامل';
            result.suggestions.push('حدث خطأ أثناء التحليل، يرجى المحاولة مرة أخرى');
        }

        return result;
    }

    private enrichWithRegex(result: AIAnalysisResult) {
        // Fallback: Document Type Detection with AI scoring
        const typeDetection = this.detectDocumentType(result.rawText);
        result.documentType = typeDetection.type;
        result.confidence = typeDetection.confidence;

        // Fallback: Extract fields based on document type
        result.extractedFields = this.extractFieldsByType(result.rawText, result.documentType);

        // Fallback: Calculate readability score
        result.qualityDetails.readability = this.calculateReadability(result.rawText);

        // Fallback: Generate AI Summary (Arabic)
        result.summary = this.generateAISummary(result);
    }

    private async enrichWithOpenAI(result: AIAnalysisResult) {
        try {
            this.logger.debug('Sending text to OpenAI for analysis...');
            const completion = await this.openai!.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an expert document analyzer for the "Wathiqni" vault app. 
                        Analyze the following OCR text. 
                        Return a pure JSON object (no markdown) with this structure:
                        {
                            "documentType": "PASSPORT" | "ID_CARD" | "BILL" | "CERTIFICATE" | "CONTRACT" | "RESIDENCE" | "OTHER",
                            "confidence": number (0-100),
                            "extractedFields": {"FieldName": {"value": "extracted value", "confidence": number}},
                            "summary": "Brief summary in Arabic",
                            "suggestions": ["suggestion1", "suggestion2"]
                        }
                        Focus on extracting keys like Name, ID Number, Expiry Date, Amount (if bill).
                        For "extractedFields", use Arabic keys mostly.`
                    },
                    { role: "user", content: result.rawText }
                ],
                model: "gpt-4o-mini",
                response_format: { type: "json_object" },
                temperature: 0.3,
            });

            const aiData = JSON.parse(completion.choices[0].message.content || '{}');

            result.documentType = aiData.documentType || 'OTHER';
            result.confidence = aiData.confidence || 0;
            result.extractedFields = aiData.extractedFields || {};
            result.summary = aiData.summary || this.generateAISummary(result); // Fallback if empty
            if (aiData.suggestions && Array.isArray(aiData.suggestions)) {
                result.suggestions = [...result.suggestions, ...aiData.suggestions];
            }

            // Still calc readability locally as it's a visual stat
            result.qualityDetails.readability = this.calculateReadability(result.rawText);

        } catch (e) {
            this.logger.error('OpenAI enrichment failed, falling back to regex', e);
            this.enrichWithRegex(result);
        }
    }

    private generateQualitySuggestions(result: AIAnalysisResult, qualityAnalysis: any) {
        if (qualityAnalysis.score < 50) {
            result.suggestions.push('جودة الصورة منخفضة، يُفضل إعادة المسح بإضاءة أفضل');
        }
        if (qualityAnalysis.details.brightness < 30) {
            result.suggestions.push('الصورة مظلمة جداً');
        }
        if (qualityAnalysis.details.brightness > 90) {
            result.suggestions.push('الصورة ساطعة جداً');
        }
    }

    // Image Quality Analysis using Sharp
    private async analyzeImageQuality(imagePath: string): Promise<{ score: number; details: AIAnalysisResult['qualityDetails'] }> {
        const details = { brightness: 70, contrast: 70, sharpness: 70, readability: 70 };

        try {
            if (!sharp) {
                return { score: 70, details };
            }

            const image = sharp(imagePath);
            const stats = await image.stats();
            const metadata = await image.metadata();

            // Calculate brightness from channel means
            const channels = stats.channels;
            const avgBrightness = channels.reduce((sum: number, ch: any) => sum + ch.mean, 0) / channels.length;
            details.brightness = Math.round((avgBrightness / 255) * 100);

            // Calculate contrast from standard deviation
            const avgStdDev = channels.reduce((sum: number, ch: any) => sum + ch.stdev, 0) / channels.length;
            details.contrast = Math.min(100, Math.round((avgStdDev / 128) * 100));

            // Sharpness estimation based on resolution
            const resolution = (metadata.width || 0) * (metadata.height || 0);
            details.sharpness = Math.min(100, Math.round((resolution / 2073600) * 100)); // 1080p baseline

            // Overall score
            const score = Math.round(
                details.brightness * 0.25 +
                details.contrast * 0.35 +
                details.sharpness * 0.25 +
                details.readability * 0.15
            );

            return { score: Math.min(100, score), details };
        } catch (e) {
            this.logger.error('Image quality analysis failed:', e);
            return { score: 70, details };
        }
    }

    // AI Document Type Detection with confidence scoring
    private detectDocumentType(text: string): { type: AIAnalysisResult['documentType']; confidence: number } {
        const lower = text.toLowerCase();
        const arabic = text;

        const patterns = {
            PASSPORT: {
                keywords: ['passport', 'جواز', 'سفر', 'nationality', 'الجنسية', 'republic', 'الجمهورية', 'ministry', 'وزارة'],
                weight: 0
            },
            ID_CARD: {
                keywords: ['national id', 'identity', 'هوية', 'بطاقة', 'national number', 'الرقم الوطني', 'civil', 'مدني'],
                weight: 0
            },
            RESIDENCE: {
                keywords: ['residence', 'إقامة', 'visa', 'تأشيرة', 'permit', 'تصريح', 'sponsor', 'كفيل'],
                weight: 0
            },
            BILL: {
                keywords: ['invoice', 'bill', 'فاتورة', 'total', 'المجموع', 'amount', 'المبلغ', 'payment', 'دفع'],
                weight: 0
            },
            CERTIFICATE: {
                keywords: ['certificate', 'شهادة', 'diploma', 'degree', 'university', 'جامعة', 'education', 'تعليم', 'birth', 'ميلاد'],
                weight: 0
            },
            CONTRACT: {
                keywords: ['contract', 'عقد', 'agreement', 'اتفاقية', 'party', 'طرف', 'terms', 'شروط', 'signature', 'توقيع'],
                weight: 0
            }
        };

        // Calculate weights for each type
        for (const [type, config] of Object.entries(patterns)) {
            for (const keyword of config.keywords) {
                if (lower.includes(keyword) || arabic.includes(keyword)) {
                    config.weight += keyword.length > 4 ? 2 : 1; // Longer keywords are more specific
                }
            }
        }

        // Find the best match
        let bestType: AIAnalysisResult['documentType'] = 'OTHER';
        let maxWeight = 0;
        let totalWeight = 0;

        for (const [type, config] of Object.entries(patterns)) {
            totalWeight += config.weight;
            if (config.weight > maxWeight) {
                maxWeight = config.weight;
                bestType = type as AIAnalysisResult['documentType'];
            }
        }

        // Calculate confidence (0-100)
        const confidence = totalWeight > 0 ? Math.min(95, Math.round((maxWeight / Math.max(totalWeight, 3)) * 100)) : 20;

        return { type: bestType, confidence };
    }

    // Extract fields based on document type
    private extractFieldsByType(text: string, docType: AIAnalysisResult['documentType']): Record<string, { value: string; confidence: number }> {
        const fields: Record<string, { value: string; confidence: number }> = {};

        // Common patterns
        const patterns = {
            email: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/,
            phone: /(\+?[0-9]{10,14})/,
            date: /\b(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b/g,
            idNumber: /\b\d{8,14}\b/,
            arabicName: /([أ-ي\s]{3,30})/,
            englishName: /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,
            amount: /(?:[\$€¥£]|IQD|USD|EUR)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
        };

        // Extract email
        const emailMatch = text.match(patterns.email);
        if (emailMatch) {
            fields['البريد الإلكتروني'] = { value: emailMatch[0], confidence: 90 };
        }

        // Extract phone
        const phoneMatch = text.match(patterns.phone);
        if (phoneMatch) {
            fields['رقم الهاتف'] = { value: phoneMatch[0], confidence: 85 };
        }

        // Extract dates
        const dates = text.match(patterns.date);
        if (dates && dates.length > 0) {
            fields['التواريخ المكتشفة'] = { value: dates.join(', '), confidence: 80 };

            // Try to identify expiry date (usually future date)
            const now = new Date();
            for (const dateStr of dates) {
                try {
                    const parts = dateStr.split(/[./-]/);
                    let parsed: Date;
                    if (parseInt(parts[2]) > 2000) {
                        // DD/MM/YYYY
                        parsed = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    } else if (parseInt(parts[0]) > 2000) {
                        // YYYY/MM/DD
                        parsed = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    } else {
                        continue;
                    }
                    if (parsed > now) {
                        fields['تاريخ الانتهاء'] = { value: dateStr, confidence: 75 };
                        break;
                    }
                } catch (e) { continue; }
            }
        }

        // Extract ID number
        const idMatch = text.match(patterns.idNumber);
        if (idMatch) {
            fields['رقم المستند'] = { value: idMatch[0], confidence: 85 };
        }

        // Extract names
        const englishNameMatch = text.match(patterns.englishName);
        if (englishNameMatch) {
            fields['الاسم (إنجليزي)'] = { value: englishNameMatch[0].trim(), confidence: 70 };
        }

        // Type-specific extractions
        if (docType === 'BILL') {
            const amountMatch = text.match(patterns.amount);
            if (amountMatch) {
                fields['المبلغ'] = { value: amountMatch[0], confidence: 80 };
            }
        }

        if (docType === 'PASSPORT' || docType === 'ID_CARD') {
            // Nationality detection
            const nationalityPatterns = [
                { en: 'iraqi', ar: 'عراقي' },
                { en: 'jordanian', ar: 'أردني' },
                { en: 'syrian', ar: 'سوري' },
                { en: 'saudi', ar: 'سعودي' },
                { en: 'egyptian', ar: 'مصري' },
            ];
            for (const nat of nationalityPatterns) {
                if (text.toLowerCase().includes(nat.en) || text.includes(nat.ar)) {
                    fields['الجنسية'] = { value: nat.ar, confidence: 85 };
                    break;
                }
            }
        }

        return fields;
    }

    // Calculate text readability score
    private calculateReadability(text: string): number {
        if (!text || text.length < 10) return 10;

        // Count valid words vs garbage
        const words = text.split(/\s+/).filter(w => w.length > 1);
        const validWords = words.filter(w => {
            // Check if word looks valid (not random chars)
            return /^[a-zA-Z\u0600-\u06FF]+$/.test(w) || /^\d+$/.test(w);
        });

        const ratio = validWords.length / Math.max(words.length, 1);
        return Math.round(ratio * 100);
    }

    // Generate AI Summary in Arabic
    private generateAISummary(result: AIAnalysisResult): string {
        const typeNames: Record<string, string> = {
            PASSPORT: 'جواز سفر',
            ID_CARD: 'بطاقة هوية',
            RESIDENCE: 'إقامة',
            BILL: 'فاتورة',
            CERTIFICATE: 'شهادة',
            CONTRACT: 'عقد',
            OTHER: 'مستند عام'
        };

        let summary = `📄 تم تصنيف المستند: ${typeNames[result.documentType]} (ثقة: ${result.confidence}%)\n\n`;

        if (result.detectedLanguages.length > 0) {
            summary += `🌐 اللغات المكتشفة: ${result.detectedLanguages.join('، ')}\n`;
        }

        summary += `📊 جودة الصورة: ${result.qualityScore}%\n`;

        const fieldCount = Object.keys(result.extractedFields).length;
        if (fieldCount > 0) {
            summary += `\n✨ البيانات المستخرجة (${fieldCount}):\n`;
            for (const [key, field] of Object.entries(result.extractedFields)) {
                summary += `• ${key}: ${field.value}\n`;
            }
        }

        if (result.suggestions.length > 0) {
            summary += `\n💡 اقتراحات:\n`;
            for (const suggestion of result.suggestions) {
                summary += `• ${suggestion}\n`;
            }
        }

        return summary;
    }

    // Legacy method for backward compatibility
    extractData(text: string) {
        const typeDetection = this.detectDocumentType(text);
        const extracted = this.extractFieldsByType(text, typeDetection.type);

        return {
            text,
            extracted: {
                type: typeDetection.type,
                ...Object.fromEntries(Object.entries(extracted).map(([k, v]) => [k, v.value]))
            },
            summary: `تم تصنيف المستند كـ ${typeDetection.type}`
        };
    }

    // Enhanced AI Chat function
    async chatWithDoc(query: string, contextText: string): Promise<string> {
        // Use OpenAI if available for superior context answering
        if (this.openai) {
            try {
                const completion = await this.openai.chat.completions.create({
                    messages: [
                        { role: "system", content: "You are a helpful assistant for the Wathiqni app. Answer the user's question based ONLY on the provided document context. Answer in Arabic unless asked otherwise." },
                        { role: "user", content: `Context: ${contextText}\n\nQuestion: ${query}` }
                    ],
                    model: "gpt-4o-mini",
                    temperature: 0.5,
                });
                return completion.choices[0].message.content || 'عذراً، لم أتمكن من الإجابة.';
            } catch (e) {
                this.logger.error('Chat with OpenAI failed, falling back to regex', e);
            }
        }

        const q = query.toLowerCase();
        const arabicQ = query;

        // Smart keyword matching with context
        if (q.includes('expiry') || q.includes('expire') || arabicQ.includes('انتهاء') || arabicQ.includes('صلاحية')) {
            const dates = contextText.match(/\b(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b/g);
            if (dates) {
                return `📅 التواريخ الموجودة في المستند: ${dates.join('، ')}`;
            }
            return "لم أجد تواريخ واضحة في المستند.";
        }

        if (q.includes('number') || q.includes('رقم') || arabicQ.includes('رقم')) {
            const numbers = contextText.match(/\b\d{8,14}\b/g);
            if (numbers) {
                return `🔢 الأرقام المستخرجة: ${numbers.join('، ')}`;
            }
            return "لم أجد أرقام مستندات واضحة.";
        }

        if (q.includes('name') || arabicQ.includes('اسم')) {
            const names = contextText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g);
            if (names) {
                return `👤 الأسماء المكتشفة: ${names.join('، ')}`;
            }
            return "لم أتمكن من استخراج أسماء واضحة.";
        }

        if (q.includes('type') || arabicQ.includes('نوع')) {
            const detection = this.detectDocumentType(contextText);
            return `📄 نوع المستند: ${detection.type} (ثقة: ${detection.confidence}%)`;
        }

        // General search
        const queryWords = q.split(' ').filter(w => w.length > 2);
        for (const word of queryWords) {
            if (contextText.toLowerCase().includes(word)) {
                const idx = contextText.toLowerCase().indexOf(word);
                const context = contextText.substring(Math.max(0, idx - 50), idx + 100);
                return `🔍 وجدت ما يتعلق بـ "${word}":\n"...${context}..."`;
            }
        }

        return "لم أجد معلومات دقيقة حول هذا السؤال في المستند. جرب السؤال عن: النوع، الرقم، التاريخ، أو الاسم.";
    }
}
