# KAI

KAI is a student wellbeing app with English and Hinglish chat, mood check-ins, a journal, breathing exercises, and links to support services in India. It is a tool for reflection, not a replacement for professional care.

Mood and journal entries stay in the current browser. Chat messages are sent to the app server and Google Gemini to generate replies; this project does not provide end-to-end encryption or account sync.

Profiles are local convenience profiles, not online accounts: they are stored in browser storage and are not password-protected. Use a guest profile for a quick visit. Do not enter sensitive or identifying information.

## Live Repository

- GitHub: https://github.com/shalini355/KAI-Version-2.0.git

## Key Features

- English and Hinglish chat, with replies generated through the server-side Gemini API
- Mood tracking and wellness check-ins
- A journal stored in the current browser
- A breathing timer and public support contacts
- Responsive web experience for desktop and mobile

## Tech Stack

- React 19 + TypeScript
- Vite for frontend tooling
- Express + Node.js for the server
- Google Gemini API for AI responses
- Tailwind CSS for styling
- Vitest + ESLint for validation

## Project Structure

```text
.
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── main.tsx
├── tests/
├── .env.example
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── server.ts
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/shalini355/KAI-Version-2.0.git
cd KAI-Version-2.0
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then add your Gemini API key in the `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Run the app

```bash
npm run dev
```

The app runs on the default port `5000` and is available at:

```text
http://localhost:5000
```

## Deploying with Vercel and Render

Deploy the Vite frontend to Vercel and the Express API to Render. Use the repository root as the project root in both dashboards.

### Render API web service

Create a **Node.js Web Service** connected to this GitHub repository and configure:

- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Environment: `NODE_ENV=production`
- Environment: `GEMINI_API_KEY` set to your Gemini API key
- Environment: `CLIENT_ORIGIN` set to your Vercel URL, for example
  `https://your-project.vercel.app`

Render provides the `PORT` value automatically. After deploying, check
`https://<your-render-service>.onrender.com/api/health`.

### Vercel frontend

Import the same GitHub repository as a Vercel project. Use the same root directory
as above, select **Vite** if prompted, and configure:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`

Redeploy Vercel after setting the environment variable. If you use a custom Vercel
domain, add that exact `https://` URL to Render's comma-separated `CLIENT_ORIGIN`
value as well. Keep `GEMINI_API_KEY` only in Render; do not add it to Vercel.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run preview
npm run typecheck
npm run lint
npm test
npm run format
npm run format:check
```

## Environment Variables

The app uses the following variables from `.env`:

```env
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_api_key_here
```

## Privacy and Safety Notice

KAI is not a therapist, clinician, or emergency-monitoring system. It is a supportive digital companion designed to help users reflect and seek help when needed.

- Crisis support should be routed to trusted contacts or official helplines.
- Sensitive personal information should not be shared in chat prompts.
- This version is a local prototype and should be treated as such.

## Quality Checks

Run the project validation commands before opening a pull request:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening issues or pull requests.

## Security

Please review [SECURITY.md](SECURITY.md) for responsible disclosure guidelines.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
