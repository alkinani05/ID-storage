import { Controller, Get, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DocumentsService } from './documents.service';

@Controller('share')
export class ShareController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Get(':token')
    async getSharedDoc(@Param('token') token: string) {
        try {
            return await this.documentsService.getSharedDocument(token);
        } catch (e: any) {
            throw new HttpException(e.message || 'Access denied', HttpStatus.FORBIDDEN);
        }
    }

    @Get(':token/file')
    async getSharedFile(@Param('token') token: string, @Res() res: Response) {
        try {
            const { path, mimeType } = await this.documentsService.getSharedFilePath(token);
            const absolutePath = path.startsWith('/') ? path : require('path').resolve(path);
            res.setHeader('Content-Type', mimeType || 'application/octet-stream');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return res.sendFile(absolutePath);
        } catch (e: any) {
            throw new HttpException(e.message || 'File access denied', HttpStatus.FORBIDDEN);
        }
    }

    @Get(':token/download')
    async downloadSharedDoc(@Param('token') token: string, @Res() res: Response) {
        try {
            const { path, filename } = await this.documentsService.downloadSharedDocument(token);
            return res.download(path, filename);
        } catch (e: any) {
            throw new HttpException(e.message || 'Download not allowed', HttpStatus.FORBIDDEN);
        }
    }
}
