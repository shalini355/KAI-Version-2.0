# KAI Version 2.0

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript 5.9" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js" alt="Node.js 22" />
  <img src="https://img.shields.io/badge/Gemini-AI-8A2BE2?style=for-the-badge" alt="Gemini AI" />
</p>

KAI is an AI-powered mental well-being assistant designed for students and young adults who want support in a language and tone that feels natural. The app blends emotional support, journaling, mood tracking, and wellness tools with a calmer, more approachable UX than traditional health apps.

This project is built to feel supportive without pretending to replace professional care. It provides compassionate responses, practical self-check features, and a safe, low-friction place to reflect.

## Live Repository

- GitHub: https://github.com/shalini355/KAI-Version-2.0.git

## Why KAI?

College life often brings exam stress, burnout, self-doubt, hostel pressure, and uncertainty about the future. Many students do not want formal clinic-style language or a heavy mental-health dashboard when they just need a safe place to begin.

KAI is designed for that moment.

## Key Features

- English and Hinglish AI chat
- Mood tracking and wellness check-ins
- Journal and reflection space
- Breathing and calming routines
- Support resources and crisis guidance
- Responsive web experience for desktop and mobile
- Local-first personal data handling for the current prototype

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
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── server.ts
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── AI_TELLS.md
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

Additional keys exist in `.env.example` for future integrations such as MongoDB, auth, email, and AI providers. These are reserved for planned backend features and are not required for the current prototype build.

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

## Team

Built with a student-first, user-centered design perspective for better mental well-being experiences.
