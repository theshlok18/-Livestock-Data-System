# 🐄 Livestock Animal Data Digitization System

A web app to digitize paper-based livestock records — track animals, monthly milk production, health data, and export reports as PDF or Excel.

---

## What You Need First

Before running anything, make sure these are installed on your computer:

| Tool | Check if installed | Download |
|---|---|---|
| Python 3.10+ | `python --version` | https://python.org |
| Node.js 18+ | `node --version` | https://nodejs.org |

> You do **NOT** need MySQL. This app uses SQLite (built into Python — no setup needed).

---

## How to Run — Step by Step

### Step 1 — Open your terminal and go to the project folder

```
cd livestock-app
```

---

### Step 2 — Set up the Backend (Python / Flask)

```
cd backend
```

Install Python packages:

```
pip install flask flask-cors flask-jwt-extended bcrypt python-dotenv reportlab pillow openpyxl xlsxwriter
```

Create the database and your login account:

```
python init_db.py
```

Start the backend server:

```
python app.py
```

You should see:
```
* Running on http://127.0.0.1:5000
```

✅ Backend is running. **Keep this terminal open.**

---

### Step 3 — Set up the Frontend (React)

Open a **new terminal window**, then:

```
cd livestock-app/frontend
```

Install packages:

```
npm install
```

Start the frontend:

```
npm run dev
```

You should see:
```
Local: http://localhost:3000/
```

✅ Frontend is running. **Keep this terminal open too.**

---

### Step 4 — Open the App

Open your browser and go to:

```
http://localhost:3000
```

Login with:
- **Username:** `shlok`
- **Password:** `shlok@0011`

---

## How to Use the App

### 🆕 New Entry
Use this when you want to register a **brand new animal** that has never been added before.
1. Click **New Entry** in the navbar
2. Type a new tag number (e.g. `TAG005`)
3. Fill in the animal details and monthly data
4. Click **Submit Record**

### 🔍 Search Animal
Use this when the animal **already exists** and you want to add a monthly record or view history.
1. Click **Search** in the navbar
2. Type the tag number (e.g. `TAG001`)
3. Click **Add Monthly Record** or **View History**

### 📋 History
View all past monthly records for any animal.
- Click **View History** from the search result
- Switch between **Cards view** and **Table view**
- **Edit** or **Delete** any record inline
- **Download** as PDF or Excel

### ⬇️ Download Reports
Every record and full history can be downloaded:
- **PDF** — formatted report, ready to print
- **Excel (.xlsx)** — spreadsheet with filters, one row per record

---

## Folder Structure

```
livestock-app/
│
├── backend/                  ← Python Flask API
│   ├── app.py                ← Start the server from here
│   ├── init_db.py            ← Run once to create database + user
│   ├── db.py                 ← Database connection
│   ├── config.py             ← App settings
│   ├── .env                  ← Secret keys (don't share this)
│   ├── livestock.db          ← SQLite database (auto-created)
│   └── routes/
│       ├── auth.py           ← Login endpoint
│       └── api.py            ← All other endpoints
│
└── frontend/                 ← React app
    └── src/
        ├── App.jsx           ← Routes
        ├── components/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── Navbar.jsx
        │   ├── NewEntry.jsx       ← Create new animal
        │   ├── SearchAnimal.jsx   ← Find existing animal
        │   ├── AnimalForm.jsx     ← Monthly data form
        │   ├── DynamicForm.jsx    ← Paper-form replica
        │   ├── HistoryViewer.jsx  ← View/edit/delete records
        │   └── ExportMenu.jsx     ← PDF + Excel download
        └── config/
            └── formSchema.json   ← All form fields defined here
```

---

## API Endpoints (for reference)

| Method | URL | What it does |
|---|---|---|
| POST | `/api/login` | Login |
| GET | `/api/animal/:tagNo` | Get animal by tag |
| POST | `/api/animal` | Create or update animal |
| POST | `/api/record` | Add monthly record |
| PUT | `/api/record/:id` | Edit a record |
| DELETE | `/api/record/:id` | Delete a record |
| GET | `/api/records/:tagNo` | Get all records for a tag |
| GET | `/api/stats` | Dashboard stats |
| GET | `/api/export/record/:id/pdf` | Download single record as PDF |
| GET | `/api/export/record/:id/excel` | Download single record as Excel |
| GET | `/api/export/animal/:tagNo/pdf` | Download full history as PDF |
| GET | `/api/export/animal/:tagNo/excel` | Download full history as Excel |

---

## Common Problems

**"Module not found" error when starting backend**
→ Run `pip install flask flask-cors flask-jwt-extended bcrypt python-dotenv reportlab pillow openpyxl xlsxwriter` again

**"npm: command not found"**
→ Install Node.js from https://nodejs.org

**Login says "Invalid credentials"**
→ Make sure you ran `python init_db.py` first

**Port 3000 or 5000 already in use**
→ Close other terminals or restart your computer

**Database not found**
→ Run `python init_db.py` from inside the `backend` folder

---

## To Stop the Servers

Press `Ctrl + C` in each terminal window.

---

## To Reset Everything (fresh start)

```
cd livestock-app/backend
del livestock.db
python init_db.py
```

This wipes all data and recreates the database with just the `shlok` account.
