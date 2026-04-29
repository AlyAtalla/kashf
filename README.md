# Kashf — Psychiatric Professional Finder

A platform connecting patients with psychiatric professionals of their choice.

## Quick Start

```bash
npm install
npm run dev
```

## Deployment

### Frontend (Netlify)
1. Push code to GitHub
2. Connect repo in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

### Backend (Render.com)
1. Create new Web Service on Render
2. Connect same GitHub repo
3. Root directory: `server`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add environment variables:
   - `PORT=4000`
   - `JWT_SECRET=your-secure-secret`
   - `DATABASE_URL=postgresql://...` (or use SQLite file)

### Environment Variables

For production, create `.env` in `/server`:
```
PORT=4000
JWT_SECRET=your-secure-random-string
DATABASE_URL=postgresql://user:password@host:5432/kashf
```

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind
- **Backend**: Express + TypeScript + Socket.IO
- **Database**: PostgreSQL (via Prisma)
