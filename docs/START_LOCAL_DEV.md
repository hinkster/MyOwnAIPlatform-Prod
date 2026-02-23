# Start local dev (Docker)

## Prerequisites

- Docker and Docker Compose
- (Optional) pnpm or npm for running commands on the host

## One-command startup

1. **Copy env template**

   From repo root:

   ```bash
   cp .env.example .env
   ```

   (Or `cp infra/.env.example .env`; both are consistent.)

2. **Set required variables in `.env`**
   - `APP_ENCRYPTION_KEY` — 32-byte key as 64-char hex. Generate with PowerShell (no Node/OpenSSL):
     ```powershell
     .\scripts\generate-encryption-key.ps1
     ```
     If script execution is restricted, run this in PowerShell instead:
     `$rng=[System.Security.Cryptography.RandomNumberGenerator]::Create();$b=New-Object byte[] 32;$rng.GetBytes($b);[System.BitConverter]::ToString($b)-replace '-',''`
     Or with Node if available: `node scripts/generate-encryption-key.js`
   - `NEXTAUTH_SECRET` — any long random string (e.g. run the same script twice, or use any 32+ character random string)
   - `NEXTAUTH_URL` — `http://localhost:3000` for local

   Leave `DATABASE_URL`, `REDIS_URL`, `QDRANT_URL` as in the example if you only run via Docker; the compose file overrides them for the web container.

3. **Start stack**

   ```bash
   docker compose -f infra/docker-compose.dev.yml up
   ```

   This starts: **web** (Next.js on 3000), **postgres** (5432), **redis** (6379), **qdrant** (6333), **worker** (placeholder). The web service uses named volumes for `node_modules` so dependencies are not reinstalled on every start; it runs `pnpm install`, `prisma generate`, `prisma migrate deploy`, and `pnpm dev`.

4. **Seed demo tenant (first time)**

   After the first up, run the seed so the demo org and user exist:

   ```bash
   docker compose -f infra/docker-compose.dev.yml exec web sh -c "cd /app/apps/web && pnpm exec prisma db seed"
   ```

5. **Open**
   - App: http://localhost:3000
   - Health: http://localhost:3000/api/health
   - Demo: http://localhost:3000/t/demo
   - Sign up to create your org and go through onboarding.

## Optional: Ollama

To start Ollama as well:

```bash
docker compose -f infra/docker-compose.dev.yml --profile ollama up
```

Then set `OLLAMA_BASE_URL=http://localhost:11434` in `.env` if the app uses it.

## Troubleshooting

- **Web won’t start**: Ensure `.env` has `APP_ENCRYPTION_KEY` and `NEXTAUTH_SECRET` set.
- **DB connection error**: Wait for postgres healthcheck to pass (a few seconds after first up).
- **Port in use**: Change the web port in `infra/docker-compose.dev.yml` (e.g. `"3001:3000"`).
