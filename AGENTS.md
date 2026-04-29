# Repository Guidelines

## Project Structure & Module Organization
- `src/`: React + TypeScript frontend (pages, components, context, and shared libs in `src/lib`).
- `server/`: Express backend in CommonJS (`index.cjs`, `routes/*.cjs`, `middleware/`, `migrations/`, `tests/`).
- `public/`: static web assets served by Vite.
- `uploads/`: runtime-uploaded product media.
- `dist/`: production frontend build output (generated).
- `deploy/hostinger/`: deployment scripts/config (`deploy.sh`, PM2 and Nginx configs).

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start Vite dev server on `http://localhost:3000`.
- `npm run build`: create optimized frontend build in `dist/`.
- `npm run preview`: preview built frontend locally.
- `npm run lint`: TypeScript type-check (`tsc --noEmit`).
- `npx vitest run`: run frontend tests (e.g., `src/pages/Home.test.tsx`).
- `node --test server/tests/*.cjs`: run backend smoke tests using Node's built-in test runner.
- `node server/index.cjs`: run the API/server locally (defaults to port `3001`).

## Coding Style & Naming Conventions
- Use TypeScript in `src/` and CommonJS JavaScript in `server/`.
- Indentation: 2 spaces; keep imports grouped and minimal.
- React components/pages: `PascalCase` filenames (`ProductCard.tsx`, `Home.tsx`).
- Utilities/hooks/context: `camelCase` exports, descriptive names.
- Backend route files: lowercase kebab/categorical naming (`homepage-sections.cjs`, `clearance.cjs`).

## Testing Guidelines
- Frontend uses Vitest + Testing Library (`src/test/setup.ts`).
- Backend tests use `node:test` with isolated Express apps and mocked DB calls.
- Name tests by behavior (e.g., `renders CategoryStrip...`, `bulk clearance update...`).
- Cover both happy path and validation/error path for new routes/components.

## Commit & Pull Request Guidelines
- Follow current history style: short, imperative subject lines (`fix: ...`, `refactor: ...`, `Fix ...`).
- Keep commits focused (one logical change per commit).
- PRs should include:
  - clear summary and scope,
  - related issue/ticket (if any),
  - test evidence (commands + results),
  - screenshots/video for UI changes.

## Security & Configuration Tips
- Copy `.env.example` to `.env` and never commit secrets.
- Required env vars include DB/session/auth settings (`SESSION_SECRET`, `FRONTEND_URL`, OAuth keys).
- Treat `uploads/` and SQL migration changes as sensitive; review access/auth impacts before merging.
