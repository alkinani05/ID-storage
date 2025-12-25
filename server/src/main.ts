import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
    try {
        const app = await NestFactory.create(AppModule);
        app.enableCors({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true,
        });
        app.useGlobalPipes(new ValidationPipe());
        const uploadPath = join(process.cwd(), 'uploads');
        console.log('Serving static files from:', uploadPath);
        app.use('/uploads', express.static(uploadPath));
        const PORT = process.env.PORT || 3001;
        // Bind to 0.0.0.0 for Railway compatibility
        await app.listen(PORT, '0.0.0.0');
        console.log(`Application is running on port ${PORT}`);
    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}
bootstrap();
