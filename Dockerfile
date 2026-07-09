# 1. Container Base
FROM oven/bun:1.3.14-alpine AS base
WORKDIR /app

# 2. Dependency Installation (All dependencies, including devDependencies for builder)
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 3. Production Dependency Installation (Only production dependencies)
FROM base AS prod-deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# 4. Application Build
FROM base as builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# 5. Final Production Image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create directory for persistent data
RUN mkdir -p /app/data/db && chown -R bun:bun /app/data

# Copy static files and build output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Copy ONLY production dependencies (no eslint, prettier, tailwind, typescript)
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Change to non-root user
USER bun

# Expose the port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]

