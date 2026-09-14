# MindGuard

MindGuard is a multimodal mental wellness concept app with:

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

This update adds a Django backend foundation that makes the project smoother to extend.

## New Django backend

The Django API now includes:

- `GET /health`
- `POST /api/auth/register`
- `GET /api/auth/verify`
- `POST /api/auth/login`
- `POST /api/interactions/text`
- `POST /api/interactions/voice`
- `POST /api/interactions/video`
- `GET /api/mood/history?userId=...`
- `GET /api/mood/burnout-risk?userId=...`
- `GET|POST /api/mood`
- `POST /api/notifications/register-token`
- `POST /api/notifications/send-alert`

The backend uses SQLite by default so it runs locally without extra infrastructure.

## Web improvements

The web app now:

- points to Django by default in local development
- loads real mood history and burnout summaries from the backend
- has a clearer dashboard shell with a recovery snapshot, action cards, and a more polished responsive layout
- keeps the original voice, video, and multimodal concepts while giving them a more stable data source

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

## Verified locally

- `python manage.py test`
- `npm run build`

## Suggested next updates

These are the highest-value improvements still worth doing next:

1. Replace the placeholder mood-analysis heuristics with a real ML or LLM-backed inference layer.
2. Move the frontend from a shared demo user id to real authenticated sessions.
3. Upgrade the mobile app from the Expo starter screen into a real MindGuard companion using the same Django API.
4. Add persistent PostgreSQL for production instead of SQLite.
5. Add stronger API tests around auth failures, notification flows, and edge-case data validation.
6. Split large inline-styled React components into smaller shared UI primitives for maintainability.

## Deployment notes

- The repo root now deploys the React frontend on Vercel via [vercel.json](/Users/shravani/Documents/Codex/2026-09-14/https-github-com-khushiraj29-mindguard-git/work/MindGuard/vercel.json).
- `render.yaml` targets the Django API service and installs from `django_backend/requirements.txt`.
- `web/vercel.json` remains available if you ever deploy the `web/` folder by itself.
- For Vercel, set `VITE_API_URL` to your deployed Django API URL when the backend is live.

## Important note about GitHub updates

The repository was cloned locally for this work. I made the changes in the local clone, but pushing them back to GitHub still needs your authenticated `git push` step or permission to use your Git credentials.
