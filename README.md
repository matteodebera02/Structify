# Structify — From idea to project plan, in seconds.

> Describe what you're building in plain language. Structify uses AI to generate structured user stories and tasks — ready to export into your tools.

**Live at:** [structify.app](https://structify.app) · **Stack:** React · FastAPI · PostgreSQL · Groq (llama-3.3-70b)

---

## What it does

1. **Describe your project** in plain text — no templates, no structure needed
2. **AI generates** user stories + tasks (or a flat task list), ordered and effort-sized automatically
3. **Export** to your PM tool with one click — CSV, JSON, or Markdown

### Export formats

| Format | Best for | Compatible tools |
|--------|----------|-----------------|
| **CSV** | PM tool import | Linear, Notion, ClickUp, Asana, Jira, Trello, Google Sheets |
| **JSON** | Developer pipelines | Custom scripts, REST APIs, n8n, Zapier, GitHub Actions |
| **Markdown** | Docs & notes | Notion, GitHub, Obsidian, Confluence, Logseq |

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Zustand |
| Backend | FastAPI + SQLAlchemy + PostgreSQL |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Auth | JWT (access tokens) + Bcrypt password hashing |
| Deploy | Docker Compose |

---

## Quick start (Docker)

### Prerequisites
- Docker + Docker Compose
- A free [Groq API key](https://console.groq.com/keys)

### 1. Clone & configure

```bash
git clone https://github.com/yourname/structify.git
cd structify
```

Create `backend/.env`:

```env
GROQ_API_KEY=your-groq-api-key-here
SECRET_KEY=any-long-random-string
DATABASE_URL=postgresql://postgres:postgres@db:5432/structify
```

### 2. Start

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## Quick start (manual)

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Features

- **AI generation** from plain text via Groq (llama-3.3-70b)
- **Two output modes:** User Stories + Tasks (agile) or Tasks-only (simple)
- **Export:** CSV · JSON · Markdown — one click, no reformatting
- **Project dashboard** with search, filters, sort, and progress tracking
- **Add feature:** extend any project by describing a new feature — AI appends new user stories and tasks
- **Personal Groq API key:** users can supply their own key to use personal quota
- **JWT auth** with email/password, forgot-password flow, and protected routes
- **GDPR-compliant:** privacy policy, account deletion (cascades all user data)
- Rate limiting: 3 generations / hour per user (shared key), unlimited with own key

---

## Project structure

```
structify/
├── frontend/
│   └── src/
│       ├── api/          # Axios HTTP clients
│       ├── hooks/        # Business logic hooks (useProjects, useGenerate, useExport…)
│       ├── store/        # Zustand global state (auth, generate, project)
│       ├── pages/        # Route-level components
│       ├── components/   # UI components (layout, dashboard, home, generate…)
│       └── types/        # TypeScript models and API types
├── backend/
│   └── app/
│       ├── routers/      # FastAPI route handlers (auth, projects, generate, export, tasks)
│       ├── services/     # Business logic (ai_service, export_service, project_service…)
│       ├── repositories/ # Database access layer
│       ├── models/       # SQLAlchemy ORM models
│       ├── schemas/      # Pydantic request/response schemas
│       └── core/         # Config, JWT helpers, dependencies
└── docker-compose.yml
```

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Get JWT token |
| GET | `/auth/users/me` | Get account settings |
| PATCH | `/auth/users/me` | Update Groq API key |
| DELETE | `/auth/users/me` | Delete account + all data |
| POST | `/generate` | Generate project structure (auth required) |
| GET | `/projects` | List user projects |
| POST | `/projects` | Create project (with pre-generated result) |
| GET | `/projects/{id}` | Get project detail |
| DELETE | `/projects/{id}` | Delete project |
| POST | `/projects/{id}/features` | Add feature via AI |
| PATCH | `/tasks/{id}/complete` | Toggle task completion |
| GET | `/projects/{id}/export/csv` | Export as CSV |
| GET | `/projects/{id}/export/json` | Export as JSON |
| GET | `/projects/{id}/export/markdown` | Export as Markdown |

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Shared Groq API key (fallback for users without their own) |
| `SECRET_KEY` | Yes | JWT signing secret |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `FRONTEND_URL` | No | Allowed CORS origin (default: `http://localhost:5173`) |
