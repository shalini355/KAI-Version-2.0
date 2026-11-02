# KAI

KAI is a student wellbeing app with English and Hinglish chat, mood check-ins, a journal, breathing exercises, and links to support services in India. It is a tool for reflection, not a replacement for professional care.

Mood and journal entries stay in the current browser. Chat messages are sent to the app server and Google Gemini to generate replies; this project does not provide end-to-end encryption or account sync.

Profiles are local convenience profiles, not online accounts: they are stored in browser storage and are not password-protected. Use a guest profile for a quick visit. Do not enter sensitive or identifying information.

For the product-design rationale and project limitations, see the [portfolio case study](docs/portfolio-case-study.md).

## Live Repository

- GitHub: https://github.com/shalini355/KAI-Version-2.0.git

## Key Features

- English and Hinglish chat, with replies generated through the server-side Gemini API
- Mood tracking and wellness check-ins
- A journal stored in the current browser
- A breathing timer, public support contacts, and optional nearby psychiatrist search
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
│   └── google-maps-logo.svg
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── main.tsx
├── tests/
├── datasets/
│   └── empathetic_dialogues/
│       ├── train.jsonl.gz
│       ├── validation.jsonl.gz
│       └── test.jsonl.gz
├── .env.example
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── render.yaml
├── server.ts
├── docs/
│   ├── empathetic-dialogues-dataset.md
│   ├── project-audit.md
│   └── portfolio-case-study.md
├── scripts/
│   └── prepare_empathetic_dialogues.py
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Getting Started

### Prerequisites

- Node.js 22.12+
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

To enable psychiatrist search, enable the Google Places API (New) with billing in
Google Cloud and set `GOOGLE_MAPS_API_KEY` in `.env`. Keep this key server-side;
never expose it as a `VITE_` variable. The feature returns Google Maps listings,
which KAI does not independently verify. Users can search by city/PIN code or
explicitly grant browser location access.

### 4. Run the app

```bash
npm run dev
```

The app runs on the default port `5000` and is available at:

```text
http://localhost:5000
```

## Deploying

### Recommended: one Render web service

The Express server serves both the built app and the chat API from one origin. This
is the simplest deployment and avoids separate frontend/API CORS configuration.

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint**, select this repository, and apply the
   settings in [`render.yaml`](render.yaml).
3. When prompted, set `GEMINI_API_KEY` to a key with access to the configured
   Gemini model. Keep it server-side; never add it as a `VITE_` variable.
4. To enable provider search, set `GOOGLE_MAPS_API_KEY` to a server-side key
   with Places API (New) access and appropriate API restrictions.
5. Wait for the deploy, then open the service URL and confirm
   `/api/health` returns a JSON response with `status: "ok"`. Try one chat
   message as well as the local mood and journal flows.

Render supplies `PORT`; the service uses the Node.js version specified in
`package.json`. The Blueprint uses Render's free plan, which may sleep after
inactivity and take time to wake. Choose an always-on plan if the portfolio demo
needs consistently fast first responses.

### Optional: Vercel frontend + Render API

If you prefer a separate Vercel frontend, import this repository with build
command `npm run build` and output directory `dist`. Set
`VITE_API_BASE_URL` to the Render service URL, then add the exact Vercel origin
(including `https://` and any custom domain) to the Render service's
comma-separated `CLIENT_ORIGIN` environment variable. Redeploy both services
after changing environment variables. Keep `GEMINI_API_KEY` only on Render.

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
GOOGLE_MAPS_API_KEY=
```

`CLIENT_ORIGIN` is only needed for a separately hosted frontend. Same-origin
requests are allowed automatically.

## Training data

The project includes a reproducible preparation script for the English
EmpatheticDialogues corpus. Run `python scripts\prepare_empathetic_dialogues.py`
to download and generate compressed chat JSONL files. Read
[`docs/empathetic-dialogues-dataset.md`](docs/empathetic-dialogues-dataset.md)
before use: the data is non-commercially licensed and is not clinical training
or validation data.

## Privacy and Safety Notice

KAI is not a therapist, clinician, or emergency-monitoring system. It is a supportive digital companion designed to help users reflect and seek help when needed.

- Crisis support should be routed to trusted contacts or official helplines.
- Sensitive personal information should not be shared in chat prompts.
- If you use nearby search, your chosen location is sent to Google Places to
  retrieve listings; KAI does not store it.
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
