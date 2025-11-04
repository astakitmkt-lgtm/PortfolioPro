# Multi-stage build per PortfolioPro
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY server/package.json server/package-lock.json* ./server/
COPY client/package.json client/package-lock.json* ./client/

# Install server dependencies
WORKDIR /app/server
RUN npm ci

# Install client dependencies
WORKDIR /app/client
RUN npm ci

# Build client
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/server ./server
COPY --from=deps /app/client ./client

# Copy source files
COPY server/src ./server/src
COPY server/tsconfig.json ./server/
COPY client/src ./client/src
COPY client/index.html ./client/
COPY client/vite.config.ts ./client/
COPY client/tsconfig.json ./client/

# Build server
WORKDIR /app/server
RUN npm run build

# Build client
WORKDIR /app/client
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install better-sqlite3 dependencies
RUN apk add --no-cache python3 make g++

# Copy built files
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/client/dist ./client/dist

# Create data directory for SQLite
RUN mkdir -p /app/data

WORKDIR /app/server

EXPOSE 3000

CMD ["node", "dist/index.js"]

