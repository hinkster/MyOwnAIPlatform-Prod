# Development

## Running web locally (without Docker)

1. **Prerequisites**: Node 18+, pnpm (or npm), local Postgres and Redis (or use Docker only for them).

2. **Env**

   Copy `infra/.env.example` to `.env` at repo root. Set:

   - `DATABASE_URL` — e.g. `postgresql://postgres:postgres@localhost:5432/makemyownmodel`
   - `REDIS_URL` — e.g. `redis://localhost:6379`
   - `QDRANT_URL` — e.g. `http://localhost:6333`
   - `APP_ENCRYPTION_KEY` — 64-char hex (see START_LOCAL_DEV.md)
   - `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (e.g. `http://localhost:3000`)

3. **Install and DB**

   ```bash
   pnpm install
   cd apps/web && pnpm exec prisma migrate deploy && pnpm exec prisma db seed
   ```

4. **Run**

   From repo root:

   ```bash
   pnpm dev
   ```

   Or from `apps/web`: `pnpm dev`. App at http://localhost:3000.

## Adding packages

- **apps/web**: `pnpm --filter web add <pkg>` or `cd apps/web && pnpm add <pkg>`
- **packages/encryption** or **tenant-context**: `pnpm --filter @makemyownmodel/encryption add <pkg>` etc.

## Tests

- **Encryption (unit)**  
  `pnpm --filter @makemyownmodel/encryption test`

- **Web (integration)**  
  Requires `DATABASE_URL` and migrated DB. Seed for demo lock test.

  ```bash
  cd apps/web
  pnpm exec prisma migrate deploy
  pnpm exec prisma db seed   # for demo user
  pnpm test
  ```

## Lint

From `apps/web`: `pnpm lint` (Next.js ESLint).
