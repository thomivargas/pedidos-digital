# ── Build stage ────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci

COPY . .

# Variables dummy para que la validación de env.ts pase durante prisma generate y tsc
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" \
    DB_HOST="localhost" \
    DB_PORT="3306" \
    DB_USER="dummy" \
    DB_PASSWORD="dummy" \
    DB_NAME="dummy" \
    JWT_ACCESS_SECRET="dummy-secret-at-least-16-chars" \
    JWT_REFRESH_SECRET="dummy-secret-at-least-16-chars" \
    CORS_ORIGIN="http://localhost"

RUN npx prisma generate
RUN npm run build

# ── Production stage ──────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

ENV NODE_ENV=production

EXPOSE ${PORT:-3000}

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
