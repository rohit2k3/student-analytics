# Student Performance Analytics

A full-stack web application that tracks student academic results, visualizes performance trends, and delivers AI-powered study recommendations and quizzes.

---

## Table of Contents

- [Overview](#overview)
- [Key Technologies](#key-technologies)
- [Repository Structure](#repository-structure)
- [Backend](#backend)
  - [API Routes](#api-routes)
  - [Data Models](#data-models)
  - [Analytics Engine](#analytics-engine)
  - [AI Integration](#ai-integration)
  - [Environment Variables](#backend-environment-variables)
  - [Running the Backend](#running-the-backend)
- [Frontend](#frontend)
  - [Pages](#pages)
  - [Key Components & Libraries](#key-components--libraries)
  - [Environment Variables](#frontend-environment-variables)
  - [Running the Frontend](#running-the-frontend)
- [Data Flow](#data-flow)

---

## Overview

Students log their semester results (subjects, scores, GPA). The backend computes rich analytics—subject breakdowns, semester trends, and pattern insights—without any external dependencies. When a Google Gemini API key is configured, the app also generates personalized study recommendations and subject-specific MCQ quizzes using Gemini 2.0 Flash; if the key is absent, deterministic fallbacks are used instead.

---

## Key Technologies

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express 5 |
| Database | MongoDB via Mongoose 8 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| AI | Google Gemini 2.0 Flash (optional) |

---

## Repository Structure

```
student-analytics/
├── backend/          # Express REST API
│   └── src/
│       ├── server.js           # HTTP server entry point
│       ├── app.js              # Express app, routes, CORS, error handler
│       ├── config/             # DB connection (db.js) and env vars (env.js)
│       ├── models/             # Mongoose schemas
│       ├── routes/             # Route declarations per feature domain
│       ├── controllers/        # Request handlers per feature domain
│       ├── services/
│       │   └── gemini.service.js  # Google Gemini AI integration
│       ├── middleware/
│       │   └── auth.js         # JWT verification
│       └── utils/
│           └── analytics.js    # Core analytics engine (pure functions)
└── frontend/         # Next.js web app
    └── src/
        ├── app/
        │   ├── layout.js           # Root layout with providers
        │   ├── page.js             # Landing/redirect page
        │   ├── (auth)/             # Public pages (login, register)
        │   └── (protected)/        # Auth-gated pages (dashboard, semesters, quiz, profile)
        ├── components/
        │   ├── auth-context.js     # React Context for auth state
        │   ├── providers.js        # Wraps app with AuthContext
        │   ├── app-shell.js        # Shared navigation shell
        │   └── semester-form.js    # Form for adding/editing semester results
        └── lib/
            └── api.js              # Central fetch wrapper (JWT header, base URL)
```

---

## Backend

### API Routes

All routes are prefixed with `/api` and require a valid JWT (except `/api/auth`).

| Route | Purpose |
|---|---|
| `POST /api/auth/register` | Create a new user account |
| `POST /api/auth/login` | Authenticate and receive a JWT |
| `GET/POST /api/results` | Retrieve or add semester results |
| `PUT/DELETE /api/results/:id` | Update or delete a semester result |
| `GET /api/analytics` | Compute and return performance analytics |
| `GET /api/recommendations` | AI-generated study recommendations |
| `POST /api/quiz` | Generate an AI-powered MCQ quiz |
| `POST /api/quiz/submit` | Submit quiz answers and save the attempt |
| `GET /api/improvement` | Retrieve improvement tracking data |

### Data Models

**User**
- `name`, `email`, `passwordHash`
- `profile`: `department`, `year`, `targetGpa`, `weeklyStudyHours`, `learningGoal`

**SemesterResult**
- `userId` (ref → User), `semesterLabel`
- `subjects[]`: `name`, `score` (0–100), `credits`, `category` (theory / practical / problem-solving / other)
- `gpa` (0–10), `percentage` (0–100)

**QuizAttempt**
- `userId`, `subject`, `topic`, `difficulty` (easy / medium / hard)
- `questions[]`, `userAnswers[]`, `score`, `total`, `percentage`

### Analytics Engine

`src/utils/analytics.js` contains pure functions (no external calls) that produce:

- **Subject breakdown** — average score per subject across all semesters, sorted by performance, categorized automatically from the subject name (e.g. words like "lab" → practical, "algorithm" → problem-solving)
- **Strong subjects** — average ≥ 75%
- **Weak subjects** — average < 60%
- **Semester trend** — chronologically ordered percentage and GPA per semester
- **Pattern insights** — human-readable observations such as:
  - "Theory performance is stronger than practical execution."
  - "Overall trend is improving across semesters."
  - "Consistently weak in problem-solving subjects."

### AI Integration

`src/services/gemini.service.js` calls **Google Gemini 2.0 Flash** to:

1. **Recommendations** — given the analytics output, returns JSON with `strategies`, `timeManagement`, and `resourceFocus` arrays tailored for the next 4 weeks.
2. **Quiz generation** — given subject, topic, and difficulty, returns 5 MCQ questions with options and correct answers.

Both functions include deterministic fallbacks that are used when `GEMINI_API_KEY` is not set or the API call fails, so the app remains fully functional without AI.

### Backend Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token lifetime (default: `7d`) |
| `PORT` | No | Server port (default: `5000`) |
| `CLIENT_ORIGIN` | No | Allowed CORS origin (default: `http://localhost:3000`) |
| `GEMINI_API_KEY` | No | Enables AI recommendations and quizzes |

### Running the Backend

```bash
cd backend
cp .env.example .env      # fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev               # starts with --watch (auto-restart on change)
```

API base URL: `http://localhost:5000/api`

---

## Frontend

### Pages

| Route | Description |
|---|---|
| `/login` | Login form |
| `/register` | Registration form |
| `/dashboard` | Overview with performance charts and insights |
| `/semesters` | Manage semester results (add / edit / delete) |
| `/quiz` | Generate and take AI-powered quizzes |
| `/profile` | Edit profile and learning goals |

Route groups are used to separate public (`(auth)`) and authenticated (`(protected)`) layouts. The protected layout redirects unauthenticated users to `/login`.

### Key Components & Libraries

- **`auth-context.js`** — React Context that stores the JWT and current user; exposes `login` / `logout` helpers used throughout the app.
- **`app-shell.js`** — Persistent navigation sidebar/header rendered inside the protected layout.
- **`semester-form.js`** — Reusable form for creating and editing semester entries.
- **`lib/api.js`** — Thin wrapper around `fetch` that prepends the API base URL and attaches the `Authorization: Bearer <token>` header automatically.
- **Recharts** — Used on the dashboard to render trend line charts and subject performance bar charts.
- **Lucide React** — Icon library used throughout the UI.

### Frontend Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | Backend API base URL (default: `http://localhost:5000/api`) |

### Running the Frontend

```bash
cd frontend
cp .env.example .env.local    # set NEXT_PUBLIC_API_URL if backend is not on localhost
npm install
npm run dev
```

App URL: `http://localhost:3000`

---

## Data Flow

```
1. User registers / logs in
        ↓
2. JWT returned and stored in AuthContext
        ↓
3. User adds semester results (subjects, scores, GPA)
        ↓
4. Backend stores results in MongoDB
        ↓
5. Dashboard fetches /api/analytics
        → Pure JS engine computes breakdowns, trends, and insights
        → Recharts renders charts
        ↓
6. User requests recommendations or starts a quiz
        → Backend calls Gemini API (or serves deterministic fallback)
        → Results displayed in the frontend
```
