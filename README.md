# MindGuard

MindGuard is a multimodal mental wellness app with:

- a React web client in `web/`
- an Expo mobile client in `mobile/`
- a new Django REST backend in `django_backend/`
- the original Express backend still kept in `backend/` as a legacy reference

## What changed

This repo originally had a visually ambitious frontend, but the backend contract was incomplete:

- the React app expected `/api/mood/history` and `/api/mood/burnout-risk`, but the Express backend did not provide them
- the mobile app was still a starter screen
- deployment was still wired to the old Node service
- the API layer had no easy local Python setup for future AI or data work

This update turns the project into a cleaner full-stack foundation that is easier to ship and extend.

## New Django backend

The Django API now includes:

- `GET /health`
- `POST /api/auth/register`
- `GET /api/auth/verify`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/password-reset/request`
- `POST /api/auth/password-reset/confirm`
- `POST /api/interactions/text`
- `POST /api/interactions/voice`
- `POST /api/interactions/video`
- `GET /api/mood/history?userId=...`
- `GET /api/mood/burnout-risk?userId=...`
- `GET|POST /api/mood`
- `POST /api/notifications/register-token`
- `POST /api/notifications/send-alert`

The backend now supports:

- SQLite by default for easy local setup
- PostgreSQL in production through `DATABASE_URL`
- optional OpenAI-backed text inference when `OPENAI_API_KEY` is configured
- signed auth tokens with real per-user sessions instead of a shared demo user

## Web improvements

The web app now:

- points to Django by default in local development
- supports real sign up, email verification, sign in, sign out, and password reset flows
- uses authenticated sessions instead of a shared demo identity
- loads real mood history and burnout summaries from the backend
- has a cleaner white-and-teal dashboard and dedicated auth screens
- splits the top-level UI into smaller components for easier maintenance

## Mobile improvements

The Expo app is no longer a starter screen. It now includes:

- login and sign-up against the Django API
- burnout snapshot loading
- recent mood history
- quick authenticated text check-ins
- a configurable API URL field for local development

## Run locally

### 1. Backend

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r django_backend/requirements.txt
cd django_backend
python manage.py migrate
python manage.py runserver
```

The Django API will run on `http://127.0.0.1:8000`.

### 2. Web app

In another terminal:

```bash
cd web
npm install --cache /private/tmp/mindguard-npm-cache
npm run dev
```

If needed, set:

```bash
VITE_API_URL=http://127.0.0.1:8000/api
```

### 3. Mobile app

In another terminal:

```bash
cd mobile
npm install
npm start
```

Important:

- iPhone or Android simulators can usually use your machine-local API more easily than a physical phone.
- if you test on a physical phone, `127.0.0.1` points to the phone itself, not your laptop, so you must replace the API URL with your laptop's local network IP.

## Verified locally

- `python manage.py test`
- `npm run build`
- `npm run lint`

## Still worth doing later

These are the highest-value follow-ups after this foundation:

1. Add refresh-token rotation and server-side token revocation rather than simple signed tokens only.
2. Move the multimodal fusion itself into the Django API so combo mode is fully persisted server-side.
3. Add a proper PostgreSQL instance on Render or Neon and wire `DATABASE_URL` in production.
4. Replace the client-side webcam heuristics with a real vision model or remove pseudo-precision metrics that may overpromise.
5. Add end-to-end tests for the auth UI and protected API flows.
6. Break the remaining large frontend components into shared card, chip, and status primitives.

## Deployment notes

- The repo root now deploys the React frontend on Vercel via [vercel.json](/Users/shravani/Documents/Codex/2026-09-14/https-github-com-khushiraj29-mindguard-git/work/MindGuard/vercel.json).
- `render.yaml` targets the Django API service and installs from `django_backend/requirements.txt`.
- `web/vercel.json` remains available if you ever deploy the `web/` folder by itself.
- For Vercel, set `VITE_API_URL` to your deployed Django API URL when the backend is live.
