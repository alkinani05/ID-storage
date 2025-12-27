import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OcrService } from './ocr.service';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
    private readonly logger = new Logger(DocumentsService.name);

    constructor(
        private prisma: PrismaService,
        private ocrService: OcrService,
    ) { }

    async create(userId: string, file: Express.Multer.File, body: any) {
        // 1. Save file info to DB
        const doc = await this.prisma.document.create({
            data: {
                userId,
                title: body.title || file.originalname,
                originalName: file.originalname,
                r2Key: file.path, // Storing local path for MVP
                mimeType: file.mimetype,
                size: file.size,
                status: 'PROCESSING',
            },
        });

        // 2. Trigger async processing (Mocking a queue)
        this.processDocument(doc.id, file.path, file.mimetype);

        return doc;
    }

    async findAll(userId: string) {
        return this.prisma.document.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { extractedData: true, shares: true }
        });
    }

    private async processDocument(docId: string, filePath: string, mimeType: string) {
        try {
            // Only run full AI analysis on images
            if (!mimeType.startsWith('image/')) {
                await this.prisma.document.update({
                    where: { id: docId },
                    data: { status: 'READY', category: 'OTHER' },
                });
                return;
            }

            this.logger.log(`Starting AI analysis for document: ${docId}`);

            // Run full AI Analysis
            const aiResult = await this.ocrService.analyzeDocument(filePath);

            this.logger.log(`AI Detection: ${aiResult.documentType} (${aiResult.confidence}% confidence)`);
            this.logger.debug(`Quality Score: ${aiResult.qualityScore}%`);

            // Parse expiry date if found
            let expiryDate: Date | null = null;
            const expiryField = aiResult.extractedFields['تاريخ الانتهاء'];
            if (expiryField) {
                try {
                    const parts = expiryField.value.split(/[./-]/);
                    if (parseInt(parts[2]) > 2000) {
                        expiryDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    } else if (parseInt(parts[0]) > 2000) {
                        expiryDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    }
                } catch {
                    // Date parsing failed - expiry date will remain null
                }
            }

            // Update Document with AI results
            await this.prisma.document.update({
                where: { id: docId },
                data: {
                    status: 'READY',
                    category: aiResult.documentType || 'OTHER',
                    expiryDate: expiryDate,
                },
            });

            // Delete existing extracted data
            await this.prisma.extractedData.deleteMany({
                where: { documentId: docId }
            });

            // Save AI Summary as primary extracted data
            await this.prisma.extractedData.create({
                data: {
                    documentId: docId,
                    fieldName: 'ai_summary',
                    fieldValue: aiResult.summary,
                    confidence: aiResult.confidence / 100
                }
            });

            // Save Quality Score
            await this.prisma.extractedData.create({
                data: {
                    documentId: docId,
                    fieldName: 'quality_score',
                    fieldValue: JSON.stringify({
                        overall: aiResult.qualityScore,
                        ...aiResult.qualityDetails
                    }),
                    confidence: 1.0
                }
            });

            // Save each extracted field
            for (const [fieldName, field] of Object.entries(aiResult.extractedFields)) {
                await this.prisma.extractedData.create({
                    data: {
                        documentId: docId,
                        fieldName: fieldName,
                        fieldValue: field.value,
                        confidence: field.confidence / 100
                    }
                });
            }

            // Save detected languages
            if (aiResult.detectedLanguages.length > 0) {
                await this.prisma.extractedData.create({
                    data: {
                        documentId: docId,
                        fieldName: 'detected_languages',
                        fieldValue: aiResult.detectedLanguages.join(', '),
                        confidence: 0.95
                    }
                });
            }

            // Save raw text for search
            if (aiResult.rawText) {
                await this.prisma.extractedData.create({
                    data: {
                        documentId: docId,
                        fieldName: 'raw_text',
                        fieldValue: aiResult.rawText.substring(0, 2000),
                        confidence: 0.9
                    }
                });
            }

            this.logger.log(`AI Analysis complete for document: ${docId}`);

        } catch (e) {
            this.logger.error(`AI Analysis failed for document ${docId}:`, e);
            await this.prisma.document.update({
                where: { id: docId },
                data: { status: 'FAILED' },
            });
        }
    }

    async searchDocs(userId: string, query: string) {
        if (!query) return this.findAll(userId);

        return this.prisma.document.findMany({
            where: {
                userId,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { extractedData: { some: { fieldValue: { contains: query, mode: 'insensitive' } } } }
                ]
            },
            include: { extractedData: true }
        });
    }

    async createShareLink(userId: string, docId: string, options?: {
        expiryHours?: number;
        allowDownload?: boolean;
        allowPrint?: boolean;
        oneTimeDownload?: boolean;
        maxViews?: number;
    }) {
        // Check ownership
        const doc = await this.prisma.document.findFirst({ where: { id: docId, userId } });
        if (!doc) throw new Error('Not found');

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + (options?.expiryHours || 1));

        // Determine access type based on permissions
        let accessType: 'VIEW' | 'DOWNLOAD' | 'PRINT_ONLY' = 'VIEW';
        if (options?.allowDownload) {
            accessType = 'DOWNLOAD';
        } else if (options?.allowPrint && !options?.allowDownload) {
            accessType = 'PRINT_ONLY';
        }

        return this.prisma.documentShare.create({
            data: {
                documentId: docId,
                token,
                expiresAt,
                accessType,
                allowDownload: options?.allowDownload ?? false,
                allowPrint: options?.allowPrint ?? true,
                oneTimeDownload: options?.oneTimeDownload ?? false,
                maxViews: options?.maxViews ?? null,
            }
        });
    }

    async getUpcomingExpiries(userId: string) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        return this.prisma.document.findMany({
            where: {
                userId,
                expiryDate: {
                    lte: thirtyDaysFromNow,
                    gte: new Date()
                }
            }
        });
    }

    async deleteDocument(userId: string, docId: string) {
        // Check ownership
        const doc = await this.prisma.document.findFirst({ where: { id: docId, userId } });
        if (!doc) throw new Error('Not found or unauthorized');

        // Delete extracted data first (foreign key constraint)
        await this.prisma.extractedData.deleteMany({ where: { documentId: docId } });

        // Delete shares
        await this.prisma.documentShare.deleteMany({ where: { documentId: docId } });

        // Delete the document
        await this.prisma.document.delete({ where: { id: docId } });

        // Optionally delete the file from disk
        try {
            if (doc.r2Key && fs.existsSync(doc.r2Key)) {
                fs.unlinkSync(doc.r2Key);
            }
        } catch (e) {
            this.logger.warn('Failed to delete file from disk', e);
        }

        return { success: true, message: 'Document deleted' };
    }

    async processChat(userId: string, message: string) {
        const msg = message.toLowerCase();
        let response = "عذراً، لم أفهم سؤالك. يمكنك سؤالي عن عدد مستنداتك، أو المستندات التي تنتهي قريباً.";

        try {
            if (msg.includes('كم') || msg.includes('count') || msg.includes('عدد')) {
                const count = await this.prisma.document.count({ where: { userId } });
                response = `لديك ${count} مستندات في خزنتك.`;

                if (msg.includes('جواز') || msg.includes('passport')) {
                    const passportCount = await this.prisma.document.count({ where: { userId, category: 'PASSPORT' } });
                    response = `لديك ${passportCount} جواز سفر مسجل.`;
                } else if (msg.includes('هوي') || msg.includes('id')) {
                    const idCount = await this.prisma.document.count({ where: { userId, category: 'ID_CARD' } });
                    response = `لديك ${idCount} بطاقات هوية.`;
                }
            }
            else if (msg.includes('انتهاء') || msg.includes('expiry') || msg.includes('تنتهي')) {
                const expiring = await this.getUpcomingExpiries(userId);
                if (expiring.length > 0) {
                    const titles = expiring.map(d => d.title).join('، ');
                    response = `تنبيه: لديك ${expiring.length} مستندات تنتهي قريباً: ${titles}`;
                } else {
                    response = "عظيم! لا توجد مستندات تنتهي صلاحيتها خلال الـ 30 يوماً القادمة.";
                }
            }
            else if (msg.includes('بحث') || msg.includes('find') || msg.includes('show')) {
                const docs = await this.searchDocs(userId, msg.replace('بحث', '').replace('find', '').trim());
                if (docs.length > 0) {
                    response = `وجدت ${docs.length} مستندات تطابق بحثك: ${docs.map(d => d.title).join('، ')}`;
                } else {
                    response = "لم أجد أي مستندات تطابق هذا الوصف.";
                }
            }
            else if (msg.includes('مرحبا') || msg.includes('hello')) {
                response = "مرحباً بك! أنا مساعدك الذكي في وثيقتي. كيف يمكنني مساعدتك اليوم؟";
            }
        } catch (e) {
            this.logger.error('Chat processing error', e);
            response = "حدث خطأ أثناء معالجة طلبك.";
        }

        return { response };
    }

    async getSharedDocument(token: string) {
        const share = await this.prisma.documentShare.findUnique({
            where: { token },
            include: { document: { include: { extractedData: true } } }
        });

        if (!share) throw new Error('Invalid link');
        if (new Date() > share.expiresAt) throw new Error('Link expired');

        // Check max views
        if (share.maxViews && share.viewsCount >= share.maxViews) {
            throw new Error('Maximum views reached');
        }

        // Increment view count
        await this.prisma.documentShare.update({
            where: { id: share.id },
            data: { viewsCount: share.viewsCount + 1 }
        });

        // Return document with permission metadata
        return {
            document: share.document,
            permissions: {
                allowDownload: share.allowDownload,
                allowPrint: share.allowPrint,
                oneTimeDownload: share.oneTimeDownload,
                downloadUsed: share.downloadUsed,
                accessType: share.accessType,
                expiresAt: share.expiresAt,
                viewsCount: share.viewsCount + 1,
                maxViews: share.maxViews
            }
        };
    }

    async downloadSharedDocument(token: string) {
        const share = await this.prisma.documentShare.findUnique({
            where: { token },
            include: { document: true }
        });

        if (!share) throw new Error('Invalid link');
        if (new Date() > share.expiresAt) throw new Error('Link expired');
        if (!share.allowDownload) throw new Error('Download not allowed for this share');
        if (share.oneTimeDownload && share.downloadUsed) throw new Error('Download already used');

        // Mark as used if one-time download
        if (share.oneTimeDownload) {
            await this.prisma.documentShare.update({
                where: { id: share.id },
                data: { downloadUsed: true }
            });
        }

        const doc = share.document;
        if (!doc.r2Key || !fs.existsSync(doc.r2Key)) throw new Error('File not found');

        return { path: doc.r2Key, filename: doc.originalName || doc.title };
    }

    async getDocumentPath(userId: string, docId: string) {
        const doc = await this.prisma.document.findFirst({ where: { id: docId, userId } });
        if (!doc) throw new Error('Not found');
        if (!doc.r2Key || !fs.existsSync(doc.r2Key)) throw new Error('File not found on disk');

        return { path: doc.r2Key, filename: doc.originalName || doc.title };
    }
}
