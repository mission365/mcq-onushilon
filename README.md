<div align="center">

<h1>📚 MCQ অনুশীলন</h1>
<p><strong>Bangladesh's most complete MCQ exam preparation platform for SSC, HSC, CAIE & IB</strong></p>

![Platform](https://img.shields.io/badge/Platform-Web-blue?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Express%20%2B%20PostgreSQL-informational?style=flat-square)
![Language](https://img.shields.io/badge/Language-TypeScript-3178c6?style=flat-square)

</div>

---

## 📖 Overview

**MCQ অনুশীলন** is a full-featured, bilingual (Bengali & English) MCQ exam preparation platform designed for Bangladeshi students preparing for national and international board exams.

The platform aggregates **authentic board question papers** across multiple curricula — NCTB (Bangla & English version), CAIE, and IB — and delivers them as timed, scored, and reviewed MCQ exams. Students can track their progress, unlock subjects, and simulate real exam conditions.

---

## 🌐 Supported Curricula & Exam Boards

| Curriculum | Level | Boards / Variants |
|---|---|---|
| **NCTB — Bangla Version** | SSC, HSC | All 10 education boards (Dhaka, Rajshahi, Chittagong, Comilla, Barishal, Sylhet, Mymensingh, Dinajpur, Jessore, Madrasha) |
| **NCTB — English Version** | SSC, HSC | English Medium (National Curriculum) |
| **CAIE** | O Level, A Level | Cambridge Assessment International Education |
| **IB** | MYP, DP | International Baccalaureate |

---

## ✨ Key Features

### 🎓 Exam Practice
- **Board Question Papers** — Authentic MCQs sourced from official board exams (2016–2024)
- **Real-Time Timer** — Countdown timer matching the actual exam duration
- **Negative Marking** — −0.25 per wrong answer (mirrors real exam rules)
- **Auto-Submit** — Exam submits automatically when the timer ends
- **Instant Results** — Score, accuracy %, correct vs. wrong breakdown shown immediately

### 📊 Progress Tracking
- **Dashboard Stats** — Total exams completed, average score, current streak
- **Per-Subject History** — View all past attempts on each subject
- **Attempt Review** — See which questions you got right/wrong with explanations

### 🔐 User Authentication
- Email & Password Registration with OTP email verification
- Google OAuth (Firebase Authentication)
- Forgot Password via OTP email flow
- JWT-based sessions (30-day validity)
- Role-based access — `student` vs. `admin`

### 💳 Subject Unlocking & Payments
- **bKash Automated Gateway** — Redirect-based payment with instant unlock
- **Manual Payment** — Send bKash → submit Transaction ID → admin approves
- **Admin Payment Panel** — Review and approve/reject pending manual payments
- Per-subject pricing — Default BDT 299 per subject (configurable by admin)

### 🛠️ Admin Panel
- Manage subjects (create, edit, toggle active/inactive)
- Manage exams per subject
- Manage questions per exam (CRUD)
- Review manual payment requests
- Configure bKash number and payment instructions

### 📱 Fully Responsive
- Mobile-first design
- Works on 320px → 1920px screen widths
- Smooth Lottie animations and Motion transitions

---

## 🗂️ Subject Coverage

### NCTB — HSC (Bangla Version)
- **Common:** Bangla 1st & 2nd, English 1st & 2nd, ICT
- **Science:** Physics, Chemistry, Higher Mathematics, Biology (Botany & Zoology)
- **Commerce:** Accounting, Business Organization & Management, Finance/Banking/Insurance, Production Management & Marketing
- **Humanities:** Civics & Good Governance, History, Geography, Economics, Logic, Sociology, Social Work
- **Optional:** Agriculture Studies, Home Science, Statistics, Psychology

### NCTB — SSC (Bangla Version)
- **Common:** Bangla 1st & 2nd, English 1st & 2nd, General Mathematics, ICT, Islam & Moral Education, Physical Education
- **Science:** Physics, Chemistry, Biology, Bangladesh & Global Studies, Higher Mathematics
- **Commerce:** Accounting, Finance & Banking, Business Entrepreneurship
- **Humanities:** History of Bangladesh & World Civilization, Civics & Citizenship, Geography & Environment, Economics

### NCTB — English Version (SSC & HSC)
All core subjects mirroring the English medium national curriculum

### CAIE — O Level & A Level
- **Compulsory Core:** English Language, Mathematics, Sciences (Physics, Chemistry, Biology)
- **Elective:** History, Geography, Economics, Business Studies, Computer Science, Accounting, Literature in English

### IB — MYP & DP
- **Subjects:** Language & Literature, Mathematics (AA & AI), Sciences, Individuals & Societies, The Arts
- **Core:** Theory of Knowledge (ToK), Extended Essay (EE), CAS

---

## 🏗️ Architecture

```
mcq-onushilon/
├── src/                        # React frontend (Vite)
│   ├── pages/
│   │   ├── LandingPage.tsx     # Public homepage
│   │   ├── LoginPage.tsx       # Login (Email + Google OAuth)
│   │   ├── RegisterPage.tsx    # Registration + OTP verification
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── VerifyEmailPage.tsx
│   │   ├── Dashboard.tsx       # Student dashboard with live stats
│   │   ├── SelectVersionPage.tsx   # Curriculum/Board selection
│   │   ├── SubjectExams.tsx    # Exam list for a subject
│   │   ├── LiveExam.tsx        # Real-time timed MCQ exam
│   │   ├── ResultPage.tsx      # Post-exam result with review
│   │   ├── BkashPaymentCallback.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminSubjects.tsx
│   │       ├── AdminExams.tsx
│   │       ├── AdminQuestions.tsx
│   │       └── AdminManualPayments.tsx
│   ├── components/layout/      # Navbar, layout wrappers
│   ├── store/                  # Zustand global state
│   └── types/                  # TypeScript type definitions
│
├── server/                     # Express.js backend API
│   ├── index.ts                # All API routes
│   ├── auth.ts                 # JWT + bcrypt helpers & middleware
│   ├── db.ts                   # PostgreSQL schema init + seed
│   ├── mailer.ts               # Nodemailer SMTP (OTP emails)
│   ├── bkash.ts                # bKash payment gateway integration
│   ├── firebaseAdmin.ts        # Firebase Admin SDK
│   └── seed_*.ts               # Question bank seeders per curriculum
│
├── .env.example                # Environment variable template
├── vite.config.ts
└── package.json
```

---

## 🛢️ Database Schema

PostgreSQL database with the following tables:

| Table | Purpose |
|---|---|
| `users` | Accounts, roles, curriculum preferences, verification status |
| `subjects` | All subjects with curriculum, level, stream, and price |
| `exams` | Board exams per subject (year, board name, type, duration) |
| `questions` | MCQ questions with 4 options, correct answer, and explanation |
| `attempts` | Exam attempt records (score, correct/wrong count, timestamps) |
| `attempt_answers` | Individual answer per question per attempt |
| `subject_access` | Tracks which subjects a user has unlocked (with payment info) |
| `manual_payment_requests` | Pending/approved/rejected bKash manual payment requests |
| `payment_sessions` | Automated bKash redirect payment sessions |
| `password_reset_otps` | Hashed OTPs for password reset flow |
| `email_verification_otps` | Hashed OTPs for email verification flow |
| `payment_settings` | Admin-configurable bKash number and instructions (singleton) |

---

## 🔒 Security

### Authentication
- **JWT tokens:** All authenticated API routes require a `Bearer` token. Tokens are signed with a secret key and expire after **30 days**.
- **bcrypt password hashing:** Passwords are hashed with bcrypt (cost factor 10). Plain-text passwords are never stored.
- **Role-based middleware:** Every admin route is protected by `requireAdmin`. Non-admin tokens receive HTTP 403.

### OTP System
- **6-digit random OTP** generated with `crypto.randomInt` (cryptographically secure).
- OTPs are **SHA-256 hashed** before database storage — the plain OTP is never persisted.
- OTPs expire in **10 minutes**.
- **Attempt limiting:** After 5 failed verification attempts, the OTP is invalidated.
- **Re-request cooldown:** 60-second rate limit on OTP re-requests per email.
- Separate tables for **email verification** and **password reset** OTPs.

### Payment Security
- bKash automated payments use the official Merchant API with HTTPS-only callbacks.
- Manual payments require **admin review** before subject access is granted.
- Payment sessions are tied to a specific `user_id` + `subject_id` pair and validated server-side.
- All transaction IDs are stored for audit trail.

### API & Transport
- **CORS:** The server reflects the requesting origin only — not a wildcard.
- **Parameterized queries:** All database queries use PostgreSQL `$1, $2` placeholders — no string interpolation, no SQL injection risk.
- **Payload limit:** Express JSON body parser capped at 10 MB.
- **Input sanitization:** Emails are trimmed and lowercased. All user-supplied content in HTML emails is escaped.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Gmail (or any SMTP provider) for OTP emails

### 1. Clone & Install
```bash
git clone <repo-url>
cd mcq-onushilon
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env`:

```env
# PostgreSQL
DATABASE_URL=postgresql://localhost:5432/mcq_onushilon

# JWT (use a strong random string in production)
JWT_SECRET=your-strong-secret-key

# SMTP for OTP emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=true

# bKash (optional — manual payments work without this)
BKASH_BASE_URL=
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_APP_KEY=
BKASH_APP_SECRET=

# Firebase (for Google OAuth)
VITE_FIREBASE_API_KEY=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

### 3. Run Development Servers
```bash
# Start both frontend (port 3000) and backend (port 8787)
npm run dev:all

# Or separately:
npm run dev:client   # Vite on :3000
npm run dev:server   # Express on :8787
```

The database schema is created automatically on first server start, along with all subjects and the default admin user.

### 4. Seed Question Banks (optional)
```bash
npx tsx server/seed_full_board_questions.ts
npx tsx server/seed_british_ib_curriculum.ts
```

---

## 📋 Core API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register with email & password |
| POST | `/api/auth/verify-email` | Public | Verify email OTP |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| POST | `/api/auth/google` | Public | Login via Firebase Google token |
| POST | `/api/auth/forgot-password` | Public | Request password reset OTP |
| POST | `/api/auth/reset-password` | Public | Set new password with reset token |
| GET | `/api/user/profile` | Auth | Get current user profile |
| GET | `/api/user/stats` | Auth | Exams completed, avg score, streak |
| PATCH | `/api/user/curriculum` | Auth | Update curriculum/level/stream |
| GET | `/api/subjects` | Public | List subjects (filtered by curriculum) |
| GET | `/api/subjects/:id/exams` | Auth | Exams for a subject |
| GET | `/api/exams/:id/questions` | Auth | Questions for an exam |
| POST | `/api/exams/:id/submit` | Auth | Submit answers & get score |
| GET | `/api/user/attempts` | Auth | User's exam history |
| POST | `/api/payments/bkash/create` | Auth | Create bKash payment session |
| POST | `/api/payments/manual` | Auth | Submit manual payment request |
| PUT | `/api/admin/payments/manual/:id` | Admin | Approve/reject manual payment |
| GET | `/api/admin/subjects` | Admin | Admin subject management |
| POST | `/api/admin/questions` | Admin | Add question to exam |
| DELETE | `/api/admin/questions/:id` | Admin | Delete question |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, TailwindCSS 4 |
| **UI** | shadcn/ui, Lucide React, Lottie React, Motion |
| **State** | Zustand |
| **Backend** | Node.js, Express 4 |
| **Database** | PostgreSQL (via `pg` pool) |
| **Auth** | JWT (`jsonwebtoken`), bcrypt, Firebase Auth (Google OAuth) |
| **Email** | Nodemailer (SMTP) |
| **Payments** | bKash Merchant API, manual bKash flow |
| **Routing** | React Router DOM v7 |

---

## 👤 Default Admin Account

On first start, an admin user is seeded automatically:

| Email | Password |
|---|---|
| `sajibuddin@gmail.com` | `sajib12345678` |

> ⚠️ **Change the default admin password immediately after first login in any production deployment.**

---

## 📄 License

This project is private and proprietary. All rights reserved.
