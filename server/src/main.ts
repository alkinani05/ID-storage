import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

const logger = new Logger('Bootstrap');

async function bootstrap() {
    try {
        const app = await NestFactory.create(AppModule);

        // Robust CORS configuration
        const allowedOrigins = process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
            : ['http://localhost:3000', 'http://localhost:3001'];

        app.enableCors({
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) return callback(null, true);

                if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    logger.warn(`Blocked CORS request from origin: ${origin}`);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
        });

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
            }),
        );

        const uploadPath = join(process.cwd(), 'uploads');
        app.use('/uploads', express.static(uploadPath));

        const PORT = process.env.PORT || 3001;

        // Bind to 0.0.0.0 for Railway compatibility
        await app.listen(PORT, '0.0.0.0');
        logger.log(`Application is running on port ${PORT}`);
        logger.log(`Allowed CORS Origins: ${allowedOrigins.join(', ')}`);
    } catch (error) {
        logger.error('Failed to start application', error.stack);
        process.exit(1);
    }
}

bootstrap().catch((err) => {
    logger.error('Bootstrap failed', err);
    process.exit(1);
});
