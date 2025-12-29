# 🚀 Deployment Guide:# Wathiqni - Railway Deployment Guide (Docker)

This guide explains how to deploy the **Wathiqni** application to [Railway](https://railway.app/) using **Docker**.

## Prerequisites
- GitHub account with the `ID-storage` repo.
- Railway account.
- **Dockerfiles**: The project uses standard `Dockerfile` configurations for both Client and Server. Railway will automatically detect and use them.
- **Scripts** have been optimized (`postinstall` added for Prisma).
- **AI Engine** configured to use local data if no API key is provided.

**Action Required from You:**
1. **Push your code to GitHub.**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

---

## 2. Deploying to Railway

You need to create **Two Services** in your Railway project: one for the Database, one for the Backup, and two for the App (Frontend & Backend).

### Step 1: Create Database
1. Click **"New Service"** -> **Database** -> **PostgreSQL**.
2. Wait for it to deploy.
3. Keep the **Connection URL** handy (found in the "Connect" tab).

### Step 2: Deploy Backend (Server)
1. On Railway, click **"New Project"** -> **"Deploy from GitHub repo"**.
2. Select your `ID-storage` repository.
3. Click **"Variable"** and add:
   - `PORT`: `3001`
   - `DATABASE_URL`: (Railway provides this automatically if you add a Database service)
   - `JWT_SECRET`: `your-secret`
4. **Important**: Go to **Settings** -> **Service** -> **Root Directory** and set it to `/server`.
   - Railway will detect `server/Dockerfile` and build using Docker.
5. Generate a Domain in **Networking**.
   - **Backend URL**: `https://id-storage-production-39bf.up.railway.app`

### Step 3: Deploy Frontend (Client)
1. Click **"New Service"** -> **GitHub Repo** -> Select your repo (again).
2. Click the new service card -> **Settings**.
3. Scroll down to **Root Directory** and set it to: `/client` (Important!).
4. Go to the **Variables** tab and add:
   - `NEXT_PUBLIC_API_URL`: `https://id-storage-production-39bf.up.railway.app`
   - `NEXT_PUBLIC_MAX_FILE_SIZE`: `10485760`
5. Railway will detect Next.js and deploy.
6. Generate a Domain in **Networking**.
   - **Frontend URL**: `https://athletic-communication-production.up.railway.app`

---

## 3. Post-Deployment Checks
- Visit your Frontend URL.
- Try Registering/Logging in.
- Upload a document.
  - If you added `OPENAI_API_KEY`, it will give detailed smart analysis.
  - If not, it will use the local reliable Regex engine using the pre-uploaded training data.

---

## 4. Troubleshooting Common Deployment Errors

### ❌ Error: 502 Bad Gateway (Backend)
**Cause:** Backend service failed to start or crashed.

**Solutions:**
1. Check Railway logs for the backend service
2. Verify `DATABASE_URL` is set correctly (Railway auto-generates this)
3. Ensure Prisma migrations ran successfully:
   ```bash
   # Check logs for: "npx prisma migrate deploy"
   ```
4. Verify health endpoint responds:
   ```bash
   curl https://your-backend-url.railway.app/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

### ❌ Error: CORS Policy Blocked
**Cause:** Backend CORS_ORIGIN doesn't include frontend URL.

**Solutions:**
1. In Railway Backend Variables, set:
   ```
   CORS_ORIGIN=https://your-frontend-url.railway.app
   ```
   Or for multiple origins:
   ```
   CORS_ORIGIN=https://frontend1.railway.app,https://frontend2.railway.app
   ```
   Or for development (NOT production):
   ```
   CORS_ORIGIN=*
   ```
2. Redeploy backend after changing CORS_ORIGIN
3. Verify in backend logs: "Allowed CORS Origins: ..."

### ❌ Error: Cannot connect to database
**Cause:** DATABASE_URL not set or PostgreSQL service not running.

**Solutions:**
1. Ensure PostgreSQL service is deployed and running
2. In Backend service, verify `DATABASE_URL` variable exists
3. Railway should auto-link database - if not, manually copy connection string from DB service

### ❌ Error: OCR/Tesseract fails in production
**Cause:** Tesseract language data not available or Sharp library issues.

**Solutions:**
1. Verify Dockerfile installs tesseract packages:
   ```dockerfile
   RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-ara tesseract-ocr-data-eng
   ```
2. Check backend logs for Tesseract initialization
3. If Sharp fails, ensure `python3 make g++` are in build stage

### ❌ Error: Frontend shows "API_URL undefined"
**Cause:** NEXT_PUBLIC_API_URL not set during build.

**Solutions:**
1. In Railway Frontend Variables, add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
2. **IMPORTANT:** Redeploy frontend (environment variables require rebuild)
3. Verify in browser console: `console.log(process.env.NEXT_PUBLIC_API_URL)`

### ❌ Error: File uploads fail
**Cause:** Upload directory permissions or size limits.

**Solutions:**
1. Verify `MAX_FILE_SIZE` environment variable is set (default: 10485760 = 10MB)
2. Check Railway volume/disk space
3. Ensure Dockerfile creates uploads directory:
   ```dockerfile
   RUN mkdir -p /app/uploads && chown -R node:node /app
   ```

### 🔍 Debugging Tips
1. **Check Railway Logs:**
   - Click on service → "Deployments" → Latest deployment → "View Logs"
   - Look for errors during build or runtime

2. **Test Health Endpoints:**
   ```bash
   # Backend
   curl https://your-backend.railway.app/health
   
   # Frontend
   curl https://your-frontend.railway.app
   ```

3. **Verify Environment Variables:**
   - Backend: DATABASE_URL, JWT_SECRET, CORS_ORIGIN, PORT
   - Frontend: NEXT_PUBLIC_API_URL

4. **Check Build Logs:**
   - Ensure `npm run build` succeeds for both services
   - Verify Prisma generates client: "npx prisma generate"
   - Check for TypeScript errors

---

## 5. Local Development (Optional)
If you still want to run locally with Docker:
```bash
# This still works because we updated the config!
docker compose up --build
```

