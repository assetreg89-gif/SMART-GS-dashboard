# Repository Guidelines

## Project Structure & Module Organization

This is a Vite + React single-page application. The app shell is in `src/App.jsx` and `src/main.jsx`; shared UI lives in `src/components/`. Authentication code is in `src/auth/`. Feature modules are isolated under `src/modules/digiletter/` and `src/modules/tlt-space-hub/`, each with `components/`, `data/`, `lib/`, and utility/service files as needed. Static browser assets belong in `public/`.

Deployment files are at the repository root: `Dockerfile`, `docker-compose.yml`, `nginx.conf`, and `.drone.yml`. Database seed/schema helpers live in `scripts/`.

## Build, Test, and Development Commands

- `bun install` installs dependencies from `bun.lock`.
- `bun run dev -- --force` starts Vite on the `PORT` from `.env` (default `14071`) and refreshes optimized dependencies.
- `bun run build` creates the production bundle in `dist/`.
- `bun run preview` serves the production bundle locally.
- `docker compose build frontend` validates the container build; `docker compose up -d frontend` starts it.

There is no automated test suite yet. At minimum, run `bun run build` after frontend changes and verify the relevant browser workflow.

## Coding Style & Naming Conventions

Use ES modules and React function components. Follow the existing two-space indentation, semicolons, and single-quoted JavaScript strings. Name React components in `PascalCase` (`UserProfileMenu.jsx`); use `camelCase` for functions, variables, and utility files (`letterHelper.js`). Keep module-specific code inside its feature directory rather than expanding the root app shell.

## Security & Configuration

Never commit populated `.env` files. Use `.env.example` for local configuration and `drone.env.example` as the template for the single `SMART_GS_ENV_FILE` Drone secret. Values prefixed with `VITE_` are bundled into the client, so do not place private credentials there. The application uses the shared Keycloak service at `auth.treg3.com`; do not add a local Keycloak service to Compose.

## Commit & Pull Request Guidelines

Use concise Conventional Commit-style subjects seen in history: `feat:`, `fix:`, `refactor:`, `ci:`, or `chore:`. Keep each commit focused. Pull requests should describe behavior changes, list validation commands, link relevant issues, and include screenshots for visible UI updates. For deployment or auth changes, state the required Drone secret or Keycloak client configuration explicitly.
