import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

const logger = new Logger('Bootstrap');

async function bootstrap() {
    try {
        const app = await NestFactory.create(AppModule);

        app.enableCors({
            origin: [
                'http://localhost:3000',
                'https://athletic-communication-production.up.railway.app',
                process.env.CORS_ORIGIN
            ].filter(Boolean),
            credentials: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            allowedHeaders: 'Content-Type, Accept, Authorization',
        });

        app.useGlobalPipes(new ValidationPipe());

        const uploadPath = join(process.cwd(), 'uploads');
        app.use('/uploads', express.static(uploadPath));

        const PORT = process.env.PORT || 3001;

        // Bind to 0.0.0.0 for Railway compatibility
        await app.listen(PORT, '0.0.0.0');
        logger.log(`Application is running on port ${PORT}`);
    } catch (error) {
        logger.error('Failed to start application', error.stack);
        process.exit(1);
    }
}

bootstrap().catch((err) => {
    logger.error('Bootstrap failed', err);
    process.exit(1);
});
