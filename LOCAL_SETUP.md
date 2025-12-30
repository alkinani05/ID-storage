# 🏠 Wathiqni - Local Development Setup

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git installed

### 1. Clone and Setup

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd ID-storage

# Create environment file from example
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file with your local settings:

```env
# Database Configuration
POSTGRES_USER=dev
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_DB=wathiqati

# Server Configuration
JWT_SECRET=your-jwt-secret-change-in-production
NODE_ENV=production

# Client Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: OpenAI API Key for advanced document analysis
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Start the Application

**Option A: Using the test script (Recommended)**
```bash
chmod +x test-local.sh
./test-local.sh
```

**Option B: Using deploy script**
```bash
chmod +x deploy.sh
./deploy.sh start
```

**Option C: Manual Docker Compose**
```bash
docker compose up --build -d
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health
- **Database**: localhost:5432

### 5. First Time Setup

1. **Create an account**: Visit http://localhost:3000/register
2. **Login**: Use your credentials at http://localhost:3000/login
3. **Upload a document**: Test the OCR functionality

---

## 📋 Available Commands

### Using deploy.sh

```bash
./deploy.sh start      # Start all services
./deploy.sh stop       # Stop all services
./deploy.sh restart    # Restart all services
./deploy.sh logs       # View logs
./deploy.sh clean      # Stop and remove all data
./deploy.sh build      # Build containers
```

### Using Docker Compose Directly

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild and start
docker compose up --build -d

# Clean everything (including data)
docker compose down -v
```

---

## 🔍 Troubleshooting

### Check Service Status

```bash
docker compose ps
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f server
docker compose logs -f client
docker compose logs -f postgres
```

### Backend Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

### Common Issues

#### Port Already in Use

If ports 3000, 3001, or 5432 are in use:

```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :5432

# Kill the process or change ports in docker-compose.yml
```

#### Database Connection Failed

```bash
# Check if postgres is healthy
docker compose ps

# Restart postgres
docker compose restart postgres

# Check postgres logs
docker compose logs postgres
```

#### Frontend Can't Connect to Backend

1. Check NEXT_PUBLIC_API_URL in .env is `http://localhost:3001`
2. Rebuild client:
   ```bash
   docker compose up --build client -d
   ```

#### OCR Not Working

1. Check server logs: `docker compose logs server`
2. Verify Tesseract is installed in container:
   ```bash
   docker compose exec server tesseract --version
   ```

---

## 🛠️ Development Mode

To run in development mode with hot reload:

### Backend (Server)

```bash
cd server
npm install
cp .env.example .env
# Edit .env with: DATABASE_URL=postgresql://dev:your-password@localhost:5432/wathiqati

# Start only database
docker compose up postgres -d

# Run server in dev mode
npm run start:dev
```

### Frontend (Client)

```bash
cd client
npm install
cp env.example .env.local
# Edit .env.local with: NEXT_PUBLIC_API_URL=http://localhost:3001

# Run client in dev mode
npm run dev
```

---

## 🧹 Cleanup

### Stop and Remove Containers

```bash
docker compose down
```

### Remove All Data (Database, Uploads)

```bash
docker compose down -v
```

### Remove Images

```bash
docker compose down --rmi all
```

---

## 🧪 Testing

### Test Document Upload

```bash
# Register a user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "fullName": "Test User"
  }'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

---

## 📊 Monitoring

### Resource Usage

```bash
docker stats
```

### Database Access

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U dev -d wathiqati

# Common queries
\dt                  # List tables
SELECT * FROM "User";
SELECT * FROM "Document";
\q                   # Quit
```

---

## 🔐 Security Notes

- Change default passwords in `.env` before deploying
- Never commit `.env` file to version control
- Use strong JWT_SECRET in production
- Regularly update Docker images

---

## 📚 Project Structure

```
ID-storage/
├── client/              # Next.js frontend
│   ├── app/            # App router pages
│   ├── lib/            # API client & utilities
│   └── Dockerfile      # Client container
├── server/             # NestJS backend
│   ├── src/            # Source code
│   ├── prisma/         # Database schema & migrations
│   └── Dockerfile      # Server container
├── docker-compose.yml  # Local orchestration
├── .env.example        # Environment template
└── LOCAL_SETUP.md      # This file
```

---

## 🆘 Getting Help

- Check logs: `docker compose logs -f`
- Verify environment: `cat .env`
- Test connectivity: `curl http://localhost:3001/health`
- Rebuild everything: `docker compose up --build -d`

For persistent issues, check:
1. Docker is running
2. Ports are not in use
3. .env file is properly configured
4. Sufficient disk space for Docker
