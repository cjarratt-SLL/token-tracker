# 🧭 Token Tracker – Quick Start Checklist

A one-page guide for running, updating, and deploying the **Token Tracker Web App**.

---

## 🧩 1. Project Overview
**Backend:** FastAPI + SQLModel + Supabase (Render-hosted)  
**Frontend:** React + Vite (Netlify-hosted)  
**Local Path:** `C:\Projects\token-tracker`  
**Git Branch:** `main` (auto-deployed to Render & Netlify)

---

## 🧠 2. Local Setup (one-time)
```powershell
python --version3.12.7
node -v
npm -v
cd C:\Projects\token-tracker
python -m venv venv
.\venv\Scripts\Activate
pip install -r backend\requirements.txt
cd frontend
npm install
cd backend
.\..\venv\Scripts\Activate
python -m uvicorn main:app --reload --port 8080
cd frontend
npm run dev
DATABASE_URL=postgresql+pg8000://USER:PASSWORD@HOST:PORT/DB_NAME
DB_ECHO=false
ENV=development
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173,https://sll-resident-token-hub.netlify.app
VITE_API_BASE=http://127.0.0.1:8080
git add .
git commit -m "Your update message"
git push
| Issue                    | Solution                                   |
| ------------------------ | ------------------------------------------ |
| Import errors            | Select correct Python interpreter (`venv`) |
| Frontend not connecting  | Check `.env` → `127.0.0.1:8080`            |
| Backend won’t start      | Verify `.env` `DATABASE_URL`               |
| Deployment didn’t update | Ensure pushed to `main` branch             |
