# ── Build stage ────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci

COPY . .

# Variables dummy para que la validación de env.ts pase durante prisma generate y tsc
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    DIRECT_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    JWT_ACCESS_SECRET="dummy-secret-at-least-16-chars" \
    JWT_REFRESH_SECRET="dummy-secret-at-least-16-chars"

RUN npm run build

# ── Production stage ──────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY src/config/env.ts ./src/config/env.ts

RUN npm ci --omit=dev && npm install --no-save ts-node typescript tsconfig-paths

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-c", "echo 'Starting container...' && npx prisma migrate deploy && echo 'Migrations done, starting server...' && node dist/server.js"]
