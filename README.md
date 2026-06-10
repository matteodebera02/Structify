# Structify — From idea to project plan, in seconds.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://www.gettingstructify.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev)

> Describe the software or tech product you want to build. Structify uses AI to generate structured user stories and tasks — ready to export into your PM tools.
>
> **Designed for software and technology projects** — apps, APIs, modules, platforms, integrations. The AI detects the tech stack from your description and generates implementation-specific tasks.
>
> **Live at [www.gettingstructify.com](https://www.gettingstructify.com)**

**Stack:** React 18 · FastAPI · PostgreSQL · Groq (openai/gpt-oss-120b)

---

## What it does

1. **Describe your project** in plain text — no templates, no structure needed
2. **AI analyzes, generates, and self-reviews** your project structure in one pass
3. **Review the output** — user stories with acceptance criteria, tasks with effort sizing and confidence scores
4. **Export with one click** — CSV, JSON, or Markdown, ready to import into your PM tool

### Generation modes

| Mode | Output |
|------|--------|
| **User Stories + Tasks** | Agile breakdown — As a [role] I want [goal] stories, each with 2–6 sized tasks |
| **Tasks only** | Flat task list for smaller projects or personal work |

### Export formats

| Format | Works with |
|--------|-----------|
| **CSV** | Google Sheets (direct), Notion (direct), Linear / ClickUp / Asana / Jira (column mapping required on import) |
| **JSON** | n8n, Zapier, GitHub Actions, custom scripts — any tool that consumes JSON |
| **Markdown** | GitHub, Obsidian, Logseq (native rendering), Notion (via import), Confluence |

> CSV columns: Name, Description, Type, User Story, Order, Effort, Effort Hours Min/Max, Priority, Status, Tags. Tools like Linear and Asana use different column names and will ask you to map them during import.

---

## The AI pipeline

Every generation runs through 3 stages powered by `openai/gpt-oss-120b` on Groq:

```
Stage 1 — ANALYZE          Detects tech stack, validates that the input is a software project
Stage 2 — GENERATE         Produces the full structured output (stories + tasks) using stack-specific vocabulary
Stage 3 — REVIEW & FINALIZE  Self-reviews for generic titles, missing tasks, wrong order, then emits <final>
```

`openai/gpt-oss-120b` is a reasoning model — it applies chain-of-thought internally without needing explicit intermediate outputs. The pipeline is designed to stay well within Groq's free-tier token limit (8000 TPM) even for the maximum allowed description length.

### Self-healing retry

If the model returns invalid JSON or violates the schema, the service automatically retries up to **3 times**. On each retry, the bad response and a correction instruction are injected back into the conversation so the model can self-correct rather than starting fresh. All 3 failures are logged with the raw output excerpt before raising a `422`.

### Response cache

Identical requests (same description + mode) are served from an **in-memory SHA-256 cache** with a 10-minute TTL and a 1000-entry cap. Cache hits return `generation_time_ms: 0` and `cache_hit: true` in the response metadata. Oldest 100 entries are evicted when the cap is reached.

### Multi-language support

The system prompt instructs the model to detect the input language and generate all human-readable output (titles, descriptions, summaries, warnings) in that same language. JSON keys always stay in English.

### Per-task metadata

Each generated task includes:
- `effort`: S / M / L (S = 0.5–2h, M = 2–6h, L = 6–8h)
- `effort_hours`: `{ min, max }` numeric range
- `confidence`: 0.0–1.0 score (tasks < 0.5 without a warning are flagged in critique)
- `assumptions`: list of assumptions made to scope the task

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Zustand |
| Backend | FastAPI 0.110 + SQLAlchemy 2 + Alembic |
| Database | PostgreSQL 16 |
| AI | Groq API — `openai/gpt-oss-120b` |
| Auth | JWT (9-hour access tokens) + Bcrypt |
| Rate limiting | SlowAPI — 3 generations / hour per user |
| Email | Resend (forgot-password flow) |
| Deploy | Docker Compose |

---

## Quick start (Docker)

### Prerequisites

- Docker + Docker Compose
- A free [Groq API key](https://console.groq.com/keys)

> **Note on the free Groq tier:** the free tier limit for `openai/gpt-oss-120b` is 8000 tokens per minute. Structify's prompt is designed to stay well under this limit — the worst case (5000-character description + max output) uses ~5700 tokens. For sustained use or teams, users should supply their own Groq API key in account settings to bypass the shared rate limit entirely.

### 1. Clone & configure

```bash
git clone https://github.com/matteodebera02/Structify.git
cd structify
```

Copy the example env file and fill in your values:

```bash
cp backend/.env.example backend/.env
```

Minimum required in `backend/.env`:

```env
GROQ_API_KEY=gsk_your-groq-api-key-here
SECRET_KEY=any-random-string-at-least-32-chars
```

### 2. Start

```bash
docker-compose up --build
```

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:5173 | Vite dev server with hot-reload |
| Backend API | http://localhost:8000 | FastAPI with hot-reload |
| Swagger / OpenAPI | http://localhost:8000/docs | Interactive API docs |
| Health check | http://localhost:8000/health | Returns `{ status, version }` |
| pgAdmin | http://localhost:5050 | `admin@admin.com` / `admin` |

The backend waits for the database healthcheck (`pg_isready`) before starting. Tables are created automatically on first boot via SQLAlchemy metadata.

---

## Quick start (manual)

**Backend:**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in GROQ_API_KEY and SECRET_KEY
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

- **3-stage AI pipeline** (Analyze → Generate → Review & Finalize) powered by `openai/gpt-oss-120b`
- **Two generation modes:** agile User Stories + Tasks, or flat task list
- **Per-task effort sizing** (S/M/L + hour ranges) and confidence scores
- **Self-review built in** — model verifies its own output for generic titles, wrong order, and missing tasks before returning
- **In-memory response cache** — 10-minute TTL, SHA-256 keyed by description + mode
- **Quota counter** — users see remaining generations in real time; turns amber at 1 left, red at 0
- **Multi-language output** — AI detects input language and generates in the same language
- **Three export formats** — CSV, JSON, Markdown — one click, no reformatting
- **Add Feature** — describe a new feature, AI appends stories and tasks to an existing project
- **Personal Groq API key** — users can add their own key in settings; bypasses rate limit
- **Rate limiting** — 3 AI generations / hour per user (shared key); unlimited with own key
- **Project dashboard** — search, filter, sort, and track completion across all projects
- **Task completion tracking** — toggle tasks done/undone with live progress bars
- **JWT auth** — 9-hour access tokens, Bcrypt hashing, forgot-password via Resend
- **GDPR compliance** — privacy policy, account deletion (cascades all user data)
- **Structured logging** — every request, generation attempt, cache event, and error logged at INFO/WARNING/ERROR via Python `logging`
- **pgAdmin4** included in Docker Compose for database inspection

---

## Project structure

```
structify/
├── frontend/
│   └── src/
│       ├── api/          # Axios clients (auth, projects, generate, export, settings)
│       ├── hooks/        # Business logic (useProjects, useGenerate, useExport, useInView…)
│       ├── store/        # Zustand global state (auth, generate, project)
│       ├── pages/        # Route-level components
│       ├── components/   # UI components (layout, dashboard, home, generate…)
│       └── types/        # TypeScript models matching API schemas
├── backend/
│   └── app/
│       ├── routers/      # FastAPI handlers (auth, projects, generate, export, tasks)
│       ├── services/     # Business logic (ai_service, export_service, project_service)
│       ├── repositories/ # Database access layer (user_repo, project_repo, task_repo)
│       ├── models/       # SQLAlchemy ORM models
│       ├── schemas/      # Pydantic request / response schemas
│       └── core/         # Config, JWT helpers, dependency injection
├── docker-compose.yml    # PostgreSQL 16, FastAPI, Vite, pgAdmin4
└── backend/.env.example
```

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Get JWT token |
| POST | `/auth/forgot-password` | Send reset email via Resend |
| POST | `/auth/reset-password` | Consume reset token |
| GET | `/auth/users/me` | Get current user + settings |
| PATCH | `/auth/users/me` | Update Groq API key |
| DELETE | `/auth/users/me` | Delete account + all data |
| POST | `/generate` | Run AI pipeline (rate-limited) |
| GET | `/generate/quota` | Get remaining generations for current user |
| GET | `/projects` | List user projects |
| POST | `/projects` | Save a generated project |
| GET | `/projects/{id}` | Get project with stories and tasks |
| DELETE | `/projects/{id}` | Delete project |
| POST | `/projects/{id}/features` | Add feature via AI |
| PATCH | `/tasks/{id}/complete` | Toggle task completion |
| GET | `/projects/{id}/export/csv` | Export as CSV |
| GET | `/projects/{id}/export/json` | Export as JSON |
| GET | `/projects/{id}/export/markdown` | Export as Markdown |
| GET | `/health` | Health check (`{ status, version }`) |

---

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | — | Shared Groq key (fallback when users have no personal key) |
| `SECRET_KEY` | Yes | — | JWT signing secret — use a long random string in production |
| `DATABASE_URL` | No | local postgres | PostgreSQL connection string |
| `RESEND_API_KEY` | No | — | Resend key — only needed for forgot-password emails |
| `FRONTEND_URL` | No | `http://localhost:5173` | Allowed CORS origin |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `540` | JWT lifetime in minutes (default 9 hours) |

---

## Logging

All layers emit structured log lines via Python's standard `logging` module (configured globally in `main.py`):

```
2025-01-15 12:34:01 [INFO]  app.services.ai_service: attempt 1/3 mode=us_and_tasks
2025-01-15 12:34:03 [INFO]  app.services.ai_service: extracted from <final> tag
2025-01-15 12:34:03 [INFO]  app.services.ai_service: parsed: 5 stories, 18 tasks
2025-01-15 12:34:03 [INFO]  app.services.ai_service: ok attempt=1 latency=2341ms
2025-01-15 12:34:10 [INFO]  app.services.ai_service: cache hit
2025-01-15 12:35:00 [WARNING] app.services.ai_service: attempt 2 failed: missing keys: {'warnings'}
2025-01-15 12:35:01 [ERROR]  app.services.ai_service: groq rate limit exceeded
```

---

## License

MIT
