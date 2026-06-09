# Structify — From idea to project plan, in seconds.

> Describe what you're building in plain language. Structify uses AI to generate structured user stories and tasks — ready to export into your PM tools.

**Stack:** React 18 · FastAPI · PostgreSQL · Groq (llama-3.3-70b-versatile)

---

## What it does

1. **Describe your project** in plain text — no templates, no structure needed
2. **AI runs a 6-stage pipeline** to understand, plan, generate, critique, repair, and finalize your project structure
3. **Review the output** — user stories with acceptance criteria, tasks with effort sizing and confidence scores
4. **Export with one click** — CSV, JSON, or Markdown, ready to import into your PM tool

### Generation modes

| Mode | Output |
|------|--------|
| **User Stories + Tasks** | Agile breakdown — As a [role] I want [goal] stories, each with 2–6 sized tasks |
| **Tasks only** | Flat task list for smaller projects or personal work |

### Export formats

| Format | Compatible tools |
|--------|-----------------|
| **CSV** | Linear, Notion, ClickUp, Asana, Jira, Trello, Google Sheets |
| **JSON** | Custom scripts, n8n, Zapier, GitHub Actions, REST pipelines |
| **Markdown** | Notion, GitHub, Obsidian, Confluence, Logseq |

---

## The AI pipeline

Every generation runs through 6 explicit stages powered by `llama-3.3-70b-versatile` on Groq:

```
Stage 1 — UNDERSTANDING    Extracts intent, features, platform hints, and ambiguities
Stage 2 — PLANNING         Designs the story structure and execution order with rationale
Stage 3 — GENERATION       Produces the full structured output (stories + tasks)
Stage 4 — CRITIQUE         A senior-engineer persona reviews for vague tasks, order violations, missing foundational work
Stage 5 — REPAIR           Applies targeted fixes to issues flagged in the critique (skipped if quality is "good")
Stage 6 — FINAL OUTPUT     Extracts the canonical result from <repaired> or <generation>
```

Each stage emits a tagged XML block (`<understanding>`, `<plan>`, `<generation>`, `<critique>`, `<repaired>`, `<final>`) that is passed forward — the model cannot skip stages or produce final output early.

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
| AI | Groq API — `llama-3.3-70b-versatile` |
| Auth | JWT (9-hour access tokens) + Bcrypt |
| Rate limiting | SlowAPI — 3 generations / hour per user |
| Email | Resend (forgot-password flow) |
| Deploy | Docker Compose |

---

## Quick start (Docker)

### Prerequisites

- Docker + Docker Compose
- A free [Groq API key](https://console.groq.com/keys)

> **Note on the free Groq tier:** the free tier has a generous token-per-minute quota for testing but a strict daily limit. For sustained use or teams, users should supply their own Groq API key in account settings.

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

- **6-stage AI pipeline** with structured XML-tagged intermediate outputs and self-healing retry
- **Two generation modes:** agile User Stories + Tasks, or flat task list
- **Per-task effort sizing** (S/M/L + hour ranges) and confidence scores
- **Critique & repair loop** — the model reviews its own output before returning it
- **In-memory response cache** — 10-minute TTL, SHA-256 keyed by description + mode
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
