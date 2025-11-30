# Being Suites Webpage

Vite + React single-page application for Being Suites.

## Tech Stack
- Vite 5, React 19, React Router 7
- Tailwind CSS, Framer Motion

## Local Development
- Install: `npm ci`
- Run: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

## Deploy to Vercel (GitHub)
1. Push this project to a GitHub repository.
2. Ensure these build settings:
   - Install Command: `npm ci`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Framework Preset: `Vite`
3. Visit Vercel → New Project → Import your GitHub repo.
4. Click Deploy. Vercel will build and provide a URL.
5. Verify deep links like `/jurys-cafe` and `/function-packages`.

### SPA Deep-Link Support
This repo includes `vercel.json` with a rewrite to `index.html` to prevent 404s when directly visiting routes.

## Environment Variables
No environment variables are required. If you add any, configure them in Vercel Project Settings → Environment Variables and access via `import.meta.env`.

## Notes
- No backend or database required for deployment.
- All images are under `src/assets`.
