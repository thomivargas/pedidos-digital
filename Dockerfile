# ── Build stage ────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci

COPY . .

# Variables dummy para que la validación de env.ts pase durante prisma generate y tsc
ENV DATABASE_URL="postgresql://postgres.qloqgxrcufdnnskcpzxw:xC9iYxxI3pqP5qlf@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true" \
    JWT_ACCESS_SECRET="dummy-secret-at-least-16-chars" \
    JWT_REFRESH_SECRET="dummy-secret-at-least-16-chars" \

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

CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
