# 🐄 Livestock Data System

> **A complete production-ready web application for digitizing paper-based livestock farm records.**

[![GitHub](https://img.shields.io/badge/GitHub-theshlok18-181717?style=flat&logo=github)](https://github.com/theshlok18/-Livestock-Data-System)
[![Made by Shlok](https://img.shields.io/badge/Made%20by-Shlok%20Sathe-16a34a?style=flat)](https://github.com/theshlok18)
[![Python](https://img.shields.io/badge/Backend-Python%20Flask-3776AB?style=flat&logo=python)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=flat&logo=react)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

---

## 📌 About

The **Livestock Data System** replaces paper-based animal record keeping with a modern, bilingual (English + Marathi) web application. Field officers can register animals, record monthly milk production, log feeding details, track health status, and export reports as PDF or Excel — all from any device.

Built entirely by **Shlok Sathe** as a full-stack project.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🐄 Animal Registration | Register animals with tag number, breed, owner, and photo |
| 📋 Monthly Records | Record milk yield, fat%, SNF%, rate, expenses per month |
| 🌾 Feeding Management | Log feed items with dependent dropdowns and auto cost calculation |
| 🏥 Health Tracking | Vaccination, deworming, pregnancy, lactation records |
| 📊 Dashboard | Live stats — total animals, records, drafts, recent activity |
| 📄 PDF Export | Download formatted reports per record or full history |
| 📊 Excel Export | Download spreadsheet with filters and auto-fit columns |
| 🌐 Bilingual | Full English / Marathi language toggle |
| 🔐 JWT Auth | Secure login with token-based authentication |
| 📱 Responsive | Works perfectly on mobile, tablet, and desktop |
| 🖨️ Print Ready | Print-friendly form layout |
| 🔑 Change Password | Profile section with password management |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 (functional components + hooks)
- Tailwind CSS
- Vite
- Axios

**Backend**
- Python 3.10+
- Flask + Flask-JWT-Extended
- SQLite (file-based, zero config)
- ReportLab (PDF generation)
- XlsxWriter (Excel generation)
- Gunicorn (production server)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone the repo

```bash
git clone https://github.com/theshlok18/-Livestock-Data-System.git
cd -Livestock-Data-System/livestock-app
```

### 2. Backend setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Initialize database and create default user
python init_db.py

# Start the server
python app.py
```

Backend runs at → `http://localhost:5000`

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at → `http://localhost:3000`

### 4. Login

| Username | Password | Role |
|---|---|---|
| `shlok` | `shlok@0011` | Field Officer |

---

## 📁 Project Structure

```
livestock-app/
├── backend/
│   ├── app.py                  # Flask app entry point
│   ├── config.py               # Configuration (env vars)
│   ├── db.py                   # SQLite connection
│   ├── init_db.py              # DB setup + seed data
│   ├── requirements.txt
│   ├── .env.example
│   └── routes/
│       ├── auth.py             # Login, change password
│       └── api.py              # All data endpoints + exports
│
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/
        │   ├── Login.jsx
        │   ├── Navbar.jsx          # Navigation + profile dropdown
        │   ├── Dashboard.jsx       # Stats + recent activity
        │   ├── NewEntry.jsx        # Register new animal
        │   ├── SearchAnimal.jsx    # Find existing animal
        │   ├── AnimalForm.jsx      # Monthly record entry form
        │   ├── DynamicForm.jsx     # Paper-form replica (JSON-driven)
        │   ├── FeedingSection.jsx  # Embedded feeding table
        │   ├── HistoryViewer.jsx   # View/edit/delete records
        │   └── ExportMenu.jsx      # PDF + Excel download
        ├── config/
        │   ├── formSchema.json     # All form fields defined here
        │   ├── feedData.json       # Feed class/subclass/name data
        │   └── translations.json   # English + Marathi labels
        └── utils/
            └── api.js              # Axios instance with JWT
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | Authenticate user |
| GET | `/api/animal/:tagNo` | Get animal by tag |
| POST | `/api/animal` | Create or update animal |
| POST | `/api/record` | Add monthly record |
| PUT | `/api/record/:id` | Edit a record |
| DELETE | `/api/record/:id` | Delete a record |
| GET | `/api/records/:tagNo` | All records for a tag |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/export/record/:id/pdf` | Single record PDF |
| GET | `/api/export/record/:id/excel` | Single record Excel |
| GET | `/api/export/animal/:tagNo/pdf` | Full history PDF |
| GET | `/api/export/animal/:tagNo/excel` | Full history Excel |
| POST | `/api/profile/change-password` | Change password |
| GET | `/health` | Health check |

---

## 🌐 Deployment

See [DEPLOY.md](DEPLOY.md) for full instructions to deploy on **Render** (backend) and **Netlify** (frontend).

**Quick summary:**

```
Backend  → Render Web Service (Python)
Frontend → Render Static Site or Netlify
Database → SQLite file (persists on server disk)
```

Environment variables needed:
```env
SECRET_KEY=your-secret
JWT_SECRET_KEY=your-jwt-secret
FLASK_ENV=production
FRONTEND_URL=https://your-frontend-url.com
DB_PATH=/path/to/livestock.db
```

---

## 📸 Screenshots

| Page | Description |
|---|---|
| Login | Clean split-panel login with system info |
| Dashboard | Stats cards + recent records + quick actions |
| New Entry | Step-by-step animal registration |
| Monthly Form | Full paper-form replica with feeding section |
| History | Cards/table view with inline edit and PDF export |

---

## 🗄️ Database Schema

**animals** — tag_no, animal_type, breed, age, owner_name, village, contact, mobile_no, aadhar_no, image_path

**monthly_records** — tag_no, record_date, milk_per_day, fat, snf, rate, expenses, health_status, vaccination, pregnancy_status, feeding_data (JSON), milk_increase, challenge_feeding, notes, is_draft

**users** — username, password_hash, full_name, role

---

## 📝 License

MIT License — free to use, modify, and distribute.

---

## 👨‍💻 Author

<table>
  <tr>
    <td align="center">
      <strong>Shlok Sathe</strong><br/>
      <a href="https://github.com/theshlok18">@theshlok18</a><br/>
      <em>Full-Stack Developer</em><br/>
      <sub>Designed · Built · Deployed</sub>
    </td>
  </tr>
</table>

> **All credit goes to Shlok Sathe.**
> This project was designed, developed, and deployed entirely by Shlok — from database schema to UI design to deployment configuration.

---

## ⭐ Support

If this project helped you, please give it a ⭐ on [GitHub](https://github.com/theshlok18/-Livestock-Data-System)!

---

*Built with ❤️ by [Shlok Sathe](https://github.com/theshlok18)*
