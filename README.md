# Agentic AI Career Coach

Full-stack hackathon app with:
- React + Tailwind frontend
- Flask backend APIs
- Groq integration for resume/chat/mock interview
- MongoDB integration with graceful fallback
- OTP-based email login

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

### 1) Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

Backend runs on `http://localhost:5000`.

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
- `GROQ_API_KEY`
- `GROQ_MODEL` (default: `llama-3.1-8b-instant`)
- `GROQ_BASE_URL` (default: `https://api.groq.com/openai/v1`)
- `MONGODB_URI`
- `MONGODB_DB`
- `PORT`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- `OTP_EXPIRY_MINUTES`

Frontend `.env`:
- `VITE_API_URL` (local default `http://localhost:5000`)

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
