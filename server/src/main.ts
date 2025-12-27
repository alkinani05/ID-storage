import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

console.log('=== Starting Application ===');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('PORT env:', process.env.PORT);

async function bootstrap() {
    try {
        console.log('Creating NestJS application...');
        const app = await NestFactory.create(AppModule);
        console.log('NestJS application created');

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
        console.log('CORS enabled');

        app.useGlobalPipes(new ValidationPipe());

        const uploadPath = join(process.cwd(), 'uploads');
        console.log('Serving static files from:', uploadPath);
        app.use('/uploads', express.static(uploadPath));

        const PORT = process.env.PORT || 3001;
        console.log('About to listen on port:', PORT);

        // Bind to 0.0.0.0 for Railway compatibility
        await app.listen(PORT, '0.0.0.0');
        console.log(`=== Application is running on port ${PORT} ===`);
    } catch (error) {
        console.error('=== Failed to start application ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

bootstrap().catch((err) => {
    console.error('Bootstrap catch:', err);
    process.exit(1);
});
