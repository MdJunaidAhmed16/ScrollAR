# ScrollAr — Full Technical Documentation

## Table of contents

1. [Project overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Database schema](#3-database-schema)
4. [Backend](#4-backend)
5. [Frontend](#5-frontend)
6. [Authentication](#6-authentication)
7. [AI pipeline](#7-ai-pipeline)
8. [Feed system](#8-feed-system)
9. [Admin dashboard](#9-admin-dashboard)
10. [Email and alerting](#10-email-and-alerting)
11. [Deployment](#11-deployment)
12. [Migration history](#12-migration-history)
13. [Known limitations and future work](#13-known-limitations-and-future-work)

---

## 1. Project overview

ScrollAr is a mobile-first web application that makes academic research accessible. It ingests papers from arXiv every 6 hours, uses Claude (via OpenRouter) to generate plain-English summaries, and presents them as cards users can like, save, or skip.

**Live URL:** https://scrollar-beta.vercel.app

**Core user flow:**
1. Sign in with Google (one tap)
2. See a stack of AI-summarised research cards
3. Tap Like, Save (bookmark), or Skip
4. View saved papers in Bookmarks

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Vercel                           │
│              React + TypeScript frontend                │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS (VITE_API_URL)
┌───────────────────────▼─────────────────────────────────┐
│                        Render                           │
│                    FastAPI backend                      │
│              uvicorn, async SQLAlchemy                  │
└──────┬───────────────────────────┬──────────────────────┘
       │                           │
┌──────▼──────┐          ┌─────────▼────────┐
│  PostgreSQL │          │   Celery Worker  │
│  (Neon)     │          │   (Render)       │
└─────────────┘          └─────────┬────────┘
                                   │
                         ┌─────────▼────────┐
                         │  Upstash Redis   │
                         │  (broker+result) │
                         └──────────────────┘
```

**External services:**
- **Firebase** — authentication (token issuance, Google OAuth, magic links)
- **OpenRouter** — Claude API access for card generation
- **Resend** — transactional email (error alerts)
- **arXiv API** — paper source

---

## 3. Database schema

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `firebase_uid` | VARCHAR(128) | Unique, indexed. Linked on first Firebase sign-in |
| `email` | VARCHAR(255) | Unique |
| `username` | VARCHAR(50) | Unique. Auto-derived from email on first sign-in |
| `is_active` | BOOLEAN | Default true |
| `created_at` | TIMESTAMPTZ | Server default |
| `last_seen_at` | TIMESTAMPTZ | Nullable. Stamped on every `/auth/me` call |

### `papers`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `arxiv_id` | VARCHAR | Unique |
| `title` | TEXT | |
| `abstract` | TEXT | |
| `authors` | JSONB | Array of strings |
| `categories` | JSONB | Array of arXiv category codes |
| `published_at` | TIMESTAMPTZ | |
| `pdf_url` | TEXT | |
| `arxiv_url` | TEXT | |

### `cards`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `paper_id` | UUID FK → papers | Unique |
| `hook` | TEXT | Catchy headline |
| `eli5` | TEXT | Plain-English summary |
| `key_finding` | TEXT | Single most important result |
| `why_it_matters` | TEXT | Real-world significance |
| `key_contributions` | JSONB | Array of bullet points |
| `tags` | JSONB | Array of topic tags |
| `difficulty` | VARCHAR | `beginner`, `intermediate`, `advanced` |
| `model_version` | VARCHAR | OpenRouter model used |
| `generated_at` | TIMESTAMPTZ | Server default |

### `swipe_events`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `paper_id` | UUID FK → papers | |
| `direction` | VARCHAR | `left`, `right`, `up` |
| `swiped_at` | TIMESTAMPTZ | Server default |

### `bookmarks`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `paper_id` | UUID FK → papers | |
| `created_at` | TIMESTAMPTZ | |

### `likes`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `paper_id` | UUID FK → papers | |
| `created_at` | TIMESTAMPTZ | |

---

## 4. Backend

### Key files

| File | Responsibility |
|---|---|
| `app/main.py` | FastAPI app, CORS, middleware, lifespan, APScheduler |
| `app/config.py` | Pydantic settings — all env vars |
| `app/database.py` | Async engine, session maker, `get_db` dependency |
| `app/base.py` | SQLAlchemy `DeclarativeBase` — decoupled from engine (fixes Alembic) |
| `app/dependencies.py` | `get_current_user` — verifies Firebase token, upserts user |
| `app/limiter.py` | SlowAPI rate limiter singleton (breaks circular import) |
| `app/routes/auth.py` | `GET /api/auth/me` — stamps last_seen_at, returns user |
| `app/routes/feed.py` | `GET /api/feed`, `POST /api/feed/swipe` |
| `app/routes/papers.py` | `GET /api/papers/bookmarks`, bookmark toggle |
| `app/routes/admin.py` | `GET /api/admin/stats` — analytics (admin only) |
| `app/services/feed_service.py` | Feed query — unseen papers with cards, cursor pagination |
| `app/services/claude_service.py` | OpenRouter call + JSON parsing for card generation |
| `app/services/firebase_service.py` | Firebase Admin SDK init + token verification |
| `app/services/email_service.py` | Resend API email sending, rate-limited error alerts |
| `app/tasks/ingest_arxiv.py` | Celery task — fetch arXiv papers, queue card generation |
| `app/tasks/generate_summary.py` | Celery task — call Claude, persist card |
| `app/tasks/celery_app.py` | Celery config — forces TLS for Upstash Redis |

### Middleware

1. **CORS** — configured via `ALLOWED_ORIGINS` env var
2. **Security headers** — X-Content-Type-Options, X-Frame-Options, HSTS (prod only)
3. **Error alert middleware** — catches 5xx responses and unhandled exceptions, fires email alert (rate-limited to 1 per 5 minutes)

### Rate limiting

Using `slowapi`. The `/auth/me` endpoint is called on every page load; no rate limit on it. Heavier write endpoints were rate-limited in the old auth system (removed with Firebase migration).

### Scheduled ingestion

APScheduler runs in-process (no Celery Beat needed):
```python
scheduler.add_job(_trigger_ingestion, "interval", hours=ARXIV_INGEST_INTERVAL_HOURS)
```
Default: every 6 hours. Configurable via `ARXIV_INGEST_INTERVAL_HOURS` env var.

On startup, if paper count is 0 or cards < papers, ingestion is triggered immediately.

---

## 5. Frontend

### Key files

| File | Responsibility |
|---|---|
| `src/firebase.ts` | Firebase app init — reads from `VITE_FIREBASE_*` env vars |
| `src/store/authStore.ts` | Zustand store — Firebase auth, user state, error handling |
| `src/api/client.ts` | Axios instance — auto-attaches Firebase ID token on every request |
| `src/api/auth.ts` | `GET /auth/me` wrapper |
| `src/api/feed.ts` | Feed + swipe API wrappers |
| `src/hooks/useFeed.ts` | TanStack Query — cursor paginated feed, swipe mutation |
| `src/pages/LoginPage.tsx` | Google sign-in + email magic link |
| `src/pages/FeedPage.tsx` | Card stack + action buttons layout |
| `src/pages/BookmarksPage.tsx` | Saved papers list |
| `src/pages/AdminPage.tsx` | Analytics dashboard (admin only) |
| `src/components/CardStack.tsx` | Manages visible cards, forced swipe state |
| `src/components/SwipeCard.tsx` | Individual card with exit animation |
| `src/components/CardContent.tsx` | Paper content — hook, authors, eli5, tags, show more |
| `src/components/ActionButtons.tsx` | Glassmorphic Skip/Save/Like buttons |
| `src/components/Navbar.tsx` | Logo, Saved link, admin link, sign out |
| `src/components/DesktopGate.tsx` | Blocks non-mobile viewports with phone mockup |
| `src/components/OnboardingOverlay.tsx` | First-time tutorial (localStorage flag) |

### State management

- **Auth** — Zustand (`useAuthStore`). `init()` sets up `onAuthStateChanged`. Firebase ID token is fetched fresh on every API request via the Axios interceptor (handles auto-refresh).
- **Feed** — TanStack Query with infinite query. Pre-fetches next page when fewer than 5 cards remain.
- **Local swipe state** — `shownIds` ref in `CardStack` prevents re-showing swiped cards before the server responds.

### Card action flow

1. User taps a button → `triggerSwipe(direction)` sets `forcedSwipe` state in `CardStack`
2. `SwipeCard` receives `forcedSwipe` via prop, `useEffect` fires the Framer Motion exit animation
3. Animation completes → `onSwipe(direction, paperId)` called → card removed from visible list → swipe POSTed to backend
4. `forcedSwipe` reset to `null` — next card is ready

### Firebase error handling

All Firebase error codes are mapped to human-readable messages in `authStore.ts`:
- `auth/popup-closed-by-user`, `auth/popup-blocked`, `auth/network-request-failed`
- `auth/too-many-requests`, `auth/invalid-action-code`, `auth/expired-action-code`
- `auth/unauthorized-domain`, `auth/account-exists-with-different-credential`
- Falls back to Firebase's raw message, then a generic fallback

---

## 6. Authentication

### Flow

```
User taps "Continue with Google"
    → Firebase SDK opens Google popup
    → Firebase issues ID token (JWT, 1 hour expiry)
    → Axios interceptor calls firebaseUser.getIdToken() on every request
        (Firebase SDK auto-refreshes if expired)
    → Backend verifies token with firebase-admin
    → Backend looks up user by firebase_uid
        → If not found: check by email (migration path for old accounts)
            → If found: link firebase_uid to existing account
            → If not found: create new user (username derived from email)
    → Returns UserResponse with is_admin flag
```

### Admin

`is_admin` is computed server-side only:
```python
data.is_admin = bool(settings.ADMIN_EMAIL and user.email == settings.ADMIN_EMAIL)
```
Never stored in DB. Set `ADMIN_EMAIL` env var on Render to designate the admin account.

### Magic link

Firebase Email Link (passwordless) auth. The sign-in link redirects to `/login` where `completeMagicLink()` is called. Email stored in `localStorage` temporarily to complete sign-in on the redirect.

**Note:** Firebase magic link emails may land in spam. The UI displays a warning after sending.

---

## 7. AI pipeline

### Ingest task (`ingest_arxiv_task`)

1. Calls arXiv API for recent papers in configured categories
2. Upserts papers with `on_conflict_do_nothing` on `arxiv_id`
3. Queries all papers without cards
4. Dispatches `generate_summary_task` for each — with retry (max 3, 60s delay)

### Summary generation (`generate_summary_task`)

1. Fetches paper title + abstract from DB
2. Calls OpenRouter with Claude model
3. Parses JSON response into card fields:
   - `hook` — catchy headline
   - `eli5` — plain English explanation
   - `key_finding` — single most important result
   - `why_it_matters` — real-world significance
   - `key_contributions` — array of bullet points
   - `tags` — topic tags
   - `difficulty` — `beginner` / `intermediate` / `advanced`
4. Persists card with `on_conflict_do_nothing` on `paper_id`

**Cost model:** Claude is called exactly once per paper, ever. No LLM calls on feed load. Feed queries are pure SQL.

### Configured categories

Default: `cs.AI, cs.LG, cs.CV, stat.ML, cs.CL`  
Configurable via `ARXIV_CATEGORIES` env var (comma-separated).

---

## 8. Feed system

### Query

```sql
SELECT papers.*, cards.*
FROM papers
JOIN cards ON cards.paper_id = papers.id
WHERE papers.id NOT IN (
    SELECT paper_id FROM swipe_events WHERE user_id = :user_id
)
ORDER BY papers.published_at DESC
LIMIT 21  -- fetch limit + 1 to determine has_more
```

Cursor is `published_at` ISO timestamp of the last item. Subsequent pages use `WHERE published_at < :cursor`.

### Frontend pagination

- Page size: 20 cards
- Pre-fetch threshold: 5 remaining cards
- `shownIds` ref tracks locally dismissed cards to prevent flicker before server confirms

### Swipe recording

`POST /api/feed/swipe` records `direction` (`left` = skip, `right` = like, `up` = save/bookmark). Bookmarks are also created for `up` swipes.

---

## 9. Admin dashboard

Endpoint: `GET /api/admin/stats` (requires `ADMIN_EMAIL` match)

Returns:
- Total users, papers, cards, swipe events, bookmarks
- DAU (last 24h), WAU (last 7d)
- Retention % (WAU/total users)
- Swipe breakdown (left/right/up counts)
- Daily activity chart (last 14 days)
- Top 10 liked papers
- 10 most recent users

Frontend: `AdminPage.tsx` — stat cards, mini bar charts (pure CSS, no charting library), top papers table, recent users table.

---

## 10. Email and alerting

Provider: **Resend** (HTTP API — SMTP blocked on Render free tier)

Config:
- `SMTP_PASSWORD` — Resend API key
- `SMTP_USER` — From address (`ScrollAr <address@domain>`)
- `ALERT_EMAIL` — Where error alerts are sent

### Error alerts

`error_alert_middleware` in `main.py` catches all 5xx responses and unhandled exceptions. Fires `send_error_alert` via `run_in_executor` (non-blocking). Rate-limited to 1 alert per 5 minutes (`_ALERT_COOLDOWN = 300`).

**Note:** Resend requires domain verification to send to arbitrary recipients. Until a domain is verified, emails only send to the Resend account email.

---

## 11. Deployment

### Render (backend)

- **Service type:** Web Service
- **Build command:** `pip install -r requirements.txt && alembic upgrade head`
- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Second service:** Worker — `celery -A app.tasks.celery_app worker --loglevel=info`

### Vercel (frontend)

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- All `VITE_FIREBASE_*` and `VITE_API_URL` set in Vercel environment variables

### Redis (Upstash)

Celery requires TLS for Upstash. `celery_app.py` forces `rediss://` and sets:
```python
broker_use_ssl = {"ssl_cert_reqs": "none"}
redis_backend_use_ssl = {"ssl_cert_reqs": "none"}
```

---

## 12. Migration history

| Migration | Description |
|---|---|
| `0001_initial_schema` | users, papers, cards, swipe_events, bookmarks, likes |
| `0002_add_last_seen_at` | Added `last_seen_at` to users (DAU tracking) |
| `0003_add_password_reset_tokens` | Password reset tokens table (old email/password auth) |
| `0004_firebase_auth` | Drop `password_reset_tokens`, drop `hashed_password`, add `firebase_uid` |

---

## 13. Known limitations and future work

### Current limitations

- **Resend domain restriction** — error alert emails only send to the Resend account owner until a custom domain is verified at resend.com/domains
- **Magic link spam** — Firebase's default sending domain has poor spam reputation with some providers; UI warns users to check spam folder
- **No personalisation** — feed is newest-first for all users regardless of interests
- **Flat bookmarks** — saves are a single unorganised list

### Planned improvements (priority order)

1. **Personalisation** — rerank feed based on swipe history (liked categories)
2. **Share a paper** — generate a shareable link with the AI card preview
3. **"Go deeper" / Chat with paper** — ask Claude questions about a specific paper
4. **Collections** — organise bookmarks into user-created folders
5. **Weekly digest email** — "Your saved papers this week" re-engagement email
6. **More arXiv categories** — physics, biology, economics, quantitative finance
