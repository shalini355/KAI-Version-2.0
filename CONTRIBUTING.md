# Contributing to KAI Version 2.0

Thanks for your interest in improving KAI.

## How to contribute

1. Fork the repository.
2. Create a feature branch.
3. Make your changes with clear commit messages.
4. Run the validation checks.
5. Open a pull request with a detailed summary.

## Local setup

```bash
git clone https://github.com/shalini355/KAI-Version-2.0.git
cd KAI-Version-2.0
npm install
cp .env.example .env
npm run dev
```

## Validation

Before submitting a PR, run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Code style

- Follow the project’s existing TypeScript and React conventions.
- Prefer small, focused pull requests.
- Do not commit secrets or API keys.
- Keep documentation updated when behavior changes.

## Reporting issues

Open an issue with:

- clear reproduction steps
- expected behavior
- actual behavior
- relevant environment details
