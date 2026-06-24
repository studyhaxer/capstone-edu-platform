# AI-Powered Educational Platform

A production-grade web application for course creation, enrollment, and AI-assisted learning — built as a 40-day capstone project (Days 20–60), deployed at [usachunian.com](https://usachunian.com).

This is not a tutorial project. It's a portfolio piece demonstrating backend API design, database modeling, authentication, AI integration, and a full React frontend, built incrementally and deployed to production.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI + Python 3.13 |
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

Run the server:

```bash
uvicorn main:app --reload
```

Visit `http://localhost:8000/docs` for the interactive API docs.

## Progress

- [x] **Day 20** — Project structure, database schema, all 4 SQLAlchemy models, Pydantic schemas
- [ ] **Days 21** — JWT register/login

## License

Personal portfolio project — all rights reserved.
