FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install
RUN pnpm --filter @makemyownmodel/encryption build
RUN pnpm --filter @makemyownmodel/tenant-context build

FROM base AS runner
COPY --from=deps /app .
WORKDIR /app/apps/web
EXPOSE 3000
ENV NODE_ENV=development
CMD ["pnpm", "dev"]
