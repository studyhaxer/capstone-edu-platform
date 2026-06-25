# AI-Powered Educational Platform

A production-grade web application for course creation, enrollment, and AI-assisted learning — built as a capstone project (Days 20–36, with buffer to Day 37), deployed at [usachunian.com](https://usachunian.com).

This is not a tutorial project. It's a portfolio piece demonstrating backend API design, database modeling, authentication, AI integration, and a full React frontend, built incrementally and deployed to production.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI + Python 3.14 |
| Database | PostgreSQL (Supabase) |
| ORM | SQLAlchemy 2.0 |
| Auth | JWT + bcrypt |
| AI | OpenAI API (gpt-4o-mini) |
| Frontend | React + Tailwind CSS |
| Deployment | Railway (API) + Supabase (DB) + usachunian.com |

## Database Schema

Four core tables, with `Enrollment` acting as a many-to-many bridge between `User` and `Course`:

- **users** — id, name, email, hashed_password, role (teacher/student/admin)
- **courses** — id, title, description, owner_id (FK → users)
- **lessons** — id, title, content, course_id (FK → courses)
- **enrollments** — id, student_id (FK → users), course_id (FK → courses), enrolled_at

## Project Structure

```
capstone-edu-platform/
├── main.py            # FastAPI app entry point
├── database.py         # DB connection setup
├── models.py            # SQLAlchemy models
├── schemas.py          # Pydantic schemas
├── auth.py               # JWT + bcrypt auth
├── exceptions.py    # Custom exceptions
├── pagination.py    # Pagination dependency
├── routers/
│   ├── __init__.py
│   ├── auth.py        # POST /auth/register, POST /auth/login
│   └── users.py       # GET /users/me, GET /users (admin-only)
├── requirements.txt
├── .env                    # Local secrets (not committed)
├── .gitignore
└── tests/
    ├── __init__.py
    └── conftest.py
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

## Roadmap (Days 20–36)

**Phase A — Core Backend (20–23)**
- [x] **Day 20** — Project structure, database schema, `User`/`Course`/`Lesson`/`Enrollment` models, Pydantic schemas
- [x] **Day 21** — Auth routes: `routers/` package, `POST /auth/register`, `POST /auth/login` (JWT), `GET /users/me`, `GET /users` (admin-only, role guard)
- [ ] **Day 22** — Course CRUD (teacher role), role-based dependency guards
- [ ] **Day 23** — Lesson CRUD + student enrollment (`POST /enroll`, list enrolled courses)

**Phase B — AI Features (24–26)**
- [ ] **Day 24** — AI lesson summarizer: `POST /lessons/{id}/summarize`, OpenAI integration
- [ ] **Day 25** — AI MCQ quiz generator: `POST /lessons/{id}/quiz`, `Quiz`/`Question` models
- [ ] **Day 26** — Quiz attempt + scoring: `POST /quiz/{id}/attempt`, attempt history

**Phase C — File Upload + Polish (27–28)**
- [ ] **Day 27** — File upload for notes/PDFs, static file serving
- [ ] **Day 28** — Testing (pytest, httpx TestClient), edge cases, pagination review, cleanup

**Phase D — React Frontend (29–33)**
- [ ] **Day 29** — Vite + React setup, login/register forms, JWT in localStorage, axios client
- [ ] **Day 30** — Teacher dashboard: create course, add lessons, upload notes, view enrollments
- [ ] **Day 31** — Student dashboard: browse/enroll courses, read lessons, view AI summary
- [ ] **Day 32** — Quiz UI + results: take quiz, show score, attempt history
- [ ] **Day 33** — UI polish: mobile layout, loading states, error messages, Tailwind cleanup

**Phase E — Deployment (34–36)**
- [ ] **Day 34** — SQLite → PostgreSQL migration, `.env` config, Alembic migrations
- [ ] **Day 35** — Backend deploy (Railway/Render), DB connected, health check endpoint
- [ ] **Day 36** — Frontend deploy (Vercel/Netlify) + usachunian.com domain, end-to-end smoke test — **LIVE**

> Buffer is built in — finishing a day late anywhere still lands the project live by Day 37.

## License

Personal portfolio project — all rights reserved.
