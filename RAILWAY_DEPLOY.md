# 🚀 Deployment Guide: Wathiqati (Railway)

This guide explains how to deploy the **Wathiqati** application to [Railway](https://railway.app) without using Docker (using Native Nixpacks).

## 1. Preparation (Already Completed)

The codebase has been prepared for Railway:
- **Dockerfiles** have been renamed to `Dockerfile.local` (ignored by Railway).
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
1. Click **"New Service"** -> **GitHub Repo** -> Select your repo.
2. Click the new service card -> **Settings**.
3. Scroll down to **Root Directory** and set it to: `/server` (Important!).
4. Go to the **Variables** tab and add:
   - `DATABASE_URL`: (Paste the PostgreSQL URL from Step 1)
   - `JWT_SECRET`: (Create a random secure key)
   - `OPENAI_API_KEY`: (Optional, for advanced AI features. `sk-...`)
   - `PORT`: `3001`
   - `NIXPACKS_PKGS`: `tesseract-ocr` (Optional, but recommended for robustness)
5. Railway will detect the changes and deploy.
6. Once deployed, go to **Settings** -> **Networking** -> **Generate Domain**.
   - Copy this URL (e.g., `https://server-production.up.railway.app`).

### Step 3: Deploy Frontend (Client)
1. Click **"New Service"** -> **GitHub Repo** -> Select your repo (again).
2. Click the new service card -> **Settings**.
3. Scroll down to **Root Directory** and set it to: `/client` (Important!).
4. Go to the **Variables** tab and add:
   - `NEXT_PUBLIC_API_URL`: (Paste the Backend URL from Step 2)
   - `NEXT_PUBLIC_MAX_FILE_SIZE`: `10485760`
5. Railway will detect Next.js and deploy.
6. Generate a Domain in **Networking**.

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
