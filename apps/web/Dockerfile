# Base image with pnpm
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Dev: install deps and build packages once; compose uses named volumes for node_modules so install is not repeated
FROM base AS dev
COPY package.json pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install
RUN pnpm --filter @makemyownmodel/encryption build
RUN pnpm --filter @makemyownmodel/tenant-context build
WORKDIR /app/apps/web
EXPOSE 3000
ENV NODE_ENV=development
CMD ["pnpm", "dev"]
