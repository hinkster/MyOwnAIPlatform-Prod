# makemyownmodel.ai

Phase 1: Docker-first, reproducible, tenant-safe foundation. Next.js App Router, path-based multi-tenancy, encrypted provider keys, onboarding wizard.

## Structure

- **apps/web** — Next.js 14 App Router, Tailwind, design tokens, Prisma, NextAuth (Credentials)
- **apps/worker** — Placeholder container
- **packages/encryption** — AES-256-GCM (APP_ENCRYPTION_KEY)
- **packages/tenant-context** — `requireTenant`, `getTenantIdForRequest`, `assertNotDemoTenant`
- **infra** — docker-compose.dev.yml (web, postgres, redis, qdrant, worker; ollama optional profile)
- **docs** — START_LOCAL_DEV, DEVELOPMENT, SECURITY

## One-command startup (Docker)

From a fresh clone:

```bash
# From repo root. Compose uses env_file ../.env (repo root).
cp infra/.env.example .env
# Edit .env: set APP_ENCRYPTION_KEY (run: .\scripts\generate-encryption-key.ps1), NEXTAUTH_SECRET, NEXTAUTH_URL

docker compose -f infra/docker-compose.dev.yml up --build
```

Then: http://localhost:3000 and http://localhost:3000/api/health. Dependencies are installed in the image; no `pnpm install` runs in the container.

Seed demo tenant (once):

```bash
docker compose -f infra/docker-compose.dev.yml exec web pnpm exec prisma db seed
```

## Test gates (must pass for Phase 1 complete)

From repo root with Node 18+ and pnpm installed:

```bash
pnpm install
pnpm format:check
pnpm lint
pnpm --filter @makemyownmodel/encryption test
cd apps/web && pnpm exec prisma migrate deploy && pnpm exec prisma db seed
pnpm --filter web test
```

- **a) Encryption round-trip** — `pnpm --filter @makemyownmodel/encryption test`
- **b) Tenant isolation** — User from org A cannot access org B (requireTenant/getTenantIdForRequest). Part of `pnpm --filter web test`.
- **c) Demo lock** — Updating provider keys for org slug `demo` returns 403. Part of `pnpm --filter web test` (requires seed).

## How to confirm Phase 1 is complete

1. **Compose up** — `docker compose -f infra/docker-compose.dev.yml up --build` brings up web, postgres, redis, qdrant, worker without errors.
2. **Health** — `curl http://localhost:3000/api/health` returns `{"status":"ok","postgres":"connected"}` (or `degraded` if DB not ready).
3. **Gate tests** — All three above pass: encryption, tenant isolation, demo lock.
4. **Demo tenant** — Seed run; `/t/demo` loads; settings for demo do not allow saving provider keys.
5. **Sign up → onboarding** — New user gets an org, completes 6-step onboarding, lands on dashboard.

## Env vars

Compose reads `env_file: ../.env` (repo root). Copy [infra/.env.example](infra/.env.example) to `.env` at repo root. Required: `DATABASE_URL`, `APP_ENCRYPTION_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `REDIS_URL`, `QDRANT_URL`. Optional: `OLLAMA_BASE_URL` (with ollama profile), provider keys.

## Phase 2 (outline only)

OAuth, worker jobs, Ollama fallback, rate limiting, inference API, RAG, audit expansion, E2E tests.
