# Deployment Guide — Livestock Data System

## What's already built

| Feature | Status |
|---|---|
| Animal registration | ✅ |
| Monthly records (milk, fat, SNF, rate) | ✅ |
| Feeding details with auto-calculation | ✅ |
| Health & breeding records | ✅ |
| PDF + Excel export | ✅ |
| JWT authentication | ✅ |
| English / Marathi language toggle | ✅ |
| Animal photo upload | ✅ |
| Dashboard with live stats | ✅ |
| Data persists after refresh/re-login | ✅ |

Database: **SQLite** (file-based, zero config, works on any server including Render free tier)

---

## Run Locally

```bash
# Backend
cd livestock-app/backend
pip install -r requirements.txt
python init_db.py        # creates DB + shlok user
python app.py            # starts on :5000

# Frontend (new terminal)
cd livestock-app/frontend
npm install
npm run dev              # starts on :3000
```

Login: `shlok` / `shlok@0011`

---

## Deploy to Render (Free)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Livestock app"
git remote add origin https://github.com/YOUR_USERNAME/livestock-app.git
git push -u origin main
```

### Step 2 — Deploy Backend

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `livestock-app/backend`
   - **Build Command:** `pip install -r requirements.txt && python init_db.py`
   - **Start Command:** `gunicorn "app:create_app()" --bind 0.0.0.0:$PORT --workers 2`
   - **Environment:** Python 3

4. Add Environment Variables:
   ```
   SECRET_KEY        = (click Generate)
   JWT_SECRET_KEY    = (click Generate)
   FLASK_ENV         = production
   DB_PATH           = /opt/render/project/src/livestock.db
   UPLOAD_FOLDER     = /opt/render/project/src/uploads
   FRONTEND_URL      = https://YOUR-FRONTEND.onrender.com
   ```

5. Deploy → copy the backend URL (e.g. `https://livestock-backend.onrender.com`)

### Step 3 — Deploy Frontend

1. New → Static Site
2. Settings:
   - **Root Directory:** `livestock-app/frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

3. Add Environment Variable:
   ```
   VITE_API_URL = https://livestock-backend.onrender.com/api
   ```

4. Deploy

### Step 4 — Update CORS

Go back to backend service → Environment Variables → update:
```
FRONTEND_URL = https://YOUR-ACTUAL-FRONTEND-URL.onrender.com
```
Redeploy backend.

---

## Deploy Frontend to Netlify (Alternative)

```bash
cd livestock-app/frontend
npm run build
# Drag the 'dist' folder to netlify.com/drop
```

Or connect GitHub repo:
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

The `public/_redirects` file handles SPA routing automatically.

---

## Sample .env files

**backend/.env**
```
SECRET_KEY=your-random-secret-here
JWT_SECRET_KEY=another-random-secret-here
FLASK_ENV=production
DB_PATH=/opt/render/project/src/livestock.db
UPLOAD_FOLDER=/opt/render/project/src/uploads
FRONTEND_URL=https://your-frontend.onrender.com
PORT=5000
```

**frontend/.env**
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Data Persistence

All data is stored in SQLite (`livestock.db`):
- Animals table
- Monthly records table (with feeding_data as JSON column)
- Users table

On Render, the file persists at `/opt/render/project/src/livestock.db` across deploys.
For guaranteed persistence, you can also use Render's **Disk** add-on (mount at `/data`).

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | Login |
| GET | `/api/animal/:tagNo` | Get animal |
| POST | `/api/animal` | Create/update animal |
| POST | `/api/record` | Add monthly record |
| PUT | `/api/record/:id` | Edit record |
| DELETE | `/api/record/:id` | Delete record |
| GET | `/api/records/:tagNo` | All records for tag |
| GET | `/api/stats` | Dashboard stats |
| GET | `/api/export/record/:id/pdf` | PDF export |
| GET | `/api/export/record/:id/excel` | Excel export |
| GET | `/api/export/animal/:tagNo/pdf` | Full history PDF |
| GET | `/api/export/animal/:tagNo/excel` | Full history Excel |
| POST | `/api/profile/change-password` | Change password |
| GET | `/health` | Health check |
