# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ 

# Copy package files first for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache \
    openssl \
    tesseract-ocr \
    tesseract-ocr-data-ara \
    tesseract-ocr-data-eng

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Copy traineddata files if they exist
COPY *.traineddata ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R node:node /app

# Use non-root user for security
USER node

EXPOSE 3001

# Health check using node (no wget needed)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "const http = require('http'); const port = process.env.PORT || 3001; http.get('http://localhost:' + port + '/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && echo 'Listing dist:' && ls -R dist && node dist/main"]
