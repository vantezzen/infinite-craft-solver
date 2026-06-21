FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. Copy ONLY the lockfile and workspace config first for caching
# The asterisk (*) ensures it doesn't fail if pnpm-workspace.yaml doesn't exist at the root
COPY pnpm-lock.yaml pnpm-workspace.yaml* ./

# 2. Fetch dependencies into the pnpm store (this caches heavily!)
RUN corepack enable pnpm && pnpm fetch

# 3. Now copy the rest of your source code
COPY . .

# 4. Install using the offline cache we just built
RUN pnpm install --frozen-lockfile --offline


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy the entire app (including all nested workspace node_modules) from deps
COPY --from=deps /app ./

# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js