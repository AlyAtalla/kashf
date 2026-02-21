# Kashf Server

Minimal Node + TypeScript + Express scaffold for Kashf backend.

Quick start

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

This scaffold includes placeholder auth endpoints in `src/routes/auth.ts`, a health check at `/health`, and a Prisma schema in `prisma/schema.prisma`.

To use PostgreSQL + Prisma:

1. Set `DATABASE_URL` in `.env` to your Postgres connection string.
2. Install dependencies: `npm install`.
3. Generate Prisma client: `npx prisma generate`.
4. Run the first migration to create DB tables: `npx prisma migrate dev --name init`.

