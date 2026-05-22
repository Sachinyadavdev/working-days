FROM node:22-alpine AS base

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm turbo

WORKDIR /app
COPY . .
# Prune the workspace for the api app
RUN turbo prune @ems/api --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

WORKDIR /app
# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
# Generate Prisma client
RUN cd apps/api && pnpm exec prisma generate
RUN pnpm turbo run build --filter=@ems/api...

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer /app/apps/api/package.json .

# Copy built assets
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules

# Ensure Prisma client is available
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/src/database/prisma ./prisma

ENV NODE_ENV production
ENV PORT 3001

EXPOSE 3001

CMD ["node", "dist/main.js"]
