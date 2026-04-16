# Deploying the Frontend to Vercel

This project is a monorepo with separate `frontend/` and `backend/` folders. The frontend is a Next.js app designed for Vercel.

Quick steps:

1. In Vercel, import the repository.
2. Set the project root to the repository (no root change needed) — `vercel.json` routes the build to the `frontend` folder.
3. Add any environment variables in the Vercel dashboard (e.g., `NEXT_PUBLIC_API_URL` pointing to your backend).
4. Build & Deploy — Vercel will run `npm install` then `npm run build` inside the `frontend` folder via the `@vercel/next` builder.

Local test:

```bash
cd frontend
npm install
npm run build
npm run start
```

Notes:
- Node 18 is recommended (`engines.node` in `frontend/package.json`).
- Backend should be hosted separately (e.g., Render, Railway, or a Vercel Serverless Function) and referenced using `NEXT_PUBLIC_API_URL`.
