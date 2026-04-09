# Agentic AI Career Coach (SaaS Edition)

Full-stack SaaS-ready app with:
- React + Tailwind frontend
- Flask backend with `/api/v1` multi-tenant APIs
- Role-based auth (org owner/admin/mentor/student/recruiter)
- Billing + usage limits scaffolding
- Admin and enterprise endpoints (SSO metadata, SCIM, exports)
- Observability (`/metrics`) + health/readiness checks
- MongoDB persistence with in-memory fallback
- SQL migration schema baseline for PostgreSQL rollout

## Project Structure

```
backend/
  app.py
  routes/
    resume.py
    chat.py
    tasks.py
  services/
    ai_service.py
    parser.py
    logic_engine.py

frontend/
  src/
    components/
      UploadResume.jsx
      Dashboard.jsx
      TaskList.jsx
      ChatBox.jsx
      Alerts.jsx
    pages/
      Home.jsx
```

## Run Locally

### 1) Backend (API)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

Backend runs on `http://localhost:5000`.

Seed login available after first run:
- Email: `owner@agentic.local`
- Password: `demo-owner`

### 2) Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Environment Variables

Backend `.env`:
- `APP_ENV`
- `PORT`
- `MONGODB_URI`, `MONGODB_DB`
- `OPENAI_API_KEY` or `GROQ_API_KEY`
- `OPENAI_MODEL`, `OPENAI_BASE_URL` (optional)
- `GROQ_MODEL`, `GROQ_BASE_URL` (optional)
- `JWT_SECRET`
- `MAX_UPLOAD_SIZE_MB`
- `RATE_LIMIT_PER_MINUTE`
- `CORS_ORIGINS`
- `ENABLE_BILLING`
- `ENABLE_ENTERPRISE`
- `POSTGRES_DSN` (enables Postgres runtime persistence)
- `REDIS_URL` (enables Redis/RQ distributed queue)
- `QUEUE_NAME` (default `agentic_jobs`)
- `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` (verified Stripe webhooks)

Frontend `.env`:
- `VITE_API_URL` (local default `http://localhost:5000`)

## API Highlights

Legacy demo endpoints still supported:
- `POST /upload-resume`
- `POST /generate-tasks`
- `POST /chat`
- `GET /mock-interview`

SaaS API v1:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/resume/upload`
- `POST /api/v1/tasks/generate`
- `POST /api/v1/chat`
- `GET /api/v1/mock-interview`
- `GET /api/v1/timeline`
- `GET /api/v1/alerts`
- `GET /api/v1/billing/subscription`
- `POST /api/v1/billing/upgrade`
- `POST /api/v1/billing/webhook/stripe`
- `GET /api/v1/admin/tenants`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/jobs`
- `POST /api/v1/admin/replay-job`
- `GET /api/v1/enterprise/sso/metadata`
- `POST /api/v1/enterprise/scim/users`
- `GET /api/v1/enterprise/export`
- `GET /api/v1/enterprise/audit-logs`

## Worker Runtime (Production)

Start a queue worker service:

```bash
cd backend
python worker.py
```

Requires `REDIS_URL` to be configured.

## Deployment (Suggested)

- Frontend: Vercel/Netlify
- Backend: Render/Railway
- MongoDB: MongoDB Atlas

Set `VITE_API_URL` in frontend deployment to backend live URL.

### Render Backend Start Command (Production)

Use this start command on Render:

```bash
gunicorn "app:create_app()" --bind 0.0.0.0:$PORT
```
