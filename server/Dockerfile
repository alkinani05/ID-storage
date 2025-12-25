# Build stage
FROM node:20 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20 AS production

WORKDIR /app

# Install production dependencies
RUN apt-get update -y && apt-get install -y openssl tesseract-ocr tesseract-ocr-ara tesseract-ocr-eng

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/*.traineddata ./

# Set environment variables
ENV NODE_ENV=production

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 3001

# Run migrations and start
CMD ["npm", "run", "start:prod"]
