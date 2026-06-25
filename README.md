# AI-Powered Educational Platform

A production-grade web application for course creation, enrollment, and AI-assisted learning — built as a capstone project (Days 20–36, with buffer to Day 37), deployed at https://usachunian.com.

This is not a tutorial project. It's a portfolio piece demonstrating backend API design, database modeling, authentication, AI integration, and a full React frontend, built incrementally and deployed to production.

---

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

---

## Database Schema

Four core tables, with `Enrollment` acting as a many-to-many bridge between `User` and `Course`:

- **users** — id, name, email, hashed_password, role (teacher/student/admin)
- **courses** — id, title, description, owner_id (FK → users)
- **lessons** — id, title, content, course_id (FK → courses)
- **enrollments** — id, student_id (FK → users), course_id (FK → courses), enrolled_at

---

# Current Features

## Authentication & Authorization
- ✅ User Registration
- ✅ JWT Login
- ✅ Password Hashing (bcrypt)
- ✅ Protected Routes
- ✅ Role-Based Authorization (Admin, Teacher, Student)

## User Management
- ✅ Get Current User (`/users/me`)
- ✅ Admin-only User Listing

## Course Management (Day 22)
- ✅ Teacher can create courses
- ✅ Teacher can update only their own courses
- ✅ Teacher can delete only their own courses
- ✅ Authenticated users can view all courses
- ✅ Authenticated users can view individual courses
- ✅ Ownership validation using `owner_id`
- ✅ Proper HTTP status codes (201, 200, 204, 403, 404)

---

## Project Structure

```text
capstone-edu-platform/
├── main.py                 # FastAPI app entry point
├── database.py             # DB connection setup
├── models.py               # SQLAlchemy models
├── schemas.py              # Pydantic schemas
├── auth.py                 # JWT + bcrypt authentication
├── exceptions.py           # Custom exceptions
├── pagination.py           # Pagination dependency
├── routers/
│   ├── __init__.py
│   ├── auth.py             # Authentication routes
│   ├── users.py            # User routes
│   └── courses.py          # Course CRUD routes
├── requirements.txt
├── .env                    # Local secrets (not committed)
├── .gitignore
└── tests/
    ├── __init__.py
    └── conftest.py
```

---

## Local Setup

```bash
git clone https://github.com/studyhaxer/capstone-edu-platform.git
cd capstone-edu-platform
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/postgres
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

> **Note:** If connecting to Supabase from a network without IPv6 support, use the session pooler connection string.

Run the server:

```bash
uvicorn main:app --reload
```

Visit:

```
http://localhost:8000/docs
```

---

# Roadmap (Days 20–36)

## Phase A — Core Backend (20–23)

- [x] **Day 20** — Project structure, SQLAlchemy models, PostgreSQL, Pydantic schemas
- [x] **Day 21** — JWT Authentication, Role-Based Authorization, `/users/me`, Admin-only routes
- [x] **Day 22** — Course CRUD, Teacher ownership validation, Teacher-only write access, Authenticated read access
- [ ] **Day 23** — Lesson CRUD + Student Enrollment (`POST /enroll`, list enrolled courses)

---

## Phase B — AI Features (24–26)

- [ ] **Day 24** — AI lesson summarizer (`POST /lessons/{id}/summarize`)
- [ ] **Day 25** — AI Quiz Generator
- [ ] **Day 26** — Quiz Attempt & Scoring

---

## Phase C — File Upload + Polish (27–28)

- [ ] **Day 27** — File Upload & Static Files
- [ ] **Day 28** — Testing (pytest), Cleanup & Pagination

---

## Phase D — React Frontend (29–33)

- [ ] **Day 29** — React Setup + Authentication UI
- [ ] **Day 30** — Teacher Dashboard
- [ ] **Day 31** — Student Dashboard
- [ ] **Day 32** — Quiz UI
- [ ] **Day 33** — UI Polish

---

## Phase E — Deployment (34–36)

- [ ] **Day 34** — PostgreSQL Migration + Alembic
- [ ] **Day 35** — Backend Deployment
- [ ] **Day 36** — Frontend Deployment + Production Testing

> Buffer is built in — finishing a day late still lands the project live by Day 37.

---

## Completed API Endpoints

### Authentication

- ✅ POST `/auth/register`
- ✅ POST `/auth/login`

### Users

- ✅ GET `/users/me`
- ✅ GET `/users` *(Admin only)*

### Courses

- ✅ POST `/courses`
- ✅ GET `/courses`
- ✅ GET `/courses/{id}`
- ✅ PUT `/courses/{id}`
- ✅ DELETE `/courses/{id}`

---

## License

Personal portfolio project — all rights reserved.
