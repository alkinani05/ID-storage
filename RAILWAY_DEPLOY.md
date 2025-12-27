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

## 4. Local Development (Optional)
If you still want to run locally with Docker:
```bash
# This still works because we updated the config!
docker compose up --build
```
