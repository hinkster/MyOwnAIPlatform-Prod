# makemyownmodel.ai

Phase 1 greenfield foundation: mono-repo with Next.js (App Router), path-based multi-tenancy, encrypted provider keys, onboarding wizard, and Docker-first local dev.

## Structure

- **apps/web** — Next.js 14 App Router, Tailwind, shadcn-style UI, Prisma, NextAuth (Credentials)
- **apps/worker** — Placeholder container for later background jobs
- **packages/encryption** — AES-256-GCM encrypt/decrypt (APP_ENCRYPTION_KEY)
- **packages/tenant-context** — `getTenantFromSlug`, `requireTenant`, `getTenantIdForRequest`
- **infra** — Docker Compose (web, postgres, redis, qdrant, worker; optional ollama profile)
- **docs** — START_LOCAL_DEV, DEVELOPMENT, SECURITY

## One-command startup

```bash
# From repo root
cp infra/.env.example .env
# Edit .env: set APP_ENCRYPTION_KEY (e.g. 64-char hex from `openssl rand -hex 32`), NEXTAUTH_SECRET, NEXTAUTH_URL

docker compose -f infra/docker-compose.dev.yml up
```

Then open http://localhost:3000 and http://localhost:3000/api/health.

Migrations and seed run in the web container on startup. To run seed manually after first up:

```bash
docker compose -f infra/docker-compose.dev.yml exec web sh -c "cd /app/apps/web && pnpm exec prisma db seed"
```

## Running without Docker

See [docs/START_LOCAL_DEV.md](docs/START_LOCAL_DEV.md) and [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Tests (gate)

Run before considering Phase 1 complete:

1. **Encryption round-trip** (packages/encryption):  
   `pnpm --filter @makemyownmodel/encryption test`
2. **Tenant isolation** (apps/web): User A cannot access Tenant B config/keys.  
   `pnpm --filter web test` (requires DATABASE_URL and migrated DB; seed not required for isolation test, but demo lock test expects demo user).
3. **Demo lock**: Updating provider keys for org slug `demo` returns 403.  
   Same as above; demo user must exist (run seed).

From repo root (with pnpm installed):

```bash
pnpm install
pnpm --filter @makemyownmodel/encryption test
cd apps/web && pnpm exec prisma migrate deploy && pnpm exec prisma db seed
pnpm --filter web test
```

## Env vars

See [infra/.env.example](infra/.env.example). Required: `DATABASE_URL`, `APP_ENCRYPTION_KEY` (32-byte hex or base64url), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Optional: `REDIS_URL`, `QDRANT_URL`, `OLLAMA_BASE_URL` (with ollama profile).

## Phase 2 (outline)

- OAuth providers; worker jobs; Ollama fallback; rate limiting; inference API; Qdrant RAG; audit expansion; tenant branding; E2E tests.
