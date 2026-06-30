# AI-Powered Educational Platform

A production-grade web application for course creation, enrollment, and AI-assisted learning — built as a capstone project (Days 20–33), deployed at [usachunian.com](https://usachunian.com).

This is not a tutorial project. It's a portfolio piece demonstrating backend API design, database modeling, authentication, AI integration, and a full React frontend, built incrementally and deployed to production.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI + Python 3.14 |
| Database | PostgreSQL (Supabase) |
| ORM | SQLAlchemy 2.0 |
| Auth | JWT + bcrypt |
| AI | Groq API · `llama-3.3-70b-versatile` (free tier) |
| Frontend | React + Tailwind CSS |
| Deployment | Railway (API) + Supabase (DB) + usachunian.com |

## Database Schema

Four core tables, with `Enrollment` acting as a many-to-many bridge between `User` and `Course`:

- **users** — id, name, email, hashed_password, role (teacher/student/admin)
- **courses** — id, title, description, owner_id (FK → users)
- **lessons** — id, title, content, course_id (FK → courses)
- **enrollments** — id, student_id (FK → users), course_id (FK → courses), enrolled_at — unique constraint on (student_id, course_id)

## Project Structure

```
capstone-edu-platform/
├── main.py                  # FastAPI app entry point
├── database.py              # DB connection setup
├── models.py                # SQLAlchemy models
├── schemas.py               # Pydantic schemas
├── auth.py                  # JWT + bcrypt authentication
├── exceptions.py            # Custom exceptions
├── pagination.py            # Pagination dependency
├── routers/
│   ├── __init__.py
│   ├── auth.py              # POST /auth/register, POST /auth/login
│   ├── users.py             # GET /users/me, GET /users (admin-only)
│   ├── courses.py           # Course CRUD (teacher-owned)
│   ├── lessons.py           # Nested lesson routes under /courses, plus /lessons/{id}, /lessons/{id}/summarize
│   └── enrollments.py       # POST /enroll, GET /my-courses
├── requirements.txt
├── .env                     # Local secrets (not committed)
├── .gitignore
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Fixtures: client, teacher_token, student_token, teacher2_token
│   ├── test_auth.py         # Register, login, duplicate, wrong password
│   ├── test_courses.py      # CRUD + ownership + role guards
│   ├── test_lessons.py      # Create, update, delete + ownership 403s
│   └── test_enrollments.py  # Enroll, duplicate 400, teacher 403, my-courses
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx         # React entry point
        ├── App.jsx          # Routes setup
        ├── App.css
        ├── index.css
        ├── api/
        │   └── axiosClient.js   # Axios instance with base URL + auth header
        ├── components/
        │   ├── Navbar.jsx           # Public top navigation bar
        │   └── TeacherNavbar.jsx    # Teacher portal navigation bar
        └── pages/
            ├── Register.jsx         # ✅ Done — register form with role select
            ├── Login.jsx            # ✅ Done — login + JWT storage + role redirect
            ├── TeacherDashboard.jsx # ✅ Done — create course, add lessons, pagination
            └── StudentDashboard.jsx # Day 29 — browse/enroll courses, read lessons
```

## Local Setup

```bash
git clone https://github.com/studyhaxer/capstone-edu-platform.git
cd capstone-edu-platform
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

Create a `.env` file with:

```
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/postgres
```

> **Note:** If connecting to Supabase from a network without IPv6 support, use the **session pooler** connection string (`*.pooler.supabase.com`) rather than the direct `db.*.supabase.co` host, which is IPv6-only.

> **Note:** Requires `psycopg2-binary` (included in `requirements.txt`) as the PostgreSQL driver for SQLAlchemy. If you see `ModuleNotFoundError: No module named 'psycopg2'`, run `pip install psycopg2-binary`.

Run the server:

```bash
uvicorn main:app --reload
```

Visit `http://localhost:8000/docs` for the interactive API docs.

## Roadmap (Days 20–33)

> 📌 **Revised on Day 26.** One page / one feature per day for deep understanding. Post-launch features (MCQ quiz generator, file upload) remain deferred. Launch target: **Day 33**.

**Phase A — Core Backend (20–23)**
- [x] **Day 20** — Project structure, database schema, `User`/`Course`/`Lesson`/`Enrollment` models, Pydantic schemas
- [x] **Day 21** — Auth routes: `routers/` package, `POST /auth/register`, `POST /auth/login` (JWT), `GET /users/me`, `GET /users` (admin-only, role guard)
- [x] **Day 22** — Course CRUD: teacher-only create, ownership-checked update/delete, authenticated read access for all
- [x] **Day 23** — Lesson CRUD (nested under courses, ownership via `lesson.course.owner_id`) + student enrollment (`POST /enroll` with duplicate-enrollment guard, `GET /my-courses`)

**Phase B — AI Integration (24)**
- [x] **Day 24** — AI lesson summarizer: `POST /lessons/{id}/summarize`, Groq (`llama-3.3-70b-versatile`) integration

**Phase C — Testing (25)**
- [x] **Day 25** — Testing + error handling: pytest, httpx TestClient, role-based route tests (28 tests, 0 failures)

**Phase D — React Frontend (26–30)**
- [x] **Day 26** — Register page: Vite + React setup, register form, axios client, success state
- [x] **Day 27** — Login page: login form, JWT token storage in localStorage, role-based redirect
- [x] **Day 28** — Teacher Dashboard: create course (owner-scoped), add lessons, server-side pagination (SQLAlchemy `offset/limit`)
- [ ] **Day 29** — Student Dashboard: browse/enroll courses, read lessons, view AI summary
- [ ] **Day 30** — UI Polish: loading states, error messages, responsive layout, Tailwind cleanup

**Phase E — Deployment (31–33)**
- [ ] **Day 31** — PostgreSQL migration + `.env` config
- [ ] **Day 32** — Backend deploy (Railway), DB connected, health check endpoint
- [ ] **Day 33** — Frontend deploy (Vercel/Netlify) + usachunian.com domain, end-to-end smoke test — **LIVE**

### Deferred to Post-Launch

| Feature | Originally Planned | Why It Moved | What It Needs |
|---|---|---|---|
| AI MCQ Quiz Generator | Day 25–26 | Needs more prompt-engineering polish before it's reliable for the MVP | Prompt engineering · `QuizQuestion` schema · `POST /lessons/{id}/quiz` |
| Quiz Attempt + Scoring | Day 26 | Depends directly on the quiz generator | Attempt model · score calculation · attempt history endpoint |
| File Upload (notes/PDFs) | Day 27 | Railway's filesystem is ephemeral — needs proper Supabase Storage/S3 setup, which fits better post-deploy | Supabase Storage or S3 · static file serving · upload endpoint |

## Test Coverage

28 automated tests — run with `pytest tests/ -v`

| File | Tests |
|---|---|
| `test_auth.py` | Register ✅, duplicate email 400, login ✅, wrong password 401, ghost user 401 |
| `test_courses.py` | Create (teacher 201, student 403, unauth 401), get all, get by id, 404, update own, update other's 403, delete own, delete other's 403 |
| `test_lessons.py` | Create (teacher 201, student 403), get list, update own, update other's 403, delete own, delete other's 403 |
| `test_enrollments.py` | Enroll 201, duplicate 400, teacher 403, unauth 401, my-courses list, empty list |

## Completed API Endpoints

**Authentication**
- ✅ POST `/auth/register`
- ✅ POST `/auth/login`

**Users**
- ✅ GET `/users/me`
- ✅ GET `/users` (Admin only)

**Courses**
- ✅ POST `/courses`
- ✅ GET `/courses`
- ✅ GET `/courses/{id}`
- ✅ PUT `/courses/{id}`
- ✅ DELETE `/courses/{id}`

**Lessons**
- ✅ POST `/courses/{course_id}/lessons` (teacher, owner-only)
- ✅ GET `/courses/{course_id}/lessons` (any logged-in user)
- ✅ PUT `/lessons/{id}` (teacher, owner-only)
- ✅ DELETE `/lessons/{id}` (teacher, owner-only)

**Enrollments**
- ✅ POST `/enroll` (student only, 400 on duplicate)
- ✅ GET `/my-courses` (student only)

**AI**
- ✅ POST `/lessons/{id}/summarize` — Groq (`llama-3.3-70b-versatile`)

## License

Personal portfolio project — all rights reserved.