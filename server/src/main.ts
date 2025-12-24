import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    const uploadPath = join(process.cwd(), 'uploads');
    console.log('Serving static files from:', uploadPath);
    app.use('/uploads', express.static(uploadPath));
    const PORT = process.env.PORT || 3001;
    await app.listen(PORT);
    console.log(`Application is running on: http://localhost:${PORT}`);
}
bootstrap();
