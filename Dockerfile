# Dockerfile for Launchpad Student Form Next.js app.
# Multi-stage build: builds app with pnpm, then copies only production assets to runner image.
# Handles Prisma, Next.js, and pnpm setup for both build and runtime.
# Does NOT copy .env (handled at runtime via docker-compose).
# Only copies files that are guaranteed to exist, avoiding build errors from missing files (e.g., tailwind.config.js).
# Exposes port 3000 for Next.js server.
# Maintains a small, secure, and reproducible image.

# ---- Base Node image ----
FROM node:20.11.1-alpine AS base
LABEL maintainer="Antonio Archer <antonioarcher.dev@gmail.com>"
WORKDIR /app

# ---- Install pnpm ----
RUN corepack enable && corepack prepare pnpm@9.1.1 --activate

# ---- Copy dependency manifests and prisma schema ----
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# ---- Install dependencies only (for caching) ----
RUN pnpm install --frozen-lockfile

# ---- Copy source code ----
COPY . .

# ---- Build the Next.js app ----
RUN pnpm build

# ---- Production image ----
FROM node:20.11.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install pnpm in the runner image
RUN corepack enable && corepack prepare pnpm@9.1.1 --activate

# Copy only necessary files from build stage
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/next.config.ts ./next.config.ts
COPY --from=base /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=base /app/tsconfig.json ./tsconfig.json

# Expose port 3000 for Next.js
EXPOSE 3000

# Start the Next.js app
CMD ["pnpm", "start"]
