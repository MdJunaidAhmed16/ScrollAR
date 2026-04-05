# ScrollAr

**AI-powered research paper discovery — built for the way you actually consume content.**

ScrollAr pulls the latest papers from arXiv daily, summarises each one with Claude into a plain-English card, and lets you triage them in seconds. Like it, save it, or skip it. No jargon walls.

🔗 **[scrollar-beta.vercel.app](https://scrollar-beta.vercel.app)**

---

## What it does

- Ingests 100+ new arXiv papers every 6 hours across AI, ML, CV, NLP, and Statistics
- Generates a card for every paper: hook, ELI5 summary, key finding, why it matters, contributions, and tags
- Feed shows unseen papers only — personalised to what you haven't read yet
- Save papers to a bookmarks list for later
- One-tap Google sign-in via Firebase

---

## Tech stack

### Backend
- **FastAPI** — async REST API
- **PostgreSQL** + **SQLAlchemy (asyncpg)** — primary database
- **Alembic** — schema migrations
- **Celery** + **Upstash Redis** — background task queue
- **OpenRouter / Claude** — AI card generation
- **Firebase Admin SDK** — token verification
- **Resend** — transactional email (error alerts)

### Frontend
- **React 19** + **TypeScript**
- **Framer Motion** — card animations
- **Tailwind CSS** — styling
- **Zustand** — auth state
- **TanStack Query** — feed data fetching + pagination
- **Firebase SDK** — Google sign-in + magic link auth

### Infrastructure
- **Render** — backend + Celery worker
- **Vercel** — frontend
- **Upstash** — managed Redis (TLS)
- **Neon / Supabase** — managed PostgreSQL

---

## Project structure

```
scrollar/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy models
│   │   ├── routes/          # FastAPI route handlers
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic (feed, claude, firebase, email)
│   │   ├── tasks/           # Celery tasks (ingest, summarise)
│   │   ├── config.py        # Settings from env vars
│   │   ├── database.py      # Async engine + session
│   │   ├── dependencies.py  # Auth dependency (Firebase token → User)
│   │   └── main.py          # FastAPI app, middleware, lifespan
│   ├── alembic/             # DB migrations
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/             # Axios client + endpoint wrappers
        ├── components/      # UI components
        ├── hooks/           # useFeed, useSwipeMutation
        ├── pages/           # Route pages
        ├── store/           # Zustand auth store
        ├── types/           # TypeScript interfaces
        └── firebase.ts      # Firebase app init
```

---

## Running locally

### Prerequisites
- Python 3.12+
- Node 22+
- PostgreSQL
- Redis

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Copy and fill in env vars
cp .env.example .env

# Run migrations
alembic upgrade head

# Start API
uvicorn app.main:app --reload

# Start Celery worker (separate terminal)
celery -A app.tasks.celery_app worker --loglevel=info
```

### Frontend

```bash
cd frontend
npm install
# Add VITE_API_URL and VITE_FIREBASE_* to .env.local
npm run dev
```

---

## Environment variables

### Backend (Render)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (asyncpg) |
| `DATABASE_URL_SYNC` | PostgreSQL connection string (psycopg2, for Alembic) |
| `REDIS_URL` | Redis URL |
| `CELERY_BROKER_URL` | Redis URL for Celery broker |
| `CELERY_RESULT_BACKEND` | Redis URL for Celery results |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `OPENROUTER_MODEL` | Model to use (e.g. `anthropic/claude-sonnet-4-5`) |
| `FIREBASE_CREDENTIALS_JSON` | Full service account JSON as a single-line string |
| `ADMIN_EMAIL` | Email address that gets `is_admin: true` |
| `ALERT_EMAIL` | Where server error alerts are sent |
| `SMTP_PASSWORD` | Resend API key |
| `SMTP_USER` | From address for emails |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins |

### Frontend (Vercel)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_FIREBASE_API_KEY` | Firebase web config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase web config |
| `VITE_FIREBASE_PROJECT_ID` | Firebase web config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase web config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase web config |
| `VITE_FIREBASE_APP_ID` | Firebase web config |

---

## License

MIT
