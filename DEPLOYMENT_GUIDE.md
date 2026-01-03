# 🚀 DIU ID Card Detection - Deployment Guide

This guide covers the **easiest and most cost-effective** ways to deploy your ID Card Detection project.

---

## 📋 Project Overview

| Component | Technology | Size |
|-----------|------------|------|
| Backend | FastAPI + Python | ~500MB (with YOLO model) |
| Frontend | React + Vite | ~5MB (built) |
| Database | SQLite | File-based (auto-created) |
| ML Model | YOLOv11m | ~50MB |

---

## 🎯 Recommended Deployment Strategy

### **Option 1: Railway (Easiest - Recommended for Demo)**

**Cost:** Free tier available (500 hours/month)  
**Best for:** Thesis demo, temporary deployment

#### Backend Deployment on Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Prepare Backend for Railway**

   Create `Procfile` in backend folder:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

   Create `runtime.txt` in backend folder:
   ```
   python-3.11.0
   ```

   Update `requirements.txt` (already done):
   ```
   fastapi==0.109.0
   uvicorn[standard]==0.27.0
   python-multipart==0.0.6
   ultralytics==8.1.0
   opencv-python-headless==4.9.0.80
   pillow==10.2.0
   numpy==1.26.3
   python-dotenv==1.0.0
   pydantic==2.5.3
   sqlalchemy==2.0.25
   ```

3. **Deploy to Railway**
   ```bash
   cd backend
   
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   railway init
   
   # Deploy
   railway up
   ```

4. **Set Environment Variables in Railway Dashboard**
   ```
   PORT=8000
   CORS_ORIGINS=https://your-frontend-url.vercel.app
   CONFIDENCE_THRESHOLD=0.5
   ```

5. **Get your backend URL** (e.g., `https://your-app.railway.app`)

---

### **Option 2: Render (Free & Easy)**

**Cost:** Free tier (spins down after inactivity)  
**Best for:** Portfolio projects

#### Backend on Render

1. Go to [render.com](https://render.com) and sign up

2. Create `render.yaml` in project root:
   ```yaml
   services:
     - type: web
       name: diu-id-detection-api
       env: python
       buildCommand: cd backend && pip install -r requirements.txt
       startCommand: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
       envVars:
         - key: PYTHON_VERSION
           value: 3.11.0
         - key: CORS_ORIGINS
           value: https://your-frontend.vercel.app
   ```

3. Connect your GitHub repo and deploy

---

## 🌐 Frontend Deployment (Vercel - Always Free)

Vercel is the **best choice** for React/Vite apps - it's free and very fast.

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Create `.env.production` in frontend folder**
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

3. **Build and Deploy**
   ```bash
   cd frontend
   
   # Login to Vercel
   vercel login
   
   # Deploy (follow prompts)
   vercel
   
   # For production deployment
   vercel --prod
   ```

4. **Or use Vercel Dashboard (Even Easier)**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repo
   - Set root directory to `frontend`
   - Add environment variable: `VITE_API_URL=https://your-backend.railway.app`
   - Deploy!

---

## 🔧 Quick Local Setup (For Testing)

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run server
python run.py
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 📁 Files to Create for Deployment

### 1. Backend `Procfile`
Create file: `backend/Procfile`
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 2. Backend `runtime.txt`
Create file: `backend/runtime.txt`
```
python-3.11.0
```

### 3. Frontend `.env.production`
Create file: `frontend/.env.production`
```
VITE_API_URL=https://YOUR_BACKEND_URL_HERE
```

### 4. Root `vercel.json` (for frontend)
Create file: `frontend/vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## ⚠️ Important Notes

### Model File Size
Your YOLO model (`runs_detect_id_card_yolo11m_75epochs_weights_best.pt`) is ~50MB. 

**Options:**
1. **Include in Git LFS** (recommended for Railway/Render)
   ```bash
   git lfs install
   git lfs track "*.pt"
   git add .gitattributes
   git add backend/*.pt
   git commit -m "Add model with LFS"
   ```

2. **Host model separately** (for larger models)
   - Upload to Google Drive/Dropbox
   - Download on server startup

### SQLite Database
- SQLite works perfectly on Railway/Render
- Database file is created automatically at `backend/detection_records.db`
- **Note:** Free tiers may reset storage periodically

### CORS Configuration
After deploying frontend, update backend's `CORS_ORIGINS`:
```
CORS_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

---

## 🚀 Step-by-Step Deployment Checklist

### Step 1: Prepare Files
- [ ] Create `backend/Procfile`
- [ ] Create `backend/runtime.txt`
- [ ] Create `frontend/.env.production` (leave URL empty for now)
- [ ] Push all changes to GitHub

### Step 2: Deploy Backend (Railway)
- [ ] Create Railway account
- [ ] Create new project from GitHub
- [ ] Select `backend` folder as root
- [ ] Add environment variables
- [ ] Deploy and get URL

### Step 3: Deploy Frontend (Vercel)
- [ ] Create Vercel account
- [ ] Import GitHub repo
- [ ] Set root directory to `frontend`
- [ ] Add `VITE_API_URL` with Railway backend URL
- [ ] Deploy

### Step 4: Update CORS
- [ ] Go to Railway dashboard
- [ ] Update `CORS_ORIGINS` with Vercel frontend URL
- [ ] Redeploy backend

### Step 5: Test
- [ ] Open Vercel URL
- [ ] Check health status (should show green)
- [ ] Upload an image and test detection
- [ ] Check Analytics tab

---

## 💰 Cost Summary

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Railway** | 500 hours/month | $5/month |
| **Render** | 750 hours/month (spins down) | $7/month |
| **Vercel** | Unlimited for personal | - |
| **Total** | **$0** | ~$5-12/month |

---

## 🆘 Troubleshooting

### "Model not loaded" error
- Check if `.pt` file is in the backend folder
- Verify Git LFS is tracking the file

### CORS errors
- Add your frontend URL to `CORS_ORIGINS` in backend

### "Cannot connect to API"
- Check if backend is running (visit `/health` endpoint)
- Verify `VITE_API_URL` in frontend

### Slow first request
- Free tier servers "sleep" after inactivity
- First request wakes them up (30-60 seconds)

---

## 📞 Quick Commands Reference

```bash
# Backend local run
cd backend && source venv/bin/activate && python run.py

# Frontend local run
cd frontend && npm run dev

# Frontend build
cd frontend && npm run build

# Deploy to Railway
cd backend && railway up

# Deploy to Vercel
cd frontend && vercel --prod
```

---

**Good luck with your thesis defense! 🎓**
