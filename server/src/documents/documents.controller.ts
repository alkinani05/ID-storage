import { Controller, Post, UseInterceptors, UploadedFile, Body, UseGuards, Request, Get, Query, Param, Delete, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';

@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Request() req) {
        return this.documentsService.create(req.user.userId, file, body);
    }

    @Get()
    findAll(@Request() req, @Query('q') q: string) {
        if (q) return this.documentsService.searchDocs(req.user.userId, q);
        return this.documentsService.findAll(req.user.userId);
    }

    @Get(':id/download')
    async downloadDoc(@Param('id') id: string, @Request() req, @Res() res: Response) {
        const { path, filename } = await this.documentsService.getDocumentPath(req.user.userId, id);
        return res.download(path, filename);
    }

    @Post(':id/share')
    shareDoc(@Param('id') id: string, @Request() req, @Body() body?: {
        expiryHours?: number;
        allowDownload?: boolean;
        allowPrint?: boolean;
        oneTimeDownload?: boolean;
        maxViews?: number;
    }) {
        return this.documentsService.createShareLink(req.user.userId, id, body);
    }

    @Delete(':id')
    deleteDoc(@Param('id') id: string, @Request() req) {
        return this.documentsService.deleteDocument(req.user.userId, id);
    }

    @Get('alerts')
    getAlerts(@Request() req) {
        return this.documentsService.getUpcomingExpiries(req.user.userId);
    }

    @Post('chat')
    chat(@Body() body: { message: string }, @Request() req) {
        return this.documentsService.processChat(req.user.userId, body.message);
    }
}
