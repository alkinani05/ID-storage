import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaService } from '../prisma.service';
import { OcrService } from './ocr.service';

import { ShareController } from './share.controller';

@Module({
    controllers: [DocumentsController, ShareController],
    providers: [DocumentsService, PrismaService, OcrService],
})
export class DocumentsModule { }
