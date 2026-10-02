# Kai – AI-Powered Mental Wellness Assistant

Kai is a full-stack mental wellness application built as a final-year engineering project. It helps users reflect on their mood, journal privately, interact with an empathetic AI companion, and access immediate support resources when needed.

The platform combines a React frontend with an Express backend and MongoDB database, with AI responses powered by server-side provider keys.

> Disclaimer: Kai is not a medical substitute. If someone is in immediate danger or experiencing a crisis, contact emergency services or a verified mental health helpline immediately.

## Features

- AI wellness chatbot with fallback provider logic
- Mood tracking with short-term trends
- Private journal entries
- Guided breathing and wellness exercises
- Responsive mental health resource page
- Google OAuth sign-in
- JWT-based authenticated user flow
- MongoDB persistence for user data and chat history

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Recharts, Lucide React
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Passport.js
- AI providers: Mistral, Gemini, Groq
- Testing: Jest, Supertest

## Project Structure

```text
Kai-Version-1.0/
├── client/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   ├── tests/
│   ├── .env
│   └── package.json
├── README.md
├── SYSTEM_ARCHITECTURE.md
├── package.json
└── .gitignore
```

## Prerequisites

- Node.js 20+
- npm
- MongoDB installed locally or access to a MongoDB instance
- API keys for at least one AI provider
- Google OAuth client credentials for sign-in

## Local Setup

### 1. Clone the project

```bash
git clone <your-repo-url>
cd Kai-Version-1.0
```

### 2. Install dependencies

```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 3. Start MongoDB locally

Windows:

```powershell
mongod --dbpath "C:\data\db"
```

Mac:

```bash
brew services start mongodb-community
```

Verify MongoDB is online:

```bash
mongosh
```

### 4. Configure environment variables

Create or edit the server environment file in [server/.env](server/.env) and add your local values.

Example:

```env
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/kai_db
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
MISTRAL_API_KEY=your_mistral_key
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

Frontend environment values can be added in the client app if needed:

```env
VITE_API_URL=http://localhost:5000/api
```

> Never expose private API keys in frontend code or commit real credentials to Git.

## Run the Project

### Start backend

```bash
npm --prefix server run dev
```

### Start frontend

Open a second terminal and run:

```bash
npm --prefix client run dev -- --host 0.0.0.0
```

### Open the app

```text
http://localhost:5173
```

## Verification Checklist for Submission

Use this checklist before final submission:

1. MongoDB is running locally.
2. Backend starts successfully without MongoDB connection errors.
3. Health endpoint responds:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{"status":"ok"}
```

4. Frontend loads at http://localhost:5173.
5. Login page loads successfully.
6. Protected routes redirect to login when unauthenticated.
7. Chat API responds without 500 errors.
8. Mood, journal, and resources screens render properly.
9. No secrets are committed in the repository.

## Tests

Run backend tests:

```bash
npm --prefix server test
```

Production build check for frontend:

```bash
npm --prefix client run build
```

## Troubleshooting

### MongoDB connection fails

Check that MongoDB is running and that the URI matches the local instance:

```env
MONGO_URI=mongodb://127.0.0.1:27017/kai_db
```

Look for this in the backend terminal logs:

```text
[MongoDB] Connected successfully: mongodb://127.0.0.1:27017/kai_db
```

### Chat is not responding

Check the browser console and backend terminal for:

- `[Chat] Sending request to:`
- `[Chat] Response received:`
- `[AI] Request served by:`
- `[AI] No AI providers are configured`

If no provider is configured, add a valid key to the server environment file.

### Unauthorized errors on protected routes

This usually means the user is not logged in or the cookie/session is missing. Sign in through the Google flow and refresh the app.

## Project Notes

This project is designed for academic demonstration and local development. If you plan to deploy publicly, use secure hosting, HTTPS, strong env secrets, and a production-ready database setup.

## License

This project is intended for educational and academic use.
